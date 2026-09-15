import docxTemplates from 'docx-templates';
import fs from 'fs';
import path from 'path';

const templatePath = path.join(process.cwd(), 'public/templates/kwitansi.docx');
const template = fs.readFileSync(templatePath);

// Include ALL fields that the template has (from the grep output)
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
  // Template has these but frontend doesn't provide:
  NIP_Bendahara: '3333333333',
  NIP_PPK: '2222222222',
  Nama_Bendahara: 'Bendahara Test',
  Nama_PPK: 'PPK Test',
  Nama_Petugas_Huruf_Besar: 'TEST USER',
  No_Bukti: 'BUKTI-001',
  Nomor_DIPA: '018.03.3.059106/2026',
  // Frontend provides these but template doesn't have:
  KPA_Nama: 'KPA Test',
  KPA_NIP: '1111111111',
  KPA_Jabatan: 'Kepala Pusat',
  PPK_Jabatan: 'Pejabat Pembuat Komitmen',
  Bendahara_NIP: '3333333333',
};

try {
  const report = await docxTemplates.createReport({
    template,
    data: testData,
    cmdDelimiter: ['{', '}'],
  });
  fs.writeFileSync('/tmp/test_output.docx', Buffer.from(report));
  console.log('SUCCESS: Template works!');
} catch (error) {
  console.log('ERROR:', error.message);
}
