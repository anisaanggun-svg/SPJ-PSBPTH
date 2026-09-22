import { createReport } from 'docx-templates';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { resolve } from 'path';

// Replicate the exact data structure from documentService.ts generateRincianBiaya
// Using dummy data similar to what the app would send

const templatePath = resolve('/Users/macintoshhd/.gemini/antigravity/scratch/PSBTPH-SPPF/public/templates/rincian_biaya_perjalanan_dinas.docx');
const template = readFileSync(templatePath);

console.log('=== TEMPLATE FILE INFO ===');
console.log('Path:', templatePath);
console.log('Size:', template.byteLength, 'bytes');
console.log('Modified:', new Date(statSync(templatePath).mtime).toISOString());

// Replicate the items array structure from RincianBiayaGenerationModal
// The modal creates items with fields: no, uraian, jumlah, keterangan
const items = [
  {
    no: 1,
    uraian: 'Biaya Perjalanan Dinas',
    jumlah: 500000,
    keterangan: '',
  },
];

console.log('\n=== ITEMS ARRAY STRUCTURE (PERSIS seperti dikirim ke createReport) ===');
console.log('Type:', Array.isArray(items) ? 'Array' : typeof items);
console.log('Length:', items.length);
console.log('JSON:', JSON.stringify(items, null, 2));
console.log('\nField names per item:');
items.forEach((item, i) => {
  console.log(`  Item ${i}:`, Object.keys(item).map(k => `${k} (${typeof item[k]})`));
});

// Replicate the full templateData from generateRincianBiaya
const templateData = {
  No_Urut_SPPD: 123,
  Pada_tanggal: '1 Juli 2026',
  Tempat_tanggal: 'Surabaya, 1 Juli 2026',
  Jumlah_Total: 500000,
  Jumlah_Terbilang: 'lima ratus ribu rupiah',
  Nama_Pegawai: 'Test Pegawai',
  NIP_Pegawai: '1234567890',
  PPK_Nama: 'Test PPK',
  PPK_NIP: '1234567890',
  Bendahara_Nama: 'Test Bendahara',
  Bendahara_NIP: '1234567890',
  Ditetapkan_Sejumlah: 500000,
  Yang_Telah_Dibayar_Semula: 0,
  Sisa_Telah_Dibayar_Semula: 0,
  Sisa_Kurang_Lebih: 500000,
  items,
};

console.log('\n=== FULL TEMPLATE DATA ===');
console.log('Data keys:', Object.keys(templateData));
console.log('items field names:', Object.keys(items[0]));

// Call createReport with the same parameters as the app
console.log('\n=== GENERATING DOCUMENT ===');
console.log('cmdDelimiter: [+++, +++]');

try {
  const report = await createReport({
    template: new Uint8Array(template),
    data: templateData,
    cmdDelimiter: ['+++', '+++'],
    noSandbox: true,
  });

  const outputPath = resolve('/Users/macintoshhd/.gemini/antigravity/scratch/PSBTPH-SPPF/server/test_rincian_biaya_output.docx');
  writeFileSync(outputPath, Buffer.from(report));
  console.log('Document generated successfully!');
  console.log('Output size:', Buffer.from(report).byteLength, 'bytes');
  console.log('Output saved to:', outputPath);
} catch (error) {
  console.error('Error generating document:', error);
  console.error('Error message:', error instanceof Error ? error.message : String(error));
  console.error('Error stack:', error instanceof Error ? error.stack : 'no stack');
}
