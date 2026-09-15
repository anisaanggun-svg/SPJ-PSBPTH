import docxTemplates from 'docx-templates';
import fs from 'fs';
import path from 'path';

const templatePath = path.join(process.cwd(), 'public/templates/kwitansi.docx');
const template = fs.readFileSync(templatePath);

// Extract the XML content to see placeholders
const JSZip = await import('jszip');
const zip = await JSZip.default.loadAsync(template);
const docXml = await zip.file('word/document.xml')?.async('text');
console.log(docXml);
