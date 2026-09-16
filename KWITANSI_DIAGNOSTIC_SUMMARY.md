# KWITANSI DIAGNOSTIC SUMMARY

**Generated:** 2026-09-16  
**Project:** PSBTPH-SPPF  
**Analisis:** Alur Generate Kwitansi dari Frontend → Backend → Template DOCX

---

## 1. ALUR GENERATE KWITANSI (Frontend → API → Backend → Template)

### 1.1 Frontend: `src/pages/documents/DocumentGeneratePage.tsx`
- **Line 60:** `await downloadKwitansi(data.id!, data.Nama_Pegawai, data.No_Urut_SPPD);`
- Mengambil `data` dari `getDataPrimer(userProfile.wilayah_kerja)` (line 37)
- Mengambil `pejabatList` dari `getActivePejabat(userProfile.wilayah_kerja)` (line 38) — **namun tidak digunakan untuk kwitansi**

### 1.2 Frontend Service: `src/services/dataPrimerService.ts`
- **Line 63-81:** `downloadKwitansi(id, namaPegawai, noUrutSPPD)`
- **Endpoint:** `GET ${API_URL}/data-primer/${id}/kwitansi`
- **Response:** Blob (DOCX file) → di-download via `file-saver`

### 1.3 Backend Route: `server/src/routes/dataPrimer.ts` (Line 150-198)
```typescript
// GET /api/data-primer/:id/kwitansi
router.get('/:id/kwitansi', authMiddleware, async (req, res) => {
  // 1. Ambil dataPrimer dari Firestore (collection: Data_Primer)
  // 2. Query PPK & Bendahara dari Master_Pejabat:
  //    - role == 'ppk' AND wilayah_kerja == dataPrimer.Wilayah_Kerja AND aktif == true
  //    - role == 'bendahara' AND wilayah_kerja == dataPrimer.Wilayah_Kerja AND aktif == true
  // 3. Jika ppkSnap.empty || bendaharaSnap.empty → RETURN 400 ERROR
  // 4. noBukti = req.query.no_bukti || '' (KOSONG by default!)
  // 5. nomorDIPA = process.env.NOMOR_DIPA || '018.03.3.059106/2026'
  // 6. Panggil generateKwitansi(dataPrimer, ppk, bendahara, noBukti, nomorDIPA)
  // 7. Return buffer sebagai attachment
});
```

### 1.4 Generator: `server/src/lib/generateKwitansi.ts`
- **Template path:** `path.join(__dirname, '../templates/kwitansi.docx')` → **`server/src/templates/kwitansi.docx`**
- **Delimiter:** `+++` (cmdDelimiter: ['+++', '+++'])
- **Data mapping:** 16 placeholder (lihat section 3)

---

## 2. LOKASI TEMPLATE KWITANSI YANG DIGUNAKAN

| Template Path | Digunakan Oleh | Status Placeholder |
|---------------|----------------|-------------------|
| `server/src/templates/kwitansi.docx` | **generateKwitansi.ts** (backend) | ✅ **LENGKAP** (16 placeholder) |
| `public/templates/kwitansi.docx` | documentService.ts (frontend - untuk dokumen lain) | ❌ **HANYA 1 placeholder** (`Tahun_Kegiatan`) |
| `public/templates/kwitansi.docx.bak` | Backup | Tidak digunakan |

**KESIMPULAN:** Template yang benar-benar dipakai untuk Generate Kwitansi adalah **`server/src/templates/kwitansi.docx`** (bukan yang di `public/templates/`).

---

## 3. DAFTAR PLACEHOLDER DI TEMPLATE KWITANSI (server/src/templates/kwitansi.docx)

Ditemukan 16 placeholder unik (dengan delimiter `+++`):

| No | Placeholder | Ditemukan di Template |
|----|-------------|----------------------|
| 1 | `Tahun_Kegiatan` | ✅ |
| 2 | `Bulan_Kegiatan` | ✅ |
| 3 | `Jumlah_Uang` | ✅ |
| 4 | `Kode_Kegiatan` | ✅ |
| 5 | `NIP_Bendahara` | ✅ |
| 6 | `NIP_PPK` | ✅ |
| 7 | `NIP_Pegawai` | ✅ |
| 8 | `Nama_Bendahara` | ✅ |
| 9 | `Nama_PPK` | ✅ |
| 10 | `Nama_Petugas_Huruf_Besar` | ✅ |
| 11 | `No_Bukti` | ✅ |
| 12 | `No_Urut_SPPD` | ✅ |
| 13 | `Nomor_DIPA` | ✅ |
| 14 | `Nomor_SPT` | ✅ |
| 15 | `Pada_tanggal` | ✅ |
| 16 | `Terbilang` | ✅ |

---

## 4. MAPPING PLACEHOLDER → DATA DARI generateKwitansi.ts

| Placeholder | Sumber Data di generateKwitansi.ts (Line 68-85) | Tipe | Catatan |
|-------------|--------------------------------------------------|------|---------|
| `Tahun_Kegiatan` | `dataPrimer.Tahun_Kegiatan` | string | Dari Data_Primer |
| `Bulan_Kegiatan` | `dataPrimer.Bulan_Kegiatan` | string | Dari Data_Primer |
| `Jumlah_Uang` | `dataPrimer.Jumlah_Uang.toLocaleString('id-ID')` | string | Format ribuan |
| `Kode_Kegiatan` | `dataPrimer.Kode_Kegiatan` | string | Dari Data_Primer |
| `NIP_Bendahara` | `bendahara.nip` | string/null | **Wajib ada** |
| `NIP_PPK` | `ppk.nip` | string/null | **Wajib ada** |
| `NIP_Pegawai` | `dataPrimer.NIP_Pegawai` | string | Dari Data_Primer |
| `Nama_Bendahara` | `bendahara.nama.toUpperCase()` | string | **Wajib ada** |
| `Nama_PPK` | `ppk.nama.toUpperCase()` | string | **Wajib ada** |
| `Nama_Petugas_Huruf_Besar` | `dataPrimer.Nama_Pegawai.toUpperCase()` | string | Dari Data_Primer |
| `No_Bukti` | `noBukti` (parameter) | string | **DEFAULT KOSONG ''** ⚠️ |
| `No_Urut_SPPD` | `dataPrimer.No_Urut_SPPD` | number | Dari Data_Primer |
| `Nomor_DIPA` | `nomorDIPA` (parameter) | string | Default dari ENV |
| `Nomor_SPT` | `dataPrimer.Nomor_SPT` | string | Dari Data_Primer |
| `Pada_tanggal` | `formatTanggalIndo(dataPrimer.Pada_tanggal)` | string | Format "30 Juli 2026" |
| `Terbilang` | `dataPrimer.Terbilang || angkaKeTerbilang(Jumlah_Uang) + ' Rupiah'` | string | Fallback ke konversi otomatis |

---

## 5. DATA YANG DIBUTUHKAN GENERATOR

### 5.1 dataPrimer (Data_Primer document)
**Wajib ada field:**
- `Tahun_Kegiatan`, `Bulan_Kegiatan`, `Kode_Kegiatan`, `Jumlah_Uang`, `Terbilang` (optional), `Nomor_SPT`, `No_Urut_SPPD`, `Pada_tanggal`, `Nama_Pegawai`, `NIP_Pegawai`, `Wilayah_Kerja`

### 5.2 ppk (MasterPejabat)
**Wajib:** `nama`, `nip`  
**Query:** `role == 'ppk' && wilayah_kerja == dataPrimer.Wilayah_Kerja && aktif == true`

### 5.3 bendahara (MasterPejabat)
**Wajib:** `nama`, `nip`  
**Query:** `role == 'bendahara' && wilayah_kerja == dataPrimer.Wilayah_Kerja && aktif == true`

### 5.4 noBukti (string)
**Sumber:** `req.query.no_bukti` → **DEFAULT KOSONG `''`** ⚠️ **MASALAH POTENSIAL**

### 5.5 nomorDIPA (string)
**Sumber:** `process.env.NOMOR_DIPA` → Default: `'018.03.3.059106/2026'`

---

## 6. SUMBER DATA PPK & BENDAHARA

### 6.1 Query di `server/src/routes/dataPrimer.ts` (Line 162-175)
```typescript
const ppkSnap = await dbAdmin
  .collection('Master_Pejabat')
  .where('role', '==', 'ppk')
  .where('wilayah_kerja', '==', dataPrimer.Wilayah_Kerja)
  .where('aktif', '==', true)
  .limit(1)
  .get();

const bendaharaSnap = await dbAdmin
  .collection('Master_Pejabat')
  .where('role', '==', 'bendahara')
  .where('wilayah_kerja', '==', dataPrimer.Wilayah_Kerja)
  .where('aktif', '==', true)
  .limit(1)
  .get();
```

### 6.2 Collection yang Dicari
- **Primary:** `Master_Pejabat` (canonical)
- **Legacy:** `master_pejabat` (hanya untuk GET all, tidak untuk query kwitansi)

### 6.3 Error Jika Tidak Ditemukan (Line 177-180)
```typescript
if (ppkSnap.empty || bendaharaSnap.empty) {
  res.status(400).json({ error: 'PPK atau Bendahara belum diatur di Master Pejabat untuk wilayah kerja ini' });
  return;
}
```

---

## 7. PENGARUH `wilayah_kerja` TERHADAP PENGAMBILAN PPK/BENDAHARA

**Logika:** `wilayah_kerja` pada **Data_Primer** (`dataPrimer.Wilayah_Kerja`) digunakan sebagai filter query ke Master_Pejabat.

| Wilayah_Kerja Data_Primer | PPK Ditemukan | Bendahara Ditemukan | Generate Kwitansi |
|---------------------------|---------------|---------------------|-------------------|
| 1 | ✅ (seed ada) | ✅ (seed ada) | ✅ BERHASIL |
| 2 | ✅ (seed ada) | ✅ (seed ada) | ✅ BERHASIL |
| 3 | ❌ (hanya operator) | ❌ | ❌ GAGAL (400) |
| 4 | ❌ **TIDAK ADA SEED** | ❌ **TIDAK ADA SEED** | ❌ **GAGAL (400)** |
| 5+ | ❌ | ❌ | ❌ GAGAL (400) |

---

## 8. KONDISI AKUN YANG DIGUNAKAN (Dari Log Server)

### 8.1 User: `diva@gmail.com` (UID: `brWRcCb0ZnNnaQfmBaqbzR4pxhg1`)
```json
{
  "role": "admin",
  "wilayah_kerja": 4,
  "status": "approved",
  "email": "diva@gmail.com"
}
```

### 8.2 User: `anisa@gmail.com` (UID: `9Fu9vQjcj4aA8u1X4w7KULieZoX2`)
```json
{
  "role": "admin",
  "wilayah_kerja": 2,
  "status": "approved",
  "email": "anisa@gmail.com"
}
```

### 8.3 User: `admin@test.com` (UID: `rcUjShhT3cQsae6NRnrVD6mHOVh1`)
```json
{
  "role": "admin",
  "wilayah_kerja": 4,
  "status": "approved",
  "email": "admin@test.com"
}
```

**Artinya:** User `diva@gmail.com` dan `admin@test.com` memiliki `wilayah_kerja: 4` yang **TIDAK memiliki data PPK/Bendahara di seed**.

---

## 9. ARTI LOG/ERROR YANG MUNCUL

### 9.1 Log Normal (Wilayah 2 - anisa@gmail.com)
```
[DataPrimer/GET kwitansi] request received, id: yjRdBcUPsE3iFQx5E9dk
[Pejabat/GET] request received, query: { wilayah_kerja: '2' }
[Pejabat/GET] success, count: 3
```
→ **Berhasil** karena wilayah 2 punya 3 pejabat (KPA, PPK, Bendahara)

### 9.2 Log Error (Wilayah 4 - diva@gmail.com)
```
[DataPrimer/GET] request received, query: { wilayah_kerja: '4', tahun_data: '2026' }
[DataPrimer/GET] success, count: 1 filteredByYear: 2026
[Pejabat/GET] request received, query: { wilayah_kerja: '4' }
[Pejabat/GET] success, count: 0    ← **KOSONG!**
```
→ **Data Primer ADA (count: 1)** tapi **PPK/Bendahara TIDAK ADA (count: 0)**

### 9.3 Error Response yang Diharapkan (jika generate kwitansi dipanggil)
```json
{
  "error": "PPK atau Bendahara belum diatur di Master Pejabat untuk wilayah kerja ini"
}
```
**Status HTTP:** 400

---

## 10. ANALISIS PENYEBAB MASALAH

| Komponen | Status | Bukti |
|----------|--------|-------|
| **Template DOCX (server)** | ✅ **BENAR** | 16 placeholder lengkap, delimiter `+++` cocok |
| **Placeholder** | ✅ **COCOK** | Semua 16 placeholder di template termapping di generateKwitansi.ts |
| **generateKwitansi.ts** | ✅ **BENAR** | Logika mapping benar, path template benar |
| **Data PPK/Bendahara** | ❌ **MASALAH UTAMA** | Wilayah 4 **TIDAK ADA** data PPK & Bendahara di Firestore |
| **wilayah_kerja** | ❌ **MASALAH UTAMA** | User login dengan wilayah_kerja=4 tapi seed hanya 1,2,3 |
| **Frontend/API Request** | ✅ **BENAR** | Request flow benar, parameter terkirim |
| **Konfigurasi Lain** | ⚠️ **PERLU CEK** | `noBukti` default kosong, `NOMOR_DIPA` dari ENV |

---

## 11. APKAH WILAYAH KERJA 4 DIDUKUNG?

**JAWABAN: BELUM DIDUKUNG** ❌

### Bukti:
1. **Seed Data (`server/seedPejabat.ts`)** hanya menanamkan pejabat untuk wilayah 1, 2, 3
2. **Log server** menunjukkan `[Pejabat/GET] success, count: 0` untuk wilayah_kerja=4
3. **Tidak ada** data primer seed untuk wilayah 4 (hanya wilayah 2 di `seed_data_primer_wilayah2.ts`)

### Wilayah yang Punya PPK & Bendahara (Dari Seed):
| Wilayah | PPK | Bendahara | KPA | Operator | Admin |
|---------|-----|-----------|-----|----------|-------|
| **1** | ✅ Muhammad Suhelmi Faruq | ✅ Bendahara Test Wilayah 1 | - | - | - |
| **2** | ✅ PPK Wilayah 2 | ✅ Bendahara Wilayah 2 | ✅ KPA Wilayah 2 | - | ✅ Ary Danar |
| **3** | - | - | - | ✅ Annisa Iftitah | - |
| **4** | ❌ **TIDAK ADA** | ❌ **TIDAK ADA** | - | - | - |

---

## 12. REKOMENDASI LANGKAH BERIKUTNYA

### 🔴 PRIORITAS TINGGI (Wajib diperbaiki)

1. **Tambah Seed PPK & Bendahara untuk Wilayah 4**
   - File: `server/seedPejabat.ts`
   - Tambahkan entry untuk `wilayah_kerja: 4` dengan role `ppk` dan `bendahara`
   - Jalankan: `cd server && npx ts-node seedPejabat.ts`

2. **Atau: Ubah User `diva@gmail.com` ke Wilayah yang Sudah Ada Data**
   - Update Firestore: `users/{uid}` → `wilayah_kerja: 2` (atau 1)
   - Atau update custom claims via Firebase Admin

### 🟡 PRIORITAS SEDANG

3. **Perbaiki `noBukti` Default Kosong**
   - Di `server/src/routes/dataPrimer.ts` line 186: `noBukti` default `''`
   - Pertimbangkan: generate nomor otomatis, atau wajibkan input dari frontend

4. **Sinkronkan Template Public (Optional)**
   - `public/templates/kwitansi.docx` hanya punya 1 placeholder
   - Jika frontend pernah pakai template ini untuk kwitansi, akan gagal
   - **Tapi saat ini kwitansi pakai backend template, jadi aman**

### 🟢 PRIORITAS RENDAH (Verifikasi)

5. **Verifikasi `NOMOR_DIPA` di `.env` Server**
   - File: `server/.env`
   - Pastikan `NOMOR_DIPA` sesuai kebutuhan tahun berjalan

6. **Test Generate Kwitansi dengan User Wilayah 2 (anisa@gmail.com)**
   - Seharusnya berhasil karena PPK & Bendahara wilayah 2 ada

---

## 13. FILE YANG DIPERIKSA & ALASAN RELEVANSI

| File | Alasan Relevansi |
|------|------------------|
| `src/pages/documents/DocumentGeneratePage.tsx` | Entry point frontend generate kwitansi |
| `src/services/dataPrimerService.ts` | Frontend service call `downloadKwitansi` |
| `src/services/masterPejabatService.ts` | Helper `getPejabatByRole` (frontend, tidak dipakai kwitansi) |
| `server/src/routes/dataPrimer.ts` | Backend endpoint `/kwitansi`, query PPK/Bendahara |
| `server/src/lib/generateKwitansi.ts` | Generator utama, mapping data → template |
| `server/src/templates/kwitansi.docx` | **Template yang benar-benar dipakai** (16 placeholder) |
| `public/templates/kwitansi.docx` | Template lama/tidak dipakai kwitansi (hanya 1 placeholder) |
| `server/seedPejabat.ts` | Source of truth data PPK/Bendahara per wilayah |
| `server/seed_data_primer_wilayah2.ts` | Source of truth data primer per wilayah |
| `/tmp/server.log` | Log error real-time dari server |
| `src/types/index.ts` | Type definitions DataPrimer, MasterPejabat, UserProfile |

---

## 14. KESIMPULAN SINGKAT

### ✅ Masalah yang Sudah Terbukti
1. **Wilayah kerja 4 TIDAK memiliki data PPK dan Bendahara** di Firestore (seed hanya wilayah 1, 2, 3)
2. **User `diva@gmail.com` (wilayah_kerja: 4) tidak bisa generate kwitansi** karena query PPK/Bendahara return empty
3. **Error yang akan muncul:** `400 - PPK atau Bendahara belum diatur di Master Pejabat untuk wilayah kerja ini`
4. **Template di `server/src/templates/kwitansi.docx` sudah benar** (16 placeholder, delimiter `+++` cocok)
5. **`noBukti` default kosong** — placeholder `No_Bukti` akan kosong di dokumen hasil generate

### ❓ Masih Perlu Diverifikasi
1. Apakah user `diva@gmail.com` **benar-benar** mencoba generate kwitansi (log tidak menunjukkan request `/kwitansi` untuk wilayah 4)
2. Apakah `NOMOR_DIPA` di `server/.env` sudah benar untuk tahun 2026
3. Apakah ada data primer di wilayah 4 yang valid (log menunjukkan count: 1 tapi perlu cek field lengkapnya)

### 🔧 Langkah Perbaikan yang Disarankan (Urutan Prioritas)
1. **TAMBAH SEED PPK & BENDAHARA WILAYAH 4** di `server/seedPejabat.ts` → jalankan seed
2. **ATAU** pindahkan user `diva@gmail.com` ke `wilayah_kerja: 2` (yang sudah lengkap datanya)
3. **PERBAIKI** `noBukti` default di `server/src/routes/dataPrimer.ts` line 186 (generate nomor otomatis atau wajibkan input)
4. **TEST** generate kwitansi dengan user `anisa@gmail.com` (wilayah 2) untuk memastikan flow backend berjalan normal

---

**Catatan:** Analisis ini **tidak mengubah kode apapun**, hanya mendokumentasikan kondisi project saat ini berdasarkan pemeriksaan file dan log server.