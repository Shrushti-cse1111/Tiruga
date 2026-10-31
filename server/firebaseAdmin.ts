import fs from 'fs';
import { initializeApp, getApps, cert, applicationDefault, App, Credential } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth, Auth } from 'firebase-admin/auth';
import { config } from './config';
import firebaseAppletConfig from '../firebase-applet-config.json';

let app: App | null = null;
let initError: Error | null = null;
let isInitialized = false;

/**
 * Safely initializes Firebase Admin SDK once per cold start.
 * Never logs credential values or tokens.
 * Handles GOOGLE_APPLICATION_CREDENTIALS as:
 *  - Full JSON text (service account credentials object)
 *  - Base64 encoded JSON text
 *  - File path to service account JSON
 *  - Application Default Credentials fallback
 * If credentials are missing or invalid, marks service as not configured without crashing.
 */
export function getFirebaseAdmin(): { app: App | null; error: Error | null; isReady: boolean } {
  if (isInitialized) {
    return { app, error: initError, isReady: !!app };
  }
  isInitialized = true;

  try {
    const existingApps = getApps();
    if (existingApps.length > 0 && existingApps[0]) {
      app = existingApps[0];
      return { app, error: null, isReady: true };
    }

    let credRaw = (process.env.GOOGLE_APPLICATION_CREDENTIALS || config.googleApplicationCredentials || '').trim();

    // Remove wrapping quotes if present
    if (
      (credRaw.startsWith('"') && credRaw.endsWith('"')) ||
      (credRaw.startsWith("'") && credRaw.endsWith("'"))
    ) {
      credRaw = credRaw.slice(1, -1).trim();
    }

    let credential: Credential | null = null;
    let projectId = (firebaseAppletConfig as any).projectId || 'tiruga-app-25000';
    let parsedServiceAccount: any = null;

    if (credRaw.length > 0) {
      // 1. Direct JSON text
      if (credRaw.startsWith('{')) {
        try {
          parsedServiceAccount = JSON.parse(credRaw);
        } catch {
          try {
            parsedServiceAccount = JSON.parse(credRaw.replace(/\\n/g, '\n'));
          } catch {}
        }
      }

      // 2. Base64 encoded JSON
      if (!parsedServiceAccount && !credRaw.startsWith('/') && !credRaw.startsWith('.')) {
        try {
          const decoded = Buffer.from(credRaw, 'base64').toString('utf8').trim();
          if (decoded.startsWith('{')) {
            parsedServiceAccount = JSON.parse(decoded);
          }
        } catch {}
      }

      // 3. File path on disk
      if (!parsedServiceAccount && fs.existsSync(credRaw)) {
        try {
          const fileContent = fs.readFileSync(credRaw, 'utf8');
          parsedServiceAccount = JSON.parse(fileContent);
        } catch {}
      }
    }

    if (parsedServiceAccount) {
      if (parsedServiceAccount.project_id) {
        projectId = parsedServiceAccount.project_id;
      }
      if (typeof parsedServiceAccount.private_key === 'string' && parsedServiceAccount.private_key.includes('\\n')) {
        parsedServiceAccount.private_key = parsedServiceAccount.private_key.replace(/\\n/g, '\n');
      }
      credential = cert(parsedServiceAccount);
    } else {
      credential = applicationDefault();
    }

    app = initializeApp({
      credential,
      projectId
    });

    return { app, error: null, isReady: true };
  } catch (err: any) {
    initError = err instanceof Error ? err : new Error(String(err));
    console.warn('[FirebaseAdmin] Failed to initialize: Not configured: GOOGLE_APPLICATION_CREDENTIALS');
    return { app: null, error: initError, isReady: false };
  }
}

/**
 * Returns Firestore Admin instance or throws a safe "Not configured" error.
 */
export function getFirestore(): Firestore {
  const { app: adminApp, isReady } = getFirebaseAdmin();
  if (!isReady || !adminApp) {
    throw new Error('Not configured: GOOGLE_APPLICATION_CREDENTIALS');
  }
  const dbId = (firebaseAppletConfig as any).firestoreDatabaseId;
  return dbId && dbId !== '(default)'
    ? getAdminFirestore(adminApp, dbId)
    : getAdminFirestore(adminApp);
}

/**
 * Returns Auth Admin instance or throws a safe "Not configured" error.
 */
export function getAuth(): Auth {
  const { app: adminApp, isReady } = getFirebaseAdmin();
  if (!isReady || !adminApp) {
    throw new Error('Not configured: GOOGLE_APPLICATION_CREDENTIALS');
  }
  return getAdminAuth(adminApp);
}

export default {
  getFirebaseAdmin,
  getFirestore,
  getAuth
};
