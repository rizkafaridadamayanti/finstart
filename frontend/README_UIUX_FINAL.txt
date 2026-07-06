FINSTART VUE – UI/UX FINAL

This frontend is built with Vue 3. The React UI/UX source was migrated into Vue
render components so the screen structure, classes, visual hierarchy, pages, and
flow match the supplied UI/UX source:

Splash → Landing Page → Login → Auth Loading → Dashboard → all modules → Logout.

Included modules:
Dashboard, CRM & Proyek, Buku Besar, Transaksi, Langganan, Piutang, Utang,
Proyeksi Bisnis, Perpajakan, SDM, Aset, Laporan, and Pengaturan.

DO NOT replace the backend folder. Your Node/Express API and MySQL database remain
in C:\laragon\www\finstart\backend.

INSTALL:
1. Keep a backup of the existing frontend folder.
2. Put this frontend folder into C:\laragon\www\finstart\frontend.
3. Run: npm install
4. Run: npm run dev
5. Open: http://localhost:5173

Note: The visual UI flow and client-side interactions are included. Backend/API
integration is intentionally not changed in this UI-only package.
