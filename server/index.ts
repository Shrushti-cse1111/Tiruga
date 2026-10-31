import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config, checkConfigOnStartup } from './config';
import { securityHeaders, corsMiddleware } from './middleware/security';
import { rateLimitPresets } from './middleware/rateLimit';
import { enforceJsonContentType } from './middleware/validate';
import { notFoundHandler, globalErrorHandler } from './middleware/errors';
import { requestLogger } from './utils/logger';
import { apiRouter } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export async function createServer() {
  const app = express();
  const isProd = config.nodeEnv === 'production';

  // Trust proxy for Cloud Run and reverse proxies (enables correct client IP for rate limiting)
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

  // Service worker route with required PWA headers
  app.get('/sw.js', (_req: Request, res: Response) => {
    const swPath = path.resolve(rootDir, 'public', 'sw.js');
    if (fs.existsSync(swPath)) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(swPath);
    } else {
      res.status(404).end();
    }
  });

  // Master API router
  app.use('/api', apiRouter);

  // 404 handler for unknown /api routes
  app.all('/api/*', notFoundHandler);

  // Development with Vite in middleware mode or Production with static serving
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
      root: rootDir
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(rootDir, 'dist');
    app.use(express.static(distDir));

    // SPA fallback for all non-/api routes so deep links like /trip/abc work
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      const indexPath = path.resolve(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build not found. Please run npm run build first.');
      }
    });
  }

  // Global Error Handler - returns JSON { ok: false, error: { code, message } } and never leaks stack traces
  app.use(globalErrorHandler);

  return app;
}

// Start server when executed directly
if (process.env.NODE_ENV !== 'test') {
  // Check environment variables at startup (logs by name only; in prod enforces GEMINI_API_KEY)
  checkConfigOnStartup();

  createServer()
    .then((app) => {
      const port = Number(process.env.PORT) || config.port || 3000;
      const host = '0.0.0.0';

      const server = app.listen(port, host, () => {
        console.log(`Tiruga server listening on http://${host}:${port} (${config.nodeEnv})`);
      });

      // Graceful shutdown
      const shutdown = () => {
        console.log('Initiating graceful shutdown...');
        server.close(() => {
          console.log('Server closed successfully.');
          process.exit(0);
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    })
    .catch((err) => {
      console.error('Failed to start server:', err?.message || err);
      process.exit(1);
    });
}
