# Audit Vue Native Final

Jalankan pemeriksaan lengkap:

```bat
cd frontend
npm run check
```

Perintah tersebut menjalankan:

1. `check:clean` untuk menolak source legacy, store/view lama, JSX/TSX, dump database, dan seed SQL manual;
2. `check:vue-native` untuk menolak pola React dan arrow function di template Vue;
3. ESLint untuk unused import/variable/function dan duplicate object key;
4. Vue TypeScript checking;
5. production build.

Hasil final: **24 SFC lulus audit Vue native**, tidak ada inline arrow function pada template, tidak ada React/JSX/TSX, dan lint lulus tanpa error/warning.
