import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const credentialsPath = resolve(__dirname, 'src/serviceAccountKey.json');
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));
admin.initializeApp({
  credential: admin.credential.cert(credentials),
  projectId: 'sppd-psbtph',
});

const auth = admin.auth();
const db = admin.firestore();

async function fix() {
  try {
    // Find user by email
    const userRecord = await auth.getUserByEmail('anisa@gmail.com');
    console.log('Found anisa@gmail.com with UID:', userRecord.uid);
    
    // Update Firestore profile
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      nama: 'Anisa anggun Fadelia',
      email: 'anisa@gmail.com',
      role: 'admin',
      wilayah_kerja: 2,
      status: 'approved',
      updatedAt: new Date(),
    }, { merge: true });
    
    console.log('Profile updated for UID:', userRecord.uid);
    
    // Also set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      status: 'approved',
      wilayah_kerja: 2,
    });
    console.log('Custom claims set');
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

fix();
