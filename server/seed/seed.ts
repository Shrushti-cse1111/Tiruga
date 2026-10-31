import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFirestore } from '../firebaseAdmin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export interface SeedResult {
  destinations: number;
  attractions: number;
  phrases: number;
  transport: number;
  seededAt: string;
}

/**
 * Commits an array of Firestore operations in chunks of max 400.
 */
async function commitBatches(
  db: FirebaseFirestore.Firestore,
  operations: Array<{
    ref: FirebaseFirestore.DocumentReference;
    data: any;
  }>
): Promise<void> {
  const CHUNK_SIZE = 400;
  for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
    const chunk = operations.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();
    for (const op of chunk) {
      batch.set(op.ref, op.data, { merge: true });
    }
    await batch.commit();
  }
}

/**
 * Idempotent seeder using Admin SDK.
 * Seeds destinations, destinations/{id}/attractions, phrases, transport and meta/seed.
 */
export async function seedAll(): Promise<SeedResult> {
  const db = getFirestore();

  // Load JSON datasets
  const destinationsPath = path.resolve(rootDir, 'data', 'destinations.json');
  const attractionsPath = path.resolve(rootDir, 'data', 'attractions.json');
  const phrasesPath = path.resolve(rootDir, 'data', 'phrases.json');
  const transportPath = path.resolve(rootDir, 'data', 'transport.json');

  const destinations = JSON.parse(fs.readFileSync(destinationsPath, 'utf8'));
  const attractions = JSON.parse(fs.readFileSync(attractionsPath, 'utf8'));
  const phrases = JSON.parse(fs.readFileSync(phrasesPath, 'utf8'));
  const transport = JSON.parse(fs.readFileSync(transportPath, 'utf8'));

  const operations: Array<{ ref: FirebaseFirestore.DocumentReference; data: any }> = [];

  // 1. Destinations
  for (const dest of destinations) {
    const destRef = db.collection('destinations').doc(dest.id);
    operations.push({
      ref: destRef,
      data: {
        ...dest,
        updatedAt: new Date().toISOString()
      }
    });
  }

  // 2. Attractions as subcollection destinations/{id}/attractions
  for (const att of attractions) {
    const destId = att.destinationId || 'hampi';
    const attRef = db.collection('destinations').doc(destId).collection('attractions').doc(att.id);
    operations.push({
      ref: attRef,
      data: {
        ...att,
        isDemo: true,
        updatedAt: new Date().toISOString()
      }
    });
  }

  // 3. Phrases
  for (let i = 0; i < phrases.length; i++) {
    const p = phrases[i];
    const phraseId = p.id || `phrase-${i + 1}`;
    const phraseRef = db.collection('phrases').doc(phraseId);
    operations.push({
      ref: phraseRef,
      data: {
        ...p,
        id: phraseId,
        updatedAt: new Date().toISOString()
      }
    });
  }

  // 4. Transport: ensure isDemo: true and no hard-coded dates
  for (const t of transport) {
    const transportRef = db.collection('transport').doc(t.id);
    operations.push({
      ref: transportRef,
      data: {
        ...t,
        isDemo: true,
        updatedAt: new Date().toISOString()
      }
    });
  }

  // Commit all document batches in chunks of 400
  console.log(`[Seed] Committing ${operations.length} document operations in chunks of 400...`);
  await commitBatches(db, operations);

  // 5. Meta/seed record
  const seededAt = new Date().toISOString();
  await db.collection('meta').doc('seed').set(
    {
      version: 1,
      seededAt,
      destinationsCount: destinations.length,
      attractionsCount: attractions.length,
      phrasesCount: phrases.length,
      transportCount: transport.length
    },
    { merge: true }
  );

  const result: SeedResult = {
    destinations: destinations.length,
    attractions: attractions.length,
    phrases: phrases.length,
    transport: transport.length,
    seededAt
  };

  console.log('[Seed] Seeding completed successfully:');
  console.log(`  - Destinations: ${result.destinations}`);
  console.log(`  - Attractions:  ${result.attractions}`);
  console.log(`  - Phrases:      ${result.phrases}`);
  console.log(`  - Transport:    ${result.transport}`);
  console.log(`  - SeededAt:     ${result.seededAt}`);

  return result;
}

// Standalone execution support
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedAll()
    .then(() => {
      console.log('[Seed] Standalone run complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Standalone run failed:', err?.message || err);
      process.exit(1);
    });
}
