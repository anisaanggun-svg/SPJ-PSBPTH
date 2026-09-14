import { createReport } from 'docx-templates';
import { saveAs } from 'file-saver';
import type { DataPrimer, MasterPejabat, RekapModel3Item } from '../types';
import { formatTanggalIndonesia, hitungLamaPerjalanan } from '../utils/dateHelpers';
import { formatRupiahManual } from '../utils/formatCurrency';
import { getPejabatByRole } from './masterPejabatService';

async function fetchTemplate(templateName: string): Promise<ArrayBuffer> {
  const response = await fetch(`/templates/${templateName}`);
  if (!response.ok) {
    throw new Error(`Template '${templateName}' not found. Please ensure the template file exists in public/templates/.`);
  }
  return response.arrayBuffer();
}

async function generateAndDownload(
  templateName: string,
  data: Record<string, unknown>,
  outputFilename: string,
): Promise<void> {
  const template = await fetchTemplate(templateName);
  const report = await createReport({
    template: new Uint8Array(template),
    data,
    cmdDelimiter: ['{', '}'],
  });
  const blob = new Blob([report as any], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  saveAs(blob, outputFilename);
}

export async function generateKwitansi(
  data: DataPrimer,
  pejabatList: MasterPejabat[],
): Promise<void> {
  const kpa = getPejabatByRole(pejabatList, 'kpa');
  const ppk = getPejabatByRole(pejabatList, 'ppk');
  const bendahara = getPejabatByRole(pejabatList, 'bendahara');

  const templateData = {
    Tahun_Kegiatan: data.Tahun_Kegiatan,
    Kode_Kegiatan: data.Kode_Kegiatan,
    Jumlah_Uang: formatRupiahManual(data.Jumlah_Uang),
    Terbilang: data.Terbilang,
    Nomor_SPT: data.Nomor_SPT,
    No_Urut_SPPD: data.No_Urut_SPPD,
    Bulan_Kegiatan: data.Bulan_Kegiatan,
    Pada_tanggal: formatTanggalIndonesia(data.Pada_tanggal),
    Nama_Pegawai: data.Nama_Pegawai,
    NIP_Pegawai: data.NIP_Pegawai,
    KPA_Nama: kpa?.nama || '',
    KPA_NIP: kpa?.nip || '',
    KPA_Jabatan: kpa?.jabatan_lengkap || '',
    PPK_Nama: ppk?.nama || '',
    PPK_NIP: ppk?.nip || '',
    PPK_Jabatan: ppk?.jabatan_lengkap || '',
    Bendahara_Nama: bendahara?.nama || '',
    Bendahara_NIP: bendahara?.nip || '',
  };

  await generateAndDownload('kwitansi.docx', templateData, `Kwitansi_${data.Nama_Pegawai}_${data.No_Urut_SPPD}.docx`);
}

export async function generateRincianBiaya(
  data: DataPrimer,
  pejabatList: MasterPejabat[],
): Promise<void> {
  const ppk = getPejabatByRole(pejabatList, 'ppk');
  const bendahara = getPejabatByRole(pejabatList, 'bendahara');

  const templateData = {
    No_Urut_SPPD: data.No_Urut_SPPD,
    Bulan_Kegiatan: data.Bulan_Kegiatan,
    Tahun_Kegiatan: data.Tahun_Kegiatan,
    Pada_tanggal: formatTanggalIndonesia(data.Pada_tanggal),
    Jumlah_Uang: formatRupiahManual(data.Jumlah_Uang),
    Terbilang: data.Terbilang,
    Nama_Pegawai: data.Nama_Pegawai,
    NIP_Pegawai: data.NIP_Pegawai,
    PPK_Nama: ppk?.nama || '',
    PPK_NIP: ppk?.nip || '',
    PPK_Jabatan: ppk?.jabatan_lengkap || '',
    Bendahara_Nama: bendahara?.nama || '',
    Bendahara_NIP: bendahara?.nip || '',
  };

  await generateAndDownload('rincian_biaya.docx', templateData, `Rincian_Biaya_${data.Nama_Pegawai}_${data.No_Urut_SPPD}.docx`);
}

export async function generateDaftarPengeluaranRiil(
  data: DataPrimer,
  pejabatList: MasterPejabat[],
): Promise<void> {
  const ppk = getPejabatByRole(pejabatList, 'ppk');

  const templateData = {
    Nama_Pegawai: data.Nama_Pegawai,
    NIP_Pegawai: data.NIP_Pegawai,
    Jabatan_Pegawai: data.Jabatan_Pegawai,
    Pada_tanggal: formatTanggalIndonesia(data.Pada_tanggal),
    No_Urut_SPPD: data.No_Urut_SPPD,
    Bulan_Kegiatan: data.Bulan_Kegiatan,
    Tahun_Kegiatan: data.Tahun_Kegiatan,
    Jumlah_Uang: formatRupiahManual(data.Jumlah_Uang),
    PPK_Nama: ppk?.nama || '',
    PPK_NIP: ppk?.nip || '',
    PPK_Jabatan: ppk?.jabatan_lengkap || '',
  };

  await generateAndDownload('daftar_pengeluaran_riil.docx', templateData, `Daftar_Pengeluaran_Riil_${data.Nama_Pegawai}_${data.No_Urut_SPPD}.docx`);
}

export async function generateSPPD(
  data: DataPrimer,
  pejabatList: MasterPejabat[],
): Promise<void> {
  const kpa = getPejabatByRole(pejabatList, 'kpa');
  const ppk = getPejabatByRole(pejabatList, 'ppk');

  const lamaPerjalanan = hitungLamaPerjalanan(data.Tanggal_Berangkat, data.Tanggal_Kembali);

  const templateData = {
    No_Urut_SPPD: data.No_Urut_SPPD,
    Bulan_Kegiatan: data.Bulan_Kegiatan,
    Tahun_Kegiatan: data.Tahun_Kegiatan,
    Nama_Pegawai: data.Nama_Pegawai,
    NIP_Pegawai: data.NIP_Pegawai,
    Pangkat_dan_Golongan: data.Pangkat_dan_Golongan,
    Jabatan_Pegawai: data.Jabatan_Pegawai,
    Tingkat_Menurut_Peraturan: data.Tingkat_Menurut_Peraturan,
    Maksud_Perjalanan_Dinas: data.Maksud_Perjalanan_Dinas,
    Berangkat_dari: data.Berangkat_dari,
    Tujuan: data.Tujuan,
    Tanggal_Berangkat: formatTanggalIndonesia(data.Tanggal_Berangkat),
    Tanggal_Kembali: formatTanggalIndonesia(data.Tanggal_Kembali),
    Pada_tanggal: formatTanggalIndonesia(data.Pada_tanggal),
    Alat_Angkutan: 'Kendaraan dinas',
    Lamanya_Perjalanan: `${lamaPerjalanan} hari`,
    Nama_Produsen: data.Nama_Produsen,
    Jabatan_Produsen: data.Jabatan_Produsen,
    NIP_Produsen: data.NIP_Produsen || '-',
    KPA_Nama: kpa?.nama || '',
    KPA_NIP: kpa?.nip || '',
    KPA_Jabatan: kpa?.jabatan_lengkap || '',
    PPK_Nama: ppk?.nama || '',
    PPK_NIP: ppk?.nip || '',
    PPK_Jabatan: ppk?.jabatan_lengkap || '',
  };

  await generateAndDownload('sppd.docx', templateData, `SPPD_${data.Nama_Pegawai}_${data.No_Urut_SPPD}.docx`);
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
