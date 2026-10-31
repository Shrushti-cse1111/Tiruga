import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin, getAuth } from '../firebaseAdmin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser | null;
    }
  }
}

/**
 * Optional authentication middleware:
 * - If Authorization header is absent: sets req.user = null (guest mode continues).
 * - If Authorization header is present: verifies Bearer token with Admin SDK.
 * - If token is invalid or expired: returns 401 { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Please sign in again.' } }.
 * CRITICAL: Never logs tokens or credentials.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    next();
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    const { isReady } = getFirebaseAdmin();
    if (!isReady) {
      // If admin auth is not configured, fall back to guest without crashing
      req.user = null;
      next();
      return;
    }

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email
    };
    next();
  } catch (err: any) {
    // Present but invalid/expired token returns 401
    res.status(401).json({
      ok: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Please sign in again.'
      }
    });
  }
}

/**
 * Mandatory authentication middleware:
 * Rejects with 401 if there is no valid user session.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  await optionalAuth(req, res, () => {
    if (!req.user || !req.user.uid) {
      res.status(401).json({
        ok: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Please sign in again.'
        }
      });
      return;
    }
    next();
  });
}
