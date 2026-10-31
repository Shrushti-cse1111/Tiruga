import { getFirestore } from '../firebaseAdmin';

export async function verifySeed(): Promise<boolean> {
  const db = getFirestore();

  console.log('[Seed Verify] Reading collections from Firestore...');

  // 1. Destinations check
  const destSnap = await db.collection('destinations').get();
  const destCount = destSnap.size;
  console.log(`  - Destinations count: ${destCount} (required: >= 15)`);

  if (destCount < 15) {
    throw new Error(`Verification failed: Expected at least 15 destinations, found ${destCount}`);
  }

  // 2. Attractions per destination
  let totalAttractions = 0;
  for (const doc of destSnap.docs) {
    const destId = doc.id;
    const attSnap = await db.collection('destinations').doc(destId).collection('attractions').get();
    const count = attSnap.size;
    totalAttractions += count;

    if (destId === 'hampi' && count < 8) {
      throw new Error(`Verification failed: Hampi requires at least 8 attractions, found ${count}`);
    } else if (count < 4) {
      throw new Error(`Verification failed: Destination '${destId}' requires at least 4 attractions, found ${count}`);
    }
  }
  console.log(`  - Total attractions: ${totalAttractions} (all 15 destinations satisfied)`);

  // 3. Phrases check
  const phraseSnap = await db.collection('phrases').get();
  const phraseCount = phraseSnap.size;
  console.log(`  - Phrases count: ${phraseCount} (required: >= 56)`);

  if (phraseCount < 56) {
    throw new Error(`Verification failed: Expected at least 56 phrases, found ${phraseCount}`);
  }

  // 4. Transport check
  const transportSnap = await db.collection('transport').get();
  const transportCount = transportSnap.size;
  console.log(`  - Transport count: ${transportCount} (required: >= 15)`);

  if (transportCount < 15) {
    throw new Error(`Verification failed: Expected at least 15 transport items, found ${transportCount}`);
  }

  console.log('[Seed Verify] All count thresholds verified successfully. PASSED.');
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('verify.ts')) {
  verifySeed()
    .then(() => {
      console.log('[Seed Verify] Verification PASSED.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Verify] Verification FAILED:', err?.message || err);
      process.exit(1);
    });
}
