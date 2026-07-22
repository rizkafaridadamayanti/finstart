# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy file dependency dulu supaya cache layer lebih efisien
COPY package*.json ./

# Install semua dependency (termasuk devDependencies, dibutuhkan kalau ada proses build)
RUN npm ci

# Copy seluruh source code
COPY . .

# Kalau project punya proses build (misal TypeScript, Next.js, dll), jalankan ini.
# Kalau tidak ada script "build" di package.json, baris ini bisa dihapus/diabaikan.
RUN npm run build --if-present


# ---------- Stage 2: Production ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy hanya file yang diperlukan untuk runtime
COPY package*.json ./
RUN npm ci --omit=dev

# Copy hasil build/source dari stage sebelumnya
COPY --from=builder /app .

# Jalankan sebagai user non-root (lebih aman)
USER node

# Sesuaikan port dengan yang dipakai aplikasi (default umum: 3000)
EXPOSE 3000

# Sesuaikan entry point aplikasi kamu (index.js, server.js, app.js, dll)
CMD ["node", "index.js"]