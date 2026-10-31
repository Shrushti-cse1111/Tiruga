import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import type { Request, Response, NextFunction } from 'express';

// If started with plain `node server.ts`, ensure tsx module loader is loaded
if (!process.env.TSX_BOOTSTRAPPED && !process.execArgv.some((a) => a.includes('tsx'))) {
  const currentFilePath = fileURLToPath(import.meta.url);
  const child = spawn(process.execPath, ['--import', 'tsx', currentFilePath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, TSX_BOOTSTRAPPED: 'true' }
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
} else {
  // Import modular Express app (without listen/vite)
  const { default: app } = await import('./server/app');
  const { config, checkConfigOnStartup } = await import('./server/config');
  const express = (await import('express')).default;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = __dirname;
  const isProd = config.nodeEnv === 'production';

  // Service worker route with required PWA headers
  app.get('/sw.js', (_req: Request, res: Response) => {
    const swPath = path.resolve(rootDir, isProd ? 'dist' : 'public', 'sw.js');
    if (fs.existsSync(swPath)) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(swPath);
    } else {
      res.status(404).end();
    }
  });

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

  // Start listening for local and Render usage
  if (process.env.NODE_ENV !== 'test') {
    checkConfigOnStartup();

    const port = Number(process.env.PORT) || config.port || 3000;
    const host = '0.0.0.0';

    const server = app.listen(port, host, () => {
      console.log(`Tiruga server listening on http://${host}:${port} (${config.nodeEnv})`);
    });

    const shutdown = () => {
      console.log('Initiating graceful shutdown...');
      server.close(() => {
        console.log('Server closed successfully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}
