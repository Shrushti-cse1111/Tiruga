import fs from 'fs';
import { initializeApp, getApps, cert, applicationDefault, App, Credential } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth, Auth } from 'firebase-admin/auth';
import { config } from './config';

let app: App | null = null;
let initError: Error | null = null;
let isInitialized = false;

/**
 * Safely initializes Firebase Admin SDK once.
 * Never logs credential values or tokens.
 * Handles GOOGLE_APPLICATION_CREDENTIALS as full JSON text or file path.
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

    const credRaw = (config.googleApplicationCredentials || '').trim();
    let credential: Credential;
    let projectId = 'tiruga-app-25000';

    if (credRaw.startsWith('{')) {
      // Full JSON string
      const parsed = JSON.parse(credRaw);
      const tempPath = '/tmp/tiruga-sa-key.json';
      try {
        fs.writeFileSync(tempPath, credRaw, { mode: 0o600 });
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
      } catch {
        // Fallback in case /tmp is read-only
      }
      credential = cert(parsed);
      if (parsed.project_id) {
        projectId = parsed.project_id;
      }
    } else if (credRaw.length > 0) {
      // File path
      if (fs.existsSync(credRaw)) {
        const fileContent = JSON.parse(fs.readFileSync(credRaw, 'utf8'));
        credential = cert(fileContent);
        if (fileContent.project_id) {
          projectId = fileContent.project_id;
        }
      } else {
        credential = applicationDefault();
      }
    } else {
      // Application Default Credentials
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
  return getAdminFirestore(adminApp);
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
