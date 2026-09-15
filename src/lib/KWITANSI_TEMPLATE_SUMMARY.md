# Ringkasan Template Kwitansi & Struktur Data

## 1. Ikhtisar Proyek

Aplikasi manajemen data perjalanan dinas (Data Primer) untuk Dinas Pertanian dan Ketahanan Pangan Provinsi Jawa Timur. Sistem ini mendukung dua sisi:

- **Frontend** (React + Vite): UI pengguna, memanggil backend API untuk generate kwitansi
- **Backend** (Node.js + Express + Firebase Admin): API server, menjadi **satu-satunya generator kwitansi**

---

## 2. Struktur Data (TypeScript Interfaces)

### `DataPrimer` (`src/types/index.ts`)

Data utama perjalanan dinas yang akan dibuatkan kwitansinya.

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `id?` | `string` | ID dokumen Firestore |
| `No` | `number` | Nomor urut |
| `Tahun_Data` | `number` | Tahun data (misal: 2026) |
| `Wilayah_Kerja` | `number` | Kode wilayah kerja |
| `Berangkat_dari` | `string` | Lokasi keberangkatan |
| `Tujuan` | `string` | Tujuan perjalanan |
| `Pada_tanggal` | `Timestamp \| Date \| string` | Tanggal pembuatan kwitansi |
| `Jabatan_Produsen` | `string` | Jabatan produsen |
| `Nama_Produsen` | `string` | Nama produsen |
| `NIP_Produsen` | `string \| null` | NIP produsen |
| `Nomor_SPT` | `string` | Nomor SPT |
| `No_Urut_SPPD` | `number` | Nomor urut SPPD |
| `Bulan_Kegiatan` | `string` | Bulan kegiatan (misal: "VII") |
| `Tahun_Kegiatan` | `string` | Tahun kegiatan (misal: "2026") |
| `Nama_Pegawai` | `string` | Nama pegawai yang dituju |
| `Tingkat_Menurut_Peraturan` | `string` | Tingkat perjalanan |
| `NIP_Pegawai` | `string` | NIP pegawai |
| `Pangkat_dan_Golongan` | `string` | Pangkat dan golongan |
| `Jabatan_Pegawai` | `string` | Jabatan pegawai |
| `Maksud_Perjalanan_Dinas` | `string` | Maksud perjalanan |
| `Tanggal_Berangkat` | `Timestamp \| Date \| string` | Tanggal berangkat |
| `Tanggal_Kembali` | `Timestamp \| Date \| string` | Tanggal kembali |
| `Kode_Kegiatan` | `string` | Kode kegiatan |
| `Kategori_DL` | `'Pendek' \| 'Panjang'` | Kategori perjalanan |
| `Jumlah_Uang` | `number` | Jumlah uang (rupiah) |
| `Terbilang` | `string` | Terbilang dalam huruf |
| `Kegiatan` | `'Sertifikasi' \| 'Penilaian Produsen'` | Jenis kegiatan |
| `createdAt?` | `Timestamp` | Timestamp pembuatan |
| `updatedAt?` | `Timestamp` | Timestamp update |

### `MasterPejabat` (`src/types/index.ts`)

Data pejabat (PPK, Bendahara, KPA, dll).

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `id?` | `string` | ID dokumen |
| `role` | `'ppk' \| 'admin' \| 'operator' \| 'kpa' \| 'bendahara' \| 'pengkompulir'` | Peran pejabat |
| `nama` | `string` | Nama lengkap |
| `nip` | `string \| null` | NIP |
| `jabatan_lengkap` | `string` | Jabatan lengkap |
| `wilayah_kerja` | `number` | Kode wilayah kerja |
| `aktif` | `boolean` | Status aktif |

### `RekapModel3Item` (`src/types/index.ts`)

Item rekap model 3 untuk laporan gabungan.

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `Berangkat_dari` | `string` | Lokasi keberangkatan |
| `Tujuan` | `string` | Tujuan |
| `Pada_tanggal` | `string` | Tanggal (ISO string) |
| `Kode_Kegiatan` | `string` | Kode kegiatan |
| `entries` | `{ Nama_Pegawai: string; Jumlah_Uang: number }[]` | Daftar pegawai |
| `total` | `number` | Total jumlah uang |

---

## 3. Template Kwitansi

### Lokasi Template

| Lingkungan | Path | Ukuran |
|------------|------|--------|
| **Backend** | `server/src/templates/kwitansi.docx` | 21.635 bytes |
| **Frontend** | `public/templates/kwitansi.docx` | 21.635 bytes |
| **Sumber asli** | `src/lib/4. KWITANSI mailing data primer.docx` | 21.635 bytes |

### Format Template

Template menggunakan library **docx-templates** dengan delimiter `+++`:

```
+++NAMA_PLACEHOLDER+++
```

### Placeholder yang Tersedia

Template hanya memiliki **satu** placeholder dinamis:

| Placeholder | Sumber Data | Deskripsi |
|-------------|-------------|-----------|
| `+++Tahun_Kegiatan+++` | `dataPrimer.Tahun_Kegiatan` | Tahun kegiatan (misal: "2026") |

### Data yang Di-hardcode di Template

Template ini adalah template "mailing data primer" yang sudah berisi data statis untuk kasus khusus:

| Field | Nilai Hardcode |
|-------|----------------|
| **TA.** | `+++Tahun_Kegiatan+++` (dinamis) |
| **NO. BUKTI** | (kosong - untuk diisi manual) |
| **M.A.K** | `4579.PDC.001.051.A/524113` |
| **D.I.P.A** | `018.03.3.059106/2026` |
| **KWITANSI / BUKTI PEMBAYARAN** | Judul statis |
| **Sudah terima dari** | `KUASA PENGGUNA ANGGARAN DINAS PERTANIAN DAN KETAHANAN PANGAN PROVINSI JAWA TIMUR` |
| **Jumlah Uang** | `Rp. 150.000,-` |
| **Terbilang** | `Seratus Lima Puluh Ribu Rupiah` |
| **Untuk Pembayaran** | `Biaya perjalanan dinas dalam kota sesuai SPT No. 000.1.2.3/374/110.65.1.4/2026 dan SPPD No. 483/VII/Perjl./2026, tanggal 30 Juli 2026` |
| **Surabaya,** | `30 Juli 2026` |
| **Yang menerima** | `PRIMA S. WELLI CANDRA, A.Md` |
| **NIP.** | `19780913 200501 1 001` |
| **An. Kuasa Pengguna Anggaran** | (header tabel) |
| **Bendahara Pengeluaran** | (header tabel) |
| **Pejabat Pembuat Komitmen** | (header tabel) |
| **Nama PPK** | `MUHAMMAD SUHELMI FARUQ` |
| **NIP PPK** | `19740601 199903 1 015` |
| **Nama Bendahara** | `NURUL WULANDARI, S.E.` |
| **NIP Bendahara** | `19851029 201101 2 011` |

---

## 4. Backend: Generate Kwitansi (SATU-SATUNYA GENERATOR)

### File: `server/src/lib/generateKwitansi.ts`

Fungsi untuk generate kwitansi di sisi server. **Ini adalah satu-satunya implementasi generate kwitansi.**

#### Signature Fungsi

```typescript
export async function generateKwitansi(
  dataPrimer: DataPrimer,
  ppk: MasterPejabat,
  bendahara: MasterPejabat,
  noBukti: string,
  nomorDIPA: string
): Promise<Buffer>
```

#### Implementasi

```typescript
const report = await createReport({
  template,
  cmdDelimiter: ['+++', '+++'],
  data: {
    Tahun_Kegiatan: dataPrimer.Tahun_Kegiatan,
  },
});
```

#### Catatan

- Parameter `ppk`, `bendahara`, `noBukti`, `nomorDIPA` tetap diterima untuk kompatibilitas dengan caller, namun tidak dipakai karena data sudah di-hardcode di template.
- Fungsi helper `angkaKeTerbilang()` dan `formatTanggalIndo()` masih ada di file tetapi tidak lagi dipakai oleh template ini.

### File: `server/src/routes/dataPrimer.ts`

#### Endpoint

```
GET /api/data-primer/:id/kwitansi?no_bukti=BUKTI-001
```

#### Alur

1. Ambil data primer dari Firestore berdasarkan `id`
2. Cari pejabat PPK dan Bendahara berdasarkan `Wilayah_Kerja`
3. Panggil `generateKwitansi(dataPrimer, ppk, bendahara, noBukti, nomorDIPA)`
4. Kembalikan buffer DOCX sebagai response dengan header `Content-Disposition: attachment; filename=kwitansi-${id}.docx`

#### Middleware Auth

Endpoint dilindungi oleh `authMiddleware` — frontend harus mengirim token Firebase sebagai `Authorization: Bearer <token>`.

---

## 5. Frontend: Download Kwitansi dari Backend

### File: `src/services/dataPrimerService.ts`

#### Fungsi `downloadKwitansi`

```typescript
export async function downloadKwitansi(
  id: string,
  namaPegawai: string,
  noUrutSPPD: number | string,
): Promise<void>
```

#### Implementasi

1. Dapatkan auth header (Firebase ID token)
2. Panggil `GET /api/data-primer/:id/kwitansi` dengan `responseType: 'blob'`
3. Buat `Blob` dari response
4. Download dengan `saveAs(blob, filename)` di mana filename = `Kwitansi_<Nama_Pegawai>_<No_Urut_SPPD>.docx`

#### Pemanggil

- `src/pages/dataPrimer/DataPrimerListPage.tsx` (line 130)
- `src/pages/documents/DocumentGeneratePage.tsx` (line 61)

---

## 6. Arsitektur Akhir (Setelah Refactoring)

```
Frontend:
DataPrimerListPage / DocumentGeneratePage
  ↓ (klik "Kwitansi")
downloadKwitansi(id, namaPegawai, noUrutSPPD)
  ↓ (axios GET dengan Bearer token)
GET /api/data-primer/:id/kwitansi
  ↓
server/src/routes/dataPrimer.ts
  ↓
server/src/lib/generateKwitansi.ts
  ↓ (docx-templates, delimiter +++)
DOCX Buffer
  ↓ (response blob)
saveAs(blob, "Kwitansi_<Nama>_<NoSPPD>.docx")
  ↓
Download ke browser
```

---

## 7. File yang Diubah

| # | File | Perubahan |
|---|------|-----------|
| 1 | `server/src/templates/kwitansi.docx` | Diganti dengan template baru dari `src/lib/4. KWITANSI mailing data primer.docx` |
| 2 | `public/templates/kwitansi.docx` | Diganti dengan template baru yang sama |
| 3 | `server/src/lib/generateKwitansi.ts` | Data object disederhanakan hanya berisi `Tahun_Kegiatan` |
| 4 | `src/services/dataPrimerService.ts` | Ditambahkan `downloadKwitansi()` yang memanggil backend API |
| 5 | `src/pages/dataPrimer/DataPrimerListPage.tsx` | Case `kwitansi` di `handleGenerateDoc` menggunakan `downloadKwitansi` dari backend |
| 6 | `src/pages/documents/DocumentGeneratePage.tsx` | Case `kwitansi` di `handleGenerate` menggunakan `downloadKwitansi` dari backend |
| 7 | `src/services/documentService.ts` | Dihapus `generateKwitansi` (frontend); `generateAndDownload` direvert ke keadaan semula |

## 8. File yang Dihapus

Tidak ada file yang dihapus. Hanya fungsi `generateKwitansi` yang dihapus dari `documentService.ts`.

---

## 9. Reference `generateKwitansi` yang Tersisa

### Backend (tetap ada — ini adalah generator utama)

| File | Baris | Peran |
|------|-------|-------|
| `server/src/lib/generateKwitansi.ts` | 55 | Definisi fungsi |
| `server/src/routes/dataPrimer.ts` | 5, 189 | Import dan pemanggil |

### Frontend (tidak ada lagi — sudah beralih ke backend)

Tidak ada referensi `generateKwitansi` di kode frontend. Semua pemanggilan kwitansi di frontend menggunakan `downloadKwitansi` dari `dataPrimerService.ts`.

---

## 10. Testing

### Backend Test

```bash
cd server && npx ts-node -e "
import { generateKwitansi } from './src/lib/generateKwitansi';
// ... mock data ...
generateKwitansi(mockDataPrimer, mockPpk, mockBendahara, 'BUKTI-001', '018.03.3.059106/2026')
  .then(buffer => {
    fs.writeFileSync('/tmp/test_kwitansi_new.docx', buffer);
    console.log('SUCCESS: Kwitansi generated, size:', buffer.length, 'bytes');
  });
"
```

**Hasil**: ✅ Berhasil, output 26.374 bytes, placeholder `+++Tahun_Kegiatan+++` diganti dengan `2026`.

### TypeScript Compilation

```bash
npx tsc --noEmit
```

**Hasil**: ✅ Tanpa error.

### Server Health

```bash
curl -s http://localhost:3001/api/health
```

**Hasil**: ✅ `{"status":"ok","timestamp":"..."}`
