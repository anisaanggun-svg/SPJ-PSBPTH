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

// Fix: Inside FOR loop, variables must be prefixed with $
// p.Nama -> $p.Nama
// p.Tanggal_Lahir -> $p.Tanggal_Lahir
// p.Hubungan_Keluarga -> $p.Hubungan_Keluarga
const replacements = [
  { from: 'p.Nama', to: '$p.Nama' },
  { from: 'p.Tanggal_Lahir', to: '$p.Tanggal_Lahir' },
  { from: 'p.Hubungan_Keluarga', to: '$p.Hubungan_Keluarga' },
];

let docXmlFixed = docXml;
for (const { from, to } of replacements) {
  const pattern = new RegExp(`\\+\\+\\+${from}\\+\\+\\+`, 'g');
  const count = (docXmlFixed.match(pattern) || []).length;
  docXmlFixed = docXmlFixed.replace(pattern, `+++${to}+++`);
  if (count > 0) {
    console.log(`Fixed: ${from} -> ${to} (${count} occurrence(s))`);
  }
}

// Verify no unconverted references remain (excluding END-FOR and FOR commands)
const unconverted = docXmlFixed.match(/\+\+\+p\.(Nama|Tanggal_Lahir|Hubungan_Keluarga)\+\+\+/g);
if (unconverted) {
  console.error('ERROR: Still has unconverted references:', unconverted);
  process.exit(1);
} else {
  console.log('All FOR loop variables converted to $prefix - OK');
}

// Write the modified XML back
zip.file('word/document.xml', docXmlFixed);
const outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });
fs.writeFileSync(outputPath, outputBuffer);
console.log('SPPD_final.docx fixed successfully!');
