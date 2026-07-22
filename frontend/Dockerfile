# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL di-"bake" ke dalam bundle saat build (Vite env var bersifat compile-time,
# bukan runtime), jadi harus dikirim sebagai build argument.
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Stage 2: Serve static build ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Package "serve" sudah terdaftar di dependencies, dipakai juga oleh Railway
# lewat script "start": "serve -s dist -l $PORT". Copy node_modules dari builder
# supaya "serve" beserta seluruh dependency transitifnya ikut tersedia.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "npx serve -s dist -l ${PORT}"]
