import type { KodKomoditas, KategoriDL, PegawaiOption } from '../types';

export const KODE_KOMODITAS: KodKomoditas[] = [
  { label: 'Padi', kode: '4579.PDC.001.051.A' },
  { label: 'Jagung', kode: '4579.PDC.002.051.A' },
  { label: 'Kedelai', kode: '4579.PDC.003.051.A' },
  { label: 'Ubi Kayu', kode: '4579.PDC.004.051.A' },
  { label: 'Ubi Jalar', kode: '4579.PDC.004.052.A' },
  { label: 'Kacang Tanah', kode: '4579.PDC.005.051.A' },
];

export const KATEGORI_DL: KategoriDL[] = [
  { label: 'Pendek', kodeAkun: '524113' },
  { label: 'Panjang', kodeAkun: '524111' },
];

export const NAMA_PEGAWAI: PegawaiOption[] = [
  { nama: 'Prima S. Welli Candra, A.Md.', nip: '19780913 200501 1 001', golongan: 'III', wilayah_kerja: 1 },
  { nama: 'Shofiana Widiningtyas', nip: '19900226 201101 2 005', golongan: 'III', wilayah_kerja: 1 },
  { nama: 'Dedy Kristiyawan, S.P.', nip: '19751203 200901 1 003', golongan: 'III', wilayah_kerja: 1 },
  { nama: 'Tedy Irawan, S.TP.', nip: '19841202 201101 1 008', golongan: 'III', wilayah_kerja: 1 },
  { nama: 'Ary Danar Kisworo, S.P.', nip: '19911116 202012 1 008', golongan: 'III', wilayah_kerja: 1 },
  { nama: 'Nedya P. Bachtiar, S.P.', nip: '19911116 202012 1 008', golongan: 'III', wilayah_kerja: 1 },
  { nama: 'Nanang Budi Astanto', nip: '19911116 202012 1 008', golongan: 'III', wilayah_kerja: 1 },
  { nama: 'Budi Winarto', nip: '19911116 202012 1 008', golongan: 'III', wilayah_kerja: 1 },
  { nama: 'Avianita Agustianti, S.TP.', nip: '19720809 199903 2 007', golongan: 'III', wilayah_kerja: 1 },
];

export const KEGIATAN = ['Sertifikasi', 'Penilaian Produsen'] as const;

export const BULAN_ROMAWI: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
};

export const TINGKAT_PERJALANAN = ['A', 'B', 'C', 'D', 'E'] as const;
