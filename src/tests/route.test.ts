import {
  haversineKm,
  segmentsKm,
  estimateMinutes,
  bearingDeg,
  interpolateAlong,
  buildRoute
} from '../lib/route';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runRouteTests() {
  console.log('--- Running Route Helper Unit Tests ---\n');

  // Known Karnataka Landmarks
  const bengaluru = { lat: 12.9716, lng: 77.5946 };
  const mysuru = { lat: 12.3052, lng: 76.6552 };
  const hampi = { lat: 15.3350, lng: 76.4600 };

  // 1. Haversine distance test
  const distBlrMys = haversineKm(bengaluru, mysuru);
  console.log(`1. Distance Bengaluru -> Mysuru: ${distBlrMys.toFixed(2)} km`);
  assert(
    distBlrMys >= 125 && distBlrMys <= 145,
    `Bengaluru to Mysuru distance should be plausible (125-145 km), got ${distBlrMys}`
  );

  const distBlrHampi = haversineKm(bengaluru, hampi);
  console.log(`   Distance Bengaluru -> Hampi: ${distBlrHampi.toFixed(2)} km`);
  assert(
    distBlrHampi >= 270 && distBlrHampi <= 320,
    `Bengaluru to Hampi distance should be plausible (270-320 km), got ${distBlrHampi}`
  );

  const distZero = haversineKm(bengaluru, bengaluru);
  assert(distZero === 0, `Same point distance should be 0, got ${distZero}`);

  // 2. Segments test
  const segments = segmentsKm([bengaluru, mysuru, hampi]);
  console.log(`2. Segments: [${segments.map((s) => s.toFixed(2) + ' km').join(', ')}]`);
  assert(segments.length === 2, `Should have 2 segments for 3 stops, got ${segments.length}`);
  assert(Math.abs(segments[0] - distBlrMys) < 0.001, 'First segment should match Blr-Mys dist');

  // 3. Compass bearing test
  const brngBlrMys = bearingDeg(bengaluru, mysuru);
  console.log(`3. Bearing Bengaluru -> Mysuru: ${brngBlrMys.toFixed(1)}°`);
  // Mysuru is South-West of Bengaluru, so bearing should be between 200° and 240°
  assert(
    brngBlrMys >= 200 && brngBlrMys <= 240,
    `Bearing to Mysuru should be South-West (~200°-240°), got ${brngBlrMys}`
  );

  const brngNorth = bearingDeg({ lat: 12.0, lng: 75.0 }, { lat: 13.0, lng: 75.0 });
  assert(Math.abs(brngNorth - 0) < 0.1, `True North bearing should be 0°, got ${brngNorth}`);

  const brngEast = bearingDeg({ lat: 12.0, lng: 75.0 }, { lat: 12.0, lng: 76.0 });
  assert(Math.abs(brngEast - 90) < 0.5, `True East bearing should be 90°, got ${brngEast}`);

  // 4. Travel time estimates
  const carMins = estimateMinutes(70, 'car');
  console.log(`4. Duration 70km by car (35 km/h): ${carMins} mins`);
  assert(carMins === 120, `70km at 35km/h should be 120 min, got ${carMins}`);

  const busMins = estimateMinutes(30, 'bus');
  assert(busMins === 60, `30km at 30km/h should be 60 min, got ${busMins}`);

  const walkMins = estimateMinutes(4.5, 'walk');
  assert(walkMins === 60, `4.5km at 4.5km/h should be 60 min, got ${walkMins}`);

  // 5. Interpolation along polyline
  const polyline = [
    { lat: 12.0, lng: 75.0 },
    { lat: 13.0, lng: 75.0 },
    { lat: 13.0, lng: 76.0 }
  ];

  const atStart = interpolateAlong(polyline, null, 0);
  console.log(`5. Interpolation at t=0: lat=${atStart.lat}, lng=${atStart.lng}, bearing=${atStart.bearing.toFixed(1)}°`);
  assert(Math.abs(atStart.lat - 12.0) < 1e-6 && Math.abs(atStart.lng - 75.0) < 1e-6, 't=0 should match start point');

  const atEnd = interpolateAlong(polyline, null, 1);
  console.log(`   Interpolation at t=1: lat=${atEnd.lat}, lng=${atEnd.lng}, bearing=${atEnd.bearing.toFixed(1)}°`);
  assert(Math.abs(atEnd.lat - 13.0) < 1e-6 && Math.abs(atEnd.lng - 76.0) < 1e-6, 't=1 should match end point');

  const atMid = interpolateAlong(polyline, null, 0.5);
  console.log(`   Interpolation at t=0.5: lat=${atMid.lat.toFixed(4)}, lng=${atMid.lng.toFixed(4)}`);
  assert(atMid.lat >= 12.0 && atMid.lat <= 13.0, 'Midpoint lat should be within segment range');

  // 6. buildRoute test with valid and missing coordinates
  const mockTrip = {
    days: [
      {
        dayNumber: 1,
        items: [
          { attractionId: 'att_valid_1', title: 'Valid Temple', time: '09:00', estimatedCost: 50 },
          { attractionId: 'att_missing_coords', title: 'Unknown Cave', time: '11:00' },
          { attractionId: 'att_valid_2', title: 'Valid Palace', time: '14:00', estimatedCost: 100 }
        ]
      }
    ]
  };

  const mockCatalog = {
    att_valid_1: { id: 'att_valid_1', name: 'Valid Temple', lat: 15.3350, lng: 76.4600, category: 'Temples' },
    att_missing_coords: { id: 'att_missing_coords', name: 'Unknown Cave' }, // no lat/lng
    att_valid_2: { id: 'att_valid_2', name: 'Valid Palace', lat: 12.3052, lng: 76.6552, category: 'Heritage' }
  };

  const routeResult = buildRoute(mockTrip, mockCatalog);
  console.log(`6. buildRoute: ${routeResult.days[0].stops.length} stops included, ${routeResult.skipped.length} skipped`);

  assert(routeResult.days[0].stops.length === 2, 'Should include 2 valid stops');
  assert(routeResult.days[0].stops[0].order === 1, 'First stop order should be 1');
  assert(routeResult.days[0].stops[1].order === 2, 'Second stop order should be 2');
  assert(routeResult.skipped.length === 1, 'Should skip 1 stop lacking coordinates');
  assert(routeResult.skipped[0].attractionId === 'att_missing_coords', 'Skipped stop should be the missing one');

  console.log('\n✓ ALL ROUTE HELPER TESTS PASSED SUCCESSFULLY!\n');
}

// Execute directly if run as a script
runRouteTests();
