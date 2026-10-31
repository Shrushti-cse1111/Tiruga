import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Karnataka geographical bounding box
const KARNATAKA_BOUNDS = {
  minLat: 11.5,
  maxLat: 18.5,
  minLng: 74.0,
  maxLng: 78.6
};

// Haversine formula to compute great-circle distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface Attraction {
  id: string;
  name: string;
  destinationId: string;
  lat?: number | null;
  lng?: number | null;
  mapX?: number;
  mapY?: number;
  [key: string]: any;
}

export function runCoordinateCheck(): {
  total: number;
  flaggedCount: number;
  flaggedList: Array<{ id: string; name: string; destinationId: string; status: string }>;
} {
  const attractionsPath = path.resolve(rootDir, 'data', 'attractions.json');
  const attractions: Attraction[] = JSON.parse(fs.readFileSync(attractionsPath, 'utf8'));

  // Group by destinationId to check cluster spread
  const byDest: Record<string, Attraction[]> = {};
  for (const a of attractions) {
    const destId = a.destinationId || 'unknown';
    if (!byDest[destId]) byDest[destId] = [];
    byDest[destId].push(a);
  }

  // Find attraction pairs in the same destination > 60km apart
  const spreadFlags: Record<string, string[]> = {};
  for (const [destId, list] of Object.entries(byDest)) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a1 = list[i];
        const a2 = list[j];
        if (
          typeof a1.lat === 'number' &&
          typeof a1.lng === 'number' &&
          typeof a2.lat === 'number' &&
          typeof a2.lng === 'number'
        ) {
          const dist = haversineKm(a1.lat, a1.lng, a2.lat, a2.lng);
          if (dist > 60) {
            if (!spreadFlags[a1.id]) spreadFlags[a1.id] = [];
            if (!spreadFlags[a2.id]) spreadFlags[a2.id] = [];
            spreadFlags[a1.id].push(`>60km from ${a2.id} (${dist.toFixed(1)}km)`);
            spreadFlags[a2.id].push(`>60km from ${a1.id} (${dist.toFixed(1)}km)`);
          }
        }
      }
    }
  }

  const reviewRows: string[] = ['id,name,destinationId,lat,lng,status'];
  const flaggedList: Array<{ id: string; name: string; destinationId: string; status: string }> = [];

  for (const a of attractions) {
    const statuses: string[] = [];
    const hasLat = typeof a.lat === 'number' && !Number.isNaN(a.lat);
    const hasLng = typeof a.lng === 'number' && !Number.isNaN(a.lng);

    if (!hasLat || !hasLng) {
      statuses.push('MISSING_COORDINATES');
    } else {
      const inBounds =
        a.lat! >= KARNATAKA_BOUNDS.minLat &&
        a.lat! <= KARNATAKA_BOUNDS.maxLat &&
        a.lng! >= KARNATAKA_BOUNDS.minLng &&
        a.lng! <= KARNATAKA_BOUNDS.maxLng;

      if (!inBounds) {
        statuses.push('OUT_OF_BOUNDS');
      }
    }

    if (spreadFlags[a.id]) {
      statuses.push(`DISTANCE_SPREAD_EXCEEDS_60KM (${spreadFlags[a.id].join('; ')})`);
    }

    const finalStatus = statuses.length > 0 ? statuses.join(' | ') : 'OK';
    if (finalStatus !== 'OK') {
      flaggedList.push({
        id: a.id,
        name: a.name,
        destinationId: a.destinationId,
        status: finalStatus
      });
    }

    // Escape CSV fields containing commas or quotes
    const safeName = `"${(a.name || '').replace(/"/g, '""')}"`;
    const safeStatus = `"${finalStatus.replace(/"/g, '""')}"`;
    reviewRows.push(
      `${a.id},${safeName},${a.destinationId},${hasLat ? a.lat : ''},${hasLng ? a.lng : ''},${safeStatus}`
    );
  }

  const reviewCsvPath = path.resolve(rootDir, 'data', 'coords.review.csv');
  fs.writeFileSync(reviewCsvPath, reviewRows.join('\n') + '\n', 'utf8');

  console.log('\n======================================================');
  console.log('       TIRUGA COORDINATE DATA CHECK REPORT            ');
  console.log('======================================================');
  console.log(`Total Attractions Checked: ${attractions.length}`);
  console.log(`Attractions Flagged: ${flaggedList.length}`);
  console.log(`CSV Report Generated: data/coords.review.csv`);
  console.log('Note: Coordinates are approximate and require a human check against a map.\n');

  if (flaggedList.length > 0) {
    console.log('--- Flagged Attractions ---');
    for (const item of flaggedList) {
      console.log(`• [${item.destinationId}] ${item.name} (${item.id}): ${item.status}`);
    }
  } else {
    console.log('✓ All attractions have valid coordinates inside Karnataka bounds.');
  }
  console.log('======================================================\n');

  return {
    total: attractions.length,
    flaggedCount: flaggedList.length,
    flaggedList
  };
}

// Run directly when called
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCoordinateCheck();
}
