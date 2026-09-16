import { Router, Request, Response } from 'express';
import { dbAdmin, authAdmin } from '../lib/firebaseAdmin';
import { authMiddleware, requireRole } from '../middleware/auth';
import type { UserProfile } from '../types';

const router = Router();

const COLLECTION = 'users';

// GET /api/users/pending - Get all pending users (admin only)
router.get('/pending', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const snapshot = await dbAdmin.collection(COLLECTION).where('status', '==', 'pending').get();
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as UserProfile);
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/:uid/approve - Approve a user (admin only)
// Body: { role?: 'admin' | 'staf', wilayah_kerja?: number }
router.post('/:uid/approve', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { role = 'staf', wilayah_kerja = 0 } = req.body;

    await authAdmin.setCustomUserClaims(uid, {
      role,
      status: 'approved',
      wilayah_kerja,
    });
    await dbAdmin.collection(COLLECTION).doc(uid).update({
      status: 'approved',
      role,
      wilayah_kerja,
      updatedAt: new Date(),
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/:uid/reject - Reject a user (admin only)
router.post('/:uid/reject', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    await authAdmin.setCustomUserClaims(uid, {
      role: 'staf',
      status: 'rejected',
      wilayah_kerja: 0,
    });
    await dbAdmin.collection(COLLECTION).doc(uid).update({
      status: 'rejected',
      updatedAt: new Date(),
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/me - Get current user profile
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    console.log('[Users/Me] Profile found:', !!user, user?.role, user?.wilayah_kerja);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    console.error('[Users/Me] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users - Get all users (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const snapshot = await dbAdmin.collection(COLLECTION).get();
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as UserProfile);
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:uid - Update user role and/or wilayah_kerja (admin only)
// Prevents admin from downgrading their own role to 'staf'
router.patch('/:uid', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const adminUser = (req as any).user;
    const { role, wilayah_kerja } = req.body;

    // Self-protection: admin cannot change their own role to 'staf'
    if (uid === adminUser.id && role === 'staf') {
      res.status(403).json({ error: 'Anda tidak dapat mengubah role Anda sendiri menjadi staf' });
      return;
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (role) updateData.role = role;
    if (wilayah_kerja !== undefined && wilayah_kerja !== null) updateData.wilayah_kerja = Number(wilayah_kerja);

    // Update Firestore profile
    await dbAdmin.collection(COLLECTION).doc(uid).update(updateData);

    // Sync custom claims if role or wilayah_kerja changed
    if (role || wilayah_kerja !== undefined) {
      const userDoc = await dbAdmin.collection(COLLECTION).doc(uid).get();
      const existing = userDoc.data() as any;
      await authAdmin.setCustomUserClaims(uid, {
        role: role || existing?.role || 'staf',
        status: existing?.status || 'approved',
        wilayah_kerja: wilayah_kerja !== undefined ? Number(wilayah_kerja) : (existing?.wilayah_kerja || 0),
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
