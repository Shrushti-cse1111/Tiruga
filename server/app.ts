import express from 'express';
import { securityHeaders, corsMiddleware } from './middleware/security';
import { rateLimitPresets } from './middleware/rateLimit';
import { enforceJsonContentType } from './middleware/validate';
import { notFoundHandler, globalErrorHandler } from './middleware/errors';
import { requestLogger } from './utils/logger';
import { apiRouter } from './routes';

export function createExpressApp() {
  const app = express();

  // Trust proxy for Cloud Run, Vercel, and reverse proxies (enables correct client IP for rate limiting)
  app.set('trust proxy', 1);

  // Disable X-Powered-By
  app.disable('x-powered-by');

  // Security Headers and CORS
  app.use(securityHeaders);
  app.use(corsMiddleware);

  // Structured request logger
  app.use(requestLogger);

  // General rate limiter for API routes
  app.use('/api', rateLimitPresets.general);

  // JSON Body parser with strict 20kb limit and Content-Type validation
  app.use(express.json({ limit: '20kb' }));
  app.use('/api', enforceJsonContentType);

  // Master API router
  app.use('/api', apiRouter);

  // 404 handler for unknown /api routes
  app.all('/api/*', notFoundHandler);

  // Global Error Handler - returns JSON { ok: false, error: { code, message } } and never leaks stack traces
  app.use(globalErrorHandler);

  return app;
}

export const app = createExpressApp();
export default app;
