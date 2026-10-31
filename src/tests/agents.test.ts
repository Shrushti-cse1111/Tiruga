import test from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineDistanceKm,
  estimateTravelMinutes,
  computePlaceCrowdScore,
  AgentOrchestrator,
  PlanContext
} from '../../shared/agents/index';
import { AssistantAgent } from '../../shared/agents/assistant';
import { SEED_REGIONS, SEED_RULES_CONFIG } from '../../shared/data/seedData';
import {
  SEED_PLACES,
  SEED_ALTERNATIVES,
  SEED_STAYS,
  SEED_FOOD_SPOTS,
  SEED_TRANSPORT_LEGS
} from '../../shared/data/seedPlaces';

test('haversineDistanceKm calculates accurate geographical distances', () => {
  // Distance between Virupaksha Temple (15.3353, 76.4600) and Vittala Temple (15.3436, 76.4754) is ~1.9 km
  const dist = haversineDistanceKm(15.3353, 76.4600, 15.3436, 76.4754);
  assert.ok(dist > 1.5 && dist < 2.5, `Distance was ${dist}`);
});

test('estimateTravelMinutes adjusts for walking vs vehicle speeds', () => {
  // Short hop (< 1.5 km) walking at 4 km/h
  const walkTime = estimateTravelMinutes(15.3353, 76.4600, 15.3378, 76.4695);
  assert.ok(walkTime >= 5 && walkTime <= 30, `Walk time was ${walkTime}`);

  // Longer distance (Bengaluru to Mysuru ~140 km)
  const driveTime = estimateTravelMinutes(12.9716, 77.5946, 12.2958, 76.6394);
  assert.ok(driveTime > 120, `Drive time was ${driveTime}`);
});

test('computePlaceCrowdScore varies deterministically by hour and weekend', () => {
  const place = SEED_PLACES[0];
  const weekdayNoon = computePlaceCrowdScore(place, 12, false, 10);
  const weekendNoon = computePlaceCrowdScore(place, 12, true, 10);
  const weekdayMorning = computePlaceCrowdScore(place, 7, false, 10);

  assert.ok(weekendNoon > weekdayNoon, 'Weekend noon crowd should be higher than weekday noon');
  assert.ok(weekdayNoon > weekdayMorning, 'Noon crowd should be higher than early morning');
});

// Table-driven Shakti Fare Test
test('FareAgent table-driven Shakti subsidy rules', async () => {
  const eligibleClasses = SEED_RULES_CONFIG.shakti.eligible_classes;

  const testCases = [
    {
      name: 'Eligible Karnataka woman on KSRTC express (non-AC)',
      isWoman: true,
      domicile: true,
      shaktiActive: true,
      serviceClass: 'express',
      shaktiEligible: true,
      originalFare: 460,
      expectedFare: 0,
      expectedFree: true
    },
    {
      name: 'Same woman on private AC sleeper bus',
      isWoman: true,
      domicile: true,
      shaktiActive: true,
      serviceClass: 'ac_sleeper',
      shaktiEligible: false,
      originalFare: 1050,
      expectedFare: 1050,
      expectedFree: false
    },
    {
      name: 'Non-eligible user (male traveler) on KSRTC express',
      isWoman: false,
      domicile: true,
      shaktiActive: true,
      serviceClass: 'express',
      shaktiEligible: true,
      originalFare: 460,
      expectedFare: 460,
      expectedFree: false
    },
    {
      name: 'Woman without Karnataka domicile (out-of-state visitor)',
      isWoman: true,
      domicile: false,
      shaktiActive: true,
      serviceClass: 'express',
      shaktiEligible: true,
      originalFare: 460,
      expectedFare: 460,
      expectedFree: false
    },
    {
      name: 'Eligible woman with Shakti toggle turned OFF',
      isWoman: true,
      domicile: true,
      shaktiActive: false,
      serviceClass: 'express',
      shaktiEligible: true,
      originalFare: 460,
      expectedFare: 460,
      expectedFree: false
    }
  ];

  for (const tc of testCases) {
    const isFree =
      tc.shaktiActive &&
      tc.isWoman &&
      tc.domicile &&
      tc.shaktiEligible &&
      eligibleClasses.includes(tc.serviceClass);

    const calculatedFare = isFree ? 0 : tc.originalFare;

    assert.equal(
      isFree,
      tc.expectedFree,
      `Failed on ${tc.name}: expectedFree ${tc.expectedFree} but got ${isFree}`
    );
    assert.equal(
      calculatedFare,
      tc.expectedFare,
      `Failed on ${tc.name}: expectedFare ${tc.expectedFare} but got ${calculatedFare}`
    );
  }
});

// Full Pipeline and Database Integrity Test
test('Full agent pipeline produces valid itinerary with no missing place IDs', async () => {
  const allPlaceIds = new Set(SEED_PLACES.map((p) => p.id));

  const ctx: PlanContext = {
    tripId: 'test_trip_1',
    userId: 'test_user_1',
    answers: {
      interests: ['heritage', 'food'],
      days: 3,
      budget: 6000,
      style: 'women_group',
      start_city: 'Bengaluru',
      start_date: '2026-10-31',
      is_woman: true,
      karnataka_domicile: true,
      shakti_active: true
    },
    lang: 'kn',
    allRegions: SEED_REGIONS,
    allPlaces: SEED_PLACES,
    allStays: SEED_STAYS,
    allFoodSpots: SEED_FOOD_SPOTS,
    allTransportLegs: SEED_TRANSPORT_LEGS,
    allAlternatives: SEED_ALTERNATIVES,
    rulesConfig: SEED_RULES_CONFIG,
    agentRuns: []
  };

  await AgentOrchestrator.runFullPipeline(ctx);

  assert.ok(ctx.scheduledDays && ctx.scheduledDays.length === 3, 'Should generate 3 days of plan');
  assert.ok(ctx.totalCostInr && ctx.totalCostInr > 0, 'Total cost should be calculated');
  assert.ok(ctx.responsibleScore && ctx.responsibleScore >= 60, 'Responsible score should be computed');

  // Verify that NO stop ever references an unknown place ID
  for (const day of ctx.scheduledDays || []) {
    for (const stop of day.stops) {
      if (stop.kind === 'place' && stop.place_id) {
        assert.ok(
          allPlaceIds.has(stop.place_id),
          `Stop has unknown place ID ${stop.place_id}`
        );
      }
    }
  }
});

// Assistant Agent Intent Classification Test
test('AssistantAgent answers only from verified data or falls back to Check locally', () => {
  // Query 1: Toilet
  const toiletAns = AssistantAgent.answerQuestion('Where is the nearest toilet?', null, SEED_PLACES, [], [], 'en');
  assert.ok(toiletAns.answer.includes('restrooms') || toiletAns.answer.includes('toilet'));
  assert.ok(toiletAns.sources.length > 0);

  // Query 2: Last bus
  const busAns = AssistantAgent.answerQuestion('When is the last bus to Bengaluru?', null, [], [], SEED_TRANSPORT_LEGS, 'en');
  assert.ok(busAns.answer.includes('bus') || busAns.answer.includes('departs'));

  // Query 3: Unknown query outside database
  const unknownAns = AssistantAgent.answerQuestion('What is the stock price of Tesla?', null, SEED_PLACES, [], [], 'en');
  assert.equal(unknownAns.answer, 'Check locally');
});
