import { Timestamp } from 'firebase/firestore';
import { BULAN_ROMAWI } from '../constants/masterData';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const NAMA_HARI = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
];

export function toDate(value: Timestamp | Date | string | { _seconds: number; _nanoseconds?: number } | null | undefined): Date {
  console.log('[toDate] Received value:', value, 'type:', typeof value);
  if (!value) {
    console.log('[toDate] Value is null/undefined');
    return new Date(NaN);
  }
  if (value instanceof Timestamp) {
    console.log('[toDate] Matched Timestamp instance');
    return value.toDate();
  }
  if (value instanceof Date) {
    console.log('[toDate] Matched Date instance');
    return value;
  }
  // Handle plain Firestore Timestamp object (serialized from backend)
  if (typeof value === 'object' && '_seconds' in value) {
    console.log('[toDate] Matched plain Firestore Timestamp object');
    return new Date(value._seconds * 1000);
  }
  console.log('[toDate] Falling back to new Date(value)');
  return new Date(value as string | number | Date);
}

export function formatTanggalIndonesia(value: Timestamp | Date | string): string {
  const date = toDate(value);
  const day = date.getDate();
  const month = NAMA_BULAN[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatTanggalLengkap(value: Timestamp | Date | string): string {
  const date = toDate(value);
  const hari = NAMA_HARI[date.getDay()];
  const day = date.getDate();
  const month = NAMA_BULAN[date.getMonth()];
  const year = date.getFullYear();
  return `${hari}, ${day} ${month} ${year}`;
}

export function hitungLamaPerjalanan(berangkat: Timestamp | Date | string, kembali: Timestamp | Date | string): number {
  const start = toDate(berangkat);
  const end = toDate(kembali);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getBulanRomawi(value: Timestamp | Date | string): string {
  const date = toDate(value);
  const monthNum = date.getMonth() + 1;
  return BULAN_ROMAWI[monthNum] || '';
}

export function formatDateForInput(value: Timestamp | Date | string | undefined): string {
  if (!value) return '';
  const date = toDate(value);
  return date.toISOString().split('T')[0];
}
