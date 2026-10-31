/**
 * Map configuration constants for Leaflet and Karnataka geolocation.
 * Attribution must always be visible on the map.
 * Tiles must NOT be prefetched or bulk-cached.
 */

// Safely access environment variables in both Vite/browser and Node/test environments
const getEnvVar = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

export const TILE_URL: string =
  getEnvVar('VITE_MAP_TILE_URL') || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const TILE_ATTRIBUTION: string =
  getEnvVar('VITE_MAP_ATTRIBUTION') || '© OpenStreetMap contributors';

export const KARNATAKA_BOUNDS = {
  minLat: 11.5,
  maxLat: 18.5,
  minLng: 74.0,
  maxLng: 78.6,
  asLatLngBounds: [
    [11.5, 74.0],
    [18.5, 78.6]
  ] as [[number, number], [number, number]]
} as const;

export const DEFAULT_CENTER = {
  lat: 12.9716,
  lng: 77.5946,
  name: 'Bengaluru'
} as const;

/**
 * Validates whether numeric latitude and longitude coordinates
 * are strictly within Karnataka geographical boundaries.
 */
export function isInKarnataka(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
  return (
    lat >= KARNATAKA_BOUNDS.minLat &&
    lat <= KARNATAKA_BOUNDS.maxLat &&
    lng >= KARNATAKA_BOUNDS.minLng &&
    lng <= KARNATAKA_BOUNDS.maxLng
  );
}
