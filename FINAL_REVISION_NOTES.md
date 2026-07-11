# Catatan Revisi Final FinStart

## Frontend Vue Native

- Tampilan, warna, aset, susunan halaman, dan CSS modern tetap mengikuti versi desain awal.
- Seluruh antarmuka menggunakan Vue 3 Single File Component: `<template>`, `<script setup>`, props, emit, `ref`, `computed`, `watch`, lifecycle, serta provide/inject.
- Tidak terdapat React, JSX, TSX, `useState`, `useEffect`, `className`, atau event handler React.
- Handler client dan project berada langsung di `CrmView.vue`, yaitu komponen yang menggunakan fungsi tersebut.
- Seluruh 24 komponen `.vue` telah diaudit dan tidak memiliki inline arrow function pada template.
- Event template menggunakan method Vue bernama, `$event`, `v-model`, dan event modifier yang sesuai.
- `App.vue` hanya berperan sebagai orchestrator aplikasi; handler domain dipisahkan ke komponen atau composable terkait.
- ESLint, Vue TypeScript checking, audit Vue-native, audit file legacy, dan production build tersedia dalam satu perintah: `npm run check`.
- Import, variable, fungsi, duplicate object key, dan source lama yang tidak digunakan telah dibersihkan.
- Halaman besar menggunakan dynamic import tanpa mengubah tampilan.
- Initial JavaScript chunk sekitar 222 KB sebelum gzip.

## Backend dan Database

- Detail error SQL tidak dikirim ke response API. Pesan umum dikirim ke client, sedangkan detail teknis dicatat di server.
- Terdapat 38 migration Drizzle berurutan untuk version control database.
- `backend/db/schema.js` mendefinisikan seluruh tabel aplikasi.
- Sumber resmi struktur database hanya `backend/db/schema.js` dan `backend/drizzle/migrations`.
- Dump `database/finstart_db.sql`, `database/finstart_db_final_seed.sql`, migration SQL lama, dan `backend/database/seed_coa.sql` tidak disertakan lagi.
- Data COA dipindahkan ke Drizzle seeder `backend/scripts/seed-chart-of-accounts.js`.
- Demo user disiapkan melalui Drizzle seeder `backend/scripts/seed-demo-user.js`.
- Password demo dibaca dalam plain text dari `DEMO_USER_PASSWORD` di `.env`, di-hash di seeder, lalu disimpan sebagai `password_hash`.
- `db:seed` menjalankan COA dan demo user; tersedia juga `db:seed:coa` dan `db:seed:user`.
- `.env.example` tidak berisi default password dan `.env` diabaikan oleh Git.

## Kebersihan Repository

- Folder/file lama seperti `frontend/src/views`, `frontend/src/stores`, `WorkspacePage.vue`, `tablePagination.tsx`, dump SQL, dan seed SQL manual dihapus melalui pemasangan bersih.
- `npm run check:clean` memastikan file legacy tersebut tidak kembali masuk ke repository.
- Paket pemasangan bersih mempertahankan `.git`, `.gitignore`, file `.env`, uploads, dan storage.
- Installer tidak menjalankan migration atau seeder sehingga database `finstart_db` tidak diubah saat source code diganti.

## Verifikasi

- `npm run check:clean`: lulus.
- `npm run check:vue-native`: lulus untuk 24 SFC; arrow function pada template: 0.
- `npm run lint`: 0 error dan 0 warning.
- `npm run typecheck`: lulus.
- `npm run build`: lulus.
- `npm test`: 8/8 pengujian backend lulus.
- `npm run db:check`: schema Drizzle valid.
