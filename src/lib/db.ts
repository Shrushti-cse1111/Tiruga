import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import destinationsJson from '../../data/destinations.json';
import attractionsJson from '../../data/attractions.json';
import phrasesJson from '../../data/phrases.json';
import transportJson from '../../data/transport.json';

import { Attraction, TransportOption, Trip } from '../data/types';
export interface DestinationItem {
  id: string;
  name: string;
  nameKn: string;
  kannadaName: string;
  district: string;
  categories: ('Heritage' | 'Nature' | 'Food' | 'Adventure' | 'Beaches' | 'Culture' | string)[];
  tags: string[];
  description: string;
  image: string;
  budgetLevel: 'Under ₹3,000' | '₹3,000 - ₹5,000' | '₹5,000 - ₹10,000' | '₹10,000+' | string;
  bestSeason: string;
  recommendedDays: number;
  familySuitable: boolean;
  studentSuitable: boolean;
  foodHighlights: string[];
  highlights?: string[];
  lat?: number;
  lng?: number;
}

export interface AttractionItem extends Attraction {
  destinationId: string;
  durationMinutes: number;
  estimatedCost: number;
  indoor: boolean;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
}

export interface TransportItem extends TransportOption {
  type: 'bus' | 'train' | 'cab';
  from: string;
  to: string;
  departure: string;
  durationMinutes: number;
  stops: number;
  priceEstimate: number;
}

export interface KannadaPhrase {
  id: string;
  category: string;
  kannada: string;
  english: string;
  pronunciation: string;
  situation: string;
}

export const DESTINATIONS_DATA: DestinationItem[] = destinationsJson as DestinationItem[];
export const ATTRACTIONS_DATA: AttractionItem[] = (attractionsJson as any[]).map((a) => ({
  ...a,
  coordinates: a.coordinates || { x: a.mapX ?? 50, y: a.mapY ?? 50 },
  distanceKm: a.distanceKm ?? 1.2,
  approxMinutes: a.approxMinutes ?? Math.round(a.durationMinutes || 45),
  estimatedEntryFee: a.estimatedEntryFee ?? (a.estimatedCost || 0),
  image: a.image || 'https://images.unsplash.com/photo-1600100397608-f010f443b74e?auto=format&fit=crop&w=800&q=80',
  isIndoor: a.isIndoor ?? a.indoor ?? false
})) as AttractionItem[];

export const PHRASES_DATA: KannadaPhrase[] = (phrasesJson as any[]).map((p, idx) => ({
  id: p.id || `phrase-${idx + 1}`,
  category: p.category,
  kannada: p.kannada,
  english: p.english,
  pronunciation: p.pronunciation,
  situation: p.situation
}));

export const TRANSPORT_DATA: TransportItem[] = (transportJson as any[]).map((t) => ({
  ...t,
  mode: (t.mode || t.type) as 'bus' | 'train' | 'cab',
  typeTag: t.typeTag || (t.type === 'bus' ? 'State Express' : t.type === 'train' ? 'Express' : 'Private Sedan'),
  departureTime: t.departureTime || t.departure,
  arrivalTime: t.arrivalTime || 'Next day',
  duration: t.duration || `${Math.floor((t.durationMinutes || 300) / 60)}h ${(t.durationMinutes || 300) % 60}m`,
  stopsText: t.stopsText || (t.stops === 0 ? 'Direct' : `${t.stops} stops`),
  estimatedPrice: t.estimatedPrice ?? t.priceEstimate,
  isDemo: true as const
})) as TransportItem[];

const STORAGE_SAVED_TRIPS_KEY = 'tiruga_saved_trips';
const STORAGE_SAVED_PLACES_KEY = 'tiruga_saved_places';

// In-Memory Caches
const destinationsCache = new Map<string, DestinationItem[]>();
const attractionsCache = new Map<string, AttractionItem[]>();
let phrasesCache: KannadaPhrase[] | null = null;
let transportCache: TransportItem[] | null = null;

/**
 * 1. Get Destinations Catalog
 * Reads getDocs once, cached in memory and localStorage with version key 'tiruga_destinations_v1'.
 * Falls back to local JSON if Firestore is unreachable or empty. Never uses onSnapshot.
 */
export async function getDestinations(): Promise<DestinationItem[]> {
  if (destinationsCache.has('all')) {
    return destinationsCache.get('all')!;
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem('tiruga_destinations_v1');
    if (cached) {
      const parsed = JSON.parse(cached) as DestinationItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        destinationsCache.set('all', parsed);
        return parsed;
      }
    }
  } catch {}

  // Try Firestore getDocs
  try {
    const snap = await getDocs(collection(db, 'destinations'));
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DestinationItem));
      destinationsCache.set('all', items);
      try {
        localStorage.setItem('tiruga_destinations_v1', JSON.stringify(items));
      } catch {}
      return items;
    }
  } catch (err) {
    // Graceful fallback to local JSON
  }

  // Fallback to local JSON
  const fallback = DESTINATIONS_DATA;
  destinationsCache.set('all', fallback);
  return fallback;
}

/**
 * 2. Get Attractions Catalog for a destination
 * Reads subcollection destinations/{destinationId}/attractions with local JSON fallback.
 */
export async function getAttractions(destinationId: string = 'hampi'): Promise<AttractionItem[]> {
  const normId = (destinationId || 'hampi').trim().toLowerCase();
  if (attractionsCache.has(normId)) {
    return attractionsCache.get(normId)!;
  }

  // Check localStorage cache
  const cacheKey = `tiruga_attractions_${normId}_v1`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as AttractionItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        attractionsCache.set(normId, parsed);
        return parsed;
      }
    }
  } catch {}

  // Try Firestore subcollection getDocs
  try {
    const subColRef = collection(db, 'destinations', normId, 'attractions');
    const snap = await getDocs(subColRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({
        id: d.id,
        destinationId: normId,
        ...d.data()
      } as AttractionItem));
      attractionsCache.set(normId, items);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(items));
      } catch {}
      return items;
    }
  } catch (err) {
    // Graceful fallback
  }

  // Fallback to local JSON
  const filtered = ATTRACTIONS_DATA.filter((att) => {
    const dId = (att.destinationId || '').toLowerCase();
    return dId === normId || att.id.toLowerCase().startsWith(normId);
  });
  const result = filtered.length > 0 ? filtered : ATTRACTIONS_DATA.slice(0, 8);
  attractionsCache.set(normId, result);
  return result;
}

/**
 * 3. Get Kannada Phrases
 * Fetches all phrases once and caches them.
 */
export async function getPhrases(category?: string): Promise<KannadaPhrase[]> {
  if (!phrasesCache) {
    try {
      const cached = localStorage.getItem('tiruga_phrases_v1');
      if (cached) {
        phrasesCache = JSON.parse(cached);
      }
    } catch {}

    if (!phrasesCache) {
      try {
        const snap = await getDocs(collection(db, 'phrases'));
        if (!snap.empty) {
          phrasesCache = snap.docs.map((d) => ({ id: d.id, ...d.data() } as KannadaPhrase));
          try {
            localStorage.setItem('tiruga_phrases_v1', JSON.stringify(phrasesCache));
          } catch {}
        }
      } catch (err) {
        // Fallback
      }
    }

    if (!phrasesCache || phrasesCache.length === 0) {
      phrasesCache = PHRASES_DATA;
    }
  }

  if (!category || category === 'All') {
    return phrasesCache;
  }
  return phrasesCache.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

/**
 * 4. Get Transport Options
 * Uses equality filters only or cached data.
 */
export async function getTransport(
  from: string = 'Bengaluru',
  to: string = 'Hampi',
  type?: 'bus' | 'train' | 'cab' | string
): Promise<TransportItem[]> {
  if (!transportCache) {
    try {
      const snap = await getDocs(collection(db, 'transport'));
      if (!snap.empty) {
        transportCache = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TransportItem));
      }
    } catch (err) {
      // Fallback
    }
    if (!transportCache || transportCache.length === 0) {
      transportCache = TRANSPORT_DATA;
    }
  }

  let list = transportCache;
  if (type) {
    list = list.filter((t) => t.type === type || t.mode === type);
  }
  if (from && to) {
    const fromN = from.toLowerCase();
    const toN = to.toLowerCase();
    const matched = list.filter((t) => {
      return (t.from || '').toLowerCase().includes(fromN) && (t.to || '').toLowerCase().includes(toN);
    });
    if (matched.length > 0) return matched;
  }
  return list;
}

/**
 * 5. Save Trip
 * Trips are ONE document with days embedded, using the item fields
 * {time, attractionId, title, estimatedCost, durationMinutes, reason},
 * schemaVersion 1, createdAt and updatedAt.
 */
export async function saveTrip(trip: Trip, uid?: string | null): Promise<void> {
  // Always mirror in localStorage for immediate offline resilience
  try {
    const stored = localStorage.getItem(STORAGE_SAVED_TRIPS_KEY);
    let trips: Trip[] = stored ? JSON.parse(stored) : [];
    const idx = trips.findIndex((t) => t.id === trip.id);
    if (idx >= 0) {
      trips[idx] = trip;
    } else {
      trips.unshift(trip);
    }
    localStorage.setItem(STORAGE_SAVED_TRIPS_KEY, JSON.stringify(trips));
  } catch (e) {
    console.warn('LocalStorage save trip notice:', e);
  }

  // If authenticated, persist to Firestore
  if (uid) {
    const tripRef = doc(db, 'users', uid, 'trips', trip.id);
    const sanitizedDays = Array.isArray(trip.days)
      ? trip.days.slice(0, 7).map((d) => ({
          dayNumber: d.dayNumber,
          summary: d.summary || '',
          items: Array.isArray(d.items)
            ? d.items.map((it) => ({
                time: it.time || '09:00',
                attractionId: it.attractionId || '',
                title: it.title || '',
                estimatedCost: Number(it.estimatedCost) || 0,
                durationMinutes: Number(it.durationMinutes) || 60,
                reason: it.reason || ''
              }))
            : []
        }))
      : [];

    const validatedData = {
      title: String(trip.title || 'Karnataka Trip').slice(0, 120),
      destination: String(trip.destination || 'Hampi'),
      destinationId: String(trip.destinationId || 'hampi'),
      totalDays: Math.min(Math.max(Number(trip.totalDays) || 3, 1), 7),
      estimatedBudget: Number(trip.estimatedBudget) || 5000,
      travelStyle: trip.travelStyle || 'Balanced',
      heroImage: trip.heroImage || '',
      days: sanitizedDays,
      schemaVersion: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(tripRef, validatedData, { merge: true });
    } catch (err) {
      console.warn('Firestore saveTrip error (saved locally):', err);
    }
  }
}

/**
 * 6. List Trips
 * Queries users/{uid}/trips with orderBy createdAt desc, limit 20 via getDocs.
 */
export async function listTrips(uid?: string | null): Promise<Trip[]> {
  if (uid) {
    try {
      const q = query(collection(db, 'users', uid, 'trips'), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Trip));
      }
    } catch (err) {
      // Fallback to localStorage
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_SAVED_TRIPS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return [];
}

/**
 * 7. Get Single Trip
 */
export async function getTrip(tripId: string, uid?: string | null): Promise<Trip | null> {
  if (uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid, 'trips', tripId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as unknown as Trip;
      }
    } catch (e) {
      // Fallback
    }
  }

  const list = await listTrips(uid);
  return list.find((t) => t.id === tripId) || null;
}

/**
 * 8. Delete Trip
 */
export async function deleteTrip(tripId: string, uid?: string | null): Promise<void> {
  if (uid) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'trips', tripId));
    } catch (e) {
      // Ignore
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_SAVED_TRIPS_KEY);
    if (stored) {
      const trips: Trip[] = JSON.parse(stored);
      const filtered = trips.filter((t) => t.id !== tripId);
      localStorage.setItem(STORAGE_SAVED_TRIPS_KEY, JSON.stringify(filtered));
    }
  } catch {}
}

/**
 * 9. Toggle Saved Place
 * Uses deterministic ID: a_${place.id} so toggling is setDoc or deleteDoc with no query.
 */
export async function toggleSavedPlace(
  place: { id: string; destinationId?: string; name?: string },
  uid?: string | null
): Promise<{ saved: boolean }> {
  const placeId = place.id;
  const docId = placeId.startsWith('a_') ? placeId : `a_${placeId}`;

  // Read current saved set from localStorage
  let savedSet = new Set<string>();
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_PLACES_KEY);
    if (raw) savedSet = new Set(JSON.parse(raw));
  } catch {}

  const willBeSaved = !savedSet.has(placeId);
  if (willBeSaved) {
    savedSet.add(placeId);
  } else {
    savedSet.delete(placeId);
  }
  localStorage.setItem(STORAGE_SAVED_PLACES_KEY, JSON.stringify(Array.from(savedSet)));

  // If signed in, update Firestore with deterministic docId
  if (uid) {
    try {
      const ref = doc(db, 'users', uid, 'savedPlaces', docId);
      if (willBeSaved) {
        await setDoc(ref, {
          destinationId: place.destinationId || 'hampi',
          attractionId: placeId,
          name: place.name || '',
          createdAt: serverTimestamp()
        });
      } else {
        await deleteDoc(ref);
      }
    } catch (err) {
      console.warn('Firestore toggleSavedPlace error:', err);
    }
  }

  return { saved: willBeSaved };
}

/**
 * 10. List Saved Places
 */
export async function listSavedPlaces(uid?: string | null): Promise<string[]> {
  if (uid) {
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'savedPlaces'));
      if (!snap.empty) {
        return snap.docs.map((d) => d.data().attractionId || d.id.replace('a_', ''));
      }
    } catch (e) {
      // Fallback to localStorage
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_SAVED_PLACES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

/**
 * 11. Save User Profile
 */
export async function saveUserProfile(uid: string, data: any): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export { db };

export async function initAndSeedDatabase(): Promise<void> {
  try {
    await getDestinations();
  } catch (err) {
    console.debug('initAndSeedDatabase fallback note:', err);
  }
}
