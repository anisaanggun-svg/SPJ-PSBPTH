import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { DataPrimer } from '../types';
import { KODE_KOMODITAS, KATEGORI_DL, NAMA_PEGAWAI, KEGIATAN, BULAN_ROMAWI } from '../constants/masterData';

const SAMPLE_PRODUSEN = [
  { nama: 'Budi Santoso', jabatan: 'Kepala Seksi', nip: '19650101 198501 1 001' },
  { nama: 'Siti Aminah', jabatan: 'Kepala Bidang', nip: '19700215 199203 2 002' },
  { nama: 'Ahmad Hidayat', jabatan: 'Kepala UPT', nip: '19680810 199001 1 003' },
];

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Removed formatDate function as it's unused

async function getExistingCount(wilayahKerja: number, tahun: number): Promise<number> {
  const { getDocs, query, collection, where } = await import('firebase/firestore');
  const q = query(
    collection(db, 'Data_Primer'),
    where('Wilayah_Kerja', '==', wilayahKerja),
    where('Tahun_Data', '==', tahun),
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function seedDataPrimer(wilayahKerja: number = 1, count: number = 10): Promise<void> {
  if (!import.meta.env.DEV) {
    console.log('[Seed] Skipping data primer seed - not in development mode');
    return;
  }

  console.log(`[Seed] Starting data primer seed for wilayah kerja ${wilayahKerja} with ${count} records...`);

  const tahunData = new Date().getFullYear();
  const startDate = new Date(tahunData, 0, 1);
  const endDate = new Date(tahunData, 11, 31);

  try {
    // Check if data already exists for this wilayah kerja + tahun to avoid duplicates
    const existing = await getExistingCount(wilayahKerja, tahunData);
    if (existing > 0) {
      console.log(`[Seed] Found ${existing} existing data primer records for wilayah ${wilayahKerja}, skipping seed`);
      return;
    }

    for (let i = 0; i < count; i++) {
      const pegawai = randomItem(NAMA_PEGAWAI);
      const produsen = randomItem(SAMPLE_PRODUSEN);
      const komoditas = randomItem(KODE_KOMODITAS);
      const kategori = randomItem(KATEGORI_DL);
      const kegiatan = randomItem([...KEGIATAN] as const);
      const bulan = Math.floor(Math.random() * 12) + 1;
      const tanggalKegiatan = randomDate(startDate, endDate);
      const tanggalBerangkat = randomDate(tanggalKegiatan, new Date(tanggalKegiatan.getTime() + 7 * 24 * 60 * 60 * 1000));
      const tanggalKembali = new Date(tanggalBerangkat.getTime() + (Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000);

      const jumlahUang = Math.floor(Math.random() * 5000000) + 500000;

      const dataPrimer: Omit<DataPrimer, 'id' | 'createdAt' | 'updatedAt'> = {
        No: i + 1,
        Tahun_Data: tahunData,
        Wilayah_Kerja: wilayahKerja,
        Berangkat_dari: 'Malang',
        Tujuan: randomItem(['Kediri', 'Blitar', 'Tulungagung', 'Trenggalek', 'Nganjuk', 'Madiun']),
        Pada_tanggal: tanggalKegiatan,
        Jabatan_Produsen: produsen.jabatan,
        Nama_Produsen: produsen.nama,
        NIP_Produsen: produsen.nip,
        Nomor_SPT: `SPT/${tahunData}/${String(i + 1).padStart(3, '0')}`,
        No_Urut_SPPD: i + 1,
        Bulan_Kegiatan: BULAN_ROMAWI[bulan],
        Tahun_Kegiatan: `Perj./${tahunData}`,
        Nama_Pegawai: pegawai.nama,
        Tingkat_Menurut_Peraturan: randomItem(['A', 'B', 'C', 'D', 'E']),
        NIP_Pegawai: pegawai.nip,
        Pangkat_dan_Golongan: pegawai.golongan,
        Jabatan_Pegawai: 'Pengawas',
        Maksud_Perjalanan_Dinas: `Kegiatan ${kegiatan} di wilayah kerja ${wilayahKerja}`,
        Tanggal_Berangkat: tanggalBerangkat,
        Tanggal_Kembali: tanggalKembali,
        Kode_Kegiatan: komoditas.kode,
        Kategori_DL: kategori.label as 'Pendek' | 'Panjang',
        Jumlah_Uang: jumlahUang,
        Terbilang: `${jumlahUang} Rupiah`,
        Kegiatan: kegiatan,
      };

      await addDoc(collection(db, 'Data_Primer'), {
        ...dataPrimer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`[Seed] Created data primer ${i + 1}/${count}: ${pegawai.nama} - ${komoditas.label}`);
    }

    console.log('[Seed] Data primer seed completed successfully');
  } catch (error) {
    console.error('[Seed] Error seeding data primer:', error);
  }
}
