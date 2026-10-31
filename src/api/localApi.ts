import { db as firestoreDb, initAndSeedDatabase } from '../lib/db';
const db: any = firestoreDb;
import {
  Trip,
  TripDay,
  TripStop,
  User,
  TravellerProfile,
  SavedPlace,
  EmergencyContact,
  AgentRun,
  TransportLeg
} from '../../shared/types';
import {
  AgentOrchestrator,
  PlanContext,
  computePlaceCrowdScore,
  estimateTravelMinutes,
  haversineDistanceKm
} from '../../shared/agents';
import { AssistantAgent } from '../../shared/agents/assistant';
import { OfflineAgent } from '../../shared/agents/offline';
import { SEED_RULES_CONFIG } from '../../shared/data/seedData';

// Ensure DB is initialized
async function ensureDb() {
  await initAndSeedDatabase();
}

export class LocalApi {
  static async getCurrentUser(): Promise<User> {
    await ensureDb();
    let user = await db.users.toCollection().first();
    if (!user) {
      user = {
        id: 'usr_local_default',
        name: 'Karnataka Yatri',
        phone_hash: null,
        pin_hash: null,
        lang: 'en',
        created_at: new Date().toISOString()
      };
      await db.users.add(user);
      await db.traveller_profiles.add({
        user_id: user.id,
        is_woman: true,
        karnataka_domicile: true,
        senior_mode: false,
        large_text: false,
        travel_style: 'solo',
        default_budget_inr: 6000,
        interests: ['heritage', 'food']
      });
    }
    return user;
  }

  static async login(phone: string, pin: string): Promise<User> {
    await ensureDb();
    const phoneHash = btoa(phone);
    const pinHash = btoa(pin);
    let user = await db.users.where('phone_hash').equals(phoneHash).first();
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        name: `Traveler ${phone.slice(-4)}`,
        phone_hash: phoneHash,
        pin_hash: pinHash,
        lang: 'en',
        created_at: new Date().toISOString()
      };
      await db.users.add(user);
    }
    return user;
  }

  static async getConfig() {
    await ensureDb();
    const regions = await db.regions.toArray();
    const rules = await db.rules_config.toArray();
    const rulesMap = Object.fromEntries(rules.map(r => [r.key, r.value]));
    return {
      regions,
      rules: rulesMap || SEED_RULES_CONFIG,
      emergency_numbers: SEED_RULES_CONFIG.emergency_numbers
    };
  }

  static async generateTrip(payload: {
    interests: string[];
    days: number;
    budget: number;
    style: string;
    start_city: string;
    start_date: string;
    is_woman: boolean;
    karnataka_domicile: boolean;
    lang: 'en' | 'kn' | 'mr';
  }): Promise<Trip> {
    await ensureDb();
    const user = await this.getCurrentUser();
    const tripId = `trip_${Date.now()}`;

    const allRegions = await db.regions.toArray();
    const allPlaces = await db.places.toArray();
    const allStays = await db.stays.toArray();
    const allFoodSpots = await db.food_spots.toArray();
    const allTransportLegs = await db.transport_legs.toArray();
    const allAlternatives = await db.place_alternatives.toArray();

    const ctx: PlanContext = {
      tripId,
      userId: user.id,
      answers: {
        ...payload,
        shakti_active: payload.is_woman && payload.karnataka_domicile
      },
      lang: payload.lang || 'en',
      allRegions,
      allPlaces,
      allStays,
      allFoodSpots,
      allTransportLegs,
      allAlternatives,
      rulesConfig: SEED_RULES_CONFIG,
      agentRuns: []
    };

    // Run the 15-agent pipeline!
    await AgentOrchestrator.runFullPipeline(ctx);

    const trip: Trip = {
      id: tripId,
      user_id: user.id,
      region_id: ctx.selectedRegion?.id || 'reg_hampi',
      title: `${ctx.selectedRegion?.name_i18n[payload.lang] || ctx.selectedRegion?.name_i18n.en} Discovery`,
      start_date: payload.start_date || '2026-10-25',
      days: payload.days,
      budget_inr: payload.budget,
      style: payload.style,
      group_type: payload.style,
      answers: ctx.answers,
      est_total_inr: ctx.totalCostInr || 5400,
      status: 'active',
      responsible_score: ctx.responsibleScore || 88,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      days_data: ctx.scheduledDays
    };

    // Save trip, days, stops, and agent_runs to DB
    await db.trips.put(trip);
    if (ctx.scheduledDays) {
      for (const d of ctx.scheduledDays) {
        await db.trip_days.put(d);
        for (const s of d.stops) {
          await db.trip_stops.put(s);
        }
      }
    }
    for (const run of ctx.agentRuns) {
      await db.agent_runs.put(run);
    }

    return trip;
  }

  static async getTrips(): Promise<Trip[]> {
    await ensureDb();
    const trips = await db.trips.toArray();
    return trips.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getTrip(tripId: string): Promise<Trip | null> {
    await ensureDb();
    const trip = await db.trips.get(tripId);
    if (!trip) return null;

    const rawDays = await db.trip_days.where('trip_id').equals(tripId).toArray();
    const days = rawDays.sort((a, b) => a.day_no - b.day_no);
    for (const day of days) {
      const rawStops = await db.trip_stops.where('trip_day_id').equals(day.id).toArray();
      const stops = rawStops.sort((a, b) => a.position - b.position);
      // Hydrate stops
      for (const stop of stops) {
        if (stop.place_id && !stop.place) {
          stop.place = await db.places.get(stop.place_id);
        }
        if (stop.stay_id && !stop.stay) {
          stop.stay = await db.stays.get(stop.stay_id);
        }
      }
      day.stops = stops;
    }
    trip.days_data = days;
    return trip;
  }

  static async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null> {
    await ensureDb();
    const trip = await db.trips.get(tripId);
    if (!trip) return null;
    const updated = {
      ...trip,
      ...updates,
      version: trip.version + 1,
      updated_at: new Date().toISOString()
    };
    await db.trips.put(updated);
    return updated;
  }

  static async toggleShakti(tripId: string, active: boolean): Promise<Trip | null> {
    await ensureDb();
    const trip = await this.getTrip(tripId);
    if (!trip) return null;

    trip.answers.shakti_active = active;

    // Recalculate fares
    const allTransport = await db.transport_legs.toArray();
    const outwardBus = allTransport.find(l => l.shakti_eligible && l.service_class === 'express');
    const returnBus = allTransport.find(l => l.last_bus && l.shakti_eligible);

    let farePerLeg = outwardBus ? outwardBus.fare_inr : 460;
    let returnFare = returnBus ? returnBus.fare_inr : 510;

    let transportTotal = (farePerLeg + returnFare);
    if (active && trip.answers.is_woman && trip.answers.karnataka_domicile) {
      transportTotal = 0; // Both legs free under Shakti!
    }

    // Recalculate stay and entry fees
    let otherSum = 0;
    trip.days_data?.forEach(d => {
      d.stops.forEach(s => {
        if (s.kind === 'stay' || s.kind === 'food') otherSum += s.cost_inr;
        if (s.kind === 'place') otherSum += (s.cost_inr || 0);
      });
    });

    const baseSum = otherSum + transportTotal;
    const buffer = Math.round(baseSum * 0.10);
    trip.est_total_inr = baseSum + buffer;
    trip.version += 1;
    trip.updated_at = new Date().toISOString();

    await db.trips.put(trip);
    return trip;
  }

  static async swapStop(tripId: string, stopId: string, direction: 'up' | 'down'): Promise<Trip | null> {
    await ensureDb();
    const trip = await this.getTrip(tripId);
    if (!trip || !trip.days_data) return null;

    for (const day of trip.days_data) {
      const idx = day.stops.findIndex(s => s.id === stopId);
      if (idx !== -1) {
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx >= 0 && targetIdx < day.stops.length) {
          const temp = day.stops[idx];
          day.stops[idx] = day.stops[targetIdx];
          day.stops[targetIdx] = temp;

          // Re-index positions
          day.stops.forEach((s, i) => {
            s.position = i + 1;
            db.trip_stops.put(s);
          });
          break;
        }
      }
    }

    trip.version += 1;
    await db.trips.put(trip);
    return trip;
  }

  static async removeStop(tripId: string, stopId: string): Promise<Trip | null> {
    await ensureDb();
    const trip = await this.getTrip(tripId);
    if (!trip || !trip.days_data) return null;

    for (const day of trip.days_data) {
      const idx = day.stops.findIndex(s => s.id === stopId);
      if (idx !== -1) {
        day.stops.splice(idx, 1);
        await db.trip_stops.delete(stopId);
        // Re-index
        day.stops.forEach((s, i) => {
          s.position = i + 1;
          db.trip_stops.put(s);
        });
        break;
      }
    }

    trip.version += 1;
    await db.trips.put(trip);
    return trip;
  }

  static async toggleLockStop(tripId: string, stopId: string): Promise<Trip | null> {
    await ensureDb();
    const stop = await db.trip_stops.get(stopId);
    if (!stop) return null;
    stop.locked = !stop.locked;
    await db.trip_stops.put(stop);
    return this.getTrip(tripId);
  }

  static async acceptQuietAlternative(tripId: string, stopId: string): Promise<Trip | null> {
    await ensureDb();
    const trip = await this.getTrip(tripId);
    if (!trip || !trip.days_data) return null;

    for (const day of trip.days_data) {
      const stop = day.stops.find(s => s.id === stopId);
      if (stop && stop.quiet_alternative) {
        const altPlace = stop.quiet_alternative.place;
        stop.place_id = altPlace.id;
        stop.place = altPlace;
        stop.cost_inr = altPlace.entry_fee_inr || 0;
        stop.cost_note = altPlace.entry_fee_inr === null ? 'check_locally' : undefined;
        stop.crowd_score = 25; // Quiet crowd score
        stop.reason_i18n = {
          en: `Quiet Alternative accepted: ${stop.quiet_alternative.trade_off_i18n.en}`,
          kn: `ಶಾಂತ ಪರ್ಯಾಯ ಸ್ವೀಕರಿಸಲಾಗಿದೆ: ${stop.quiet_alternative.trade_off_i18n.kn}`,
          mr: `शांत पर्याय स्वीकारला: ${stop.quiet_alternative.trade_off_i18n.mr}`
        };
        delete stop.quiet_alternative;
        await db.trip_stops.put(stop);
        break;
      }
    }

    trip.version += 1;
    await db.trips.put(trip);
    return trip;
  }

  static async generatePlanB(tripId: string, trigger: 'rain' | 'heat' | 'bus_missed' | 'gate_closed'): Promise<{
    previewDiff: Array<{ original: string; replacement: string; reason: string }>;
    trigger: string;
  }> {
    await ensureDb();
    const trip = await this.getTrip(tripId);
    const allPlaces = await db.places.toArray();
    const diff: Array<{ original: string; replacement: string; reason: string }> = [];

    if (trip?.days_data?.[0]) {
      const day1 = trip.days_data[0];
      day1.stops.forEach(s => {
        const hour = parseInt(s.start_time.split(':')[0], 10);
        if (!s.locked && hour >= 13 && s.place?.is_outdoor) {
          const indoorAlt = allPlaces.find(p => p.is_indoor_alt && p.region_id === s.place?.region_id) || allPlaces[3];
          diff.push({
            original: s.place.name_i18n.en,
            replacement: indoorAlt.name_i18n.en,
            reason: trigger === 'rain' ? 'Indoor air-cooled museum safe from torrential afternoon rain' : `Safe alternative from ${trigger}`
          });
        }
      });
    }

    return {
      previewDiff: diff.length > 0 ? diff : [
        {
          original: 'Vittala Temple & Stone Chariot',
          replacement: 'Archaeological Museum Kamalapura',
          reason: 'Switch open stone ruins to air-cooled museum galleries'
        }
      ],
      trigger
    };
  }

  static async applyPlanB(tripId: string, trigger: string): Promise<Trip | null> {
    await ensureDb();
    const trip = await this.getTrip(tripId);
    const allPlaces = await db.places.toArray();
    if (!trip || !trip.days_data) return null;

    const day1 = trip.days_data[0];
    if (day1) {
      day1.plan_variant = 'B';
      await db.trip_days.put(day1);

      for (const s of day1.stops) {
        const hour = parseInt(s.start_time.split(':')[0], 10);
        if (!s.locked && hour >= 13 && s.place?.is_outdoor) {
          const indoorAlt = allPlaces.find(p => p.is_indoor_alt && p.region_id === s.place?.region_id) || allPlaces[3];
          s.place_id = indoorAlt.id;
          s.place = indoorAlt;
          s.cost_inr = indoorAlt.entry_fee_inr || 20;
          s.crowd_score = 30;
          s.reason_i18n = {
            en: `Plan B applied: sheltered indoor gallery safe from ${trigger}`,
            kn: `ಪ್ಲಾನ್ ಬಿ ಅನ್ವಯಿಸಲಾಗಿದೆ: ${trigger} ನಿಂದ ರಕ್ಷಣೆ ನೀಡುವ ಒಳಾಂಗಣ ಗ್ಯಾಲರಿ`,
            mr: `प्लॅन बी लागू: ${trigger} पासून सुरक्षेसाठी इनडोअर गॅलरी`
          };
          await db.trip_stops.put(s);
        }
      }
    }

    trip.version += 1;
    await db.trips.put(trip);
    return this.getTrip(tripId);
  }

  static async revertPlanB(tripId: string): Promise<Trip | null> {
    await ensureDb();
    const trip = await this.getTrip(tripId);
    if (!trip || !trip.days_data) return null;

    const day1 = trip.days_data[0];
    if (day1) {
      day1.plan_variant = 'A';
      await db.trip_days.put(day1);
      // Re-run original candidate schedule for day 1
      const allPlaces = await db.places.toArray();
      const origPlaces = allPlaces.filter(p => p.region_id === trip.region_id).slice(0, 3);
      day1.stops.forEach((s, i) => {
        if (s.kind === 'place' && origPlaces[i]) {
          s.place_id = origPlaces[i].id;
          s.place = origPlaces[i];
          s.cost_inr = origPlaces[i].entry_fee_inr || 0;
          s.crowd_score = 45;
          s.reason_i18n = {
            en: 'Original itinerary restored',
            kn: 'ಮೂಲ ಪ್ರವಾಸ ವೇಳಾಪಟ್ಟಿ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ',
            mr: 'मूळ वेळापत्रक पुनर्संचयित केले'
          };
          db.trip_stops.put(s);
        }
      });
    }

    trip.version += 1;
    await db.trips.put(trip);
    return this.getTrip(tripId);
  }

  static async getNearbyPlaces(q?: string, category?: string): Promise<any[]> {
    await ensureDb();
    const refLat = 15.3350;
    const refLng = 76.4600;

    if (category === 'stays') {
      const stays = await db.stays.toArray();
      return stays.map(s => ({
        id: s.id,
        name_i18n: s.name_i18n,
        category: 'stay',
        lat: s.lat,
        lng: s.lng,
        summary_i18n: {
          en: `Comfortable stay with verified registration: ${s.registration_status}`,
          kn: `ದೃಢೀಕರಿಸಿದ ವಾಸ್ತವ್ಯ: ${s.registration_status}`,
          mr: `सत्यापित मुक्काम: ${s.registration_status}`
        },
        dress_code_i18n: { en: 'Casual', kn: 'ಸಾಮಾನ್ಯ', mr: 'कॅज्युअल' },
        rules_i18n: { en: 'Govt Photo ID required at check-in. Quiet hours 10 PM - 6 AM.', kn: 'ಚೆಕ್-ಇನ್ ಸಮಯದಲ್ಲಿ ಸರ್ಕಾರಿ ಗುರುತಿನ ಚೀಟಿ ಅಗತ್ಯವಿದೆ.', mr: 'चेक-इन वेळी सरकारी ओळखपत्र आवश्यक.' },
        entry_fee_inr: s.price_per_night_inr,
        rating: 4.5,
        distance_km: 2.1,
        travel_min: 8,
        crowd_now: 40,
        is_saved: false,
        last_checked: s.last_checked,
        verified: s.registration_status === 'registered' ? 1 : 0
      }));
    }

    let places = await db.places.toArray();
    const saved = await db.saved_places.toArray();
    const savedIds = new Set(saved.map(s => s.place_id));

    if (category && category !== 'all') {
      places = places.filter(p => p.category === category);
    }

    if (q) {
      const query = q.toLowerCase();
      places = places.filter(p =>
        p.name_i18n.en.toLowerCase().includes(query) ||
        p.name_i18n.kn.toLowerCase().includes(query) ||
        p.name_i18n.mr.toLowerCase().includes(query) ||
        p.summary_i18n.en.toLowerCase().includes(query)
      );
    }

    return places.map(p => {
      const dist = haversineDistanceKm(refLat, refLng, p.lat, p.lng);
      return {
        ...p,
        distance_km: Math.round(dist * 10) / 10,
        travel_min: estimateTravelMinutes(refLat, refLng, p.lat, p.lng),
        crowd_now: computePlaceCrowdScore(p, new Date().getHours(), false, 10),
        is_saved: savedIds.has(p.id)
      };
    });
  }

  static async getPlace(placeId: string) {
    await ensureDb();
    const place = await db.places.get(placeId);
    if (!place) return null;
    const alt = await db.place_alternatives.where('place_id').equals(placeId).first();
    let altPlace = null;
    if (alt) {
      altPlace = await db.places.get(alt.alt_place_id);
    }
    return {
      place,
      alternative: altPlace && alt ? { place: altPlace, trade_off_i18n: alt.trade_off_i18n } : null
    };
  }

  static async toggleBookmarkPlace(placeId: string): Promise<boolean> {
    await ensureDb();
    const user = await this.getCurrentUser();
    const existing = await db.saved_places.get([user.id, placeId]);
    if (existing) {
      await db.saved_places.delete([user.id, placeId]);
      return false;
    } else {
      await db.saved_places.put({
        user_id: user.id,
        place_id: placeId,
        created_at: new Date().toISOString()
      });
      return true;
    }
  }

  static async getSavedItems() {
    await ensureDb();
    const user = await this.getCurrentUser();
    const savedTrips = await db.trips.where('user_id').equals(user.id).toArray();
    const savedPlacesRecs = await db.saved_places.where('user_id').equals(user.id).toArray();
    const places: any[] = [];
    for (const rec of savedPlacesRecs) {
      const p = await db.places.get(rec.place_id);
      if (p) places.push(p);
    }
    return {
      trips: savedTrips,
      places
    };
  }

  static async createOfflinePack(tripId: string) {
    await ensureDb();
    const trip = await this.getTrip(tripId);
    if (!trip) throw new Error('Trip not found');

    const places = await db.places.where('region_id').equals(trip.region_id).toArray();
    const stays = await db.stays.where('region_id').equals(trip.region_id).toArray();
    const transport = await db.transport_legs.toArray();

    const pack = OfflineAgent.createBundle(
      trip,
      places,
      stays,
      transport,
      SEED_RULES_CONFIG,
      SEED_RULES_CONFIG.regional_climatology[trip.region_id],
      SEED_RULES_CONFIG.emergency_numbers
    );

    await db.offline_packs.put(pack);
    return {
      id: pack.id,
      size_bytes: pack.size_bytes,
      formatted_size: OfflineAgent.formatBytes(pack.size_bytes),
      built_at: pack.built_at
    };
  }

  static async askAssistant(query: string, tripId?: string, lang: 'en' | 'kn' | 'mr' = 'en') {
    await ensureDb();
    let trip = null;
    if (tripId) {
      trip = await db.trips.get(tripId);
    }
    const places = await db.places.toArray();
    const food = await db.food_spots.toArray();
    const legs = await db.transport_legs.toArray();

    return AssistantAgent.answerQuestion(query, trip, places, food, legs, lang);
  }

  static async getAgentRuns(tripId: string): Promise<AgentRun[]> {
    await ensureDb();
    const runs = await db.agent_runs.where('trip_id').equals(tripId).toArray();
    return runs.length > 0 ? runs : await db.agent_runs.toArray();
  }

  static async getTransportLegs(): Promise<TransportLeg[]> {
    await ensureDb();
    return db.transport_legs.toArray();
  }

  static async getEmergencyContacts() {
    await ensureDb();
    const user = await this.getCurrentUser();
    return db.emergency_contacts.where('user_id').equals(user.id).toArray();
  }

  static async addEmergencyContact(name: string, phone: string) {
    await ensureDb();
    const user = await this.getCurrentUser();
    const contact: EmergencyContact = {
      user_id: user.id,
      name,
      phone
    };
    await db.emergency_contacts.add(contact);
    return contact;
  }
}
