/**
 * Pure route helper functions for distance, bearings, time estimates, and polyline interpolation.
 * Strictly pure functions with ZERO network calls.
 */

import { isInKarnataka } from './mapConfig';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface RouteStop {
  order: number;
  attractionId: string;
  name: string;
  time: string;
  lat: number;
  lng: number;
  estimatedCost: number;
  category: string;
}

export interface RouteDay {
  dayNumber: number;
  stops: RouteStop[];
}

export interface SkippedStop {
  attractionId: string;
  name: string;
  dayNumber: number;
}

export interface TripRoute {
  days: RouteDay[];
  skipped: SkippedStop[];
}

/**
 * Average speeds in km/h for various travel modes in Karnataka.
 * All speeds are approximate due to varying road conditions, ghat sections, and traffic.
 */
export const AVERAGE_SPEED_KMH = {
  car: 35, // approximate: 35 km/h
  bus: 30, // approximate: 30 km/h
  bike: 25, // approximate: 25 km/h
  walk: 4.5 // approximate: 4.5 km/h
} as const;

export type TravelMode = keyof typeof AVERAGE_SPEED_KMH | string;

/**
 * Calculates great-circle distance in kilometers between two points using the Haversine formula.
 */
export function haversineKm(a: LatLngPoint, b: LatLngPoint): number {
  if (!a || !b) return 0;
  if (a.lat === b.lat && a.lng === b.lng) return 0;

  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat2 = Math.sin(dLat / 2);
  const sinDLng2 = Math.sin(dLng / 2);

  const h =
    sinDLat2 * sinDLat2 +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng2 * sinDLng2;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

/**
 * Calculates distance in kilometers between consecutive stops.
 * Returns an array of segment distances [d(0,1), d(1,2), ...].
 */
export function segmentsKm(stops: LatLngPoint[]): number[] {
  if (!Array.isArray(stops) || stops.length < 2) {
    return [];
  }
  const result: number[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    result.push(haversineKm(stops[i], stops[i + 1]));
  }
  return result;
}

/**
 * Estimates travel duration in minutes based on distance and mode of transport.
 * All travel times are approximate.
 */
export function estimateMinutes(km: number, mode: TravelMode = 'car'): number {
  if (typeof km !== 'number' || km <= 0 || Number.isNaN(km)) {
    return 0;
  }
  const speed = (AVERAGE_SPEED_KMH as Record<string, number>)[mode] || AVERAGE_SPEED_KMH.car;
  return Math.round((km / speed) * 60);
}

/**
 * Calculates initial compass bearing in degrees [0, 360) from point a to point b.
 */
export function bearingDeg(a: LatLngPoint, b: LatLngPoint): number {
  if (!a || !b) return 0;
  if (a.lat === b.lat && a.lng === b.lng) return 0;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(dLng) * Math.cos(lat2);

  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

/**
 * Interpolates a point along a polyline given a normalized parameter t in [0, 1].
 * Returns coordinates and the compass bearing at that position.
 */
export function interpolateAlong(
  polyline: LatLngPoint[],
  cumulativeKm: number[] | null | undefined,
  t: number
): { lat: number; lng: number; bearing: number } {
  if (!Array.isArray(polyline) || polyline.length === 0) {
    return { lat: 0, lng: 0, bearing: 0 };
  }
  if (polyline.length === 1) {
    return { lat: polyline[0].lat, lng: polyline[0].lng, bearing: 0 };
  }

  // Precompute cumulative distances if not provided or length mismatch
  let cumDist = cumulativeKm;
  if (!cumDist || cumDist.length !== polyline.length) {
    cumDist = [0];
    for (let i = 0; i < polyline.length - 1; i++) {
      cumDist.push(cumDist[i] + haversineKm(polyline[i], polyline[i + 1]));
    }
  }

  const totalDist = cumDist[cumDist.length - 1];
  if (totalDist <= 0) {
    return { lat: polyline[0].lat, lng: polyline[0].lng, bearing: 0 };
  }

  // Clamp t to [0, 1]
  const clampedT = Math.max(0, Math.min(1, t));

  if (clampedT <= 0) {
    const bearing = bearingDeg(polyline[0], polyline[1]);
    return { lat: polyline[0].lat, lng: polyline[0].lng, bearing };
  }
  if (clampedT >= 1) {
    const lastIdx = polyline.length - 1;
    const bearing = bearingDeg(polyline[lastIdx - 1], polyline[lastIdx]);
    return { lat: polyline[lastIdx].lat, lng: polyline[lastIdx].lng, bearing };
  }

  const targetDist = clampedT * totalDist;

  // Find segment containing targetDist
  for (let i = 0; i < cumDist.length - 1; i++) {
    const dStart = cumDist[i];
    const dEnd = cumDist[i + 1];

    if (targetDist >= dStart && targetDist <= dEnd) {
      const segLen = dEnd - dStart;
      const frac = segLen > 0 ? (targetDist - dStart) / segLen : 0;
      const p1 = polyline[i];
      const p2 = polyline[i + 1];

      const lat = p1.lat + frac * (p2.lat - p1.lat);
      const lng = p1.lng + frac * (p2.lng - p1.lng);
      const bearing = bearingDeg(p1, p2);

      return { lat, lng, bearing };
    }
  }

  // Fallback to last point
  const last = polyline[polyline.length - 1];
  return { lat: last.lat, lng: last.lng, bearing: 0 };
}

/**
 * Builds day-wise route stops and collects skipped attractions.
 * Stops without valid coordinates go to skipped; this function NEVER throws.
 */
export function buildRoute(
  trip: any,
  attractionsById: Record<string, any> = {}
): TripRoute {
  const result: TripRoute = {
    days: [],
    skipped: []
  };

  if (!trip || !Array.isArray(trip.days)) {
    return result;
  }

  for (const day of trip.days) {
    const dayNumber = typeof day.dayNumber === 'number' ? day.dayNumber : 1;
    const stops: RouteStop[] = [];

    const items = Array.isArray(day.items) ? day.items : [];
    for (const item of items) {
      const attractionId = item.attractionId || item.id || '';
      const att = attractionId ? attractionsById[attractionId] : null;

      // Extract coordinates from lookup catalog or item itself
      const rawLat = att?.lat ?? item?.lat;
      const rawLng = att?.lng ?? item?.lng;

      const numLat = typeof rawLat === 'number' ? rawLat : Number(rawLat);
      const numLng = typeof rawLng === 'number' ? rawLng : Number(rawLng);

      const isValidCoords =
        Number.isFinite(numLat) &&
        Number.isFinite(numLng) &&
        !Number.isNaN(numLat) &&
        !Number.isNaN(numLng) &&
        isInKarnataka(numLat, numLng);

      const name = item.title || att?.name || 'Unknown Attraction';

      if (isValidCoords) {
        stops.push({
          order: stops.length + 1,
          attractionId,
          name,
          time: item.time || '',
          lat: numLat,
          lng: numLng,
          estimatedCost: typeof item.estimatedCost === 'number' ? item.estimatedCost : (att?.estimatedCost || 0),
          category: item.category || att?.category || 'Heritage'
        });
      } else {
        result.skipped.push({
          attractionId,
          name,
          dayNumber
        });
      }
    }

    result.days.push({
      dayNumber,
      stops
    });
  }

  return result;
}
