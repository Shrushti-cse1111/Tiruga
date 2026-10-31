import { config } from '../config';
import { LocalApi } from './localApi';
import { FirebaseApi } from './firebaseApi';
import { Trip, User, TransportLeg } from '../../shared/types';

async function serverFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${config.apiBaseUrl}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const apiClient = {
  async getCurrentUser(): Promise<User> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<User>('/user/current');
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.getCurrentUser();
  },

  async login(phone: string, pin: string): Promise<User> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<User>('/user/login', {
          method: 'POST',
          body: JSON.stringify({ phone, pin })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    const user = await LocalApi.login(phone, pin);
    if (config.apiMode === 'firebase') {
      FirebaseApi.saveUser({
        id: user.id,
        displayName: user.name,
        lang: user.lang
      }).catch(err => console.warn('Firebase saveUser error (handled):', err));
    }
    return user;
  },

  async getConfig() {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch('/config');
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.getConfig();
  },

  async generateTrip(payload: {
    interests: string[];
    days: number;
    budget: number;
    style: string;
    start_city: string;
    start_date: string;
    is_woman: boolean;
    karnataka_domicile: boolean;
    lang: 'en' | 'kn' | 'mr';
  }): Promise<Trip> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>('/trips/generate', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    // Generate trip deterministically using local multi-agent pipeline
    const trip = await LocalApi.generateTrip(payload);

    // If Firebase is active, persist to Cloud Firestore asynchronously
    if (config.apiMode === 'firebase') {
      FirebaseApi.saveTrip(trip).catch(err => {
        console.warn('Firestore trip persistence note (offline or rules fallback):', err);
      });
    }

    return trip;
  },

  async getTrips(): Promise<Trip[]> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip[]>('/trips');
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    if (config.apiMode === 'firebase') {
      try {
        const firestoreTrips = await FirebaseApi.getTrips();
        if (firestoreTrips && firestoreTrips.length > 0) {
          return firestoreTrips;
        }
      } catch (e) {
        console.warn('Firebase getTrips fallback to local IndexedDB:', e);
      }
    }

    return LocalApi.getTrips();
  },

  async getTrip(tripId: string): Promise<Trip | null> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>(`/trips/${tripId}`);
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    if (config.apiMode === 'firebase') {
      try {
        const firestoreTrip = await FirebaseApi.getTrip(tripId);
        if (firestoreTrip) {
          return firestoreTrip;
        }
      } catch (e) {
        console.warn('Firebase getTrip fallback to local IndexedDB:', e);
      }
    }

    return LocalApi.getTrip(tripId);
  },

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>(`/trips/${tripId}`, {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    const updated = await LocalApi.updateTrip(tripId, updates);
    if (config.apiMode === 'firebase') {
      FirebaseApi.updateTrip(tripId, updates).catch(err => {
        console.warn('Firestore updateTrip sync note:', err);
      });
    }
    return updated;
  },

  async toggleShakti(tripId: string, active: boolean): Promise<Trip | null> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>(`/trips/${tripId}/shakti`, {
          method: 'POST',
          body: JSON.stringify({ active })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    const trip = await LocalApi.toggleShakti(tripId, active);
    if (config.apiMode === 'firebase' && trip) {
      FirebaseApi.updateTrip(tripId, { shakti_active: active, days_data: trip.days_data }).catch(err => {
        console.warn('Firestore toggleShakti sync note:', err);
      });
    }
    return trip;
  },

  async swapStop(tripId: string, stopId: string, direction: 'up' | 'down'): Promise<Trip | null> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>(`/trips/${tripId}/stops/swap`, {
          method: 'POST',
          body: JSON.stringify({ stopId, direction })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    const trip = await LocalApi.swapStop(tripId, stopId, direction);
    if (config.apiMode === 'firebase' && trip) {
      FirebaseApi.updateTrip(tripId, { days_data: trip.days_data }).catch(err => {
        console.warn('Firestore swapStop sync note:', err);
      });
    }
    return trip;
  },

  async removeStop(tripId: string, stopId: string): Promise<Trip | null> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>(`/trips/${tripId}/stops/remove`, {
          method: 'POST',
          body: JSON.stringify({ stopId })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    const trip = await LocalApi.removeStop(tripId, stopId);
    if (config.apiMode === 'firebase' && trip) {
      FirebaseApi.updateTrip(tripId, { days_data: trip.days_data }).catch(err => {
        console.warn('Firestore removeStop sync note:', err);
      });
    }
    return trip;
  },

  async toggleLockStop(tripId: string, stopId: string): Promise<Trip | null> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>(`/trips/${tripId}/stops/lock`, {
          method: 'POST',
          body: JSON.stringify({ stopId })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    const trip = await LocalApi.toggleLockStop(tripId, stopId);
    if (config.apiMode === 'firebase' && trip) {
      FirebaseApi.updateTrip(tripId, { days_data: trip.days_data }).catch(err => {
        console.warn('Firestore toggleLockStop sync note:', err);
      });
    }
    return trip;
  },

  async acceptQuietAlternative(tripId: string, stopId: string): Promise<Trip | null> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>(`/trips/${tripId}/stops/quiet-alt`, {
          method: 'POST',
          body: JSON.stringify({ stopId })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    const trip = await LocalApi.acceptQuietAlternative(tripId, stopId);
    if (config.apiMode === 'firebase' && trip) {
      FirebaseApi.updateTrip(tripId, { days_data: trip.days_data }).catch(err => {
        console.warn('Firestore acceptQuietAlternative sync note:', err);
      });
    }
    return trip;
  },

  async generatePlanB(tripId: string, trigger: 'rain' | 'heat' | 'bus_missed' | 'gate_closed'): Promise<{
    previewDiff: Array<{ original: string; replacement: string; reason: string }>;
    trigger: string;
  }> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<{ previewDiff: Array<{ original: string; replacement: string; reason: string }>; trigger: string }>(
          `/trips/${tripId}/planb/generate`,
          {
            method: 'POST',
            body: JSON.stringify({ trigger })
          }
        );
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.generatePlanB(tripId, trigger);
  },

  async applyPlanB(tripId: string, trigger: string): Promise<Trip | null> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>(`/trips/${tripId}/planb/apply`, {
          method: 'POST',
          body: JSON.stringify({ trigger })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    const trip = await LocalApi.applyPlanB(tripId, trigger);
    if (config.apiMode === 'firebase' && trip) {
      FirebaseApi.updateTrip(tripId, {
        plan_b_applied: true,
        days_data: trip.days_data
      }).catch(err => {
        console.warn('Firestore applyPlanB sync note:', err);
      });
    }
    return trip;
  },

  async revertPlanB(tripId: string): Promise<Trip | null> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<Trip>(`/trips/${tripId}/planb/revert`, {
          method: 'POST'
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }

    const trip = await LocalApi.revertPlanB(tripId);
    if (config.apiMode === 'firebase' && trip) {
      FirebaseApi.updateTrip(tripId, {
        plan_b_applied: false,
        days_data: trip.days_data
      }).catch(err => {
        console.warn('Firestore revertPlanB sync note:', err);
      });
    }
    return trip;
  },

  async getNearbyPlaces(q?: string, category?: string) {
    if (config.apiMode === 'server') {
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (category) params.set('category', category);
        return await serverFetch<any[]>(`/places?${params.toString()}`);
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.getNearbyPlaces(q, category);
  },

  async getPlace(placeId: string) {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch(`/places/${placeId}`);
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.getPlace(placeId);
  },

  async toggleBookmarkPlace(placeId: string): Promise<boolean> {
    if (config.apiMode === 'server') {
      try {
        const res = await serverFetch<{ bookmarked: boolean }>(`/places/${placeId}/bookmark`, {
          method: 'POST'
        });
        return res.bookmarked;
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.toggleBookmarkPlace(placeId);
  },

  async getSavedItems() {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<{ trips: Trip[]; places: any[] }>('/saved');
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.getSavedItems();
  },

  async createOfflinePack(tripId: string) {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch('/offline/pack', {
          method: 'POST',
          body: JSON.stringify({ tripId })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.createOfflinePack(tripId);
  },

  async askAssistant(query: string, tripId?: string, lang: 'en' | 'kn' | 'mr' = 'en') {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch('/assistant/ask', {
          method: 'POST',
          body: JSON.stringify({ query, tripId, lang })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.askAssistant(query, tripId, lang);
  },

  async getAgentRuns(tripId: string) {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<any[]>(`/agent-runs/${tripId}`);
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.getAgentRuns(tripId);
  },

  async getTransportLegs(): Promise<TransportLeg[]> {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch<TransportLeg[]>('/transport-legs');
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.getTransportLegs();
  },

  async getEmergencyContacts() {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch('/emergency-contacts');
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.getEmergencyContacts();
  },

  async addEmergencyContact(name: string, phone: string) {
    if (config.apiMode === 'server') {
      try {
        return await serverFetch('/emergency-contacts', {
          method: 'POST',
          body: JSON.stringify({ name, phone })
        });
      } catch (e) {
        console.warn('Server API failed, falling back to LocalApi:', e);
      }
    }
    return LocalApi.addEmergencyContact(name, phone);
  }
};
