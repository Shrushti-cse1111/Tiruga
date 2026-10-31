import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface TirugaPreferences {
  interests: string[];
  days: number;
  budget: string;
  travelStyle: string;
  updatedAt?: string;
}

export const DEFAULT_PREFERENCES: TirugaPreferences = {
  interests: ['Heritage', 'Nature'],
  days: 3,
  budget: '₹3,000 - ₹5,000',
  travelStyle: 'Solo'
};

const PREFS_STORAGE_KEY = 'tiruga_prefs';

/**
 * Reads user preferences from localStorage with fallback to default
 */
export function getPreferences(): TirugaPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read tiruga_prefs from localStorage:', err);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Saves preferences locally and synchronizes to Firestore users/{uid} if signed in
 */
export async function savePreferences(
  prefs: TirugaPreferences,
  uid?: string | null
): Promise<void> {
  const payload: TirugaPreferences = {
    ...prefs,
    updatedAt: new Date().toISOString()
  };

  // 1. Always persist to localStorage for instant offline resilience
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to write tiruga_prefs to localStorage:', err);
  }

  // 2. Sync to Cloud Firestore if a user UID is present matching firestore.rules
  if (uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(
        userRef,
        {
          interests: prefs.interests,
          days: prefs.days,
          budget: prefs.budget,
          travelStyle: prefs.travelStyle,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore preferences sync skipped or offline:', err);
    }
  }
}
