FINSTART DIGITAL ACCOUNTING - CARA MENJALANKAN

1. Extract ZIP.
2. Buka folder finstart-frontend menggunakan VS Code.
3. Buka Terminal di VS Code.
4. Jalankan: npm install
5. Setelah selesai, jalankan: npm run dev
6. Buka alamat yang tampil, biasanya http://localhost:5173

CATATAN
- Vue DevTools sudah dihapus dari konfigurasi Vite, sehingga panel Vue di bagian bawah halaman tidak akan muncul.
- Logo aplikasi menggunakan file finstart-logo.png dari folder src/assets.
- Data disimpan di localStorage browser. Refresh tidak menghapus data.
- Untuk kembali ke data awal saat pengujian, buka DevTools browser > Application > Local Storage, lalu hapus key finstartFinanceStateV3.
