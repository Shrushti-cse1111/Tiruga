import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimit';

export const routeRouter = Router();

export const DEFAULT_OSRM_BASE_URL = 'https://router.project-osrm.org';

// Karnataka geographical boundary constants for server validation
const KARNATAKA_BOUNDS = {
  minLat: 11.5,
  maxLat: 18.5,
  minLng: 74.0,
  maxLng: 78.6
};

// Rate limiter: 10 requests per minute per IP (guest) or uid (authenticated)
const routeRateLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  keyFn: (req) => {
    const uid = (req as any).user?.uid;
    return uid ? `routeUser:${uid}` : `routeGuest:${req.ip || 'anonymous'}`;
  },
  message: 'Route request limit reached. Please wait a moment.'
});

interface Point {
  lat: number;
  lng: number;
}

interface CacheEntry {
  data: {
    coordinates: [number, number][];
    distanceKm: number;
    durationMin: number;
    source: 'osrm';
  };
  expiresAt: number;
}

// In-memory cache: max 200 entries, 24-hour TTL
const routeCache = new Map<string, CacheEntry>();

function getCachedRoute(key: string): CacheEntry['data'] | null {
  const entry = routeCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    routeCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedRoute(key: string, data: CacheEntry['data']): void {
  if (routeCache.size >= 200) {
    const oldestKey = routeCache.keys().next().value;
    if (oldestKey) routeCache.delete(oldestKey);
  }
  routeCache.set(key, {
    data,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });
}

/**
 * Simplifies polyline coordinates down to at most maxPoints (500)
 * while strictly preserving the first and last waypoints.
 */
function simplifyPolyline(coords: [number, number][], maxPoints: number = 500): [number, number][] {
  if (coords.length <= maxPoints) {
    return coords;
  }
  const result: [number, number][] = [coords[0]];
  const step = (coords.length - 1) / (maxPoints - 1);
  for (let i = 1; i < maxPoints - 1; i++) {
    const idx = Math.round(i * step);
    result.push(coords[idx]);
  }
  result.push(coords[coords.length - 1]);
  return result;
}

/**
 * POST /api/route
 * Public route proxy forwarding coordinate waypoints to OSRM driving service.
 */
routeRouter.post('/route', optionalAuth, routeRateLimiter, async (req: Request, res: Response): Promise<void> => {
  const body = req.body;

  // 1. Validate body structure
  if (!body || typeof body !== 'object') {
    res.status(400).json({
      ok: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid request body.',
        retryable: false
      }
    });
    return;
  }

  // 2. Validate mode: "driving" only
  const mode = body.mode !== undefined ? body.mode : 'driving';
  if (mode !== 'driving') {
    res.status(400).json({
      ok: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Unsupported travel mode. Only "driving" is supported.',
        retryable: false
      }
    });
    return;
  }

  // 3. Validate points array: 2 to 12 points
  const rawPoints = body.points;
  if (!Array.isArray(rawPoints) || rawPoints.length < 2 || rawPoints.length > 12) {
    res.status(400).json({
      ok: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'The points parameter must be an array of between 2 and 12 waypoints.',
        retryable: false
      }
    });
    return;
  }

  // 4. Sanitize and validate coordinates strictly within Karnataka bounds
  const sanitizedPoints: Point[] = [];
  for (let i = 0; i < rawPoints.length; i++) {
    const p = rawPoints[i];
    if (!p || typeof p !== 'object') {
      res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: `Point at index ${i} is invalid.`,
          retryable: false
        }
      });
      return;
    }

    const lat = Number(p.lat);
    const lng = Number(p.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Number.isNaN(lat) || Number.isNaN(lng)) {
      res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: `Coordinates at index ${i} must be valid finite numbers.`,
          retryable: false
        }
      });
      return;
    }

    if (
      lat < KARNATAKA_BOUNDS.minLat ||
      lat > KARNATAKA_BOUNDS.maxLat ||
      lng < KARNATAKA_BOUNDS.minLng ||
      lng > KARNATAKA_BOUNDS.maxLng
    ) {
      res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: `Waypoint at index ${i} (${lat.toFixed(4)}, ${lng.toFixed(4)}) is outside Karnataka boundaries.`,
          retryable: false
        }
      });
      return;
    }

    sanitizedPoints.push({ lat, lng });
  }

  // 5. Check in-memory cache (keyed by 4 decimal places)
  const cacheKey = sanitizedPoints.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join(';');
  const cached = getCachedRoute(cacheKey);
  if (cached) {
    res.json({
      ok: true,
      data: cached
    });
    return;
  }

  // 6. Request route from OSRM with 5-second timeout
  // CRITICAL: Never log coordinates tied to a uid.
  const osrmBase = process.env.OSRM_BASE_URL || DEFAULT_OSRM_BASE_URL;
  // OSRM expects coordinates as {lng},{lat};{lng},{lat}
  const coordinatesParam = sanitizedPoints.map((p) => `${p.lng},${p.lat}`).join(';');
  const osrmUrl = `${osrmBase}/route/v1/driving/${coordinatesParam}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const osrmRes = await fetch(osrmUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!osrmRes.ok) {
      res.json({
        ok: false,
        error: {
          code: 'ROUTE_UNAVAILABLE',
          message: 'Road route unavailable. Showing a straight-line preview.',
          retryable: true
        }
      });
      return;
    }

    const json: any = await osrmRes.json();
    if (!json || json.code !== 'Ok' || !Array.isArray(json.routes) || json.routes.length === 0) {
      res.json({
        ok: false,
        error: {
          code: 'ROUTE_UNAVAILABLE',
          message: 'Road route unavailable. Showing a straight-line preview.',
          retryable: true
        }
      });
      return;
    }

    const route = json.routes[0];
    const rawCoords: [number, number][] = route.geometry?.coordinates || [];

    // Simplify polyline to max 500 points
    const simplifiedCoords = simplifyPolyline(rawCoords, 500);

    const distanceKm = Math.round(((route.distance || 0) / 1000) * 100) / 100;
    const durationMin = Math.round((route.duration || 0) / 60);

    const resultData = {
      coordinates: simplifiedCoords,
      distanceKm,
      durationMin,
      source: 'osrm' as const
    };

    // Save to cache
    setCachedRoute(cacheKey, resultData);

    res.json({
      ok: true,
      data: resultData
    });
  } catch (_err) {
    // Graceful error fallback on network errors or timeouts (not a 500)
    res.json({
      ok: false,
      error: {
        code: 'ROUTE_UNAVAILABLE',
        message: 'Road route unavailable. Showing a straight-line preview.',
        retryable: true
      }
    });
  }
});
