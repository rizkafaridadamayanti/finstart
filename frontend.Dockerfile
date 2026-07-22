# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL

# context build = root project, jadi arahkan ke folder frontend/
COPY frontend/package*.json ./
RUN npm install

COPY frontend/. .
RUN npm run build


# ---------- Stage 2: Serve ----------
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV PORT=80
EXPOSE 80

CMD ["npm", "run", "start"]