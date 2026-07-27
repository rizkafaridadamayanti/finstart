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

# migrate: jalankan migration Drizzle (aman diulang, skip yang sudah tercatat)
# seed-demo-user: jaring pengaman supaya demo user selalu ada; tidak menimpa
# password/akun yang sudah ada, dan tidak menghentikan start jika gagal
# (mis. DEMO_USER_PASSWORD belum diisi tapi user demo sudah ada dari dump).
CMD ["sh", "-c", "node scripts/migrate.js && (node scripts/seed-demo-user.js || echo 'Seed demo user dilewati') && node index.js"]
