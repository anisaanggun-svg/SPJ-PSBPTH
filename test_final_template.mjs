import docxTemplates from 'docx-templates';
import fs from 'fs';
import path from 'path';

const templatePath = path.join(process.cwd(), 'public/templates/kwitansi.docx');
const template = fs.readFileSync(templatePath);

// Frontend provides these fields (from documentService.ts)
const testData = {
  Tahun_Kegiatan: '2026',
  Kode_Kegiatan: 'TEST-001',
  Jumlah_Uang: '5,000,000',
  Terbilang: 'Lima Juta Rupiah',
  Nomor_SPT: 'SPT/2026/001',
  No_Urut_SPPD: '1',
  Bulan_Kegiatan: 'I',
  Pada_tanggal: '15 Januari 2026',
  Nama_Pegawai: 'Test User',
  NIP_Pegawai: '1234567890',
  KPA_Nama: 'KPA Test',
  KPA_NIP: '1111111111',
  KPA_Jabatan: 'Kepala Pusat',
  PPK_Nama: 'PPK Test',
  PPK_NIP: '2222222222',
  PPK_Jabatan: 'Pejabat Pembuat Komitmen',
  Bendahara_Nama: 'Bendahara Test',
  Bendahara_NIP: '3333333333',
};

try {
  const report = await docxTemplates.createReport({
    template,
    data: testData,
    cmdDelimiter: ['{', '}'],
  });
  fs.writeFileSync('/tmp/test_final_output.docx', Buffer.from(report));
  console.log('SUCCESS: Final template works with frontend data!');
} catch (error) {
  console.log('ERROR:', error.message);
}
