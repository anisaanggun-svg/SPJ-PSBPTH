import { Timestamp } from 'firebase/firestore';

export interface DataPrimer {
  id?: string;
  No: number;
  Tahun_Data: number;
  Wilayah_Kerja: number;
  Berangkat_dari: string;
  Tujuan: string;
  Pada_tanggal: Timestamp | Date | string;
  Jabatan_Produsen: string;
  Nama_Produsen: string;
  NIP_Produsen: string | null;
  Nomor_SPT: string;
  No_Urut_SPPD: number;
  Bulan_Kegiatan: string;
  Tahun_Kegiatan: string;
  Nama_Pegawai: string;
  Tingkat_Menurut_Peraturan: string;
  NIP_Pegawai: string;
  Pangkat_dan_Golongan: string;
  Jabatan_Pegawai: string;
  Maksud_Perjalanan_Dinas: string;
  Tanggal_Berangkat: Timestamp | Date | string;
  Tanggal_Kembali: Timestamp | Date | string;
  Kode_Kegiatan: string;
  Kategori_DL: 'Pendek' | 'Panjang';
  Jumlah_Uang: number;
  Terbilang: string;
  Kegiatan: 'Sertifikasi' | 'Penilaian Produsen';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface MasterPejabat {
  id?: string;
  role: 'ppk' | 'admin' | 'operator' | 'kpa' | 'bendahara' | 'pengkompulir';
  nama: string;
  nip: string | null;
  jabatan_lengkap: string;
  wilayah_kerja: number;
  aktif: boolean;
}

export interface UserProfile {
  id?: string;
  uid: string;
  nama: string;
  email: string;
  role: 'admin' | 'staf';
  wilayah_kerja: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Timestamp;
}

export interface RekapModel3Item {
  Berangkat_dari: string;
  Tujuan: string;
  Pada_tanggal: string;
  Kode_Kegiatan: string;
  entries: {
    Nama_Pegawai: string;
    Jumlah_Uang: number;
  }[];
  total: number;
}

export interface KodKomoditas {
  label: string;
  kode: string;
}

export interface KategoriDL {
  label: string;
  kodeAkun: string;
}

export interface PegawaiOption {
  nama: string;
  nip: string;
  golongan: string;
  wilayah_kerja: number;
}
