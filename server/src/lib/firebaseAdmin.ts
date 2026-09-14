import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const projectId = process.env.FIREBASE_PROJECT_ID || 'sppd-psbtph';

let firebaseApp: admin.app.App;

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
    console.log('Firebase Admin SDK initialized with service account');
  } catch (err1: any) {
    console.warn('No service account key found, trying default credentials:', err1.message);
    try {
      firebaseApp = admin.initializeApp({
        projectId,
      });
      console.log('Firebase Admin SDK initialized with default credentials');
    } catch (err2: any) {
      console.error('Failed to initialize Firebase Admin SDK:', err2.message);
      console.error('Server will continue but Firestore operations will fail.');
      process.exit(1);
    }
  }
}

export const dbAdmin = admin.firestore(firebaseApp);
export const authAdmin = admin.auth();
export default firebaseApp;
