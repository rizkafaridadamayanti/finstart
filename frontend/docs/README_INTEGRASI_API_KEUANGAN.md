# FinStart — Integrasi Data Keuangan ke API

Paket ini mempertahankan tampilan, layout, aset, dan alur UI/UX Vue yang sudah ada.
Perubahan hanya berada pada pengambilan dan penyimpanan data keuangan agar memakai API
backend FinStart di `http://localhost:4000/api`.

## Koneksi API

Frontend memakai:

```env
VITE_API_URL=http://localhost:4000/api
```

Nilai tersebut sudah tersedia di `.env.example`. Bila tidak dibuatkan file `.env`, frontend
tetap menggunakan alamat yang sama sebagai fallback.

Jalankan frontend pada port `5173`. Backend yang ada memang mengizinkan origin tersebut
melalui `CORS_ORIGIN=http://localhost:5173`.

## Data yang sekarang bersumber dari database/API

- Dashboard: `/dashboard/summary`
- CRM & Proyek: `/clients`, `/projects`
- Buku Besar & Jurnal: `/accounts`, `/journal-transactions`, `/journals`
- Piutang: `/invoices`
- Utang: `/bills`
- Langganan: `/subscriptions`
- Aset: `/assets`
- Pajak: `/taxes`, `/taxes/summary`, `/taxes/calculation`
- Proyeksi: `/projections`
- Laporan: `/reports`

Tambah, ubah, posting, pelunasan, dan pembayaran pada modul di atas juga dikirim ke API
yang sudah tersedia. Setelah request berhasil, daftar serta ringkasan dimuat ulang dari
database agar tampilan mengikuti data nyata.

## Yang sengaja tidak diubah

- Folder `backend`
- Route API, SQL, database, dan file `.env` backend
- CSS, susunan layout, aset, menu, landing page, login, loading screen, dashboard,
  seluruh halaman UI/UX, dan logout
- Payroll/SDM: masih memakai data sementara karena Master Data Operasional belum tersedia.
  Modul payroll tidak diberi endpoint baru dan tidak dipaksa menggunakan data dummy lain.

## Menjalankan

1. Jalankan backend yang sudah ada:

   ```bat
   cd C:\laragon\www\finstart\backend
   npm run dev
   ```

2. Jalankan frontend ini:

   ```bat
   cd C:\laragon\www\finstart\frontend
   npm install
   npm run build
   npm run dev
   ```

3. Buka `http://localhost:5173`.

Jika port `5173` sedang dipakai, tutup Vite frontend lain terlebih dahulu. Konfigurasi
frontend memakai `strictPort`, sehingga Vite tidak akan pindah diam-diam ke `5174` dan
mengalami masalah CORS.
