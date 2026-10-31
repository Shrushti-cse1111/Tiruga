import dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

/**
 * Server-only configuration.
 * Reads environment variables needed by the backend.
 * CRITICAL: Never import this file from client code (src/).
 */
export interface ServerConfig {
  geminiApiKey: string;
  geminiModel: string;
  seedEnabled: boolean;
  seedSecret: string;
  googleApplicationCredentials: string;
  port: number;
  nodeEnv: string;
  allowedOrigins: string[];
}

const rawAllowedOrigins = process.env.ALLOWED_ORIGINS || '';
const parsedOrigins = rawAllowedOrigins
  ? rawAllowedOrigins.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

export const config: ServerConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  seedEnabled: process.env.SEED_ENABLED === 'true',
  seedSecret: process.env.SEED_SECRET || '',
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: parsedOrigins
};

export const REQUIRED_SERVER_VARS = [
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'SEED_ENABLED',
  'SEED_SECRET'
] as const;

/**
 * Logs presence/absence of required environment variables by NAME only.
 * Never logs values. In production, refuses to start if GEMINI_API_KEY is missing.
 */
export function checkConfigOnStartup(): void {
  console.log('[Config Check] Environment variables presence status:');
  for (const varName of REQUIRED_SERVER_VARS) {
    const isPresent = Boolean(process.env[varName] && process.env[varName]?.trim() !== '');
    console.log(`  - ${varName}: ${isPresent ? 'PRESENT' : 'MISSING'}`);
  }

  // In production, refuse to start if GEMINI_API_KEY is missing
  if (config.nodeEnv === 'production' && !config.geminiApiKey) {
    console.error('[Config Error] Fatal: GEMINI_API_KEY is required in production mode.');
    process.exit(1);
  }

  // Loud warning if SEED_ENABLED is true in production
  if (config.nodeEnv === 'production' && config.seedEnabled) {
    console.warn('******************************************************************');
    console.warn('⚠️  CRITICAL SECURITY WARNING: SEED_ENABLED IS TRUE IN PRODUCTION ⚠️');
    console.warn('   Disable SEED_ENABLED and remove SEED_SECRET after seeding.    ');
    console.warn('******************************************************************');
  }
}

/**
 * Returns a dictionary of variable presence { [name]: boolean }.
 * Never returns variable values.
 */
export function getConfigStatus(): Record<string, boolean> {
  const status: Record<string, boolean> = {};
  for (const varName of REQUIRED_SERVER_VARS) {
    status[varName] = Boolean(process.env[varName] && process.env[varName]?.trim() !== '');
  }
  return status;
}

export default config;
