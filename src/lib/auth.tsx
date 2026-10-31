import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  collection
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export interface UserProfileData {
  name: string;
  email: string;
  photoURL: string;
  language: 'en' | 'kn';
  travellerType?: string;
  budget?: string;
  interests?: string[];
  travelStyle?: string;
  days?: number;
  createdAt?: any;
  updatedAt?: any;
}

export function getAuthErrorMessage(code: string, lang: 'en' | 'kn' | 'mr' = 'en'): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return lang === 'kn' ? 'ತಪ್ಪಾದ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್' : 'Invalid email or password';
    case 'auth/email-already-in-use':
      return lang === 'kn' ? 'ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ಬಳಕೆಯಲ್ಲಿದೆ' : 'This email is already in use';
    case 'auth/weak-password':
      return lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು' : 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return lang === 'kn' ? 'ಅಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸ' : 'Invalid email address';
    case 'auth/popup-closed-by-user':
      return lang === 'kn' ? 'ಸೈನ್-ಇನ್ ರದ್ದುಮಾಡಲಾಗಿದೆ' : 'Sign-in cancelled';
    case 'auth/network-request-failed':
      return lang === 'kn' ? 'ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ' : 'Network error. Please check your connection';
    default:
      return lang === 'kn' ? 'ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 'An error occurred. Please try again.';
  }
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfileData | null;
  loading: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  signInWithEmail: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<FirebaseUser | null>;
  signInAsGuest: () => Promise<FirebaseUser | null>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  updateUserProfile: (updates: Partial<UserProfileData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_SAVED_TRIPS_KEY = 'tiruga_saved_trips';
const STORAGE_SAVED_PLACES_KEY = 'tiruga_saved_places';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // One-time guest data migration into Firestore
  const migrateLocalDataToUser = async (uid: string) => {
    try {
      const batch = writeBatch(db);
      let writesCount = 0;

      // 1. Migrate saved trips from localStorage
      const localTripsRaw = localStorage.getItem(STORAGE_SAVED_TRIPS_KEY);
      if (localTripsRaw) {
        try {
          const localTrips = JSON.parse(localTripsRaw);
          if (Array.isArray(localTrips)) {
            for (const trip of localTrips) {
              if (trip && trip.id) {
                const tripRef = doc(db, 'users', uid, 'trips', trip.id);
                batch.set(
                  tripRef,
                  {
                    title: String(trip.title || 'Karnataka Itinerary').slice(0, 120),
                    destination: String(trip.destination || 'Hampi'),
                    destinationId: String(trip.destinationId || 'hampi'),
                    totalDays: Math.min(Math.max(Number(trip.totalDays) || 3, 1), 7),
                    estimatedBudget: Number(trip.estimatedBudget) || 5000,
                    preferences: trip.preferences || {},
                    days: Array.isArray(trip.days) ? trip.days.slice(0, 7) : [],
                    meta: trip.meta || {},
                    schemaVersion: 1,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                  },
                  { merge: true }
                );
                writesCount++;
              }
            }
          }
        } catch (e) {
          console.warn('Trip migration parse notice:', e);
        }
      }

      // 2. Migrate saved places from localStorage
      const localPlacesRaw = localStorage.getItem(STORAGE_SAVED_PLACES_KEY);
      if (localPlacesRaw) {
        try {
          const localPlaceIds = JSON.parse(localPlacesRaw);
          if (Array.isArray(localPlaceIds)) {
            for (const placeId of localPlaceIds) {
              if (placeId && typeof placeId === 'string') {
                const docId = placeId.startsWith('a_') ? placeId : `a_${placeId}`;
                const placeRef = doc(db, 'users', uid, 'savedPlaces', docId);
                batch.set(
                  placeRef,
                  {
                    destinationId: placeId.split('_')[0] || 'hampi',
                    attractionId: placeId,
                    createdAt: serverTimestamp()
                  },
                  { merge: true }
                );
                writesCount++;
              }
            }
          }
        } catch (e) {
          console.warn('Place migration parse notice:', e);
        }
      }

      if (writesCount > 0) {
        await batch.commit();
        // Clear local storage copies after successful migration
        localStorage.removeItem(STORAGE_SAVED_TRIPS_KEY);
        localStorage.removeItem(STORAGE_SAVED_PLACES_KEY);
        localStorage.removeItem('tiruga_saved_places_objects');
      }
    } catch (err) {
      console.warn('Guest migration note:', err);
    }
  };

  // Initial user doc creation & loading
  const handleUserSession = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfileData;
        setProfile(data);
      } else {
        // First login: create user doc without ever overwriting createdAt
        const initialProfile: UserProfileData = {
          name: firebaseUser.displayName || 'Karnataka Yatri',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          language: 'en',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userRef, initialProfile);
        setProfile(initialProfile);

        // Run guest migration in a single batch
        await migrateLocalDataToUser(firebaseUser.uid);
      }
    } catch (err) {
      console.warn('User profile session notice:', err);
      // Fallback in-memory profile
      setProfile({
        name: firebaseUser.displayName || 'Karnataka Yatri',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        language: 'en'
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await handleUserSession(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      return cred.user;
    } catch (err: any) {
      console.warn('Google Sign-In caught error:', err);
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup')
      ) {
        setAuthError(
          'Sign-in popup was blocked by your browser. Please allow popups or open Tiruga in a new tab to complete sign-in.'
        );
      } else if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(err?.message || 'Unable to complete Google sign-in. Please try again.');
      }
      return null;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<FirebaseUser | null> => {
    setAuthError(null);
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<FirebaseUser | null> => {
    setAuthError(null);
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    return cred.user;
  };

  const signInAsGuest = async (): Promise<FirebaseUser | null> => {
    setAuthError(null);
    try {
      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch {
      return null;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
      setAuthError(null);
    } catch (err) {
      console.warn('SignOut error:', err);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfileData>): Promise<void> => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest: !user || user.isAnonymous,
        isAdmin: !!user && (user.email === 'admin@tiruga.in' || (user.email?.includes('admin') ?? false)),
        authError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        resetPassword,
        signOut,
        logout: signOut,
        clearAuthError,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
