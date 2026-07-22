FROM node:20-alpine

WORKDIR /app

# context build = root project, jadi arahkan ke folder backend/
COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/. .

EXPOSE 4000

CMD ["node", "index.js"]