import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { config } from '../config';
import { seedAll } from '../seed/seed';
import { rateLimitPresets } from '../middleware/rateLimit';

export const seedRouter = Router();

/**
 * Constant time string comparison using SHA-256 hashing to prevent timing attacks.
 */
function timingSafeEqualStrings(a: string, b: string): boolean {
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// POST /api/admin/seed exists ONLY when SEED_ENABLED === "true"; otherwise falls through to 404
if (config.seedEnabled) {
  seedRouter.post('/admin/seed', rateLimitPresets.seed, async (req: Request, res: Response) => {
    const providedSecret = req.headers['x-seed-secret'];
    const secretStr = Array.isArray(providedSecret) ? providedSecret[0] : (providedSecret as string | undefined);

    if (!secretStr || !timingSafeEqualStrings(secretStr, config.seedSecret)) {
      res.status(403).json({
        ok: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Invalid or missing seed authorization secret'
        }
      });
      return;
    }

    try {
      // Accepts no user input into the data
      const result = await seedAll();

      // Logs ONLY "seed run" with counts
      console.log(`[Seed Log] seed run: destinations=${result.destinations}, attractions=${result.attractions}, phrases=${result.phrases}, transport=${result.transport}`);

      res.json({
        ok: true,
        counts: {
          destinations: result.destinations,
          attractions: result.attractions,
          phrases: result.phrases,
          transport: result.transport
        }
      });
    } catch (err: any) {
      console.error('[Seed Error] Database seeding encountered an error:', err?.message || err);
      res.status(500).json({
        ok: false,
        error: {
          code: 'SEED_FAILED',
          message: 'Database seeding failed'
        }
      });
    }
  });
}
