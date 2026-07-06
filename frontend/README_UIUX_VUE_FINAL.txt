FINSTART — FRONTEND VUE UI/UX FINAL

Status:
- Seluruh komponen tampilan menggunakan Vue (.vue) dan JavaScript.
- Tidak ada file React (.tsx/.jsx) pada source application.
- Backend, API route, SQL, dan database tidak dimodifikasi.
- Default API frontend: http://localhost:4000/api
- Alur UI: Splash -> Landing -> Login -> Loading -> Dashboard -> Semua menu -> Logout.

Cara menjalankan:
1. Buat frontend/.env dari .env.example bila ingin menentukan VITE_API_URL.
2. Jalankan npm install.
3. Jalankan npm run dev.
4. Buka http://localhost:5173.

Catatan:
- UI login adalah alur tampilan karena backend source yang diberikan tidak memiliki endpoint autentikasi.
- Dashboard, CRM/Proyek, Buku Besar, Piutang, Utang, Langganan, Aset, Pajak,
  Proyeksi, dan Laporan membaca endpoint API yang sudah tersedia.
- SDM dan beberapa kontrol Settings menampilkan workspace UI tanpa endpoint baru;
  endpoint backend tidak ditambah/diubah.

Pemasangan aman:
- Replace folder frontend saja.
- Jangan replace folder backend.
- Simpan backup folder frontend sebelumnya sebelum memindahkan frontend ini.
