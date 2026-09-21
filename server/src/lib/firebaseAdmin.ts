import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const projectId = process.env.FIREBASE_PROJECT_ID || 'sppd-psbtph';

let firebaseApp: admin.app.App | undefined;

try {
  firebaseApp = admin.app();
} catch {
  try {
    const credentialsPath = resolve(__dirname, '..', 'serviceAccountKey.json');
    const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId,
    });
    console.log('[Firebase] Admin SDK initialized with service account');
  } catch (err1: any) {
    console.warn('[Firebase] Service account key failed, trying default credentials:', err1.message);
    try {
      firebaseApp = admin.initializeApp({
        projectId,
      });
      console.log('[Firebase] Admin SDK initialized with default credentials');
    } catch (err2: any) {
      console.error('[Firebase] CRITICAL: Failed to initialize Firebase Admin SDK:', err2.message);
      console.error('[Firebase] Server will continue running but Firestore/Auth operations will fail.');
      console.error('[Firebase] Fix: ensure server/src/serviceAccountKey.json is valid or set GOOGLE_APPLICATION_CREDENTIALS.');
      firebaseApp = undefined;
    }
  }
}

export const dbAdmin = firebaseApp ? admin.firestore(firebaseApp) : undefined;
export const authAdmin = firebaseApp ? admin.auth() : undefined;
export default firebaseApp;
