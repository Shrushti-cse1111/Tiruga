/**
 * Lightweight IndexedDB wrapper for Tiruga offline storage.
 * Database: "tiruga-offline"
 * Object stores: "trips", "destinations", "phrases"
 */

const DB_NAME = 'tiruga-offline';
const DB_VERSION = 1;

interface OfflineTripRecord {
  id: string;
  trip: any;
  destination: any;
  phrases: any[];
  savedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this device/environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('trips')) {
        db.createObjectStore('trips', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('destinations')) {
        db.createObjectStore('destinations', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('phrases')) {
        db.createObjectStore('phrases', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
  });
}

/**
 * Saves a trip, destination info, and curated phrases for offline access.
 */
export async function saveTripOffline(
  trip: any,
  destination: any = null,
  phrases: any[] = []
): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['trips', 'destinations', 'phrases'], 'readwrite');
      const tripStore = tx.objectStore('trips');
      const destStore = tx.objectStore('destinations');
      const phraseStore = tx.objectStore('phrases');

      const record: OfflineTripRecord = {
        id: trip.id,
        trip,
        destination,
        phrases,
        savedAt: new Date().toISOString()
      };

      tripStore.put(record);

      if (destination && destination.id) {
        destStore.put(destination);
      }

      if (Array.isArray(phrases)) {
        for (const phrase of phrases) {
          if (phrase.id) {
            phraseStore.put(phrase);
          }
        }
      }

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error || new Error('Transaction failed.'));
    });
  } catch (error) {
    console.warn('[offlineStore] saveTripOffline failed:', error);
    return false;
  }
}

/**
 * Gets an offline trip record by ID.
 */
export async function getOfflineTrip(id: string): Promise<any | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('trips', 'readonly');
      const store = tx.objectStore('trips');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result ? request.result.trip : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.warn('[offlineStore] getOfflineTrip failed:', error);
    return null;
  }
}

/**
 * Lists all downloaded trips.
 */
export async function listOfflineTrips(): Promise<OfflineTripRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('trips', 'readonly');
      const store = tx.objectStore('trips');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => resolve([]);
    });
  } catch (error) {
    console.warn('[offlineStore] listOfflineTrips failed:', error);
    return [];
  }
}

/**
 * Removes a trip from offline storage.
 */
export async function removeOfflineTrip(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('trips', 'readwrite');
      const store = tx.objectStore('trips');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error || new Error('Failed to delete trip.'));
    });
  } catch (error) {
    console.warn('[offlineStore] removeOfflineTrip failed:', error);
    return false;
  }
}

/**
 * Checks if a specific trip is saved offline.
 */
export async function hasOfflineTrip(id: string): Promise<boolean> {
  try {
    const trip = await getOfflineTrip(id);
    return !!trip;
  } catch {
    return false;
  }
}
