import { Request, Response, NextFunction } from 'express';

export interface StructuredLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  route?: string;
  method?: string;
  status?: number;
  latencyMs?: number;
  uid?: string;
}

export const logger = {
  info(message: string, meta?: Partial<StructuredLog>): void {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...meta
    }));
  },

  warn(message: string, meta?: Partial<StructuredLog>): void {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      ...meta
    }));
  },

  error(message: string, meta?: Partial<StructuredLog>): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      ...meta
    }));
  }
};

/**
 * Request logging middleware.
 * Records timestamp, route, method, status, latency, and uid (if present).
 * CRITICAL: Never logs tokens, keys, bodies, credentials, or user prompt texts.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Only log /api routes to keep static asset request noise minimal
  if (!req.path.startsWith('/api')) {
    next();
    return;
  }

  const start = Date.now();

  res.on('finish', () => {
    const latency = Date.now() - start;
    const uid = (req as any).user?.uid || undefined;

    logger.info('API Request completed', {
      method: req.method,
      route: req.path,
      status: res.statusCode,
      latencyMs: latency,
      uid
    });
  });

  next();
}
