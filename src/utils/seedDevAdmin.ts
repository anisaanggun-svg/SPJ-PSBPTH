import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '../types';

const DEV_ADMIN_EMAIL = import.meta.env.VITE_DEV_ADMIN_EMAIL;
const DEV_ADMIN_PASSWORD = import.meta.env.VITE_DEV_ADMIN_PASSWORD;
const DEV_ADMIN_NAME = import.meta.env.VITE_DEV_ADMIN_NAME || 'Dev Admin';
const DEV_ADMIN_WILAYAH = parseInt(import.meta.env.VITE_DEV_ADMIN_WILAYAH || '1', 10);

// Guard to prevent multiple executions (seedDevAdmin is called on every render in App.tsx)
let seedInProgress = false;

export async function seedDevAdmin(): Promise<void> {
  // Only run in development mode
  if (!import.meta.env.DEV) {
    console.log('[Seed] Skipping dev admin seed - not in development mode');
    return;
  }

  // Prevent concurrent/duplicate executions
  if (seedInProgress) {
    console.log('[Seed] Dev admin seed already in progress, skipping');
    return;
  }
  seedInProgress = true;

  // Skip if env vars are not configured
  if (!DEV_ADMIN_EMAIL || !DEV_ADMIN_PASSWORD) {
    console.warn(
      '[Seed] Dev admin seed skipped: VITE_DEV_ADMIN_EMAIL or VITE_DEV_ADMIN_PASSWORD not set in .env'
    );
    seedInProgress = false;
    return;
  }

  try {
    console.log('[Seed] Starting dev admin seed...');

    let uid: string;
    let user: User;

    // Check if user is already signed in (use currentUser, not hardcoded UID)
    if (auth.currentUser) {
      user = auth.currentUser;
      uid = user.uid;
      console.log('[Seed] Using already-signed-in user:', uid, user.email);
    } else {
      // Try to sign in with existing credentials
      try {
        const cred = await signInWithEmailAndPassword(auth, DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD);
        user = cred.user;
        uid = cred.user.uid;
        console.log('[Seed] Signed in with existing dev admin user:', uid);
      } catch (error: unknown) {
        // If sign in fails with user-not-found, create new user
        const firebaseError = error as { code?: string };
        if (firebaseError.code === 'auth/user-not-found') {
          const cred = await createUserWithEmailAndPassword(
            auth,
            DEV_ADMIN_EMAIL,
            DEV_ADMIN_PASSWORD
          );
          user = cred.user;
          uid = cred.user.uid;
          console.log('[Seed] Created new dev admin user in Firebase Auth:', uid);
        } else {
          console.error('[Seed] Sign in error:', error);
          throw error;
        }
      }
    }

    // Ensure Firestore profile exists and is approved admin
    // Use 'users' collection (lowercase) to match backend
    const userRef = doc(db, 'users', uid);
    console.log('[Seed] Checking Firestore profile for uid:', uid, 'in collection: users');
    const docSnap = await getDoc(userRef);

    const adminProfile: Omit<UserProfile, 'id'> = {
      uid,
      nama: DEV_ADMIN_NAME,
      email: DEV_ADMIN_EMAIL,
      role: 'admin',
      wilayah_kerja: DEV_ADMIN_WILAYAH,
      status: 'approved',
    };

    if (!docSnap.exists()) {
      console.log('[Seed] Firestore profile does not exist, creating...');
      await setDoc(userRef, {
        ...adminProfile,
        createdAt: serverTimestamp(),
      });
      console.log('[Seed] Created dev admin profile in Firestore:', adminProfile);
    } else {
      const existing = docSnap.data() as Partial<UserProfile>;
      console.log('[Seed] Firestore profile already exists:', existing);
      // Update existing profile to ensure it's approved admin
      await setDoc(userRef, {
        ...adminProfile,
        createdAt: existing.createdAt || serverTimestamp(),
      }, { merge: true });
      console.log('[Seed] Updated dev admin profile in Firestore:', adminProfile);
    }

    // Do NOT sign out — keep the user signed in so AuthContext can pick up the session
    // The AuthContext's onAuthStateChanged will fire and fetch the profile via getMe()
    console.log('[Seed] Dev admin seed completed successfully. User remains signed in.');
  } catch (error) {
    console.error('[Seed] Error seeding dev admin:', error);
  } finally {
    seedInProgress = false;
  }
}
