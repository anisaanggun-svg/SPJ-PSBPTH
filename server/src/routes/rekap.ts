import { Router, Request, Response } from 'express';
import { dbAdmin } from '../lib/firebaseAdmin';
import { authMiddleware } from '../middleware/auth';
import type { RekapModel3Item } from '../../../src/types';

const router = Router();

const COLLECTION = 'Data_Primer';
const DATE_FIELDS = ['Pada_tanggal', 'Tanggal_Berangkat', 'Tanggal_Kembali'];

function toIsoString(value: any): string {
  if (!value) return '';

  let date: Date | null = null;
  if (typeof value.toDate === 'function') {
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

  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : '';
}

// GET /api/rekap?wilayah_kerja=&tahun_data=&bulan=
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  console.log('[Rekap/GET] request received, query:', req.query);
  try {
    const rawWilayahKerja = req.query.wilayah_kerja;
    const rawTahunData = req.query.tahun_data;
    const bulan = typeof req.query.bulan === 'string' ? req.query.bulan : '';
    const wilayahKerja = rawWilayahKerja ? parseInt(rawWilayahKerja as string, 10) : null;
    const tahunData = rawTahunData ? parseInt(rawTahunData as string, 10) : null;

    if (!wilayahKerja || !Number.isFinite(wilayahKerja) || wilayahKerja <= 0 || !tahunData || !Number.isFinite(tahunData) || tahunData <= 0) {
      console.log('[Rekap/GET] ERROR: wilayah_kerja and tahun_data are required and must be positive numbers');
      res.status(400).json({ error: 'wilayah_kerja and tahun_data are required and must be positive numbers' });
      return;
    }

    // Filter only by wilayah in Firestore to avoid a composite index requirement.
    // Tahun and bulan are filtered in application memory.
    const snapshot = await dbAdmin
      .collection(COLLECTION)
      .where('Wilayah_Kerja', '==', wilayahKerja)
      .get();
    console.log('[Rekap/GET] snapshot count before filters:', snapshot.size);

    // Group by Kode_Kegiatan + Kategori_DL
    const groups: Record<
      string,
      {
        Berangkat_dari: string;
        Tujuan: string;
        Pada_tanggal: string;
        Kode_Kegiatan: string;
        entries: { Nama_Pegawai: string; Jumlah_Uang: number }[];
        total: number;
      }
    > = {};

    snapshot.forEach((doc) => {
      const data = doc.data() as any;
      if (tahunData && data.Tahun_Data !== tahunData) return;
      if (bulan && data.Bulan_Kegiatan !== bulan) return;

      const kodeKegiatan = data.Kode_Kegiatan || 'unknown';
      const kategoriDL = data.Kategori_DL || 'Pendek';
      const groupKey = `${kodeKegiatan}_${kategoriDL}`;
      const padaTanggal = toIsoString(data.Pada_tanggal);

      if (!groups[groupKey]) {
        groups[groupKey] = {
          Berangkat_dari: data.Berangkat_dari || '',
          Tujuan: data.Tujuan || '',
          Pada_tanggal: padaTanggal,
          Kode_Kegiatan: kodeKegiatan,
          entries: [],
          total: 0,
        };
      }

      groups[groupKey].entries.push({
        Nama_Pegawai: data.Nama_Pegawai || '',
        Jumlah_Uang: Number(data.Jumlah_Uang || 0),
      });
      groups[groupKey].total += Number(data.Jumlah_Uang || 0);
    });

    const result: RekapModel3Item[] = Object.values(groups).map((group) => ({
      Berangkat_dari: group.Berangkat_dari,
      Tujuan: group.Tujuan,
      Pada_tanggal: group.Pada_tanggal,
      Kode_Kegiatan: group.Kode_Kegiatan,
      entries: group.entries,
      total: group.total,
    }));

    console.log('[Rekap/GET] success, group count:', result.length);
    res.json(result);
  } catch (error: any) {
    console.error('[Rekap/GET] ERROR:', error.message, error.code);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

export default router;
