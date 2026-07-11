# Database Migration dan Seeder FinStart

## Sumber Resmi Database

Struktur database hanya dikelola melalui:

- `backend/db/schema.js` sebagai Drizzle schema;
- `backend/drizzle/migrations` sebagai versioned migration;
- `backend/scripts/seed-chart-of-accounts.js` sebagai seeder COA;
- `backend/scripts/seed-demo-user.js` sebagai seeder demo user.

Dump database besar dan script SQL seed lama tidak digunakan lagi sebagai sumber instalasi.

## Perintah

```bat
npm run db:migrate
npm run db:seed
npm run db:seed:coa
npm run db:seed:user
npm run db:setup
npm run db:new -- nama_migration
npm run db:check
```

`db:seed` menjalankan seeder COA dan demo user. Sebelum menjalankan demo user seeder, isi `DEMO_USER_PASSWORD` di `backend/.env`. Password plain text hanya dibaca saat proses seed, kemudian di-hash sebelum disimpan ke database.

Pada database produksi atau database lama, buat backup terlebih dahulu dan jalankan migration secara terkontrol. Installer clean replace tidak menjalankan migration maupun seeder.
