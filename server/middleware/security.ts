import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Security headers middleware.
 * Sets mandatory protection headers and CSP manually without third-party bloat.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Remove X-Powered-By
  res.removeHeader('X-Powered-By');

  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy - disable camera & microphone
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  // X-Frame-Options: allow AI Studio iframe in development; SAMEORIGIN in production
  const isDev = config.nodeEnv !== 'production';
  if (!isDev) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }

  // Content-Security-Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com https://*.gstatic.com https://firestore.googleapis.com",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.run.app",
    "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
    isDev
      ? "frame-ancestors 'self' https://*.google.com https://*.run.app https://aistudio.google.com"
      : "frame-ancestors 'self'"
  ];

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  next();
}

/**
 * CORS Middleware:
 * Same-origin by default. No wildcard (*). Only explicitly configured ALLOWED_ORIGINS are allowed.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  if (origin && config.allowedOrigins.length > 0 && config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
  } else if (req.method === 'OPTIONS' && !origin) {
    res.status(204).end();
    return;
  }

  next();
}
