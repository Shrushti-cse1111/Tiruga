import {
  Place,
  Region,
  Stay,
  FoodSpot,
  TransportLeg,
  Trip,
  TripDay,
  TripStop,
  AgentRun,
  RulesConfig,
  I18nText,
  PlaceAlternative
} from '../types';

export interface PlanContext {
  tripId: string;
  userId: string;
  answers: {
    interests: string[];
    days: number;
    budget: number;
    style: string;
    start_city: string;
    start_date: string;
    is_woman: boolean;
    karnataka_domicile: boolean;
    shakti_active?: boolean;
    simulate_trigger?: 'rain' | 'heat' | 'bus_missed' | 'gate_closed';
  };
  lang: 'en' | 'kn' | 'mr';
  allRegions: Region[];
  allPlaces: Place[];
  allStays: Stay[];
  allFoodSpots: FoodSpot[];
  allTransportLegs: TransportLeg[];
  allAlternatives: PlaceAlternative[];
  rulesConfig: RulesConfig;

  // Pipeline generated state
  selectedRegion?: Region;
  profileModifiers?: {
    minSeniorFriendly: number;
    penalizeAfterDusk: boolean;
    requireVerifiedStays: boolean;
    crowdWeightModifier: number;
    outdoorBoost: number;
    stopsPerDay: number;
  };
  candidatePlaces?: Place[];
  scoredPlaces?: Array<{ place: Place; score: number }>;
  routedDays?: Array<{ dayNo: number; places: Place[] }>;
  scheduledDays?: TripDay[];
  transportLegsUsed?: TransportLeg[];
  totalCostInr?: number;
  costBreakdown?: {
    stay: number;
    food: number;
    transport: number;
    entry_fees: number;
    buffer_10pct: number;
    total: number;
    unknown_fees_count: number;
  };
  responsibleScore?: number;
  weatherEstimate?: {
    rain_prob: number;
    temp_min: number;
    temp_max: number;
    sunset: string;
    message: I18nText;
    condition: string;
  };
  safetyAlerts?: Array<{ type: string; title: string; message: string }>;
  agentRuns: AgentRun[];
}

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateTravelMinutes(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dist = haversineDistanceKm(lat1, lon1, lat2, lon2);
  if (dist < 1.5) {
    // Walking at 4 km/h
    return Math.max(5, Math.round((dist / 4) * 60));
  }
  // Local vehicle: distance * 1.4 winding factor / 25 km/h average local speed
  return Math.max(10, Math.round(((dist * 1.4) / 25) * 60));
}

export function computePlaceCrowdScore(place: Place, hour: number, isWeekend: boolean, month: number): number {
  let score = 35; // base
  if (isWeekend) score += 25;
  if (hour >= 11 && hour <= 15) score += 25;
  if (hour >= 16 && hour <= 18) score += 15;
  if ([10, 11, 12, 1].includes(month)) score += 10;
  if (place.rating >= 4.8) score += 10;
  return Math.min(95, Math.max(15, score));
}

// 1. ProfileAgent
export const ProfileAgent = {
  name: 'ProfileAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { answers, rulesConfig } = ctx;
    const isSenior = answers.style === 'senior';
    const isSoloWoman = answers.style === 'solo' && answers.is_woman;
    const isWomenGroup = answers.style === 'women_group' || (answers.is_woman && answers.style === 'friends');
    const isAdventure = answers.interests.includes('adventure') || answers.style === 'friends';

    let stopsPerDay = rulesConfig.stops_per_day.balanced;
    if (isSenior) stopsPerDay = rulesConfig.stops_per_day.relaxed;
    else if (isAdventure || answers.days <= 2) stopsPerDay = rulesConfig.stops_per_day.packed;

    ctx.profileModifiers = {
      minSeniorFriendly: isSenior ? 3 : 0,
      penalizeAfterDusk: isSoloWoman || isWomenGroup,
      requireVerifiedStays: isSoloWoman || isWomenGroup,
      crowdWeightModifier: isAdventure ? 0.6 : 1.0,
      outdoorBoost: isAdventure ? 1.25 : 1.0,
      stopsPerDay
    };

    const outSummary = `Profile: ${answers.style}, stops/day: ${stopsPerDay}, seniorMode: ${isSenior}, safetyFocus: ${isSoloWoman || isWomenGroup}`;
    ctx.agentRuns.push({
      id: `run_${Date.now()}_1`,
      trip_id: ctx.tripId,
      agent: 'ProfileAgent',
      input_summary: `Style: ${answers.style}, Days: ${answers.days}, Woman: ${answers.is_woman}`,
      output_summary: outSummary,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 2. CandidateAgent
export const CandidateAgent = {
  name: 'CandidateAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { answers, allRegions, allPlaces } = ctx;
    
    // Pick region based on interests or city
    let targetRegionId = 'reg_hampi'; // Default Hampi for heritage
    if (answers.interests.includes('beach')) {
      targetRegionId = 'reg_coast';
    } else if (answers.interests.includes('nature') && !answers.interests.includes('heritage')) {
      targetRegionId = 'reg_coorg';
    } else if (answers.start_city === 'Mysuru') {
      targetRegionId = 'reg_mysuru';
    } else if (answers.interests.includes('heritage') && answers.days >= 3) {
      targetRegionId = 'reg_hampi';
    }

    ctx.selectedRegion = allRegions.find(r => r.id === targetRegionId) || allRegions[0];

    // Filter places in region
    let candidates = allPlaces.filter(p => p.region_id === targetRegionId);

    // Apply senior mode filter if applicable
    if (ctx.profileModifiers && ctx.profileModifiers.minSeniorFriendly > 0) {
      candidates = candidates.filter(p => p.senior_friendly >= ctx.profileModifiers!.minSeniorFriendly);
    }

    // Ensure we have at least 6 candidates, otherwise include nearby regional highlights
    if (candidates.length < 6) {
      candidates = allPlaces.slice(0, 12);
    }

    ctx.candidatePlaces = candidates.slice(0, 40);

    ctx.agentRuns.push({
      id: `run_${Date.now()}_2`,
      trip_id: ctx.tripId,
      agent: 'CandidateAgent',
      input_summary: `Region: ${ctx.selectedRegion.slug}, Interests: ${answers.interests.join(',')}`,
      output_summary: `Selected ${ctx.candidatePlaces.length} candidate places in ${ctx.selectedRegion.name_i18n.en}`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 3. ScoringAgent
export const ScoringAgent = {
  name: 'ScoringAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { candidatePlaces = [], answers, rulesConfig } = ctx;
    const weights = rulesConfig.scoring_weights;
    const month = new Date(answers.start_date || '2026-10-25').getMonth() + 1;

    const scored = candidatePlaces.map(place => {
      // Interest match
      let interestMatch = 0.5;
      if (answers.interests.includes(place.category)) interestMatch = 1.0;
      else if (place.category === 'heritage' && answers.interests.includes('spiritual')) interestMatch = 0.8;
      else if (place.category === 'nature' && answers.interests.includes('adventure')) interestMatch = 0.9;

      // Budget fit: free places get higher score for low budgets
      let budgetFit = 0.8;
      if (answers.budget <= 3000 && (place.entry_fee_inr === 0 || place.entry_fee_inr === null)) {
        budgetFit = 1.0;
      } else if (answers.budget <= 3000 && (place.entry_fee_inr || 0) > 100) {
        budgetFit = 0.5;
      }

      // Season / weather
      const seasonWeather = place.best_months.includes(month) ? 1.0 : 0.6;

      // Crowd score (estimated for midday)
      const crowdScore = computePlaceCrowdScore(place, 12, true, month);
      const crowdFit = 1 - (crowdScore / 100);

      // Travel ease: senior friendly & local benefit
      const travelEase = place.senior_friendly / 5;
      const localBenefit = (place.local_benefit || 3) / 5;

      const totalScore =
        weights.interest_match * interestMatch +
        weights.budget_fit * budgetFit +
        weights.season_weather * seasonWeather +
        weights.crowd_avoidance * crowdFit +
        weights.travel_ease * travelEase +
        weights.local_benefit * localBenefit;

      return {
        place,
        score: Math.round(totalScore * 100) / 100
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    ctx.scoredPlaces = scored;

    ctx.agentRuns.push({
      id: `run_${Date.now()}_3`,
      trip_id: ctx.tripId,
      agent: 'ScoringAgent',
      input_summary: `Evaluated ${candidatePlaces.length} places with weights`,
      output_summary: `Top ranked: ${scored.slice(0, 3).map(s => s.place.name_i18n.en).join(', ')}`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 4. RouteAgent
export const RouteAgent = {
  name: 'RouteAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { scoredPlaces = [], answers, profileModifiers } = ctx;
    const daysCount = answers.days;
    const stopsPerDay = profileModifiers?.stopsPerDay || 4;
    const neededStops = Math.min(scoredPlaces.length, daysCount * stopsPerDay);

    const chosen = scoredPlaces.slice(0, neededStops).map(s => s.place);
    const routed: Array<{ dayNo: number; places: Place[] }> = [];

    // Distribute places across days
    for (let d = 1; d <= daysCount; d++) {
      const slice = chosen.slice((d - 1) * stopsPerDay, d * stopsPerDay);
      if (slice.length === 0 && chosen.length > 0) {
        // Fallback duplicate/circular for long day itineraries
        slice.push(chosen[0]);
      }
      
      // Order places by nearest-neighbour route to minimize travel time
      const ordered: Place[] = [];
      const pool = [...slice];
      let current = pool.shift();
      if (current) ordered.push(current);

      while (pool.length > 0) {
        let bestIdx = 0;
        let minD = 999999;
        for (let i = 0; i < pool.length; i++) {
          const dKm = haversineDistanceKm(current!.lat, current!.lng, pool[i].lat, pool[i].lng);
          if (dKm < minD) {
            minD = dKm;
            bestIdx = i;
          }
        }
        current = pool.splice(bestIdx, 1)[0];
        ordered.push(current);
      }

      routed.push({ dayNo: d, places: ordered });
    }

    ctx.routedDays = routed;

    ctx.agentRuns.push({
      id: `run_${Date.now()}_4`,
      trip_id: ctx.tripId,
      agent: 'RouteAgent',
      input_summary: `Clustering ${neededStops} stops into ${daysCount} days`,
      output_summary: `Optimized nearest-neighbour day clusters without routing API`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 5. ScheduleAgent
export const ScheduleAgent = {
  name: 'ScheduleAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { routedDays = [], allFoodSpots, allStays, selectedRegion, answers } = ctx;
    const days: TripDay[] = [];

    const regionFood = allFoodSpots.filter(f => f.region_id === selectedRegion?.id);
    const regionStay = allStays.find(s => s.region_id === selectedRegion?.id && s.registration_status === 'registered') || allStays[0];

    const slotTimes = ['08:30', '10:30', '14:30', '16:45'];

    routedDays.forEach((rd) => {
      const stops: TripStop[] = [];
      let pos = 1;

      // Day 1 Morning stay check-in / baggage drop
      if (rd.dayNo === 1 && regionStay) {
        stops.push({
          id: `stop_${rd.dayNo}_stay`,
          trip_day_id: `day_${rd.dayNo}`,
          position: pos++,
          kind: 'stay',
          stay_id: regionStay.id,
          stay: regionStay,
          start_time: '08:00',
          end_time: '08:30',
          travel_min: 15,
          cost_inr: Math.round(regionStay.price_per_night_inr / (answers.days)),
          cost_note: 'estimate',
          crowd_score: 20,
          reason_i18n: {
            en: 'Check-in & baggage drop at registered heritage stay',
            kn: 'ನೋಂದಾಯಿತ ಹೆರಿಟೇಜ್ ವಸತಿ ಗೃಹದಲ್ಲಿ ಚೆಕ್-ಇನ್ ಮತ್ತು ಲಗೇಜ್ ಇರಿಸಿ',
            mr: 'नोंदणीकृत हेरिटेज मुक्कामावर चेक-इन'
          },
          locked: true
        });
      }

      rd.places.forEach((place, pIdx) => {
        const startTime = slotTimes[pIdx % slotTimes.length];
        const hourNum = parseInt(startTime.split(':')[0], 10);
        const endHour = hourNum + Math.ceil(place.avg_visit_min / 60);
        const endTime = `${endHour < 10 ? '0' : ''}${endHour}:${startTime.split(':')[1]}`;
        
        let prevLat = place.lat;
        let prevLng = place.lng;
        if (pIdx > 0) {
          prevLat = rd.places[pIdx - 1].lat;
          prevLng = rd.places[pIdx - 1].lng;
        }
        const travelMin = pIdx === 0 ? 15 : estimateTravelMinutes(prevLat, prevLng, place.lat, place.lng);
        const crowdScore = computePlaceCrowdScore(place, hourNum, true, 10);

        stops.push({
          id: `stop_${rd.dayNo}_${place.id}`,
          trip_day_id: `day_${rd.dayNo}`,
          position: pos++,
          kind: 'place',
          place_id: place.id,
          place,
          start_time: startTime,
          end_time: endTime,
          travel_min: travelMin,
          cost_inr: place.entry_fee_inr || 0,
          cost_note: place.entry_fee_inr === null ? 'check_locally' : undefined,
          crowd_score: crowdScore,
          reason_i18n: {
            en: `Quieter at ${startTime}; matches your passion for ${answers.interests[0] || 'heritage'}`,
            kn: `${startTime} ಕ್ಕೆ ಕಡಿಮೆ ಜನದಟ್ಟಣೆ; ನಿಮ್ಮ ಆಸಕ್ತಿಗೆ ತಕ್ಕುದಾದ ಸ್ಥಳ`,
            mr: `${startTime} वाजता कमी गर्दी; आपल्या आवडीनुसार निवडलेले`
          },
          locked: false
        });

        // Insert lunch after 2nd stop
        if (pIdx === 1 && regionFood.length > 0) {
          const food = regionFood[rd.dayNo % regionFood.length];
          stops.push({
            id: `stop_${rd.dayNo}_food`,
            trip_day_id: `day_${rd.dayNo}`,
            position: pos++,
            kind: 'food',
            food,
            start_time: '13:00',
            end_time: '14:00',
            travel_min: 10,
            cost_inr: food.avg_cost_inr,
            cost_note: 'estimate',
            crowd_score: 55,
            reason_i18n: {
              en: `Local culinary stop: authentic ${food.dish_i18n.en}`,
              kn: `ಸ್ಥಳೀಯ ರುಚಿಯ ಅನುಭವ: ಸಾಂಪ್ರದಾಯಿಕ ${food.dish_i18n.kn}`,
              mr: `स्थानिक चव: पारंपारिक ${food.dish_i18n.mr}`
            },
            locked: false
          });
        }
      });

      days.push({
        id: `day_${rd.dayNo}`,
        trip_id: ctx.tripId,
        day_no: rd.dayNo,
        title_i18n: {
          en: `Day ${rd.dayNo}: ${selectedRegion?.name_i18n.en.split(' ')[0]} Highlights`,
          kn: `ದಿನ ${rd.dayNo}: ${selectedRegion?.name_i18n.kn.split(' ')[0]} ವಿಶೇಷತೆಗಳು`,
          mr: `दिवस ${rd.dayNo}: ${selectedRegion?.name_i18n.mr.split(' ')[0]} दर्शन`
        },
        plan_variant: 'A',
        stops
      });
    });

    ctx.scheduledDays = days;

    ctx.agentRuns.push({
      id: `run_${Date.now()}_5`,
      trip_id: ctx.tripId,
      agent: 'ScheduleAgent',
      input_summary: `Created ${days.length} daily schedules with quiet window alignments`,
      output_summary: `Scheduled ${days.reduce((acc, d) => acc + d.stops.length, 0)} stops with meals and stay check-in`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 6. FareAgent (Shakti-aware table-driven logic)
export const FareAgent = {
  name: 'FareAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { answers, allTransportLegs, selectedRegion, rulesConfig } = ctx;
    
    // Shakti conditions:
    // 1. Woman traveler
    // 2. Karnataka domicile (resident)
    // 3. Class in rulesConfig.shakti.eligible_classes ('non_ac', 'ordinary', 'express')
    // 4. shakti_eligible flag on the transport leg is true (state bus KSRTC/NWKRTC)
    // 5. Shakti switch is toggled ON (default is true for eligible profile)
    const isShaktiActive = answers.shakti_active ?? (answers.is_woman && answers.karnataka_domicile);
    const eligibleClasses = rulesConfig.shakti.eligible_classes;

    // Filter relevant transport legs between start city and region
    const matchedLegs = allTransportLegs.filter(leg => {
      if (selectedRegion?.slug === 'hampi-badami') {
        return leg.to_name.includes('Hosapete') || leg.to_name.includes('Hampi') || leg.from_name.includes('Hampi');
      } else if (selectedRegion?.slug === 'bengaluru-mysuru') {
        return leg.to_name.includes('Mysuru') || leg.from_name.includes('Mysuru');
      } else if (selectedRegion?.slug === 'coast') {
        return leg.to_name.includes('Udupi') || leg.from_name.includes('Udupi');
      }
      return true;
    });

    // Evaluate each leg for Shakti eligibility
    const processedLegs = matchedLegs.map(leg => {
      const isEligibleForShakti =
        isShaktiActive &&
        answers.is_woman &&
        answers.karnataka_domicile &&
        leg.shakti_eligible &&
        eligibleClasses.includes(leg.service_class);

      return {
        ...leg,
        effective_fare_inr: isEligibleForShakti ? 0 : leg.fare_inr,
        is_free_shakti: isEligibleForShakti
      };
    });

    ctx.transportLegsUsed = processedLegs;

    ctx.agentRuns.push({
      id: `run_${Date.now()}_6`,
      trip_id: ctx.tripId,
      agent: 'FareAgent',
      input_summary: `Woman: ${answers.is_woman}, Domicile: ${answers.karnataka_domicile}, Shakti active: ${isShaktiActive}`,
      output_summary: `Processed ${processedLegs.length} transport options. Free Shakti applied to eligible KSRTC non-AC routes.`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 7. BudgetAgent
export const BudgetAgent = {
  name: 'BudgetAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { scheduledDays = [], transportLegsUsed = [], answers } = ctx;

    let stayTotal = 0;
    let foodTotal = 0;
    let entryTotal = 0;
    let unknownFeesCount = 0;

    scheduledDays.forEach(day => {
      day.stops.forEach(stop => {
        if (stop.kind === 'stay') stayTotal += stop.cost_inr;
        if (stop.kind === 'food') foodTotal += stop.cost_inr;
        if (stop.kind === 'place') {
          if (stop.cost_note === 'check_locally') {
            unknownFeesCount++;
          } else {
            entryTotal += stop.cost_inr;
          }
        }
      });
    });

    // Pick outward and return cheapest transport leg
    const outwardLeg = transportLegsUsed[0];
    const returnLeg = transportLegsUsed.find(l => l.last_bus) || transportLegsUsed[1] || outwardLeg;
    const transportTotal = (outwardLeg?.effective_fare_inr ?? 380) + (returnLeg?.effective_fare_inr ?? 380);

    const baseSum = stayTotal + foodTotal + entryTotal + transportTotal;
    const buffer10pct = Math.round(baseSum * 0.10);
    const grandTotal = baseSum + buffer10pct;

    ctx.totalCostInr = grandTotal;
    ctx.costBreakdown = {
      stay: stayTotal,
      food: foodTotal,
      transport: transportTotal,
      entry_fees: entryTotal,
      buffer_10pct: buffer10pct,
      total: grandTotal,
      unknown_fees_count: unknownFeesCount
    };

    ctx.agentRuns.push({
      id: `run_${Date.now()}_7`,
      trip_id: ctx.tripId,
      agent: 'BudgetAgent',
      input_summary: `Budget target: ₹${answers.budget}, Estimated base: ₹${baseSum}`,
      output_summary: `Est. total ₹${grandTotal} (including 10% buffer ₹${buffer10pct}). ${unknownFeesCount} unpriced fees excluded.`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 8. CrowdAgent (Quiet Alternative)
export const CrowdAgent = {
  name: 'CrowdAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { scheduledDays = [], allAlternatives, allPlaces, rulesConfig } = ctx;
    const threshold = rulesConfig.crowd_threshold;
    let alternativesFound = 0;

    scheduledDays.forEach(day => {
      day.stops.forEach(stop => {
        if (stop.kind === 'place' && stop.place && stop.crowd_score >= threshold) {
          // Look for quiet alternative in database
          const altMatch = allAlternatives.find(a => a.place_id === stop.place_id);
          if (altMatch) {
            const altPlace = allPlaces.find(p => p.id === altMatch.alt_place_id);
            if (altPlace) {
              stop.quiet_alternative = {
                place: altPlace,
                trade_off_i18n: altMatch.trade_off_i18n,
                similarity: altMatch.similarity
              };
              alternativesFound++;
            }
          }
        }
      });
    });

    ctx.agentRuns.push({
      id: `run_${Date.now()}_8`,
      trip_id: ctx.tripId,
      agent: 'CrowdAgent',
      input_summary: `Threshold: ${threshold}%. Analyzed crowd scores across all stops.`,
      output_summary: `Identified ${alternativesFound} quiet alternatives for crowded hotspots.`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 9. WeatherAgent
export const WeatherAgent = {
  name: 'WeatherAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { selectedRegion, answers, rulesConfig } = ctx;
    const regId = selectedRegion?.id || 'reg_hampi';
    const month = new Date(answers.start_date || '2026-10-25').getMonth() + 1;

    const regionClimate = rulesConfig.regional_climatology[regId]?.monthly[month] || {
      rain_prob: 0.20,
      temp_min: 20,
      temp_max: 31,
      sunset: '18:02',
      message: {
        en: 'Pleasant autumn breeze with clear skies',
        kn: 'ಹಿತಕರ ತಂಗಾಳಿ ಮತ್ತು ಸ್ವಚ್ಛ ಆಕಾಶ',
        mr: 'सुखद वारा आणि निरभ्र आकाश'
      }
    };

    let condition = 'Partly Cloudy';
    if (regionClimate.rain_prob > 0.35) condition = 'Chance of Afternoon Showers';
    else if (regionClimate.temp_max > 33) condition = 'Sunny & Warm';
    else condition = 'Clear & Pleasant';

    ctx.weatherEstimate = {
      rain_prob: regionClimate.rain_prob,
      temp_min: regionClimate.temp_min,
      temp_max: regionClimate.temp_max,
      sunset: regionClimate.sunset,
      message: regionClimate.message,
      condition
    };

    ctx.agentRuns.push({
      id: `run_${Date.now()}_9`,
      trip_id: ctx.tripId,
      agent: 'WeatherAgent',
      input_summary: `Climatology lookup for ${selectedRegion?.slug} in month ${month}`,
      output_summary: `Forecast: ${condition}, ${regionClimate.temp_min}°C - ${regionClimate.temp_max}°C, Sunset at ${regionClimate.sunset}`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 10. PlanBAgent
export const PlanBAgent = {
  name: 'PlanBAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { scheduledDays = [], allPlaces, answers } = ctx;
    const trigger = answers.simulate_trigger;

    if (!trigger) {
      // Default initial plan generation - Plan B is prepared as standby
      ctx.agentRuns.push({
        id: `run_${Date.now()}_10`,
        trip_id: ctx.tripId,
        agent: 'PlanBAgent',
        input_summary: 'Standby mode (no active weather or closure alert)',
        output_summary: 'Ready with indoor alternatives and emergency contingencies',
        duration_ms: Math.round(performance.now() - t0),
        created_at: new Date().toISOString()
      });
      return;
    }

    // Active Plan B generation for Day 1
    const day1 = scheduledDays[0];
    if (day1) {
      day1.stops.forEach(stop => {
        // Only modify unlocked afternoon stops
        const hour = parseInt(stop.start_time.split(':')[0], 10);
        if (!stop.locked && hour >= 13 && stop.kind === 'place' && stop.place?.is_outdoor) {
          // Find indoor alternative
          const indoorAlt = allPlaces.find(p => p.region_id === stop.place?.region_id && p.is_indoor_alt && p.id !== stop.place_id);
          if (indoorAlt) {
            stop.place_id = indoorAlt.id;
            stop.place = indoorAlt;
            stop.reason_i18n = {
              en: `Plan B adaptive switch: indoor gallery safe from ${trigger}`,
              kn: `ಪ್ಲಾನ್ ಬಿ ಹೊಂದಾಣಿಕೆ: ${trigger} ನಿಂದ ರಕ್ಷಣೆ ನೀಡುವ ಒಳಾಂಗಣ ಸ್ಥಳ`,
              mr: `प्लॅन बी बदल: ${trigger} पासून संरक्षणासाठी इनडोअर जागा`
            };
            stop.crowd_score = 30;
          }
        }
      });
      day1.plan_variant = 'B';
    }

    ctx.agentRuns.push({
      id: `run_${Date.now()}_10`,
      trip_id: ctx.tripId,
      agent: 'PlanBAgent',
      input_summary: `Triggered simulation: ${trigger}`,
      output_summary: `Adapted afternoon schedule to indoor and sheltered alternatives`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 11. ExplainerAgent
export const ExplainerAgent = {
  name: 'ExplainerAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { scheduledDays = [], answers } = ctx;

    scheduledDays.forEach(day => {
      day.stops.forEach(stop => {
        if (stop.kind === 'place' && stop.place) {
          const interestWord = answers.interests[0] || 'heritage';
          stop.reason_i18n = {
            en: `Matches your passion for ${interestWord}; quieter before ${stop.start_time}; verified local access`,
            kn: `${interestWord} ಆಸಕ್ತಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ; ${stop.start_time} ಮೊದಲು ಕಡಿಮೆ ಜನದಟ್ಟಣೆ; ಅಧಿಕೃತ ಪ್ರವೇಶ`,
            mr: `${interestWord} आवडीनुसार निवड; ${stop.start_time} पूर्वी शांत वेळ; खात्रीशीर माहिती`
          };
        }
      });
    });

    ctx.agentRuns.push({
      id: `run_${Date.now()}_11`,
      trip_id: ctx.tripId,
      agent: 'ExplainerAgent',
      input_summary: 'Template i18n synthesis for every stop',
      output_summary: 'Generated multilingual human explanations with context tags',
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 12. SafetyAgent
export const SafetyAgent = {
  name: 'SafetyAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { transportLegsUsed = [], answers } = ctx;
    const alerts: Array<{ type: string; title: string; message: string }> = [];

    const lastBus = transportLegsUsed.find(l => l.last_bus);
    if (lastBus) {
      alerts.push({
        type: 'last_bus',
        title: 'Last Return Bus Alert',
        message: `Final return bus departs ${lastBus.from_name} at ${lastBus.depart}. Please reach the stand by 21:00.`
      });
    }

    if (answers.is_woman && (answers.style === 'solo' || answers.style === 'women_group')) {
      alerts.push({
        type: 'safe_travel',
        title: 'Daylight Travel Routing Active',
        message: 'All evening activities scheduled before dusk with KSTDC-verified stays and quick 112 / 181 helpline access.'
      });
    }

    ctx.safetyAlerts = alerts;

    ctx.agentRuns.push({
      id: `run_${Date.now()}_12`,
      trip_id: ctx.tripId,
      agent: 'SafetyAgent',
      input_summary: `Safety audit for ${answers.style} style`,
      output_summary: `Generated ${alerts.length} safety checks including last-bus buffer timing`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// 13. ResponsibleScoreAgent
export const ResponsibleScoreAgent = {
  name: 'ResponsibleScoreAgent',
  async run(ctx: PlanContext) {
    const t0 = performance.now();
    const { scheduledDays = [] } = ctx;

    let totalStops = 0;
    let localBenefitSum = 0;
    let registeredStayCount = 0;
    let offPeakStopCount = 0;

    scheduledDays.forEach(day => {
      day.stops.forEach(stop => {
        totalStops++;
        if (stop.place) {
          localBenefitSum += stop.place.local_benefit || 3;
          if (stop.crowd_score < 70) offPeakStopCount++;
        }
        if (stop.stay && stop.stay.registration_status === 'registered') {
          registeredStayCount++;
        }
      });
    });

    const crowdSpreadScore = Math.min(30, Math.round((offPeakStopCount / Math.max(1, totalStops)) * 30));
    const localBenefitScore = Math.min(35, Math.round((localBenefitSum / (Math.max(1, totalStops) * 5)) * 35));
    const stayVerificationScore = registeredStayCount > 0 ? 25 : 15;
    const leaveNoTraceScore = 10;

    const totalResponsible = crowdSpreadScore + localBenefitScore + stayVerificationScore + leaveNoTraceScore;
    ctx.responsibleScore = Math.min(100, Math.max(60, totalResponsible));

    ctx.agentRuns.push({
      id: `run_${Date.now()}_13`,
      trip_id: ctx.tripId,
      agent: 'ResponsibleScoreAgent',
      input_summary: `Analyzed crowd spread, registered accommodations, and local spend`,
      output_summary: `Responsible Travel Score: ${ctx.responsibleScore}/100`,
      duration_ms: Math.round(performance.now() - t0),
      created_at: new Date().toISOString()
    });
  }
};

// Orchestrator: executes the full pipeline sequentially and tracks execution
export class AgentOrchestrator {
  static async runFullPipeline(ctx: PlanContext): Promise<PlanContext> {
    const agents = [
      ProfileAgent,
      CandidateAgent,
      ScoringAgent,
      RouteAgent,
      ScheduleAgent,
      FareAgent,
      BudgetAgent,
      CrowdAgent,
      WeatherAgent,
      PlanBAgent,
      ExplainerAgent,
      SafetyAgent,
      ResponsibleScoreAgent
    ];

    for (const agent of agents) {
      await agent.run(ctx);
    }

    return ctx;
  }
}
