# FinStart Frontend — Final Tersinkron

Aplikasi frontend Vue 3 + Vite untuk prototype sistem accounting startup **FinStart**.

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka alamat yang muncul di terminal (biasanya `http://localhost:5173`).

## Sinkronisasi data

Seluruh modul menggunakan satu Pinia store dan disimpan otomatis pada browser melalui `localStorage`.

Data berikut saling terhubung:

- CRM & Proyek → klien/proyek aktif pada Dashboard dan AI.
- Buku Besar & Jurnal → saldo akun, Dashboard, AI, dan Laporan.
- Piutang → terbitkan invoice menambah piutang dan pendapatan; pelunasan menambah kas dan mengurangi piutang.
- Utang → persetujuan tagihan menambah beban dan utang; pembayaran mengurangi kas dan utang.
- Proyeksi → roadmap pada halaman Proyeksi dan Dashboard.
- Pajak → setoran mengurangi kas dan tercatat sebagai jurnal.
- SDM → payroll menambah beban dan mengurangi Bank BCA.
- Aset, langganan, pengaturan, serta data pengguna → tersimpan dan dibaca ulang setelah refresh.
- AI FinStart Assistant → rule-based dan membaca data live dari seluruh modul prototype yang tersimpan.

## Catatan

- Ini adalah frontend prototype dengan penyimpanan browser, belum memakai database atau API backend.
- AI FinStart Assistant adalah **rule-based data-aware assistant**, bukan koneksi ke Gemini/ChatGPT/API eksternal.
- Untuk mengembalikan data awal, hapus data situs/browser untuk aplikasi ini atau hapus key localStorage `finstartFinanceStateV3` dan `finstartAssistantChatV2`.
