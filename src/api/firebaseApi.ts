import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, ensureAuth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Trip, User, EmergencyContact, Place, Stay, TransportLeg } from '../../shared/types';
import {
  BUNDLED_PLACES,
  BUNDLED_STAYS,
  BUNDLED_TRANSPORT_LEGS,
  BUNDLED_REGIONS,
  BUNDLED_INTERESTS,
  BUNDLED_RULES_CONFIG
} from '../../shared/seed';

export class FirebaseApi {
  // --- USER PROFILE ---
  static async saveUser(user: {
    id: string;
    displayName?: string;
    photoURL?: string;
    lang?: 'en' | 'kn' | 'mr';
    theme?: 'light' | 'dark' | 'system';
    largeText?: boolean;
    seniorMode?: boolean;
    isGuest?: boolean;
    profile?: any;
    stats?: any;
  }) {
    const authUser = await ensureAuth();
    if (!authUser) return null;
    const uid = authUser.uid;
    const path = `users/${uid}`;
    try {
      const payload = {
        displayName: user.displayName || authUser.displayName || (authUser.isAnonymous ? 'Guest Yatri' : 'Karnataka Yatri'),
        photoURL: user.photoURL || authUser.photoURL || '',
        lang: user.lang || 'en',
        theme: user.theme || 'system',
        largeText: !!user.largeText,
        seniorMode: !!user.seniorMode,
        isGuest: authUser.isAnonymous,
        profile: user.profile || {
          isWoman: true,
          karnatakaDomicile: true,
          travelStyle: 'solo',
          defaultBudgetInr: 6000,
          interests: ['heritage', 'nature']
        },
        stats: user.stats || { savedTrips: 0, savedPlaces: 0, tripHistory: 0 },
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', uid), payload, { merge: true });
      return payload;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // --- TRIPS (under users/{uid}/trips/{tripId}) ---
  static async saveTrip(trip: Trip): Promise<Trip | null> {
    const authUser = await ensureAuth();
    if (!authUser) return null;
    const uid = authUser.uid;
    const tripPath = `users/${uid}/trips/${trip.id}`;

    try {
      const batch = writeBatch(db);
      const tripDocRef = doc(db, 'users', uid, 'trips', trip.id);

      const days = trip.days_data?.length || trip.days || 3;
      const tripPayload = {
        regionId: trip.region_id || 'reg_hampi',
        title: (trip.title || 'Karnataka Itinerary').slice(0, 120),
        startDate: trip.start_date || '2026-10-31',
        days: Math.min(10, Math.max(1, days)),
        budgetInr: trip.budget_inr || 6000,
        style: trip.style || 'solo',
        groupType: trip.group_type || trip.style || 'solo',
        answers: trip.answers || {
          interests: ['heritage'],
          days,
          budget: trip.budget_inr || 6000,
          style: trip.style || 'solo',
          start_city: 'Bengaluru',
          start_date: trip.start_date || '2026-10-31',
          is_woman: !!trip.is_woman,
          karnataka_domicile: !!trip.karnataka_domicile,
          shakti_active: !!trip.shakti_active
        },
        estTotalInr: trip.est_total_inr || trip.budget_inr || 6000,
        estimateExclusions: ['Unknown entry fees', 'Personal shopping'],
        bufferInr: Math.round((trip.est_total_inr || 6000) * 0.1),
        status: trip.status || 'saved',
        activeVariant: (trip.plan_b_applied ? 'B' : 'A') as 'A' | 'B',
        responsibleScore: trip.responsible_score || 75,
        responsibleBreakdown: { crowdDispersal: 80, localSpend: 85, heritageRespect: 90 },
        shaktiOn: !!trip.shakti_active,
        version: Number(trip.version || 1),
        daysDataSnapshot: JSON.stringify(trip.days_data || []),
        createdAt: trip.created_at || new Date().toISOString(),
        updatedAt: serverTimestamp()
      };

      batch.set(tripDocRef, tripPayload);

      // Write each day to subcollection users/{uid}/trips/{tripId}/days/{dayId}
      if (trip.days_data && trip.days_data.length > 0) {
        trip.days_data.forEach((day, idx) => {
          const dayId = day.id || `day_${idx + 1}`;
          const dayDocRef = doc(db, 'users', uid, 'trips', trip.id, 'days', dayId);
          batch.set(dayDocRef, {
            dayNo: day.day_no || idx + 1,
            variant: day.plan_variant || 'A',
            title: day.title_i18n,
            stops: (day.stops || []).map((s) => ({
              id: s.id,
              position: s.position,
              kind: s.kind,
              placeId: s.place_id || null,
              stayId: s.stay_id || null,
              legId: s.leg_id || null,
              startTime: s.start_time,
              endTime: s.end_time,
              travelMin: s.travel_min,
              costInr: s.cost_inr,
              costNote: s.cost_note || 'estimate',
              crowdScore: s.crowd_score,
              reason: s.reason_i18n,
              locked: !!s.locked,
              done: false
            }))
          });
        });
      }

      await batch.commit();
      return trip;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, tripPath);
    }
  }

  static async getTrips(): Promise<Trip[]> {
    const authUser = await ensureAuth();
    if (!authUser) return [];
    const uid = authUser.uid;
    const path = `users/${uid}/trips`;

    try {
      const snap = await getDocs(collection(db, 'users', uid, 'trips'));
      return snap.docs.map((d) => {
        const data = d.data();
        let daysData = [];
        try {
          daysData = data.daysDataSnapshot ? JSON.parse(data.daysDataSnapshot) : [];
        } catch {
          daysData = [];
        }

        return {
          id: d.id,
          user_id: uid,
          region_id: data.regionId || 'reg_hampi',
          title: data.title,
          start_date: data.startDate,
          days: data.days,
          budget_inr: data.budgetInr,
          style: data.style,
          group_type: data.groupType,
          answers: data.answers || {
            interests: ['heritage'],
            days: data.days,
            budget: data.budgetInr,
            style: data.style,
            start_city: 'Bengaluru',
            start_date: data.startDate,
            is_woman: true,
            karnataka_domicile: true,
            shakti_active: data.shaktiOn
          },
          est_total_inr: data.estTotalInr,
          status: data.status,
          responsible_score: data.responsibleScore,
          version: data.version,
          created_at: data.createdAt,
          updated_at: data.updatedAt,
          days_data: daysData,
          shakti_active: data.shaktiOn,
          plan_b_applied: data.activeVariant === 'B'
        } as Trip;
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  static async getTrip(tripId: string): Promise<Trip | null> {
    const authUser = await ensureAuth();
    if (!authUser) return null;
    const uid = authUser.uid;
    const path = `users/${uid}/trips/${tripId}`;

    try {
      const snap = await getDoc(doc(db, 'users', uid, 'trips', tripId));
      if (!snap.exists()) return null;
      const data = snap.data();

      let daysData = [];
      try {
        daysData = data.daysDataSnapshot ? JSON.parse(data.daysDataSnapshot) : [];
      } catch {
        daysData = [];
      }

      return {
        id: snap.id,
        user_id: uid,
        region_id: data.regionId || 'reg_hampi',
        title: data.title,
        start_date: data.startDate,
        days: data.days,
        budget_inr: data.budgetInr,
        style: data.style,
        group_type: data.groupType,
        answers: data.answers,
        est_total_inr: data.estTotalInr,
        status: data.status,
        responsible_score: data.responsibleScore,
        version: data.version,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        days_data: daysData,
        shakti_active: data.shaktiOn,
        plan_b_applied: data.activeVariant === 'B'
      } as Trip;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  }

  static async updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
    const authUser = await ensureAuth();
    if (!authUser) return;
    const uid = authUser.uid;
    const path = `users/${uid}/trips/${tripId}`;

    try {
      const firestoreUpdates: Record<string, any> = {
        updatedAt: serverTimestamp()
      };
      if (updates.shakti_active !== undefined) firestoreUpdates.shaktiOn = updates.shakti_active;
      if (updates.plan_b_applied !== undefined) firestoreUpdates.activeVariant = updates.plan_b_applied ? 'B' : 'A';
      if (updates.responsible_score !== undefined) firestoreUpdates.responsibleScore = updates.responsible_score;
      if (updates.days_data !== undefined) firestoreUpdates.daysDataSnapshot = JSON.stringify(updates.days_data);
      if (updates.title !== undefined) firestoreUpdates.title = updates.title.slice(0, 120);
      if (updates.version !== undefined) firestoreUpdates.version = updates.version;

      await updateDoc(doc(db, 'users', uid, 'trips', tripId), firestoreUpdates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  static async deleteTrip(tripId: string): Promise<void> {
    const authUser = await ensureAuth();
    if (!authUser) return;
    const uid = authUser.uid;
    const path = `users/${uid}/trips/${tripId}`;

    try {
      await deleteDoc(doc(db, 'users', uid, 'trips', tripId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }

  // --- SAVED PLACES (under users/{uid}/savedPlaces/{placeId}) ---
  static async toggleBookmark(placeId: string, placeSnapshot?: Place): Promise<boolean> {
    const authUser = await ensureAuth();
    if (!authUser) return false;
    const uid = authUser.uid;
    const docRef = doc(db, 'users', uid, 'savedPlaces', placeId);

    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await deleteDoc(docRef);
        return false;
      } else {
        await setDoc(docRef, {
          placeId,
          snapshot: placeSnapshot ? {
            name: placeSnapshot.name_i18n,
            lat: placeSnapshot.lat,
            lng: placeSnapshot.lng,
            category: placeSnapshot.category
          } : null,
          createdAt: serverTimestamp()
        });
        return true;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/savedPlaces/${placeId}`);
    }
  }

  // --- EMERGENCY CONTACTS (under users/{uid}/emergencyContacts/{id}) ---
  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const authUser = await ensureAuth();
    if (!authUser) return [];
    const uid = authUser.uid;

    try {
      const snap = await getDocs(collection(db, 'users', uid, 'emergencyContacts'));
      return snap.docs.map(d => ({
        id: d.id,
        user_id: uid,
        name: d.data().name,
        phone: d.data().phone
      }));
    } catch {
      return [];
    }
  }

  static async addEmergencyContact(name: string, phone: string): Promise<EmergencyContact> {
    const authUser = await ensureAuth();
    const uid = authUser?.uid || 'guest';
    const id = `contact_${Date.now()}`;
    const contact = { id, user_id: uid, name, phone };

    if (authUser) {
      try {
        await setDoc(doc(db, 'users', uid, 'emergencyContacts', id), {
          name,
          phone,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Save contact to firestore warning:', err);
      }
    }
    return contact;
  }

  // --- REFERENCE COLLECTIONS WITH BUNDLED FALLBACK ---
  static async getPlaces(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, 'places'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('Firestore places read fallback to bundled JSON:', e);
    }
    return BUNDLED_PLACES;
  }

  static async getStays(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, 'stays'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('Firestore stays read fallback to bundled JSON:', e);
    }
    return BUNDLED_STAYS;
  }

  static async getTransportLegs(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, 'transportLegs'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('Firestore transport legs read fallback to bundled JSON:', e);
    }
    return BUNDLED_TRANSPORT_LEGS;
  }

  // --- DATA REPORTS (top-level dataReports/{id}) ---
  static async submitDataReport(entity: string, entityId: string, note: string) {
    const authUser = await ensureAuth();
    const uid = authUser?.uid || 'guest';
    const id = `rep_${Date.now()}`;
    const reportDoc = {
      uid,
      entity,
      entityId,
      note,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    if (authUser) {
      try {
        await setDoc(doc(db, 'dataReports', id), {
          ...reportDoc,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `dataReports/${id}`);
      }
    }
    return reportDoc;
  }
}
