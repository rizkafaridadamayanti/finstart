# Panduan Uji Manual FinStart - Revisi 1.3

Lakukan uji pada database `finstart_db` setelah backend dan frontend berjalan. Catat hasil aktual dan screenshot untuk kebutuhan demo atau laporan pengujian.

| No. | Skenario | Langkah ringkas | Hasil yang diharapkan |
|---:|---|---|---|
| 1 | Splash screen | Buka ulang `http://localhost:5173`. | Tiga potongan logo bergerak dan menyatu menjadi logo FinStart yang jelas, wordmark tampil tanpa progress bar, lalu aplikasi berpindah ke landing atau dashboard bila sesi masih tersimpan. |
| 2 | Landing dan carousel | Buka landing page, tunggu beberapa detik, lalu arahkan pointer ke carousel fitur. | Kartu fitur berpindah langsung setiap beberapa detik tanpa indikator progress/loading. Autoplay berhenti sementara saat pointer/focus berada pada carousel dan berjalan lagi saat keluar. Logo navbar tetap kecil dan proporsional. |
| 3 | Login dan sesi | Login dengan akun valid dan tidak valid. | Login valid menerima sesi dari API; kredensial salah ditolak. |
| 4 | Sidebar aplikasi | Login, tutup sidebar desktop, lalu klik tombol garis tiga lagi. | Tombol tetap terlihat dan sidebar dapat dibuka kembali. Menu ditampilkan berdasarkan role. |
| 5 | Klien, proyek, dan tim | Buat/ubah klien dan proyek, tambahkan tim, milestone, dan budget. Refresh halaman. | Klien, proyek, tim, milestone, dan data terkait tetap tersimpan dari API. |
| 6 | Jurnal | Buat jurnal seimbang dan jurnal tidak seimbang. Lanjutkan alur approve/post sesuai role. | Jurnal tidak seimbang ditolak. Jurnal seimbang mengikuti status draft, approve, dan post. |
| 7 | Invoice, bill, dan pembayaran | Buat dokumen, terbitkan, pilih dokumen spesifik pada form pembayaran, lalu bayar sebagian. | Outstanding dan status dokumen diperbarui; nominal melebihi outstanding ditolak. |
| 8 | SDM, master data & payroll | Buka Kelola Divisi & Jabatan, tambah/ubah data, aktif/nonaktif, lalu uji hapus data yang tidak dipakai. Lanjutkan Detail/Ubah/Hapus pegawai. | Divisi/jabatan dapat dikelola melalui dialog master; data yang masih dipakai pegawai atau jabatan terkait tidak dapat dihapus. Aksi pegawai memakai mata, pensil, dan tempat sampah. |
| 9 | Aset dan pajak | Tambah/ubah aset, jalankan penyusutan bila role mengizinkan, lalu buka perpajakan. | Nilai aset dan riwayat tersedia; pencatatan pajak berjalan sebagai data internal. |
| 10 | Laporan | Pilih periode jurnal posted, buka Laba Rugi, Neraca, Arus Kas, Trial Balance, dan Buku Besar. | Nilai laporan berasal dari API/jurnal posted. Export Excel-compatible dan print browser dapat digunakan. |
| 11 | AI CFO Copilot | Di Dashboard, buat Chat baru, kirim pertanyaan, buka Riwayat, pilih room lain, hapus room, lalu tutup panel Riwayat. | Riwayat hanya muncul sebagai panel kecil di sisi kanan kartu AI CFO; tidak menutupi seluruh dashboard. Area pesan memakai ruang fleksibel dan composer berada di bagian bawah kartu. Room aktif dapat dibuka lagi. |
| 12 | Penyimpanan riwayat AI | Refresh browser setelah membuat chat. | Riwayat AI tetap ada pada browser yang sama. Riwayat tidak muncul sebagai data server atau antar perangkat. |

## Validasi source

```bash
cd backend
npm test

cd ../frontend
npm run build
```

Tes backend memeriksa hash password, MFA TOTP, jurnal seimbang, pembayaran parsial, PPN/PPh 23, PPh 21, dan RBAC. Uji manual tetap diperlukan untuk memeriksa integrasi API, database, tampilan, serta alur role pada browser.
