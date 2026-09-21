import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import fs from 'fs';

const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: { top: 720, right: 720, bottom: 720, left: 720 }
      }
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "DAFTAR PENGELUARAN RIIL", bold: true, size: 28 }),
        ],
      }),
      new Paragraph({ text: "" }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "PERJALANAN DINAS", bold: true, size: 24 }),
        ],
      }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "" }),
      
      // Table with data
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Row 1: Nama Pegawai
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Nama Pegawai", bold: true })] })],
              }),
              new TableCell({
                width: { size: 5, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: ":", bold: true })] })],
              }),
              new TableCell({
                width: { size: 65, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "{Nama_Pegawai}" })] })],
              }),
            ],
          }),
          // Row 2: NIP
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "NIP", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: ":", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "{NIP_Pegawai}" })] })],
              }),
            ],
          }),
          // Row 3: Jabatan
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Jabatan", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: ":", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "{Jabatan_Pegawai}" })] })],
              }),
            ],
          }),
          // Row 4: Tanggal
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Tanggal Perjalanan", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: ":", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "{Pada_tanggal}" })] })],
              }),
            ],
          }),
          // Row 5: No SPPD - separate placeholders
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "No. SPPD", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: ":", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "{No_Urut_SPPD}/{Bulan_Kegiatan}/{Tahun_Kegiatan}" })] })],
              }),
            ],
          }),
          // Row 6: Jumlah Uang
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Jumlah Uang", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: ":", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "{Jumlah_Uang}" })] })],
              }),
            ],
          }),
        ],
      }),
      
      new Paragraph({ text: "" }),
      new Paragraph({ text: "" }),
      
      // PPK Section
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Pejabat Pembuat Komitmen (PPK)", bold: true, size: 24 }),
        ],
      }),
      new Paragraph({ text: "" }),
      
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Nama", bold: true })] })],
              }),
              new TableCell({
                width: { size: 5, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: ":", bold: true })] })],
              }),
              new TableCell({
                width: { size: 65, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "{PPK_Nama}" })] })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "NIP", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: ":", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "{PPK_NIP}" })] })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Jabatan", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: ":", bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "{PPK_Jabatan}" })] })],
              }),
            ],
          }),
        ],
      }),
      
      new Paragraph({ text: "" }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "" }),
      
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "___________________________", bold: true }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "{PPK_Nama}", bold: true }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "NIP. {PPK_NIP}", bold: true }),
        ],
      }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync('public/templates/daftar_pengeluaran_riil.docx', buffer);
console.log('Template fixed successfully!');
