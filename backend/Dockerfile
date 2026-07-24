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

CMD ["sh", "-c", "node scripts/migrate.js && node index.js"]
