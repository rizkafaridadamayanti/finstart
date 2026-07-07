# FinStart — Sistem Akuntansi Internal

FinStart adalah aplikasi akuntansi internal berbasis **Vue 3 + Vite** dan **Node.js + Express + MySQL**. Aplikasi ini ditujukan untuk **satu perusahaan internal** dan beroperasi dalam **Rupiah (IDR)**.

## Fitur yang sudah aktif

- Login berbasis API dengan password PBKDF2, token sesi server, logout server, ganti password, reset-password token, serta daftar sesi aktif.
- Role dan hak akses untuk `admin`, `finance_manager`, `finance`, `hr`, `tax`, `project_manager`, `director`, dan `auditor`. Hak akses diterapkan pada menu dan endpoint API.
- Audit trail serta notifikasi database untuk transaksi sukses, perubahan master data, payroll, pajak, proyek, pengguna, dan pengaturan.
- Klien, proyek, serta alokasi anggota proyek tersimpan pada database (`project_members`).
- Jurnal draft → approve → post dengan pemisahan pembuat dan penyetuju.
- Piutang, utang, pembayaran parsial, pilihan invoice/tagihan yang akan dilunasi, aset, penyusutan bulanan, payroll, PPh 21 estimasi, dan pencatatan pajak internal.
- Laporan laba rugi, neraca, arus kas, trial balance, buku besar, umur piutang, umur utang, pajak, payroll, aset/penyusutan, dan profitabilitas proyek.
- Unduh laporan Excel-compatible dan cetak browser untuk disimpan sebagai PDF.

## Batasan yang disengaja

- Belum ada integrasi Bank Persepsi, DJP/e-Faktur, SPT, payment gateway, Google Drive, email invoice, atau rekonsiliasi mutasi bank. Pembayaran eksternal dilakukan lewat kanal resmi lalu nomor bukti/NTPN dicatat secara internal.
- MFA TOTP dapat diaktifkan per pengguna dari Pengaturan menggunakan aplikasi authenticator. Tidak ada MFA yang diklaim aktif sebelum pengguna mengonfirmasikan kode enam digit.
- Multi-currency belum didukung. Semua transaksi operasional memakai IDR.
- Asisten pada dashboard berbasis aturan data internal, bukan predictive AI/Gemini.

## Kebutuhan

- Node.js 20.19 atau lebih baru
- MySQL 8.0 atau MariaDB yang kompatibel
- npm

## Instalasi database

### Database baru dari nol

Buat database kosong `finstart_db`, lalu impor **satu file** berikut:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS finstart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p finstart_db < database/finstart_db_final_seed.sql
```

Snapshot tersebut aman untuk repository karena tidak berisi sesi login, reset token, atau secret MFA.

### Database `finstart_db` yang sudah ada

Jangan import snapshot lagi bila database sudah terisi. Cukup backup database, pastikan `backend/.env` memakai nama `finstart_db`, lalu jalankan backend dan frontend. Perbaikan laporan/sidebar tidak membutuhkan import SQL baru.

Untuk skema baru tanpa snapshot, impor migrasi berikut secara berurutan:


```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS finstart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p finstart_db < backend/database/finstart_schema_lengkap.sql
mysql -u root -p finstart_db < backend/database/master_data_migration.sql
mysql -u root -p finstart_db < backend/database/projects.sql
mysql -u root -p finstart_db < backend/database/clients.sql
mysql -u root -p finstart_db < backend/database/seed_coa.sql
mysql -u root -p finstart_db < backend/database/subscriptions_migration.sql
mysql -u root -p finstart_db < backend/database/assets_depreciation_migration.sql
mysql -u root -p finstart_db < backend/database/payroll_migration.sql
mysql -u root -p finstart_db < backend/database/payroll_tax_migration.sql
mysql -u root -p finstart_db < backend/database/tax_ppn_pph23_migration.sql
mysql -u root -p finstart_db < backend/database/financial_projections_migration.sql
mysql -u root -p finstart_db < backend/database/finstart_final_migration.sql
```

> Jalankan pada database uji terlebih dahulu. Migrasi final tidak menghapus data, tetapi tetap lakukan backup sebelum menerapkannya ke database yang sudah dipakai.

## Konfigurasi dan menjalankan aplikasi

### 1. Backend

```bash
cd backend
copy .env.example .env
npm ci
npm run dev
```

Pada macOS/Linux, gunakan `cp .env.example .env`.

Edit `backend/.env` sesuai MySQL lokal. Backend berjalan pada `http://localhost:4000`.

### 2. Frontend

Buka terminal baru:

```bash
cd frontend
npm ci
npm run dev
```

Frontend berjalan pada `http://localhost:5173` dan memakai `VITE_API_URL=http://localhost:4000/api`.

## Akun awal

Akun awal dibuat otomatis **hanya jika tabel `users` masih kosong**.

| Role | Email | Password awal |
|---|---|---|
| Administrator | `admin@kedata.id` | `Admin123!` |
| Finance Manager | `finance@kedata.id` | `kedata123` |

Segera ganti password awal setelah login pertama. Jangan gunakan akun awal pada deployment publik.

## Build dan pengujian

```bash
cd backend
npm test

cd ../frontend
npm run build
```

Dokumen uji manual ada di `docs/MANUAL_TESTING.md`.

## Backup dan restore database

Backup:

```bash
mysqldump -u root -p finstart_db > backup_finstart.sql
```

Restore:

```bash
mysql -u root -p finstart_db < backup_finstart.sql
```

## Deployment ringkas

1. Gunakan server dengan Node.js 20+, MySQL, reverse proxy (Nginx/Apache), dan HTTPS.
2. Simpan `.env` hanya di server; jangan pernah memasukkannya ke ZIP, Git, atau pesan chat.
3. Atur `CORS_ORIGIN` ke domain frontend HTTPS yang sebenarnya.
4. Jalankan backend memakai process manager seperti PM2/systemd.
5. Build frontend dengan `npm run build`, lalu layani folder `frontend/dist` melalui web server.
6. Backup database terjadwal, batasi akses MySQL, dan ganti akun awal sebelum produksi.

## Struktur penting

- `backend/routes/` — API dan aturan proses bisnis
- `backend/middleware/` — autentikasi, RBAC, audit trail
- `backend/database/` — schema dan migrasi
- `frontend/src/components/` — tampilan dan formulir
- `docs/API_CONTRACT.md` — ringkasan endpoint aktual
- `docs/MANUAL_TESTING.md` — kasus uji manual


## GitHub

Panduan push source dan aturan file database ada di `docs/GITHUB_DAN_DATABASE.md`.

## Pembaruan UI & laporan final (7 Juli 2026)

- Laporan menggunakan perhitungan dari jurnal `posted` melalui query inti yang sederhana dan kompatibel dengan `finstart_db`: Laba Rugi, Neraca, Arus Kas, Trial Balance, dan Buku Besar tidak lagi bergantung pada tabel laporan tambahan.
- Sidebar desktop memakai satu tombol menu yang selalu terlihat. Tombol bergeser ke kiri ketika sidebar tertutup dan kembali ke kanan ketika sidebar dibuka.
- Sidebar dikelompokkan menjadi: Utama, Operasional, Akuntansi, Perencanaan & Analisis, serta Sistem.
- SDM menggunakan ikon yang konsisten: mata untuk Detail, pensil untuk Ubah, dan tempat sampah untuk Hapus. Hapus hanya diizinkan bila belum ada riwayat payroll; pegawai dengan riwayat payroll harus dinonaktifkan dari form Ubah.
- Form Ubah Pegawai memiliki pilihan status Aktif/Nonaktif.
- Logo Kedata pada landing page menggunakan ukuran eksplisit 30 px agar proporsional pada desktop dan tidak membesar mengikuti ukuran asli gambar.
- Riwayat AI CFO Copilot menggunakan panel kecil di sisi kanan kartu AI CFO. Setiap room dapat dibuka kembali dari daftar chat; riwayatnya tersimpan lokal pada browser pengguna dan belum disinkronkan ke server.
- PRD yang selaras dengan implementasi saat ini tersedia pada `docs/PRD_FinStart_Final.docx`.
- Tidak memerlukan import SQL baru untuk pembaruan UI ini.

## Pembaruan UI, AI, Landing & Splash (Revisi 1.2 — 7 Juli 2026)

- Splash screen aktif saat aplikasi dibuka. Potongan logo bergerak dari beberapa arah lalu menyatu menjadi logo FinStart sebelum wordmark tampil.
- Landing page memakai logo navbar berukuran eksplisit 30 px serta carousel fitur yang bergerak otomatis. Autoplay dijeda saat pointer atau focus berada di area carousel.
- Riwayat AI CFO Copilot tidak lagi membuka sidebar seluruh halaman. Tombol **Riwayat** hanya membuka panel kecil di sisi kanan kartu AI CFO.
- Room chat tetap dapat dibuat, dibuka kembali, dibersihkan, dan dihapus. Riwayat hanya disimpan lokal pada browser melalui `localStorage`.
- Area pesan AI CFO menggunakan tinggi fleksibel agar mengisi ruang kosong pada kartu dan composer tetap berada di bawah.
- PRD revisi 1.2 berada di `docs/PRD_FinStart_Final.docx` dan hanya mendeskripsikan fungsi yang tersedia pada aplikasi saat ini.
- Pembaruan ini tidak memerlukan import SQL baru. Saat menimpa source, pertahankan `backend/.env` lokal.


## Pembaruan UI Final (Revisi 1.3 — 7 Juli 2026)

- Lonceng notifikasi di topbar dihapus; area topbar fokus pada identitas workspace dan menu profil.
- SDM & Payroll memiliki tombol **Kelola Divisi & Jabatan**. Dialog master mendukung tambah, ubah, pencarian, aktif/nonaktif, dan hapus divisi/jabatan melalui API. Data yang masih dipakai pegawai atau jabatan terkait tidak dapat dihapus.
- Akun `finance_manager` diberi akses tulis ke master SDM agar pengelolaan divisi/jabatan di workspace Finance Manager dapat digunakan.
- Area chat AI CFO memakai tinggi fleksibel dengan composer terkunci di dasar kartu agar ruang kosong di bawah input tidak tersisa. Riwayat tetap hanya tampil di dalam kartu AI.
- Landing carousel berpindah langsung setiap sekitar 4,6 detik tanpa indikator loading/progress.
- Splash memakai logo transparan yang lebih jelas; tiga potongan logo bergerak lalu menyatu pada panel gelap sebelum wordmark tampil.
- PRD Revisi 1.3 di `docs/PRD_FinStart_Final.docx` sesuai dengan fungsi yang tersedia pada source ini.
- Tidak memerlukan import SQL baru. Saat menimpa source, pertahankan `backend/.env` lokal.
