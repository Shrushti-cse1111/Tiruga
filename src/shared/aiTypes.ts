export interface Attraction {
  id: string;
  destinationId: string;
  name: string;
  category: string;
  durationMinutes: number;
  estimatedCost: number;
  indoor: boolean;
  description: string;
}

export interface Item {
  time: string; // "HH:MM"
  attractionId: string;
  title: string;
  estimatedCost: number;
  durationMinutes: number;
  reason: string;
}

export interface Day {
  dayNumber: number;
  summary: string;
  items: Item[];
}

export interface Itinerary {
  title: string;
  destination: string;
  destinationId: string;
  totalDays: number;
  estimatedBudget: number;
  days: Day[];
}

export interface SuccessMeta {
  model: string;
  generatedAt: string;
  attempts: 1 | 2;
  costsAreEstimated: true;
  latencyMs?: number;
}

export interface Success<T> {
  ok: true;
  data: T;
  meta: SuccessMeta;
}

export type AiErrorCode =
  | 'INVALID_INPUT'
  | 'RATE_LIMITED'
  | 'AI_INVALID_OUTPUT'
  | 'AI_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_CONFIGURED'
  | 'OFFLINE'
  | 'UNAUTHENTICATED';

export interface ErrorDetails {
  code: AiErrorCode;
  message: string;
  retryable: boolean;
  errors?: string[];
}

export interface ErrorResponse {
  ok: false;
  error: ErrorDetails;
}

export type ApiResponse<T> = Success<T> | ErrorResponse;

export interface ValidationResult<T> {
  valid: boolean;
  errors: string[];
  data?: T;
}
