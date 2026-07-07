
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
| Finance Manager | `finance@kedata.id` | `kedata123` |

Segera ganti password awal setelah login pertama. Jangan gunakan akun awal pada deployment publik.

## Build dan pengujian

```bash
cd backend
npm test

cd ../frontend
npm run build
```

Dokumen uji manual ada di `docs/MANUAL_TESTING.md`.PRD_FinStart_Final.docx` sesuai dengan fungsi yang tersedia pada source ini.
- Tidak memerlukan import SQL baru. Saat menimpa source, pertahankan `backend/.env` lokal.
