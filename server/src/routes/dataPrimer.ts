import { Router, Request, Response } from 'express';
import { dbAdmin } from '../lib/firebaseAdmin';
import { authMiddleware, requireRole } from '../middleware/auth';
import type { DataPrimer, MasterPejabat } from '../../../src/types';
import { generateKwitansi } from '../lib/generateKwitansi';

const router = Router();

const COLLECTION = 'Data_Primer';
const DATE_FIELDS = ['Pada_tanggal', 'Tanggal_Berangkat', 'Tanggal_Kembali'];

function parseDate(value: any, field: string): Date {
  let date: Date | null = null;
  if (typeof value?.toDate === 'function') {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'object' && value._seconds !== undefined) {
    date = new Date(value._seconds * 1000);
  } else if (typeof value === 'object' && value.seconds !== undefined) {
    date = new Date(value.seconds * 1000);
  } else if (typeof value === 'string') {
    date = new Date(value);
  }

  if (!date || Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid date`);
  }
  return date;
}

function toIsoString(value: any, field: string): string {
  return parseDate(value, field).toISOString();
}

function convertTimestamps(data: any): any {
  const result = { ...data };
  DATE_FIELDS.forEach((field) => {
    if (result[field] === undefined || result[field] === null || result[field] === '') return;
    const val = result[field];
    console.log(`[DataPrimer] convertTimestamps: field=${field}, type=${typeof val}, value=`, val);
    result[field] = parseDate(val, field);
    console.log(`[DataPrimer] convertTimestamps: field=${field} converted to`, result[field]);
  });
  return result;
}

function serializeDataPrimer(item: any): DataPrimer {
  const result = { ...item };
  DATE_FIELDS.forEach((field) => {
    if (result[field]) result[field] = toIsoString(result[field], field);
  });
  return result as DataPrimer;
}

// GET /api/data-primer?wilayah_kerja=&tahun_data=
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  console.log('[DataPrimer/GET] request received, query:', req.query);
  try {
    const rawWilayahKerja = req.query.wilayah_kerja;
    const rawTahunData = req.query.tahun_data;
    const wilayahKerja = rawWilayahKerja ? parseInt(rawWilayahKerja as string, 10) : null;
    const tahunData = rawTahunData ? parseInt(rawTahunData as string, 10) : null;

    if (!wilayahKerja || !Number.isFinite(wilayahKerja) || wilayahKerja <= 0) {
      console.log('[DataPrimer/GET] ERROR: wilayah_kerja is required and must be a positive number');
      res.status(400).json({ error: 'wilayah_kerja is required and must be a positive number' });
      return;
    }
    if (rawTahunData && (!Number.isFinite(tahunData) || (tahunData as number) <= 0)) {
      console.log('[DataPrimer/GET] ERROR: tahun_data must be a positive number');
      res.status(400).json({ error: 'tahun_data must be a positive number' });
      return;
    }

    // Filter only by wilayah in Firestore to avoid a composite index requirement.
    // Tahun_Data filtering and No sorting are performed in application memory.
    const snapshot = await dbAdmin
      .collection(COLLECTION)
      .where('Wilayah_Kerja', '==', wilayahKerja)
      .get();
    const data: DataPrimer[] = [];
    snapshot.forEach((doc) => {
      const item = { id: doc.id, ...doc.data() } as DataPrimer;
      if (!tahunData || item.Tahun_Data === tahunData) {
        data.push(item);
      }
    });
    data.sort((a, b) => (a.No || 0) - (b.No || 0));
    console.log('[DataPrimer/GET] success, count:', data.length, 'filteredByYear:', tahunData ?? 'none');
    res.json(data);
  } catch (error: any) {
    console.error('[DataPrimer/GET] ERROR:', error.message, error.code);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// POST /api/data-primer - Create data primer
router.post('/', authMiddleware, requireRole('admin', 'staf'), async (req: Request, res: Response) => {
  console.log('[DataPrimer/POST] request received, body keys:', Object.keys(req.body || {}));
  try {
    const data = convertTimestamps(req.body);
    const docRef = await dbAdmin.collection(COLLECTION).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const doc = await docRef.get();
    const result: DataPrimer = { id: doc.id, ...doc.data() } as DataPrimer;
    console.log('[DataPrimer/POST] success, new id:', doc.id);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('[DataPrimer/POST] ERROR:', error.message, error.code);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// PUT /api/data-primer/:id - Update data primer
router.put('/:id', authMiddleware, requireRole('admin', 'staf'), async (req: Request, res: Response) => {
  console.log('[DataPrimer/PUT] request received, id:', req.params.id);
  try {
    const { id } = req.params;
    const data = convertTimestamps(req.body);
    await dbAdmin.collection(COLLECTION).doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    console.log('[DataPrimer/PUT] success, id:', id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[DataPrimer/PUT] ERROR:', error.message, error.code);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// DELETE /api/data-primer/:id - Delete data primer
router.delete('/:id', authMiddleware, requireRole('admin', 'staf'), async (req: Request, res: Response) => {
  console.log('[DataPrimer/DELETE] request received, id:', req.params.id);
  try {
    const { id } = req.params;
    await dbAdmin.collection(COLLECTION).doc(id).delete();
    console.log('[DataPrimer/DELETE] success, id:', id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[DataPrimer/DELETE] ERROR:', error.message, error.code);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

// GET /api/data-primer/:id/kwitansi - Generate dokumen kwitansi
router.get('/:id/kwitansi', authMiddleware, async (req: Request, res: Response) => {
  console.log('[KWITANSI] request received, id:', req.params.id);
  try {
    const { id } = req.params;
    const doc = await dbAdmin.collection(COLLECTION).doc(id).get();
    if (!doc.exists) {
      console.log('[KWITANSI] ERROR: Data primer tidak ditemukan, id:', id);
      res.status(404).json({ error: 'Data primer tidak ditemukan' });
      return;
    }
    const dataPrimer = { id: doc.id, ...doc.data() } as DataPrimer;
    console.log('[KWITANSI] data primer found:', dataPrimer.Nama_Pegawai, 'Wilayah_Kerja:', dataPrimer.Wilayah_Kerja);

    const ppkSnap = await dbAdmin
      .collection('Master_Pejabat')
      .where('role', '==', 'ppk')
      .where('wilayah_kerja', '==', dataPrimer.Wilayah_Kerja)
      .where('aktif', '==', true)
      .limit(1)
      .get();
    const bendaharaSnap = await dbAdmin
      .collection('Master_Pejabat')
      .where('role', '==', 'bendahara')
      .where('wilayah_kerja', '==', dataPrimer.Wilayah_Kerja)
      .where('aktif', '==', true)
      .limit(1)
      .get();

    console.log('[KWITANSI] wilayah kerja:', dataPrimer.Wilayah_Kerja);
    console.log('[KWITANSI] PPK found:', ppkSnap.empty ? 'NO' : 'YES', ppkSnap.empty ? '' : ppkSnap.docs[0].data().nama);
    console.log('[KWITANSI] Bendahara found:', bendaharaSnap.empty ? 'NO' : 'YES', bendaharaSnap.empty ? '' : bendaharaSnap.docs[0].data().nama);

    if (ppkSnap.empty || bendaharaSnap.empty) {
      console.log('[KWITANSI] ERROR: PPK atau Bendahara tidak ditemukan untuk wilayah kerja:', dataPrimer.Wilayah_Kerja);
      res.status(400).json({ error: 'PPK atau Bendahara belum diatur di Master Pejabat untuk wilayah kerja ini' });
      return;
    }

    const ppk = ppkSnap.docs[0].data() as MasterPejabat;
    const bendahara = bendaharaSnap.docs[0].data() as MasterPejabat;

    // TODO: ganti noBukti & nomorDIPA sesuai sumber data kamu (input manual, counter, atau .env)
    const noBukti = (req.query.no_bukti as string) || '';
    const nomorDIPA = process.env.NOMOR_DIPA || '018.03.3.059106/2026';

    console.log('[KWITANSI] generating document...');
    const buffer = await generateKwitansi(dataPrimer, ppk, bendahara, noBukti, nomorDIPA);
    console.log('[KWITANSI] generation success, buffer size:', buffer.length);

    res.setHeader('Content-Disposition', `attachment; filename=kwitansi-${id}.docx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error: any) {
    console.error('[KWITANSI] ERROR:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

export default router;