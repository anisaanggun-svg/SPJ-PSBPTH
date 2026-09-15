import docxTemplates from 'docx-templates';
import fs from 'fs';
import path from 'path';

const templatePath = path.join(process.cwd(), 'public/templates/kwitansi.docx');
const template = fs.readFileSync(templatePath);

// Simulate exact data from generateKwitansi for first seeded record
const testData = {
  Tahun_Kegiatan: '2026',
  Kode_Kegiatan: 'KGT-001',
  Jumlah_Uang: '2,500,000',
  Terbilang: 'Dua Juta Lima Ratus Ribu Rupiah',
  Nomor_SPT: 'SPT/2026/001',
  No_Urut_SPPD: 1,
  Bulan_Kegiatan: 'I',
  Pada_tanggal: '10 Januari 2026',
  Nama_Pegawai: 'Anisa anggun Fadelia',
  NIP_Pegawai: '199001012015032001',
  KPA_Nama: 'KPA Wilayah 2',
  KPA_NIP: '19700601 199903 1 014',
  KPA_Jabatan: 'Kepala Pusat Anggaran Wilayah 2',
  PPK_Nama: 'PPK Wilayah 2',
  PPK_NIP: '19750601 199903 1 016',
  PPK_Jabatan: 'Pejabat Pembuat Komitmen Wilayah 2',
  Bendahara_Nama: 'Bendahara Wilayah 2',
  Bendahara_NIP: '19810101 200501 1 002',
};

try {
  const report = await docxTemplates.createReport({
    template,
    data: testData,
    cmdDelimiter: ['{', '}'],
  });
  fs.writeFileSync('/tmp/test_kwitansi_full.docx', Buffer.from(report));
  console.log('SUCCESS: Full kwitansi generation works!');
  console.log('Output size:', report.byteLength, 'bytes');
} catch (error) {
  console.log('ERROR:', error.message);
  console.log('Stack:', error.stack);
}
