import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFirebaseAdmin, getFirestore } from '../firebaseAdmin';
import { Attraction } from '../../src/shared/aiTypes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export interface AIContextResult {
  destination: {
    id: string;
    name: string;
    nameKn: string;
    district: string;
    categories: string[];
    tags: string[];
    description: string;
    bestSeason: string;
    recommendedDays: number;
    budgetLevel: string;
    foodHighlights: string[];
  };
  attractions: Attraction[];
  attractionsById: Map<string, Attraction>;
  source: 'firestore' | 'json';
}

/**
 * Loads destination and attractions from Firestore Admin SDK with fallback to local JSON.
 * Sends only the fields required for AI prompt context.
 */
export async function getContext(options: {
  destinationId: string;
  interests?: string[];
}): Promise<AIContextResult> {
  const normId = (options.destinationId || 'hampi').trim().toLowerCase();

  // 1. Attempt loading from Firestore Admin SDK
  try {
    const { isReady } = getFirebaseAdmin();
    if (isReady) {
      const db = getFirestore();
      const destDoc = await db.collection('destinations').doc(normId).get();

      if (destDoc.exists) {
        const destData = destDoc.data()!;
        const attsSnap = await db
          .collection('destinations')
          .doc(normId)
          .collection('attractions')
          .get();

        if (!attsSnap.empty) {
          const attractions: Attraction[] = attsSnap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              destinationId: normId,
              name: String(data.name || d.id),
              category: String(data.category || 'Heritage'),
              durationMinutes: Number(data.durationMinutes) || 60,
              estimatedCost: Number(data.estimatedCost) || 0,
              indoor: Boolean(data.indoor),
              description: String(data.description || '')
            };
          });

          const attractionsById = new Map<string, Attraction>();
          attractions.forEach((a) => attractionsById.set(a.id, a));

          return {
            destination: {
              id: normId,
              name: destData.name || normId,
              nameKn: destData.nameKn || '',
              district: destData.district || '',
              categories: destData.categories || [],
              tags: destData.tags || [],
              description: destData.description || '',
              bestSeason: destData.bestSeason || 'October - March',
              recommendedDays: destData.recommendedDays || 3,
              budgetLevel: destData.budgetLevel || '₹3,000 - ₹5,000',
              foodHighlights: destData.foodHighlights || []
            },
            attractions,
            attractionsById,
            source: 'firestore'
          };
        }
      }
    }
  } catch (err) {
    // Firestore unavailable or not provisioned; proceed to local JSON fallback
  }

  // 2. Fallback to local JSON files
  const destsPath = path.resolve(rootDir, 'data', 'destinations.json');
  const attsPath = path.resolve(rootDir, 'data', 'attractions.json');

  const dests = JSON.parse(fs.readFileSync(destsPath, 'utf8'));
  const allAtts = JSON.parse(fs.readFileSync(attsPath, 'utf8'));

  const matchedDest = dests.find((d: any) => d.id.toLowerCase() === normId) || dests[0];
  const matchedAtts = allAtts.filter((a: any) => {
    const dId = (a.destinationId || '').toLowerCase();
    return dId === normId || a.id.toLowerCase().startsWith(normId);
  });

  const attractions: Attraction[] = (matchedAtts.length > 0 ? matchedAtts : allAtts.slice(0, 8)).map(
    (a: any) => ({
      id: a.id,
      destinationId: a.destinationId || normId,
      name: String(a.name || a.id),
      category: String(a.category || 'Heritage'),
      durationMinutes: Number(a.durationMinutes) || 60,
      estimatedCost: Number(a.estimatedCost) || 0,
      indoor: Boolean(a.indoor),
      description: String(a.description || '')
    })
  );

  const attractionsById = new Map<string, Attraction>();
  attractions.forEach((a) => attractionsById.set(a.id, a));

  return {
    destination: {
      id: matchedDest.id,
      name: matchedDest.name,
      nameKn: matchedDest.nameKn || '',
      district: matchedDest.district || '',
      categories: matchedDest.categories || [],
      tags: matchedDest.tags || [],
      description: matchedDest.description || '',
      bestSeason: matchedDest.bestSeason || 'October - March',
      recommendedDays: matchedDest.recommendedDays || 3,
      budgetLevel: matchedDest.budgetLevel || '₹3,000 - ₹5,000',
      foodHighlights: matchedDest.foodHighlights || []
    },
    attractions,
    attractionsById,
    source: 'json'
  };
}

/**
 * Server-side algorithm for "surprise" destination selection.
 * Picks the best-matching destination by interest and tag overlap, traveller suitability, and budget level.
 */
export function pickSurpriseDestination(options: {
  interests?: string[];
  travellerType?: string;
  budget?: number;
}): string {
  const destsPath = path.resolve(rootDir, 'data', 'destinations.json');
  const dests = JSON.parse(fs.readFileSync(destsPath, 'utf8'));

  const interests = (options.interests || []).map((i) => i.toLowerCase());
  const travellerType = (options.travellerType || '').toLowerCase();
  const budget = Number(options.budget) || 5000;

  let bestDest = dests[0];
  let highestScore = -1;

  for (const dest of dests) {
    let score = 0;
    const destCats = (dest.categories || []).map((c: string) => c.toLowerCase());
    const destTags = (dest.tags || []).map((t: string) => t.toLowerCase());

    // Category and Tag overlap
    for (const interest of interests) {
      if (destCats.some((c: string) => c.includes(interest) || interest.includes(c))) {
        score += 3;
      }
      if (destTags.some((t: string) => t.includes(interest) || interest.includes(t))) {
        score += 2;
      }
    }

    // Traveller suitability
    if (travellerType.includes('family') && dest.familySuitable) score += 3;
    if ((travellerType.includes('student') || travellerType.includes('solo') || travellerType.includes('friend')) && dest.studentSuitable) score += 2;

    // BudgetLevel affinity
    const bLevel = (dest.budgetLevel || '').toLowerCase();
    if (budget <= 3000 && bLevel.includes('under ₹3,000')) score += 3;
    else if (budget > 3000 && budget <= 5000 && bLevel.includes('₹3,000 - ₹5,000')) score += 3;
    else if (budget > 5000 && budget <= 10000 && bLevel.includes('₹5,000 - ₹10,000')) score += 3;
    else if (budget > 10000 && bLevel.includes('₹10,000+')) score += 3;

    if (score > highestScore) {
      highestScore = score;
      bestDest = dest;
    }
  }

  return bestDest.id;
}
