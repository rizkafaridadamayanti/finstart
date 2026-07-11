# FinStart Final Vue Native

FinStart adalah aplikasi internal keuangan berbasis **Vue 3 native**, Express, MySQL, dan Drizzle ORM. Tampilan modern versi awal tetap dipertahankan; perubahan final berfokus pada struktur kode, keamanan API, migration, seeder, audit kode tidak terpakai, dan optimasi bundle.

Pada revisi ini, seluruh 24 Single File Component telah diaudit sebagai Vue native. Semua inline arrow function di template telah dihapus, event memakai pemanggilan method atau ekspresi Vue, form memakai binding Vue, dan overlay menggunakan event modifier ketika diperlukan. Tidak ada React, JSX, atau TSX. CSS, kelas tampilan, warna, aset, dan susunan visual tidak diganti.

## Menjalankan paling mudah di Windows/Laragon

1. Ekstrak ZIP ke `C:\laragon\www\` sehingga menjadi `C:\laragon\www\finstart`.
2. Nyalakan MySQL pada Laragon.
3. Klik dua kali `SETUP_DAN_JALANKAN.bat`.
4. Isi konfigurasi database saat diminta.
5. Setelah setup pertama selesai, berikutnya cukup klik `JALANKAN_FINSTART.bat`.

Tidak perlu menjalankan `npm install` secara manual. Script setup menjalankan `npm ci`, pemeriksaan backend, ESLint, `vue-tsc`, build frontend, migration sesuai pilihan, dan seeder user demo.

## Database pengujian

Untuk folder percobaan gunakan database terpisah, misalnya `finstart_test`. Jangan menggunakan database produksi/asli ketika menguji migration atau seeder.

## Perintah pemeriksaan

Frontend:

```bat
cd frontend
npm run check:vue-native
npm run lint
npm run typecheck
npm run build
npm run check
```

Backend:

```bat
cd backend
npm run db:check
npm test
```

## Drizzle ORM

Seluruh 36 tabel aplikasi didefinisikan di `backend/db/schema.js`. Migration yang sudah digunakan tetap berada di `backend/drizzle/migrations` agar instalasi lama tidak terputus. Untuk perubahan schema baru, ubah `db/schema.js`, lalu jalankan:

```bat
cd backend
npm run db:check
npm run db:generate
```

`db:generate` menghasilkan draft perbandingan schema di `backend/drizzle/generated`. Setelah direview, buat migration berurutan melalui `npm run db:new -- nama_perubahan`, masukkan SQL yang diperlukan, lalu jalankan `npm run db:migrate`. Cara ini mempertahankan riwayat migration lama yang sudah digunakan.

## Keamanan

File `.env`, password, token, `node_modules`, dan hasil build tidak disertakan dalam ZIP. Password demo hanya ditulis pada `backend/.env` lokal, kemudian di-hash oleh seeder sebelum disimpan ke database.

Setelah source dipindahkan ke repository asli, jalankan `CEK_KEAMANAN_GIT.bat` untuk memastikan `.env` tidak sedang dilacak Git.
