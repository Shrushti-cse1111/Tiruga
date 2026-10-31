import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// If started with plain `node server.ts`, ensure tsx module loader is loaded
if (!process.env.TSX_BOOTSTRAPPED && !process.execArgv.some((a) => a.includes('tsx'))) {
  const serverIndexPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'server', 'index.ts');
  const child = spawn(process.execPath, ['--import', 'tsx', serverIndexPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, TSX_BOOTSTRAPPED: 'true' }
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
} else {
  await import('./server/index.ts');
}
