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

export interface SessionResponse {
  ok: boolean;
  data?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    profile?: any;
  };
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
}

export interface RegisterProfileResponse {
  ok: boolean;
  data?: {
    uid: string;
    profile: any;
  };
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
}

/**
 * Validates session with backend server.
 */
export async function verifySession(idToken: string): Promise<SessionResponse> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    });
    const data = await response.json();
    return data;
  } catch (err: any) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Unable to verify session'
      }
    };
  }
}

/**
 * Registers user profile with backend server.
 */
export async function registerProfile(profilePayload: any, idToken: string): Promise<RegisterProfileResponse> {
  try {
    const response = await fetch('/api/auth/register-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify(profilePayload)
    });
    const data = await response.json();
    return data;
  } catch (err: any) {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Unable to register profile'
      }
    };
  }
}
