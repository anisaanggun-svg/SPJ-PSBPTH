import { Request, Response, NextFunction } from 'express';
import { authAdmin, dbAdmin } from '../lib/firebaseAdmin';
import type { UserProfile } from '../types';

async function verifyToken(token: string): Promise<{ uid: string }> {
  // Try Admin SDK first
  if (authAdmin) {
    try {
      const decodedToken = await (authAdmin as any).verifyIdToken(token);
      return { uid: decodedToken.uid };
    } catch (err) {
      // Fall through to REST API
    }
  }

  console.log('[Auth] verifyToken: trying Admin SDK');
  // Fallback: verify using Firebase Auth REST API
  console.log('[Auth] verifyToken: Admin SDK failed, trying REST API');
  const projectId = process.env.FIREBASE_PROJECT_ID || 'sppd-psbtph';
  const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyD9D69Bjxji2t40YlQDSkEawBFpMl2bba4';
  const response = await fetch(
    `https://www.googleapis.com/identityplatform/v3/projects/${projectId}/verifyIdToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    }
  );
  if (!response.ok) {
    throw new Error(`Token verification failed: ${response.status}`);
  }
  const data = await response.json() as { localId: string };
  return { uid: data.localId };
}

async function getUserProfile(uid: string): Promise<Omit<UserProfile, 'id'>> {
  console.log('[Auth] getUserProfile: uid=', uid);

  // Priority 1: Fetch from Firestore (source of truth) - always fresh data
  let firestoreData: any = null;
  if (dbAdmin) {
    try {
      const userDocRef = await (dbAdmin as any).collection('users').doc(uid).get();
      if (userDocRef.exists) {
        firestoreData = userDocRef.data();
        console.log('[Auth] getUserProfile: Firestore profile found:', {
          role: firestoreData?.role,
          wilayah_kerja: firestoreData?.wilayah_kerja,
          status: firestoreData?.status,
          email: firestoreData?.email,
        });
      } else {
        console.log('[Auth] getUserProfile: Firestore doc does not exist for uid:', uid);
      }
    } catch (err) {
      console.error('[Auth] getUserProfile: Firestore fetch failed:', err);
    }
  }

  // Priority 2: Get user info from Admin SDK (for displayName/email fallback)
  let adminUserData: any = null;
  let customClaims: any = {};
  if (authAdmin) {
    try {
      const userDoc = await (authAdmin as any).getUser(uid);
      adminUserData = userDoc;
      customClaims = (userDoc.customClaims || {}) as {
        role?: UserProfile['role'];
        wilayah_kerja?: number;
        status?: UserProfile['status'];
      };
      console.log('[Auth] getUserProfile: Admin SDK customClaims:', customClaims);
    } catch (err) {
      console.log('[Auth] getUserProfile: Admin SDK getUser failed:', err);
    }
  }

  // Merge: Firestore takes precedence (source of truth), Admin SDK as fallback
  const role = firestoreData?.role || customClaims.role || 'staf';
  const wilayahKerja = firestoreData?.wilayah_kerja ?? customClaims.wilayah_kerja ?? 0;
  const status = firestoreData?.status || customClaims.status || 'pending';
  const nama = firestoreData?.nama || adminUserData?.displayName || adminUserData?.email?.split('@')[0] || 'User';
  const email = firestoreData?.email || adminUserData?.email || '';

  console.log('[Auth] getUserProfile: final merged profile:', {
    uid,
    role,
    wilayah_kerja: wilayahKerja,
    status,
  });

  return {
    uid,
    nama,
    email,
    role,
    wilayah_kerja: wilayahKerja,
    status,
  };
}

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: no token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await verifyToken(token);
    const uid = decoded.uid;

    console.log('[Auth] Authenticated UID:', uid);

    const profile = await getUserProfile(uid);

    console.log('[Auth] Profile found:', !!profile.role, profile.role, profile.wilayah_kerja, profile.status);

    // /users/me must remain available so the frontend can redirect pending/rejected
    // users to the approval flow. All other API endpoints require an approved account.
    const isProfileEndpoint = req.path === '/me' || req.originalUrl.endsWith('/users/me');
    if (profile.status !== 'approved' && !isProfileEndpoint) {
      console.log('[Auth] Access denied: user status=', profile.status, 'uid=', uid);
      res.status(403).json({ error: 'Forbidden: account is not approved' });
      return;
    }

    req.user = {
      id: uid,
      ...profile,
    };

    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}
