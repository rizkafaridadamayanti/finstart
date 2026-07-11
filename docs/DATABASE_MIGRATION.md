# Migration dan Seeder FinStart

FinStart memakai **Drizzle ORM** untuk menjalankan migration MySQL secara berurutan dan untuk seeder pengguna demo. Seluruh perubahan struktur database disimpan di `backend/drizzle/migrations`, sedangkan status migration yang sudah dijalankan dicatat oleh Drizzle pada tabel `__drizzle_migrations`.

## Menyiapkan database

```bat
cd backend
copy .env.example .env
npm install
npm run db:migrate
npm run db:seed
```

`db:migrate` membuat database apabila belum tersedia lalu menjalankan migration yang belum pernah diterapkan. `db:seed` membaca credential demo dari `.env`, meng-hash `DEMO_USER_PASSWORD` melalui PBKDF2, kemudian melakukan upsert role dan pengguna. Password plain text dan hash demo tidak disimpan dalam repository.

## Menambahkan perubahan database

Buat migration baru dengan perintah berikut:

```bat
npm run db:new -- add_feature_table
```

Perintah tersebut membuat file migration berikutnya sekaligus mendaftarkannya pada journal Drizzle. Isi file SQL yang baru dibuat. Untuk beberapa statement, pisahkan setiap statement dengan baris:

```sql
--> statement-breakpoint
```

Setelah itu jalankan:

```bat
npm run db:migrate
```

Migration lama yang sudah pernah dijalankan tidak boleh diedit. Setiap perubahan berikutnya harus dibuat sebagai file migration baru agar histori database tetap konsisten di Git dan saat deployment.
