/**
 * Konfigurasi Terpusat Wilayah Kerja UPT PSBTPH
 *
 * CATATAN PENTING:
 * - File ini adalah SUMBER DATA TUNGGAL (Single Source of Truth) untuk daftar wilayah kerja.
 * - Jika di masa depan jumlah wilayah kerja bertambah (misal jadi 20), cukup ubah array
 *   `WILAYAH_KERJA_LIST` di bawah ini. TIDAK PERLU mengubah kode di file lain
 *   (Login, Register, Admin Users, dll) karena mereka semua meng-import dari sini.
 * - Setiap entry memiliki: value (string untuk form), label (tampilan UI), dan namaLengkap (untuk display).
 */

export interface WilayahKerjaOption {
  value: string;
  label: string;
  namaLengkap: string;
}

/**
 * Daftar wilayah kerja UPT PSBTPH Jawa Timur.
 * Saat ini: 4 wilayah kerja (sesuai kondis aktual).
 * Untuk menambah wilayah kerja di masa depan, cukup tambahkan entry baru ke array ini.
 */
export const WILAYAH_KERJA_LIST: WilayahKerjaOption[] = [
  { value: '1', label: 'Wilayah Kerja I', namaLengkap: 'Wilayah Kerja I' },
  { value: '2', label: 'Wilayah Kerja II', namaLengkap: 'Wilayah Kerja II' },
  { value: '3', label: 'Wilayah Kerja III', namaLengkap: 'Wilayah Kerja III' },
  { value: '4', label: 'Wilayah Kerja IV', namaLengkap: 'Wilayah Kerja IV - Malang' },
];

/**
 * Jumlah total wilayah kerja (derived dari WILAYAH_KERJA_LIST.length).
 * Gunakan ini jika butuh angka total saja (misal untuk validasi).
 */
export const TOTAL_WILAYAH_KERJA = WILAYAH_KERJA_LIST.length;

/**
 * Helper: Dapatkan label/nama lengkap wilayah kerja berdasarkan value.
 * Return undefined jika tidak ditemukan.
 */
export function getWilayahKerjaLabel(value: string | number): string | undefined {
  const found = WILAYAH_KERJA_LIST.find((w) => w.value === String(value));
  return found?.namaLengkap;
}

/**
 * Helper: Dapatkan opsi untuk komponen Select (value + label).
 * Cocok untuk dropdown di form Register, Admin Users, dll.
 */
export function getWilayahKerjaSelectOptions(): { value: string; label: string }[] {
  return WILAYAH_KERJA_LIST.map((w) => ({ value: w.value, label: w.label }));
}

/**
 * Helper: Dapatkan opsi untuk komponen Select dengan nama lengkap sebagai label.
 * Cocok untuk dropdown yang butuh nama lengkap (misal: "Wilayah Kerja IV - Malang").
 */
export function getWilayahKerjaSelectOptionsFull(): { value: string; label: string }[] {
  return WILAYAH_KERJA_LIST.map((w) => ({ value: w.value, label: w.namaLengkap }));
}