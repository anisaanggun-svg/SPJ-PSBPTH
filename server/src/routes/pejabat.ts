import { Router, Request, Response } from 'express';
import { dbAdmin } from '../lib/firebaseAdmin';
import { authMiddleware, requireRole } from '../middleware/auth';
import type { MasterPejabat } from '../../../src/types';

const router = Router();

const COLLECTION = 'Master_Pejabat';
const LEGACY_COLLECTION = 'master_pejabat';

async function getPejabatDocuments(wilayahKerja?: number): Promise<any[]> {
  const collections = [dbAdmin.collection(COLLECTION), dbAdmin.collection(LEGACY_COLLECTION)];
  const snapshots = await Promise.all(
    collections.map(async (collectionRef) => {
      let query: FirebaseFirestore.Query = collectionRef;
      if (wilayahKerja) {
        query = query.where('wilayah_kerja', '==', wilayahKerja);
      }
      return query.get();
    }),
  );

  const documents = new Map<string, any>();
  snapshots.forEach((snapshot) => {
    snapshot.forEach((doc) => documents.set(doc.id, doc));
  });
  return Array.from(documents.values());
}

async function findPejabatDocument(id: string): Promise<{ collectionRef: any; doc: any } | null> {
  const canonicalDoc = await dbAdmin.collection(COLLECTION).doc(id).get();
  if (canonicalDoc.exists) {
    return { collectionRef: dbAdmin.collection(COLLECTION), doc: canonicalDoc };
  }

  const legacyDoc = await dbAdmin.collection(LEGACY_COLLECTION).doc(id).get();
  if (legacyDoc.exists) {
    return { collectionRef: dbAdmin.collection(LEGACY_COLLECTION), doc: legacyDoc };
  }

  return null;
}

// GET /api/pejabat - Get all pejabat (filter by wilayah_kerja optional)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  console.log('[Pejabat/GET] request received, query:', req.query);
  try {
    const rawWilayahKerja = req.query.wilayah_kerja;
    const wilayahKerja = rawWilayahKerja ? parseInt(rawWilayahKerja as string, 10) : undefined;
    if (rawWilayahKerja && (!Number.isFinite(wilayahKerja) || (wilayahKerja as number) <= 0)) {
      res.status(400).json({ error: 'wilayah_kerja must be a positive number' });
      return;
    }

    const documents = await getPejabatDocuments(wilayahKerja);
    const pejabat: MasterPejabat[] = documents
      .map((doc) => ({ id: doc.id, ...doc.data() } as MasterPejabat))
      .sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));

    console.log('[Pejabat/GET] success, count:', pejabat.length);
    res.json(pejabat);
  } catch (error: any) {
    console.error('[Pejabat/GET] ERROR:', error.message, error.code);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// POST /api/pejabat - Create pejabat (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  console.log('[Pejabat/POST] request received, body keys:', Object.keys(req.body || {}));
  try {
    const data = req.body as Omit<MasterPejabat, 'id'>;
    const docRef = await dbAdmin.collection(COLLECTION).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const doc = await docRef.get();
    const result: MasterPejabat = { id: doc.id, ...doc.data() } as MasterPejabat;
    console.log('[Pejabat/POST] success, new id:', doc.id);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('[Pejabat/POST] ERROR:', error.message, error.code);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// PUT /api/pejabat/:id - Update pejabat (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  console.log('[Pejabat/PUT] request received, id:', req.params.id);
  try {
    const { id } = req.params;
    const data = req.body as Partial<MasterPejabat>;
    const existing = await findPejabatDocument(id);
    if (!existing) {
      res.status(404).json({ error: 'Pejabat tidak ditemukan' });
      return;
    }

    await existing.collectionRef.doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    console.log('[Pejabat/PUT] success, id:', id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Pejabat/PUT] ERROR:', error.message, error.code);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// DELETE /api/pejabat/:id - Delete pejabat (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  console.log('[Pejabat/DELETE] request received, id:', req.params.id);
  try {
    const { id } = req.params;
    const existing = await findPejabatDocument(id);
    if (!existing) {
      res.status(404).json({ error: 'Pejabat tidak ditemukan' });
      return;
    }

    await existing.collectionRef.doc(id).delete();
    console.log('[Pejabat/DELETE] success, id:', id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Pejabat/DELETE] ERROR:', error.message, error.code);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

export default router;
