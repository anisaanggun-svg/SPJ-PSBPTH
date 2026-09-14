# PRD: Aplikasi Generator Dokumen Perjalanan Dinas (SPPD)

## UPT Pengawasan dan Sertifikasi Benih Tanaman Pangan dan Hortikultura Provinsi Jawa Timur — Wilayah Kerja IV Malang

---

## 1. Ringkasan Proyek

Aplikasi web fullstack untuk mengelola data perjalanan dinas pegawai UPT PSBTPH dan menghasilkan otomatis seluruh dokumen administrasi keuangan terkait (SPPD, Kwitansi, Rincian Biaya Perjadin, Daftar Pengeluaran Riil, dan rekap Model 3) melalui satu input data, menggantikan proses manual mail-merge dari Excel.

## 2. Tech Stack

| Layer                   | Teknologi                                  | Keterangan                                                                                 |
| :---------------------- | :----------------------------------------- | :----------------------------------------------------------------------------------------- |
| **Frontend Framework**  | React 18 + Vite (TypeScript)               | Single Page Application (SPA) responsif & cepat                                            |
| **Backend**             | Express.js (Node.js)                       | REST API, kompatibel & terintegrasi dengan Firebase Admin SDK                              |
| **Styling & UI**        | Tailwind CSS + Lucide Icons                | Palet warna resmi hijau UPT PSBTPH, gaya Glassmorphism, toggle Dark/Light Theme            |
| **Document Templating** | `docx-templates` + `pizzip` + `file-saver` | Generator dokumen `.docx` otomatis via Mail Merge dari template Word yang sudah disediakan |
| **Database**            | Cloud Firestore                            | Sumber data utama                                                                          |
| **Authentication**      | Firebase Auth + Internal Role Engine       | Login email/password dengan mekanisme Admin Approval                                       |

## 3. Fitur Utama

- **Input Form** — Create, Read, Update, Delete data perjalanan dinas.
- **User Profil** — dropdown dari navbar untuk melihat/mengubah nama, email, dan password akun.
- **Dropdown Master Data** — semua dropdown pilihan menyertakan placeholder default (mis. "-- Pilih Kode Komoditas --").
- **Document Templating** — generate dokumen `.docx` menggunakan `docx-templates`, mengisi template Word yang sudah disediakan (mail merge), lalu diunduh via `file-saver`.
- **Autentikasi & Approval** — pengguna baru mendaftar lalu menunggu approval dari Admin sebelum bisa login/menggunakan sistem (role engine internal: `admin`, `staf`).

## 4. Dropdown Master Data

### A. Kode Komoditas

| Komoditas    | Kode               |
| ------------ | ------------------ |
| Padi         | 4579.PDC.001.051.A |
| Jagung       | 4579.PDC.002.051.A |
| Kedelai      | 4579.PDC.003.051.A |
| Ubi Kayu     | 4579.PDC.004.051.A |
| Ubi Jalar    | 4579.PDC.004.052.A |
| Kacang Tanah | 4579.PDC.005.051.A |

### B. Kategori DL (Dinas Luar / Akun Belanja Perjalanan)

| Kategori | Kode Akun |
| -------- | --------- |
| Pendek   | 524113    |
| Panjang  | 524111    |

### C. Nama Pegawai (Nama, NIP, Golongan)

| Nama                         | NIP                   | Golongan | Wilayah_Kerja |
| ---------------------------- | --------------------- | -------- | ------------- |
| Prima S. Welli Candra, A.Md. | 19780913 200501 1 001 | III      | 1             |
| Shofiana Widiningtyas        | 19900226 201101 2 005 | III      | 1             |
| Dedy Kristiyawan, S.P.       | 19751203 200901 1 003 | III      | 1             |
| Tedy Irawan, S.TP.           | 19841202 201101 1 008 | III      | 1             |
| Ary Danar Kisworo, S.P.      | 19911116 202012 1 008 | III      | 1             |
| Nedya P. Bachtiar, S.P.      | 19911116 202012 1 008 | III      | 1             |
| Nanang Budi Astanto          | 19911116 202012 1 008 | III      | 1             |
| Budi Winarto                 | 19911116 202012 1 008 | III      | 1             |
| Avianita Agustianti, S.TP.   | 19720809 199903 2 007 | III      | 1             |

### D. Kegiatan

- Sertifikasi
- Penilaian Produsen

## 5. Desain Basis Data (Cloud Firestore)

Sistem menggunakan 3 koleksi utama:

### 5.1 Koleksi Utama: `Data_Primer`

Satu dokumen = satu baris data perjalanan dinas.

| Field                       | Tipe                                                       | Keterangan                                                                   |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `No.`                       | `number`                                                   | Nomor urut baris                                                             |
| `Tahun_Data`                | `number`                                                   | Tahun ketika data diinput                                                    |
| `Wilayah_Kerja`             | `number`                                                   | Wilayah Kerja User yang menginput data                                       |
| `Berangkat_dari`            | `string`                                                   | Kota asal keberangkatan                                                      |
| `Tujuan`                    | `string`                                                   | Instansi/produsen tujuan                                                     |
| `Pada_tanggal`              | `Timestamp` (Date)                                         | Tanggal pelaksanaan kegiatan                                                 |
| `Jabatan_Produsen`          | `string`                                                   | Jabatan penanggung jawab pihak produsen                                      |
| `Nama_Produsen`             | `string`                                                   | Nama penanggung jawab produsen                                               |
| `NIP_Produsen`              | `string` \| `null`                                         | NIP produsen (kosong jika non-PNS)                                           |
| `Nomor_SPT`                 | `string`                                                   | Nomor Surat Perintah Tugas                                                   |
| `No_Urut_SPPD`              | `number`                                                   | Nomor urut SPPD                                                              |
| `Bulan_Kegiatan`            | `string`                                                   | Bulan (format angka romawi, mis. "VII")                                      |
| `Tahun_Kegiatan`            | `string`                                                   | Tahun anggaran (format "Perj./2026")                                         |
| `Nama_Pegawai`              | `string`                                                   | Nama pegawai yang ditugaskan (dari dropdown Nama Pegawai)                    |
| `Tingkat_Menurut_Peraturan` | `string`                                                   | Kode tingkat perjalanan dinas (A–E)                                          |
| `NIP_Pegawai`               | `string`                                                   | NIP pegawai (dari dropdown Nama Pegawai)                                     |
| `Pangkat_dan_Golongan`      | `string`                                                   | Golongan pegawai, mis. "III" (dari dropdown Nama Pegawai)                    |
| `Jabatan_Pegawai`           | `string`                                                   | Jabatan struktural pegawai                                                   |
| `Maksud_Perjalanan_Dinas`   | `string`                                                   | Uraian maksud perjalanan dinas                                               |
| `Tanggal_Berangkat`         | `Timestamp` (Date)                                         | Tanggal keberangkatan                                                        |
| `Tanggal_Kembali`           | `Timestamp` (Date)                                         | Batas tanggal harus kembali                                                  |
| `Kode_Kegiatan`             | `string`                                                   | Kode akun (dari dropdown Kode Komoditas)                                     |
| `Kategori_DL`               | `string` (enum: `"Pendek"` \| `"Panjang"`)                 | Kategori dinas luar (dari dropdown Kategori DL)                              |
| `Jumlah_Uang`               | `number`                                                   | Nominal biaya perjalanan dinas (Rupiah)                                      |
| `Terbilang`                 | `string`                                                   | Nominal dalam bentuk terbilang (bisa digenerate otomatis dari `Jumlah_Uang`) |
| `Kegiatan`                  | `string` (enum: `"Sertifikasi"` \| `"Penilaian Produsen"`) | Jenis kegiatan (dari dropdown Kegiatan)                                      |
| `createdAt`                 | `Timestamp`                                                | Waktu data dibuat                                                            |
| `updatedAt`                 | `Timestamp`                                                | Waktu data terakhir diubah                                                   |

### 5.2 Koleksi: `Master_Pejabat`

Data tetap pejabat penandatangan (tidak berubah per transaksi).

| Field             | Tipe                                                  | Keterangan                                                     |
| ----------------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| `role`            | `string` (enum: `"ppk"` \| `"admin"` \| `"operator"`) | Jenis peran pejabat                                            |
| `nama`            | `string`                                              | Nama pejabat                                                   |
| `nip`             | `string` \| `null`                                    | NIP pejabat (bisa kosong untuk jabatan struktural seperti KPA) |
| `jabatan_lengkap` | `string`                                              | Nama jabatan lengkap untuk ditampilkan di dokumen              |
| `wilayah_kerja`   | `number`                                              | Wilayah Kerja User                                             |
| `aktif`           | `boolean`                                             | Menandai data yang sedang berlaku                              |

**Alasan dipisah dari `Data_Primer`:** nama dan NIP pejabat (KPA, PPK, Bendahara Pengeluaran, Yang Mengkompulir) sama di semua transaksi — kalau disimpan di `Data_Primer`, datanya akan terduplikasi di setiap baris dan sulit diperbarui saat pejabatnya berganti. Dengan koleksi terpisah, cukup diubah di satu tempat (flag `aktif: true`), dan semua dokumen otomatis menarik data pejabat yang sedang berlaku.

Contoh isi awal:

| role       | nama                         | nip                   | jabatan_lengkap                                              | wilayah_kerja |
| ---------- | ---------------------------- | --------------------- | ------------------------------------------------------------ | ------------- |
| `ppk`      | Muhammad Suhelmi Faruq, S.P. | 19740601 199903 1 015 | Pejabat Pembuat Komitmen (Hanya dapat melihat `Data_Primer`) | 1             |
| `admin`    | Ary Danar                    | 19851029 201101 2 011 | User Admin dengan Role Paling Tinggi                         | 2             |
| `operator` | Annisa Iftitah               | 19690227 199403 2 004 | User Mengkompulir data (Hanya dapat menginput `Data_Primer`) | 3             |

### 5.3 Koleksi: `Users`

Akun pengguna aplikasi (terhubung ke Firebase Auth UID).

| Field           | Tipe                                         | Keterangan                 |
| --------------- | -------------------------------------------- | -------------------------- |
| `uid`           | `string`                                     | UID dari Firebase Auth     |
| `nama`          | `string`                                     | Nama pengguna              |
| `email`         | `string`                                     | Email login                |
| `role`          | `string` (enum: `"admin"` \| `"staf"`)       | Peran akses dalam aplikasi |
| `wilayah_kerja` | `number`                                     | Wilayah Kerja User         |
| `status`        | `string` (enum: `"pending"` \| `"approved"`) | Status persetujuan akun    |
| `createdAt`     | `Timestamp`                                  | Waktu akun dibuat          |

## 6. Halaman Menu & Pemetaan Field Dokumen

### 6.1 Kwitansi

`Tahun_Kegiatan`, `Kode_Kegiatan`, `Jumlah_Uang`, `Terbilang`, `Nomor_SPT`, `No_Urut_SPPD`, `Bulan_Kegiatan`, `Pada_tanggal`, `Nama_Pegawai`, `NIP_Pegawai`

- Master_Pejabat: KPA ("Sudah terima dari"), PPK ("Setuju dibayar"), Bendahara Pengeluaran ("Lunas dibayar")

### 6.2 Rincian Biaya Perjadin

`No_Urut_SPPD`, `Bulan_Kegiatan`, `Tahun_Kegiatan`, `Pada_tanggal`, `Jumlah_Uang`, `Terbilang`, `Nama_Pegawai`, `NIP_Pegawai`

- Master_Pejabat: Bendahara Pengeluaran ("Telah dibayar"), PPK

### 6.3 Daftar Pengeluaran Riil

`Nama_Pegawai`, `NIP_Pegawai`, `Jabatan_Pegawai`, `Pada_tanggal`, `No_Urut_SPPD`, `Bulan_Kegiatan`, `Tahun_Kegiatan`, `Jumlah_Uang`

- Master_Pejabat: PPK ("Mengetahui/Menyetujui")

### 6.4 SPPD (2 halaman: Depan & Belakang)

**Halaman Depan:**
`No_Urut_SPPD`, `Bulan_Kegiatan`, `Tahun_Kegiatan`, `Nama_Pegawai`, `NIP_Pegawai`, `Pangkat_dan_Golongan`, `Jabatan_Pegawai`, `Tingkat_Menurut_Peraturan`, `Maksud_Perjalanan_Dinas`, `Berangkat_dari`, `Tujuan`, `Tanggal_Berangkat`, `Tanggal_Kembali`, `Pada_tanggal`

**Halaman Belakang:**
`Berangkat_dari`, `Tujuan`, `Pada_tanggal`, `Nama_Produsen`, `Jabatan_Produsen`, `NIP_Produsen`

**Dari Master_Pejabat:** KPA ("Pejabat berwenang yang memberi perintah" & "An. Kuasa Pengguna Anggaran"), PPK ("Pejabat Pembuat Komitmen", penandatangan di depan & belakang)

**Field/nilai tambahan pada template (tidak perlu disimpan manual per transaksi):**

- `Alat_Angkutan` — nilai statis "Kendaraan dinas"
- `Lamanya_Perjalanan` — dihitung otomatis di frontend dari selisih `Tanggal_Berangkat` dan `Tanggal_Kembali`

### 6.5 Output (Rekap Model 3 — dokumen agregat, bukan per baris)

`Kode_Kegiatan`, `Bulan_Kegiatan`, `Tahun_Kegiatan`, `Berangkat_dari`, `Tujuan`, `Pada_tanggal`, `Nama_Pegawai`, `Jumlah_Uang`

- Master_Pejabat: Bendahara Pengeluaran, Yang Mengkompulir

**Logic khusus:** Dokumen ini bukan satu dokumen per baris `Data_Primer`, melainkan rekap yang mengelompokkan (group by) baris-baris `Data_Primer` berdasarkan kombinasi `Berangkat_dari` + `Tujuan` + `Pada_tanggal` + `Kode_Kegiatan` dalam satu periode/bulan, dengan total `Jumlah_Uang` dijumlahkan di baris JUMLAH. Setiap user yg login hanya melihat data berdasarkan `wilayah_kerja` masing-masing. Data juga ditampilkan berdasarkan grup `tahun_data` agar user tidak melihat terlalu banyak data yang tidak perlu.

### 6.6 Edit Profil

Halaman untuk pengguna mengubah nama, email, dan password akun sendiri (terhubung ke Firebase Auth).

## 7. Alur Autentikasi

1. Pengguna baru daftar (register) dengan email & password → status `pending` di koleksi `Users`.
2. Admin melihat daftar pending user dan melakukan approval → status berubah jadi `approved`.
3. Hanya user dengan status `approved` yang bisa login dan mengakses halaman aplikasi.
4. Role `admin` memiliki akses tambahan: approval user & kelola `Master_Pejabat`.

## 8. Alur Generate Dokumen

1. Pengguna mengisi/memilih data perjalanan dinas dari `Data_Primer` (via form input atau memilih data yang sudah ada).
2. Pengguna memilih jenis dokumen yang ingin digenerate dari menu (Kwitansi / Rincian Biaya / Daftar Pengeluaran Riil / SPPD / Output).
3. Sistem mengambil data dari `Data_Primer` + `Master_Pejabat` sesuai mapping field pada bagian 6.
4. Sistem mengisi template `.docx` yang sudah disediakan menggunakan `docx-templates`, menghasilkan file baru.
5. File hasil generate diunduh otomatis via `file-saver`.

## 9. Kebutuhan Non-Fungsional

- Layout, tata letak tanda tangan, dan format penomoran dokumen hasil generate harus identik dengan template Word asli yang sudah disediakan.
- UI responsif (mobile & desktop), dengan toggle Dark/Light Theme dan gaya Glassmorphism menggunakan palet warna hijau resmi UPT PSBTPH.
- Semua dropdown master data wajib memiliki placeholder default agar tidak ada nilai kosong/ambigu saat form belum diisi.
