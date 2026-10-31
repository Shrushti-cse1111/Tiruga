import { ApiResponse, Itinerary } from '../shared/aiTypes';
import { validateItinerary } from '../shared/validators';
import { auth } from './firebase';

/**
 * Generic client-side AI API helper.
 * - Checks navigator.onLine before attempting request.
 * - Attaches Firebase Bearer ID token when signed in.
 * - Handles 30-second AbortController timeout.
 * - Safely handles 401: attempts token refresh once and retries once.
 * - Maps technical errors to friendly user-facing messages.
 */
export async function postAi<T = any>(
  path: string,
  body: any
): Promise<ApiResponse<T>> {
  // 1. Check client network status
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      ok: false,
      error: {
        code: 'OFFLINE',
        message: 'AI features need an internet connection.',
        retryable: false
      }
    };
  }

  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

  // Helper to obtain fresh or cached ID token
  const getToken = async (forceRefresh = false): Promise<string | null> => {
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken(forceRefresh);
      }
    } catch {}
    return null;
  };

  const makeRequest = async (token: string | null): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body || {}),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    let token = await getToken(false);
    let response: Response;

    try {
      response = await makeRequest(token);
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        return {
          ok: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request timed out after 30 seconds. Please try again.',
            retryable: true
          }
        };
      }
      return {
        ok: false,
        error: {
          code: 'AI_UNAVAILABLE',
          message: 'Unable to connect to Tiruga AI. Please check your connection.',
          retryable: true
        }
      };
    }

    // Handle 401 Unauthorized: Refresh token once and retry once
    if (response.status === 401 && auth.currentUser) {
      try {
        const freshToken = await getToken(true);
        if (freshToken) {
          response = await makeRequest(freshToken);
        }
      } catch {}

      if (response.status === 401) {
        return {
          ok: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Please sign in again.',
            retryable: false
          }
        };
      }
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      return {
        ok: false,
        error: {
          code: 'AI_INVALID_OUTPUT',
          message: 'Unexpected server response format.',
          retryable: true
        }
      };
    }

    if (!response.ok) {
      const serverError = data?.error;
      return {
        ok: false,
        error: {
          code: serverError?.code || 'AI_UNAVAILABLE',
          message: serverError?.message || "Tiruga couldn't generate this right now. Please try again.",
          retryable: Boolean(serverError?.retryable ?? true),
          errors: serverError?.errors
        }
      };
    }

    return data as ApiResponse<T>;
  } catch (err: any) {
    return {
      ok: false,
      error: {
        code: 'AI_UNAVAILABLE',
        message: 'Something went wrong while contacting AI service.',
        retryable: true
      }
    };
  }
}

export interface PlanTripRequest {
  destinationId: string;
  days: number;
  budget: number;
  travellerType?: string;
  interests?: string[];
  travelStyle?: string;
  profile?: any;
}

/**
 * Client-side trip planning function.
 * Calls POST /api/ai/plan-trip and re-validates the returned payload using shared validators.
 */
export async function planTrip(request: PlanTripRequest): Promise<ApiResponse<Itinerary>> {
  const res = await postAi<Itinerary>('/api/ai/plan-trip', request);
  if (!res.ok) {
    return res;
  }

  // Client-side re-validation with shared validators
  const validation = validateItinerary(res.data);
  if (!validation.valid || !validation.data) {
    return {
      ok: false,
      error: {
        code: 'AI_INVALID_OUTPUT',
        message: 'Generated trip failed client validation check.',
        retryable: true,
        errors: validation.errors
      }
    };
  }

  return {
    ...res,
    data: validation.data
  };
}

export interface ModifyTripResponse {
  itinerary: Itinerary;
  beforeAfter: {
    budgetBefore: number;
    budgetAfter: number;
    added: Array<{ id: string; name: string }>;
    removed: Array<{ id: string; name: string }>;
  };
}

/**
 * Client-side trip modification function.
 * Calls POST /api/ai/modify-trip and re-validates the returned payload using shared validators.
 */
export async function modifyTrip(
  itinerary: Itinerary,
  instruction: string
): Promise<ApiResponse<ModifyTripResponse>> {
  const res = await postAi<ModifyTripResponse>('/api/ai/modify-trip', {
    itinerary,
    instruction
  });

  if (!res.ok) {
    return res;
  }

  // Re-validate modified itinerary with shared validators
  const validation = validateItinerary(res.data.itinerary);
  if (!validation.valid || !validation.data) {
    return {
      ok: false,
      error: {
        code: 'AI_INVALID_OUTPUT',
        message: 'Modified itinerary failed client validation check.',
        retryable: true,
        errors: validation.errors
      }
    };
  }

  return {
    ...res,
    data: {
      itinerary: validation.data,
      beforeAfter: res.data.beforeAfter
    }
  };
}

export interface SavingsSuggestion {
  description: string;
  amountSaved: number;
}

export interface MakeCheaperResponse {
  itinerary: Itinerary;
  savingsSuggestions: SavingsSuggestion[];
  beforeAfter: {
    budgetBefore: number;
    budgetAfter: number;
    added: Array<{ id: string; name: string }>;
    removed: Array<{ id: string; name: string }>;
  };
}

/**
 * Client-side budget optimizer function.
 * Calls POST /api/ai/make-cheaper and re-validates the returned payload using shared validators.
 */
export async function makeCheaper(
  itinerary: Itinerary,
  budget?: number
): Promise<ApiResponse<MakeCheaperResponse>> {
  const res = await postAi<MakeCheaperResponse>('/api/ai/make-cheaper', {
    itinerary,
    budget
  });

  if (!res.ok) {
    return res;
  }

  // Re-validate optimized itinerary with shared validators
  const validation = validateItinerary(res.data.itinerary);
  if (!validation.valid || !validation.data) {
    return {
      ok: false,
      error: {
        code: 'AI_INVALID_OUTPUT',
        message: 'Optimized itinerary failed client validation check.',
        retryable: true,
        errors: validation.errors
      }
    };
  }

  return {
    ...res,
    data: {
      itinerary: validation.data,
      savingsSuggestions: res.data.savingsSuggestions || [],
      beforeAfter: res.data.beforeAfter
    }
  };
}


