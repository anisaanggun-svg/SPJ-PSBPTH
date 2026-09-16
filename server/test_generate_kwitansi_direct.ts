import { generateKwitansi } from './src/lib/generateKwitansi';
import type { DataPrimer, MasterPejabat } from '../src/types';

// Mock data for testing - using 'as any' to bypass strict Timestamp typing
const mockDataPrimer = {
  id: 'test-id',
  No: 1,
  Tahun_Data: 2026,
  Wilayah_Kerja: 1,
  Berangkat_dari: 'Malang',
  Tujuan: 'Nganjuk',
  Pada_tanggal: new Date('2026-01-15'),
  Jabatan_Produsen: 'Kepala UPT',
  Nama_Produsen: 'Ahmad Hidayat',
  NIP_Produsen: '19680810 199001 1 003',
  Nomor_SPT: 'SPT/2026/009',
  No_Urut_SPPD: 9,
  Bulan_Kegiatan: 'III',
  Tahun_Kegiatan: 'Perj./2026',
  Nama_Pegawai: 'Dedy Kristiyawan, S.P.',
  Tingkat_Menurut_Peraturan: 'E',
  NIP_Pegawai: '19751203 200901 1 003',
  Pangkat_dan_Golongan: 'III',
  Jabatan_Pegawai: 'Pengawas',
  Maksud_Perjalanan_Dinas: 'Kegiatan Sertifikasi di wilayah kerja 1',
  Tanggal_Berangkat: new Date('2026-01-15'),
  Tanggal_Kembali: new Date('2026-01-20'),
  Kode_Kegiatan: '4579.PDC.002.051.A',
  Kategori_DL: 'Panjang',
  Jumlah_Uang: 5493479,
  Terbilang: '5493479 Rupiah',
  Kegiatan: 'Sertifikasi',
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as DataPrimer;

const mockPPK: MasterPejabat = {
  id: 'ppk-id',
  role: 'ppk',
  nama: 'Muhammad Suhelmi Faruq, S.P.',
  nip: '19740601 199903 1 015',
  jabatan_lengkap: 'Pejabat Pembuat Komitmen',
  wilayah_kerja: 1,
  aktif: true,
};

const mockBendahara: MasterPejabat = {
  id: 'bendahara-id',
  role: 'bendahara',
  nama: 'NURUL WULANDARI, S.E.',
  nip: '19851029 201101 2 011',
  jabatan_lengkap: 'Bendahara Pengeluaran',
  wilayah_kerja: 1,
  aktif: true,
};

async function test() {
  console.log('Testing generateKwitansi directly...');
  try {
    const buffer = await generateKwitansi(
      mockDataPrimer,
      mockPPK,
      mockBendahara,
      'TEST-BUKTI-001',
      '018.03.3.059106/2026'
    );
    console.log('SUCCESS: Kwitansi generated!');
    console.log('Buffer size:', buffer.length);
    
    // Save to file for inspection
    const fs = require('fs');
    fs.writeFileSync('/tmp/test-kwitansi.docx', buffer);
    console.log('Saved to /tmp/test-kwitansi.docx');
  } catch (error: any) {
    console.error('ERROR:', error.message);
    console.error(error.stack);
  }
}

test();