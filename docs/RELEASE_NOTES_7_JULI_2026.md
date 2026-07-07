# Release Notes - FinStart Revisi 1.3 (7 Juli 2026)

## Landing dan Splash

- Splash screen memakai tiga potongan logo transparan yang bergerak dan menyatu pada panel gelap berkontras tinggi, lalu wordmark muncul tanpa progress bar.
- Logo navbar landing memakai ukuran eksplisit 30 px agar proporsional.
- Carousel fitur landing bergeser langsung setiap sekitar 4,6 detik tanpa indikator progress/loading dan dijeda saat hover/focus.

## AI CFO Copilot

- Tombol **Riwayat** tidak lagi membuka drawer pada seluruh halaman dashboard.
- Riwayat chat tampil sebagai panel lokal berukuran kecil di sisi kanan kartu AI CFO.
- Chat area memakai tinggi fleksibel dan composer diberi posisi bawah kartu agar tidak menyisakan ruang kosong di bawah input.
- Chat baru, pilih room, hapus room, dan bersihkan room tetap tersedia.
- Riwayat tetap menggunakan `localStorage` browser dan belum disimpan ke database.

## Master SDM

- Tombol **Kelola Divisi & Jabatan** tersedia pada SDM & Payroll.
- Dialog master mendukung tambah, ubah, pencarian, aktif/nonaktif, dan hapus divisi atau jabatan.
- Penghapusan diblokir bila master masih dipakai pegawai atau relasi jabatan.
- Finance Manager dan HR dapat memakai endpoint master SDM sesuai izin server.

## Topbar

- Lonceng notifikasi di topbar dihapus agar fokus pada profil pengguna. Notifikasi dan preferensi terkait tetap tersedia dari modul/pengaturan yang memiliki izin.

## Dokumen

- `PRD_FinStart_Final.docx` direvisi menjadi versi 1.3 dan hanya menjelaskan fitur yang benar-benar tersedia pada aplikasi.
- `MANUAL_TESTING.md` memuat skenario splash, landing carousel, dan panel riwayat AI lokal.

## Pemasangan

- Tidak perlu import SQL baru.
- Saat menimpa source, pertahankan file `backend/.env` lokal.
- Jalankan `npm ci`/`npm install` dan `npm run dev` di folder backend serta frontend.
