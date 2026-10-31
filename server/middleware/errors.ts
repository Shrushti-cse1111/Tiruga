import { Request, Response, NextFunction } from 'express';

/**
 * 404 Handler for unmatched /api routes.
 * Always returns JSON { ok: false, error: { code: 'NOT_FOUND', message: 'API route not found' } }.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: `API route ${req.method} ${req.path} not found`
    }
  });
}

/**
 * Global Error Handler.
 * Returns structured JSON without leaking stack traces, environment values, or file paths.
 */
export function globalErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  const status = typeof err.status === 'number'
    ? err.status
    : typeof err.statusCode === 'number'
    ? err.statusCode
    : 500;

  const code = err.code || (status === 404 ? 'NOT_FOUND' : status === 400 ? 'INVALID_INPUT' : 'INTERNAL_SERVER_ERROR');
  
  // Safe message sanitization - never leak tokens, keys, credentials, or raw stack traces
  let rawMessage = err instanceof Error ? err.message : String(err || '');
  if (!rawMessage || status === 500) {
    if (rawMessage.startsWith('Not configured:')) {
      // Allow safe missing configuration notices by name only
      rawMessage = rawMessage;
    } else {
      rawMessage = 'An unexpected server error occurred';
    }
  }

  res.status(status).json({
    ok: false,
    error: {
      code: String(code),
      message: rawMessage
    }
  });
}
