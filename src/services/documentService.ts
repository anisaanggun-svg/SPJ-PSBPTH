import { createReport } from 'docx-templates';
import { saveAs } from 'file-saver';
import type { DataPrimer, MasterPejabat, RekapModel3Item } from '../types';
import { formatTanggalIndonesia, hitungLamaPerjalanan } from '../utils/dateHelpers';
import { formatRupiahManual } from '../utils/formatCurrency';
import { terbilang } from '../utils/terbilang';
import { getPejabatByRole } from './masterPejabatService';

export interface RincianBiayaItem {
  no: number;
  uraian: string;
  jumlah: number;
  keterangan: string;
}

export interface RincianBiayaGenerationOptions {
  items?: RincianBiayaItem[];
  yangTelahDibayarSemula?: number;
  sisaTelahDibayarSemula?: number;
}

async function fetchTemplate(templateName: string): Promise<ArrayBuffer> {
  // Cache-busting: append a timestamp query param so the browser never serves
  // a stale cached version of the template during development. Templates are
  // frequently updated, so we force a fresh fetch every time.
  const url = `/templates/${templateName}?t=${Date.now()}`;
  console.log('[documentService] Fetching template:', url);
  const response = await fetch(url, {
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  console.log('[documentService] Template response:', response.status, response.statusText);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('[documentService] Template fetch failed:', response.status, text);
    throw new Error(`Template '${templateName}' not found (HTTP ${response.status}). Please ensure the template file exists in public/templates/.`);
  }
  return response.arrayBuffer();
}

async function generateAndDownload(
  templateName: string,
  data: Record<string, unknown>,
  outputFilename: string,
  cmdDelimiter: [string, string] = ['{', '}'],
): Promise<void> {
  console.log('[documentService] Generating document:', templateName, 'with data keys:', Object.keys(data));
  const template = await fetchTemplate(templateName);
  console.log('[documentService] Template fetched, size:', template.byteLength);
  console.log('[documentService] cmdDelimiter:', cmdDelimiter);
  console.log('[documentService] Calling createReport...');
  try {
    const report = await createReport({
      template: new Uint8Array(template),
      data,
      cmdDelimiter,
      noSandbox: true, // Required for browser compatibility (vm module not available)
    });
    console.log('[documentService] createReport returned, report size:', (report as any).byteLength);
    const blob = new Blob([report as any], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    console.log('[documentService] Blob created, size:', blob.size);
    saveAs(blob, outputFilename);
    console.log('[documentService] Document saved:', outputFilename);
  } catch (error) {
    console.error('[documentService] Error generating document:', error);
    console.error('[documentService] Error details:', error instanceof Error ? error.message : String(error));
    console.error('[documentService] Error stack:', error instanceof Error ? error.stack : 'no stack');
    throw error;
  }
}

export async function generateRincianBiaya(
  data: DataPrimer,
  pejabatList: MasterPejabat[],
  options: RincianBiayaGenerationOptions = {},
): Promise<void> {
  console.log('[documentService] generateRincianBiaya START', { dataId: data.id, nama: data.Nama_Pegawai });

  const ppk = getPejabatByRole(pejabatList, 'ppk');
  const bendahara = getPejabatByRole(pejabatList, 'bendahara');
  const items = options.items && options.items.length > 0
    ? options.items
    : [
        {
          no: 1,
          uraian: 'Biaya Perjalanan Dinas',
          jumlah: data.Jumlah_Uang || 0,
          keterangan: '',
        },
      ];
  const jumlahTotal = items.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  const yangTelahDibayarSemula = options.yangTelahDibayarSemula ?? 0;
  const sisaTelahDibayarSemula = options.sisaTelahDibayarSemula ?? 0;
  const sisaKurangLebih = jumlahTotal - (yangTelahDibayarSemula + sisaTelahDibayarSemula);

  const formatAngka = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const templateData = {
    No_Urut_SPPD: data.No_Urut_SPPD,
    Pada_tanggal: formatTanggalIndonesia(data.Pada_tanggal),
    Tempat_tanggal: `Surabaya, ${formatTanggalIndonesia(data.Pada_tanggal)}`,
    Jumlah_Total: formatAngka(jumlahTotal),
    Jumlah_Terbilang: terbilang(jumlahTotal),
    Nama_Pegawai: data.Nama_Pegawai,
    NIP_Pegawai: data.NIP_Pegawai,
    PPK_Nama: ppk?.nama || '',
    PPK_NIP: ppk?.nip || '',
    Bendahara_Nama: bendahara?.nama || '',
    Bendahara_NIP: bendahara?.nip || '',
    Ditetapkan_Sejumlah: formatAngka(jumlahTotal),
    Yang_Telah_Dibayar_Semula: formatAngka(yangTelahDibayarSemula),
    Sisa_Telah_Dibayar_Semula: formatAngka(sisaTelahDibayarSemula),
    Sisa_Kurang_Lebih: formatAngka(sisaKurangLebih),
    items: items.map(item => ({
      ...item,
      jumlah: formatAngka(item.jumlah || 0)
    })),
  };

  console.log('[documentService] generateRincianBiaya templateData:', JSON.stringify(templateData, null, 2));

  await generateAndDownload(
    'rincian_biaya_perjalanan_dinas.docx',
    templateData,
    `Rincian_Biaya_Perjalanan_Dinas_${data.Nama_Pegawai}_${data.No_Urut_SPPD}.docx`,
    ['+++', '+++'],
  );

  console.log('[documentService] generateRincianBiaya SUCCESS');
}

export async function generateDaftarPengeluaranRiil(
  data: DataPrimer,
  pejabatList: MasterPejabat[],
): Promise<void> {
  console.log('[documentService] generateDaftarPengeluaranRiil START', { dataId: data.id, nama: data.Nama_Pegawai });
  
  const ppk = getPejabatByRole(pejabatList, 'ppk');
  console.log('[documentService] PPK found:', ppk ? { nama: ppk.nama, nip: ppk.nip } : 'NOT FOUND');

  // Create items array for the FOR loop in template
  // For now, create a single item from the total amount
  // TODO: Update when form supports multiple rincian pengeluaran items
  const jumlahTotal = data.Jumlah_Uang || 0;
  const items = [
    {
      no: 1,
      uraian: 'Biaya Perjalanan Dinas',
      jumlah: formatRupiahManual(jumlahTotal),
    },
  ];

  // Tempat_tanggal: kota + tanggal tanda tangan (e.g., "Surabaya, 1 Juli 2026")
  const tempatTanggal = `Surabaya, ${formatTanggalIndonesia(data.Pada_tanggal)}`;

  const templateData = {
    Nama_Pegawai: data.Nama_Pegawai,
    NIP_Pegawai: data.NIP_Pegawai,
    Jabatan_Pegawai: data.Jabatan_Pegawai,
    Pada_tanggal: formatTanggalIndonesia(data.Pada_tanggal),
    No_Urut_SPPD: data.No_Urut_SPPD,
    Jumlah_Total: formatRupiahManual(jumlahTotal),
    Tempat_tanggal: tempatTanggal,
    PPK_Nama: ppk?.nama || '',
    PPK_NIP: ppk?.nip || '',
    items,
  };

  console.log('[documentService] generateDaftarPengeluaranRiil templateData:', JSON.stringify(templateData, null, 2));

  try {
    await generateAndDownload(
      'daftar_pengeluaran_riil.docx',
      templateData,
      `Daftar_Pengeluaran_Riil_${data.Nama_Pegawai}_${data.No_Urut_SPPD}.docx`,
      ['+++', '+++']
    );
    console.log('[documentService] generateDaftarPengeluaranRiil SUCCESS');
  } catch (error) {
    console.error('[documentService] generateDaftarPengeluaranRiil ERROR:', error);
    throw error;
  }
}

export interface PengikutItem {
  Nama: string;
  Tanggal_Lahir: string;
  Hubungan_Keluarga: string;
}

export interface SPPDGenerationOptions {
  Instansi?: string;
  Mata_Anggaran?: string;
  Keterangan_Lain?: string;
  Pengikut?: PengikutItem[];
}

export async function generateSPPD(
  data: DataPrimer,
  pejabatList: MasterPejabat[],
  options: SPPDGenerationOptions = {}
): Promise<void> {
  console.log('[documentService] generateSPPD START', { dataId: data.id, nama: data.Nama_Pegawai });

  const ppk = getPejabatByRole(pejabatList, 'ppk');
  console.log('[documentService] PPK found:', ppk ? { nama: ppk.nama, nip: ppk.nip } : 'NOT FOUND');

  const lamaPerjalanan = hitungLamaPerjalanan(data.Tanggal_Berangkat, data.Tanggal_Kembali);

  const templateData = {
    // Shared fields
    No_Urut_SPPD: data.No_Urut_SPPD,
    Pada_tanggal: formatTanggalIndonesia(data.Pada_tanggal),
    Tempat_tanggal: `Surabaya, ${formatTanggalIndonesia(data.Pada_tanggal)}`,
    Nama_Pegawai: data.Nama_Pegawai,
    NIP_Pegawai: data.NIP_Pegawai,
    Jabatan_Pegawai: data.Jabatan_Pegawai,
    PPK_Nama: ppk?.nama || '',
    PPK_NIP: ppk?.nip || '',

    // SPPD Depan specific fields
    Pangkat_Golongan: data.Pangkat_dan_Golongan,
    Tingkat_Perjalanan: data.Tingkat_Menurut_Peraturan,
    Maksud_Perjalanan: data.Maksud_Perjalanan_Dinas,
    Alat_Angkutan: 'Kendaraan dinas',
    Tempat_Berangkat: data.Berangkat_dari,
    Tempat_Tujuan: data.Tujuan,
    Lama_Perjalanan: `${lamaPerjalanan} hari`,
    Tanggal_Berangkat: formatTanggalIndonesia(data.Tanggal_Berangkat),
    Tanggal_Kembali: formatTanggalIndonesia(data.Tanggal_Kembali),
    Instansi: options.Instansi || '',
    Mata_Anggaran: options.Mata_Anggaran || '',
    Keterangan_Lain: options.Keterangan_Lain || '',
    Pengikut: options.Pengikut || [],
  };

  console.log('[documentService] generateSPPD templateData:', JSON.stringify(templateData, null, 2));

  try {
    await generateAndDownload(
      'SPPD_final.docx',
      templateData,
      `SPPD_${data.Nama_Pegawai}_${data.No_Urut_SPPD}.docx`,
      ['+++', '+++'],
    );
    console.log('[documentService] generateSPPD SUCCESS');
  } catch (error) {
    console.error('[documentService] generateSPPD ERROR:', error);
    throw error;
  }
}

export async function generateRekapModel3(
  rekapData: RekapModel3Item[],
  pejabatList: MasterPejabat[],
  bulanKegiatan: string,
  tahunKegiatan: string,
): Promise<void> {
  const bendahara = getPejabatByRole(pejabatList, 'bendahara');
  const pengkompulir = getPejabatByRole(pejabatList, 'pengkompulir');

  const grandTotal = rekapData.reduce((sum, item) => sum + item.total, 0);

  const templateData = {
    Bulan_Kegiatan: bulanKegiatan,
    Tahun_Kegiatan: tahunKegiatan,
    items: rekapData.map((item, idx) => ({
      no: idx + 1,
      Berangkat_dari: item.Berangkat_dari,
      Tujuan: item.Tujuan,
      Pada_tanggal: item.Pada_tanggal,
      Kode_Kegiatan: item.Kode_Kegiatan,
      entries: item.entries,
      total: formatRupiahManual(item.total),
    })),
    grand_total: formatRupiahManual(grandTotal),
    Bendahara_Nama: bendahara?.nama || '',
    Bendahara_NIP: bendahara?.nip || '',
    Pengkompulir_Nama: pengkompulir?.nama || '',
    Pengkompulir_NIP: pengkompulir?.nip || '',
  };

  await generateAndDownload('rekap_model3.docx', templateData, `Rekap_Model3_${bulanKegiatan}_${tahunKegiatan}.docx`);
}
