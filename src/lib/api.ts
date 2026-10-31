/**
 * Client API helper for interacting with the Express backend.
 */

export interface HealthResponse {
  ok: boolean;
  time?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Pings GET /api/health to verify client-to-server connectivity.
 */
export async function getHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: `HTTP_${response.status}`,
          message: `Server returned status ${response.status}`
        }
      };
    }
    const data = await response.json();
    return data;
  } catch (err: any) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Unable to connect to server'
      }
    };
  }
}

export interface RoadRoutePoint {
  lat: number;
  lng: number;
}

export interface RoadRouteData {
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
  source: 'osrm';
}

export interface RoadRouteResponse {
  ok: boolean;
  data?: RoadRouteData;
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
}

/**
 * Requests an OSRM driving route via the backend /api/route proxy.
 * Enforces an 8-second client timeout and returns null on any error.
 */
export async function getRoadRoute(points: RoadRoutePoint[]): Promise<RoadRouteData | null> {
  if (!Array.isArray(points) || points.length < 2 || points.length > 12) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('/api/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        points,
        mode: 'driving'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const result: RoadRouteResponse = await res.json();
    if (result && result.ok && result.data) {
      return result.data;
    }

    return null;
  } catch (_err) {
    return null;
  }
}
