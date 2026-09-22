const fs = require('fs');
const AdmZip = require('adm-zip');

const zip = new AdmZip('public/templates/rincian_biaya_perjalanan_dinas.docx');
let xml = zip.readAsText('word/document.xml');

const trRegex = /(<w:tr(?:[\s>][\s\S]*?)<\/w:tr>)/g;
let match;
let modifiedXml = xml;

while ((match = trRegex.exec(xml)) !== null) {
  const rowXml = match[0];
  if (rowXml.includes('+++FOR item IN items+++') && rowXml.includes('+++END-FOR item+++')) {
    
    // We create a FOR row by removing all text except FOR
    let forRow = rowXml.replace(/<w:t[^>]*>(.*?)<\/w:t>/g, (m, text) => {
      if (text.includes('+++FOR item IN items+++')) return m;
      return '<w:t></w:t>';
    });
    
    // We create a Data row by removing FOR and END-FOR
    let dataRow = rowXml.replace(/<w:t[^>]*>(.*?)<\/w:t>/g, (m, text) => {
      let newText = text.replace('+++FOR item IN items+++', '').replace('+++END-FOR item+++', '');
      return m.replace(text, newText);
    });
    
    // We create an END-FOR row by removing all text except END-FOR
    let endForRow = rowXml.replace(/<w:t[^>]*>(.*?)<\/w:t>/g, (m, text) => {
      if (text.includes('+++END-FOR item+++')) return m;
      return '<w:t></w:t>';
    });

    const newRows = forRow + dataRow + endForRow;
    modifiedXml = modifiedXml.replace(rowXml, newRows);
    break;
  }
}

zip.updateFile('word/document.xml', Buffer.from(modifiedXml, 'utf-8'));
zip.writeZip('public/templates/rincian_biaya_perjalanan_dinas.docx');
console.log('Template updated!');
