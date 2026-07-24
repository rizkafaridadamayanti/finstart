FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 4000

# Migration Drizzle aman dijalankan berulang (idempotent, dilacak lewat
# tabel __drizzle_migrations), begitu juga seed chart-of-accounts & user
# login demo (keduanya pakai upsert/cek-dulu, aman diulang tiap start).
# SENGAJA TIDAK menjalankan "db:seed" penuh - itu juga menyisipkan data
# dummy/contoh yang tidak seharusnya ada di deployment produksi.
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed:coa && npm run db:seed:user && node index.js"]
