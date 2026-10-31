import { Router, Request, Response } from 'express';
import { getFirebaseAdmin, getFirestore } from '../firebaseAdmin';
import { config, getConfigStatus } from '../config';

export const healthRouter = Router();

/**
 * GET /api/health
 * Simple liveness probe. Returns { ok: true, time: ISOString }.
 */
healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    time: new Date().toISOString()
  });
});

/**
 * GET /api/ready
 * Readiness probe with a lightweight Firestore Admin read.
 * Returns { ok, firestore } without leaking connection details or internal paths.
 */
healthRouter.get('/ready', async (_req: Request, res: Response) => {
  try {
    const { isReady } = getFirebaseAdmin();
    if (!isReady) {
      res.json({
        ok: false,
        firestore: false
      });
      return;
    }

    const db = getFirestore();
    // Tiny probe read with a 3-second timeout
    const probePromise = db.collection('destinations').limit(1).get();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 3000)
    );

    await Promise.race([probePromise, timeoutPromise]);

    res.json({
      ok: true,
      firestore: true
    });
  } catch {
    // Graceful error reporting without crashing or leaking details
    res.json({
      ok: false,
      firestore: false
    });
  }
});

/**
 * GET /api/config-status (dev-only)
 * Returns boolean presence by name only.
 */
if (config.nodeEnv !== 'production') {
  healthRouter.get('/config-status', (_req: Request, res: Response) => {
    res.json(getConfigStatus());
  });
}
