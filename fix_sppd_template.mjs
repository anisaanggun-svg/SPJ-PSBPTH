import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';

const templatePath = path.join(process.cwd(), 'public/templates/SPPD_final.docx');
const outputPath = path.join(process.cwd(), 'public/templates/SPPD_final.docx');

const template = fs.readFileSync(templatePath);

const zip = await JSZip.loadAsync(template);
const docXml = await zip.file('word/document.xml')?.async('text');

if (!docXml) {
  console.error('No document.xml found');
  process.exit(1);
}

// Fix 1: Split +++FOR p IN Pengikut++++++p.Nama+++ into two paragraphs
// Replace: <w:t>+++FOR p IN Pengikut++++++p.Nama+++</w:t>
// With:    <w:t>+++FOR p IN Pengikut+++</w:t></w:r><w:r><w:t>+++p.Nama+++</w:t>
const forNamaPattern = /<w:t>\+\+\+FOR p IN Pengikut\+\+\+\+\+\+p\.Nama\+\+\+<\/w:t>/g;
const forNamaReplacement = '<w:t>+++FOR p IN Pengikut+++</w:t></w:r><w:r><w:t>+++p.Nama+++</w:t>';
const docXmlFixed1 = docXml.replace(forNamaPattern, forNamaReplacement);

if (docXmlFixed1 === docXml) {
  console.log('WARNING: FOR p IN Pengikut + p.Nama pattern not found');
} else {
  console.log('Fixed: FOR p IN Pengikut + p.Nama');
}

// Fix 2: Split +++p.Hubungan_Keluarga++++++END-FOR p+++ into two paragraphs
// Replace: <w:t>+++p.Hubungan_Keluarga++++++END-FOR p+++</w:t>
// With:    <w:t>+++p.Hubungan_Keluarga+++</w:t></w:r><w:r><w:t>+++END-FOR p+++</w:t>
const hubunganEndForPattern = /<w:t>\+\+\+p\.Hubungan_Keluarga\+\+\+\+\+\+END-FOR p\+\+\+<\/w:t>/g;
const hubunganEndForReplacement = '<w:t>+++p.Hubungan_Keluarga+++</w:t></w:r><w:r><w:t>+++END-FOR p+++</w:t>';
const docXmlFixed2 = docXmlFixed1.replace(hubunganEndForPattern, hubunganEndForReplacement);

if (docXmlFixed2 === docXmlFixed1) {
  console.log('WARNING: p.Hubungan_Keluarga + END-FOR pattern not found');
} else {
  console.log('Fixed: p.Hubungan_Keluarga + END-FOR');
}

// Verify the fixes
const forCount = (docXmlFixed2.match(/FOR p IN Pengikut/g) || []).length;
const endForCount = (docXmlFixed2.match(/END-FOR p/g) || []).length;
const pNamaCount = (docXmlFixed2.match(/p\.Nama/g) || []).length;
const pHubunganCount = (docXmlFixed2.match(/p\.Hubungan_Keluarga/g) || []).length;

console.log(`\\nVerification:`);
console.log(`  FOR p IN Pengikut: ${forCount}`);
console.log(`  END-FOR p: ${endForCount}`);
console.log(`  p.Nama: ${pNamaCount}`);
console.log(`  p.Hubungan_Keluarga: ${pHubunganCount}`);

// Check no concatenated commands remain
const concatenated = docXmlFixed2.match(/\+\+\+FOR p IN Pengikut\+\+\+\+\+\+p\.Nama\+\+\+/g);
const concatenated2 = docXmlFixed2.match(/\+\+\+p\.Hubungan_Keluarga\+\+\+\+\+\+END-FOR p\+\+\+/g);
if (concatenated || concatenated2) {
  console.error('ERROR: Still has concatenated commands!');
  process.exit(1);
} else {
  console.log('No concatenated commands remaining - OK');
}

// Write the modified XML back to the zip
zip.file('word/document.xml', docXmlFixed2);

// Write the modified docx
const outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });
fs.writeFileSync(outputPath, outputBuffer);
console.log('\\nSPPD_final.docx fixed successfully!');
