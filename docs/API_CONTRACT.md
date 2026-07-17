# Kontrak API FinStart

## Informasi dasar

- Frontend: Vue 3 + Vite
- Backend: Node.js + Express
- Database: MySQL
- Base URL lokal: `http://localhost:4000/api`
- Respons sukses: `{ "success": true, "message": "...", "data": ... }`
- Semua endpoint selain health dan login membutuhkan header:

```text
Authorization: Bearer <token-sesi>
```

## Autentikasi dan keamanan

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/auth/login` | Login email/password dan menghasilkan token sesi server |
| GET | `/auth/me` | Profil, role, dan tab yang diizinkan |
| POST | `/auth/logout` | Mencabut sesi aktif saat ini |
| GET | `/auth/sessions` | Daftar sesi pengguna saat ini |
| DELETE | `/auth/sessions/:id` | Mencabut sesi tertentu |
| GET/PUT | `/auth/security-settings` | Preferensi alert keamanan |

## Role, pengguna, audit

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/roles` | Daftar role dan hak akses |
| GET | `/users` | Daftar pengguna |
| GET/PUT | `/users/:id` | Detail dan perubahan pengguna (admin) |
| GET | `/audit` | Aktivitas keamanan/transaksi (admin/auditor sesuai hak akses) |
| GET | `/notifications` | Notifikasi pengguna login |
| PATCH | `/notifications/:id/read` | Tandai notifikasi terbaca |

## Modul bisnis utama

| Modul | Endpoint utama |
|---|---|
| Klien | `/clients` |
| Proyek dan tim | `/projects`, `/projects/:id/close` — payload menerima `members[]`, `budget_amount`, dan `milestones[]`; anggota disimpan di `project_members`. Closing proyek membuat draft invoice final untuk sisa kontrak yang belum ditagih; kas tetap bertambah hanya saat pembayaran invoice dicatat. |
| COA | `/accounts` |
| Jurnal | `/journals`, `/journals/:id/approve`, `/journals/:id/post`; jurnal dapat diberi `division_id` untuk realisasi budget |
| Invoice/piutang | `/invoices`, `PUT /invoices/:id`, `/invoices/:id/issue`, `/invoices/:id/cancel`, `/invoices/:id/payments` |
| Tagihan/utang | `/bills`, `PUT /bills/:id`, `/bills/:id/issue`, `/bills/:id/cancel`, `/bills/:id/payments` |
| SDM | `GET/POST /employees`, `GET/PUT/PATCH/DELETE /employees/:id`; penghapusan ditolak bila pegawai sudah memiliki riwayat payroll, sehingga statusnya harus diubah menjadi `inactive`. Master Divisi dan Jabatan mendukung `GET/POST /divisions`, `GET/PUT/PATCH/DELETE /divisions/:id`, `GET/POST /positions`, dan `GET/PUT/PATCH/DELETE /positions/:id`; penghapusan ditolak bila data masih dipakai pegawai atau relasi master lain. |
| Payroll | `/payroll`, `/payroll/process-bulk`, `/payroll/:id/payslip`, `/payroll/export/bank-transfer` |
| Pajak | `/taxes`, `/taxes/:id/pay`, `/taxes/employee-pph21/calculate` |
| Aset | `/assets`, `PUT /assets/:id`, `/assets/:id/dispose`, `/assets/depreciate-batch`, `/assets/:id/depreciations` |
| Proyeksi | `/projections`, `/projections/scenarios`, `/projections/budgets` |
| Laporan | `GET /reports?period=YYYY-MM` mengembalikan Laba Rugi, Neraca, Arus Kas, Trial Balance, Buku Besar, umur piutang/utang, pajak, payroll, aset, dan profitabilitas proyek dalam satu payload. `GET /reports/periods` menampilkan periode jurnal `posted`. |

## Aturan akses utama

- Token yang tidak valid atau kedaluwarsa menerima `401`.
- Akses role yang tidak memiliki izin menerima `403`.
- Jurnal dibuat sebagai `draft` oleh pembuatnya.
- Pengguna tidak dapat menyetujui jurnal yang dibuat sendiri.
- Hanya role yang memiliki izin approve/post yang dapat menjalankan tahap tersebut.
- Mutasi yang sukses dicatat pada `activity_logs`; notifikasi pengguna dibuat pada `notifications`.

## Catatan integrasi

API ini belum menggantikan integrasi resmi DJP, Bank Persepsi, e-Faktur, SPT, payment gateway, email, atau bank reconciliation. Endpoint pajak hanya untuk pencatatan internal.
