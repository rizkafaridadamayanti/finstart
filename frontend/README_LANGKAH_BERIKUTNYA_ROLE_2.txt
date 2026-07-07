LANGKAH BERIKUTNYA UNTUK ORANG KEDUA (BACKEND & INTEGRASI)

PRIORITAS BERIKUTNYA ADALAH BACKEND, BUKAN MENAMBAH UI LAGI.

1. Buat backend Laravel dan database MySQL.
   Tabel inti: users, clients, projects, accounts, journal_entries, journal_lines, receivables, receivable_payments, payables, payable_payments, subscriptions, tax_obligations, employees, payrolls, assets, depreciation_logs, projection_targets.

2. Buat autentikasi dan role pengguna.
   Minimal: Owner, Finance Manager, Finance Staff, Project Manager.

3. Buat API transaksi yang bersifat atomik.
   - Terbitkan invoice: piutang + pendapatan + jurnal.
   - Terima pembayaran invoice: kas/bank + pengurangan piutang + jurnal.
   - Setujui dan bayar tagihan: utang + kas/bank + jurnal.
   - Setor pajak dan payroll: beban + kas/bank + jurnal.

4. Ganti penyimpanan localStorage dengan Axios ke API Laravel.
   Pinia tetap dipakai, tetapi sebagai state aplikasi dari API.

5. Buat validasi backend dan pengujian.
   Uji agar debit-kredit selalu seimbang, transaksi tidak ganda, nominal tidak negatif, dan saldo tidak berubah jika proses gagal.

6. Integrasikan AI setelah API siap.
   AI harus membaca data dari endpoint laporan, bukan hanya dari browser. Jangan menyimpan API key AI di Vue frontend.

7. Terakhir lakukan hosting dan dokumentasi API.
