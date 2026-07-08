# Revisi Final 1-36 dari ZIP Awal

Perbaikan ini dibuat dari ZIP awal yang dikirim user dan hanya difokuskan pada 36 poin revisi.

## Konsep Hak Akses
- Sistem dibuat menggunakan satu jenis akses internal: Keuangan Internal.
- Bukan berarti hanya satu orang yang bisa login.
- Banyak akun login bagian keuangan tetap bisa dibuat, semua memakai role/akses yang sama.

## Ringkasan Poin Diperbaiki
1. Autentikasi dua langkah tersedia di Pengaturan > Keamanan.
2. Ubah kata sandi tersedia di Pengaturan > Keamanan.
3. Simpan perubahan pengaturan diperbaiki termasuk bulan awal tahun buku.
4. Jawaban AI dikunci mengikuti template.
5. Detail Tim Terlibat diberi penjelasan fungsi.
6. Klien baru di Inisiasi Proyek tidak dipakai; klien dipilih dari Klien Partner.
7. Registrasi klien baru tetap di halaman Klien Partner.
8. Search dibuat otomatis/reactive pada modul terkait.
9. Kolom kontak PIC dirapikan.
10. Button kategori langganan diperbaiki.
11. Search langganan diperbaiki.
12. Mata uang USD dan konversi kurs ditambahkan.
13. Riwayat transaksi langganan ditambahkan.
14. Edit aset tidak memindahkan halaman ke SaaS/Langganan.
15. Hapus/pelepasan aset diperbaiki.
16. Form daftarkan aset diperbaiki dengan PIC/penanggung jawab.
17. Proses penyusutan aset diperbaiki dan akun jurnal otomatis dipastikan tersedia.
18. Kolom aktif/nonaktif pegawai ditambahkan di SDM.
19. Hak akses dibuat 1 jenis role internal, multi akun login.
20. Atur BPJS dapat disimpan oleh akses internal.
21. Kelola divisi dan jabatan diperbaiki.
22. Form tambah pegawai diperbaiki.
23. Form proses payroll diperbaiki dan akun payroll otomatis dipastikan tersedia.
24. Notifikasi dipindahkan ke depan/tengah atas.
25. Button tab Langganan/Aset Teknologi ganda dihapus.
26. Aksi detail di Buku Besar ditambahkan.
27. Button tab Chart/Jurnal ganda dihapus.
28. Form Entri Jurnal Umum dirapikan.
29. Form Entri Jurnal Umum dibuat reactive dan validasi debit/kredit diperbaiki.
30. Catat pelunasan diperkuat melalui akun kas/bank fallback.
31. Tambah target proyeksi bisnis diperbaiki.
32. Aksi edit target proyeksi bisnis ditambahkan.
33. Button laporan dirapikan.
34. Menu mata uang, tombol kurs Google, dan kalkulator kurs ditambahkan di Langganan.
35. Landing page card diberi animasi otomatis dan efek pop-up.
36. Splash screen dibuat dengan animasi garis menyatu membentuk logo lalu muncul nama aplikasi dan perusahaan.

## Validasi
- Frontend: npm run build berhasil.
- Backend: node --check pada file route/middleware yang diubah berhasil.

## Revisi lanjutan sesuai temuan terakhir

1. Button Autentikasi Dua Langkah diperkuat: backend sekarang membuat kode setup MFA, frontend menampilkan modal aktivasi, validasi 6 digit, dan tombol Konfirmasi MFA benar-benar mengirim kode ke endpoint `/auth/mfa/confirm`.
2. Riwayat Langganan diubah sesuai maksud: sekarang ada satu tombol **Riwayat Kadaluarsa** untuk menampung langganan yang tanggal perpanjangannya sudah lewat atau statusnya dihentikan/nonaktif. Tabel utama hanya menampilkan langganan aktif.
3. Form Kelola Divisi & Jabatan diubah menjadi overlay/modal di depan seperti form lain. Tombol **Simpan** dan **Batal** dibuat jelas dan tidak lagi berada sebagai panel samping.
4. Bug simpan Jabatan di backend diperbaiki. Sebelumnya endpoint tambah jabatan memakai variabel yang belum ada sehingga simpan bisa gagal.
5. Saat browser dikecilkan, tombol navigasi tidak lagi redundan: drawer desktop disembunyikan pada mobile, dan margin konten hanya aktif pada ukuran desktop.
