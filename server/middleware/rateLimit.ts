import { Request, Response, NextFunction } from 'express';

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  keyFn?: (req: Request) => string;
  message?: string;
}

interface WindowRecord {
  timestamps: number[];
}

/**
 * Creates an in-memory sliding-window rate limiter.
 * Returns 429 { ok: false, error: { code: 'RATE_LIMITED', message, retryable: true } } and Retry-After header.
 */
export function createLimiter(options: RateLimiterOptions) {
  const { windowMs, max, keyFn, message = 'Too many requests. Please try again later.' } = options;
  const store = new Map<string, WindowRecord>();

  // Interval cleanup of expired entries
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, Math.min(windowMs, 60_000));

  // Do not block process exit
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const defaultKey = req.ip || req.socket.remoteAddress || 'unknown';
    const key = keyFn ? keyFn(req) : defaultKey;
    const now = Date.now();

    let record = store.get(key);
    if (!record) {
      record = { timestamps: [] };
      store.set(key, record);
    }

    // Filter to sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= max) {
      const oldest = record.timestamps[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message,
          retryable: true
        }
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

// Preset Limiters
export const rateLimitPresets = {
  // 8 requests per minute per IP for guest AI endpoints
  aiGuest: createLimiter({
    windowMs: 60 * 1000,
    max: 8,
    keyFn: (req) => `aiGuest:${req.ip || 'anonymous'}`,
    message: 'AI request limit reached for guest. Please wait a moment.'
  }),

  // 20 requests per minute per UID for authenticated AI endpoints
  aiUser: createLimiter({
    windowMs: 60 * 1000,
    max: 20,
    keyFn: (req) => `aiUser:${(req as any).user?.uid || req.ip || 'anonymous'}`,
    message: 'AI request limit reached for user. Please wait a moment.'
  }),

  // 120 requests per minute per IP for general API endpoints
  general: createLimiter({
    windowMs: 60 * 1000,
    max: 120,
    keyFn: (req) => `general:${req.ip || 'anonymous'}`,
    message: 'Too many requests. Please slow down.'
  }),

  // 3 requests per hour per IP for database seed operations
  seed: createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyFn: (req) => `seed:${req.ip || 'anonymous'}`,
    message: 'Seed rate limit exceeded. Only 3 seed operations allowed per hour.'
  })
};
