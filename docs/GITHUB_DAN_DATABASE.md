# GitHub dan Database FinStart

## Database sebagai version control

Struktur database resmi berada pada `backend/drizzle/migrations`. Jalankan migration setelah mengambil source terbaru:

```bat
cd backend
npm install
npm run db:migrate
```

Setiap perubahan tabel atau kolom harus dibuat sebagai file migration baru. Route API tidak membuat atau mengubah tabel ketika request berjalan.

## Seeder pengguna demo

Salin `.env.example` menjadi `.env`, kemudian isi:

```env
DEMO_USER_EMAIL=finance@kedata.id
DEMO_USER_NAME=Finance Manager
DEMO_USER_PASSWORD=<isi-password-lokal>
```

Jalankan:

```bat
npm run db:seed
```

Password plain text hanya berada di `.env` lokal. Seeder meng-hash password sebelum melakukan insert atau update pengguna.

## File yang boleh masuk GitHub

- Source `backend/`, `frontend/`, dan `docs/`
- Migration di `backend/drizzle/migrations`
- `package.json`, `package-lock.json`, dan `.env.example`

## File yang tidak boleh masuk GitHub

- `.env`
- `node_modules/` dan `dist/`
- Folder `.git/` di dalam arsip distribusi
- Dump database lokal, backup SQL, token, secret MFA, atau password
