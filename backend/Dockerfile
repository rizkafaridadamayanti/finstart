# ---------- FinStart Backend (Express + MySQL) ----------
FROM node:20-alpine

WORKDIR /app

# Copy file dependency dulu supaya layer cache npm install lebih efisien
COPY package*.json ./

# Install hanya dependency production (devDependencies seperti drizzle-kit tidak perlu di runtime)
RUN npm ci --omit=dev

# Copy seluruh source code backend
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

# migrate.js membuat struktur tabel, lalu seed chart-of-accounts & user login
# demo disiapkan (aman dijalankan berulang, pakai upsert/cek-dulu, tidak
# dobel). Data contoh/dummy (klien/proyek palsu dll) SENGAJA TIDAK ikut
# dijalankan di sini - database yang dipakai bisa jadi database asli yang
# sudah berisi data sungguhan, jangan disisipi data contoh.
# migrate.js dibuat "|| true" (tidak menghentikan container kalau gagal) -
# kalau database yang dipakai sudah lama/sudah ada isinya, tabel pelacak
# migrasi Drizzle kadang tidak sinkron walau strukturnya sudah benar; lebih
# baik lanjut start server daripada container terjebak crash-loop.
CMD ["sh", "-c", "node scripts/migrate.js || true; node scripts/seed-chart-of-accounts.js || true; node scripts/seed-demo-user.js || true; node index.js"]
