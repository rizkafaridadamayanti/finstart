# FinStart Frontend

Frontend FinStart menggunakan Vue 3 Single File Component, Composition API, dan Vite. Semua halaman ditulis dengan `<template>` dan `<script setup>`.

Struktur utama:

- `src/App.vue`: komposisi layar dan layout aplikasi.
- `src/composables/useFinStartApp.ts`: state global dan integrasi API.
- `src/composables/useFinStartContext.ts`: penyedia action untuk modul.
- `src/components/`: logic dan tampilan setiap workspace.
- `src/services/`: client API dan mapper response.
- `src/utils/`: utilitas bersama.

Menjalankan frontend:

```bash
npm ci
npm run dev
```

Build produksi:

```bash
npm run build
```
