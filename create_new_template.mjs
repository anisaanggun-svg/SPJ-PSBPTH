import docxTemplates from 'docx-templates';
import fs from 'fs';
import path from 'path';

// Create a new template with frontend's expected fields
const templateContent = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>KWITANSI</w:t></w:r></w:p>
    <w:p><w:r><w:t>Tahun Kegiatan: {Tahun_Kegiatan}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Kode Kegiatan: {Kode_Kegiatan}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Jumlah Uang: {Jumlah_Uang}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Terbilang: {Terbilang}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Nomor SPT: {Nomor_SPT}</w:t></w:r></w:p>
    <w:p><w:r><w:t>No Urut SPPD: {No_Urut_SPPD}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Bulan Kegiatan: {Bulan_Kegiatan}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Pada Tanggal: {Pada_tanggal}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Nama Pegawai: {Nama_Pegawai}</w:t></w:r></w:p>
    <w:p><w:r><w:t>NIP Pegawai: {NIP_Pegawai}</w:t></w:r></w:p>
    <w:p><w:r><w:t>KPA Nama: {KPA_Nama}</w:t></w:r></w:p>
    <w:p><w:r><w:t>KPA NIP: {KPA_NIP}</w:t></w:r></w:p>
    <w:p><w:r><w:t>KPA Jabatan: {KPA_Jabatan}</w:t></w:r></w:p>
    <w:p><w:r><w:t>PPK Nama: {PPK_Nama}</w:t></w:r></w:p>
    <w:p><w:r><w:t>PPK NIP: {PPK_NIP}</w:t></w:r></w:p>
    <w:p><w:r><w:t>PPK Jabatan: {PPK_Jabatan}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Bendahara Nama: {Bendahara_Nama}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Bendahara NIP: {Bendahara_NIP}</w:t></w:r></w:p>
  </w:body>
</w:document>
`;

// We need to create a proper docx file. Let's use the existing template as base
// and replace the document.xml with our new content

const JSZip = await import('jszip');
const zip = new JSZip.default();

// Read existing template to get structure
const templatePath = path.join(process.cwd(), 'public/templates/kwitansi.docx');
const templateBuffer = fs.readFileSync(templatePath);
const existingZip = await JSZip.default.loadAsync(templateBuffer);

// Replace document.xml
existingZip.file('word/document.xml', templateContent);

// Generate new docx
const newDocx = await existingZip.generateAsync({ type: 'nodebuffer' });
fs.writeFileSync(path.join(process.cwd(), 'public/templates/kwitansi_new.docx'), newDocx);
console.log('New template created!');
