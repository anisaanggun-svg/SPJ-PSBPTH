import fs from 'fs';
import path from 'path';
import createReport from 'docx-templates';
import type { DataPrimer, MasterPejabat } from '../../../src/types';

// Fungsi bantu: ubah angka jadi terbilang Bahasa Indonesia
function angkaKeTerbilang(angka: number): string {
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
  const belasan = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];

  function konversi(n: number): string {
    if (n < 10) return satuan[n];
    if (n < 20) return belasan[n - 10];
    if (n < 100) {
      const puluh = Math.floor(n / 10);
      const sisa = n % 10;
      return (puluh === 1 ? 'Sepuluh' : satuan[puluh] + ' Puluh') + (sisa ? ' ' + satuan[sisa] : '');
    }
    if (n < 1000) {
      const ratus = Math.floor(n / 100);
      const sisa = n % 100;
      return (ratus === 1 ? 'Seratus' : satuan[ratus] + ' Ratus') + (sisa ? ' ' + konversi(sisa) : '');
    }
    if (n < 1000000) {
      const ribu = Math.floor(n / 1000);
      const sisa = n % 1000;
      return (ribu === 1 ? 'Seribu' : konversi(ribu) + ' Ribu') + (sisa ? ' ' + konversi(sisa) : '');
    }
    const juta = Math.floor(n / 1000000);
    const sisa = n % 1000000;
    return konversi(juta) + ' Juta' + (sisa ? ' ' + konversi(sisa) : '');
  }

  return konversi(Math.floor(angka)).trim();
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Format Date/Timestamp jadi "30 Juli 2026"
function formatTanggalIndo(value: any): string {
  let date: Date;
  if (typeof value?.toDate === 'function') {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(value);
  }
  return `${date.getDate()} ${NAMA_BULAN[date.getMonth()]} ${date.getFullYear()}`;
}

export async function generateKwitansi(
  dataPrimer: DataPrimer,
  ppk: MasterPejabat,
  bendahara: MasterPejabat,
  noBukti: string,
  nomorDIPA: string
): Promise<Buffer> {
  const templatePath = path.join(__dirname, '../templates/kwitansi.docx');
  console.log('[KWITANSI] template path:', templatePath);
  
  if (!fs.existsSync(templatePath)) {
    console.error('[KWITANSI] ERROR: Template file not found at:', templatePath);
    throw new Error(`Template kwitansi tidak ditemukan: ${templatePath}`);
  }
  console.log('[KWITANSI] template exists: true');
  
  const template = fs.readFileSync(templatePath);
  console.log('[KWITANSI] template loaded, size:', template.length);

  const report = await createReport({
    template,
    cmdDelimiter: ['+++', '+++'],
    data: {
      Tahun_Kegiatan: dataPrimer.Tahun_Kegiatan,
      No_Bukti: noBukti,
      Kode_Kegiatan: dataPrimer.Kode_Kegiatan,
      Nomor_DIPA: nomorDIPA,
      Jumlah_Uang: dataPrimer.Jumlah_Uang.toLocaleString('id-ID'),
      Terbilang: dataPrimer.Terbilang || (angkaKeTerbilang(dataPrimer.Jumlah_Uang) + ' Rupiah'),
      Nomor_SPT: dataPrimer.Nomor_SPT,
      No_Urut_SPPD: dataPrimer.No_Urut_SPPD,
      Bulan_Kegiatan: dataPrimer.Bulan_Kegiatan,
      Pada_tanggal: formatTanggalIndo(dataPrimer.Pada_tanggal),
      Nama_Petugas_Huruf_Besar: dataPrimer.Nama_Pegawai.toUpperCase(),
      NIP_Pegawai: dataPrimer.NIP_Pegawai,
      Nama_PPK: ppk.nama.toUpperCase(),
      NIP_PPK: ppk.nip,
      Nama_Bendahara: bendahara.nama.toUpperCase(),
      NIP_Bendahara: bendahara.nip,
    },
  });

  console.log('[KWITANSI] report generated, size:', (report as any).length);
  return Buffer.from(report);
}
