# Master Data FinStart

## Tabel Database
- `employees` — data pegawai, NIK, divisi, jabatan, status kerja, PTKP, BPJS, tanggal bergabung, dan gaji pokok.
- `divisions` — master divisi.
- `positions` — master jabatan.
- `bpjs_configurations` — konfigurasi tarif BPJS.
- `company_settings` — profil dan pengaturan perusahaan.

## Endpoint API

### Divisi
- GET `/api/divisions`
- GET `/api/divisions/:id`
- POST `/api/divisions`
- PUT `/api/divisions/:id`
- PATCH `/api/divisions/:id/status`

### Jabatan
- GET `/api/positions`
- GET `/api/positions/:id`
- POST `/api/positions`
- PUT `/api/positions/:id`
- PATCH `/api/positions/:id/status`

### Pegawai
- GET `/api/employees`
- GET `/api/employees/:id`
- POST `/api/employees`
- PUT `/api/employees/:id`
- PATCH `/api/employees/:id/status`

### BPJS
- GET `/api/bpjs-config`
- PUT `/api/bpjs-config`

### Pengaturan Perusahaan
- GET `/api/company-settings`
- PUT `/api/company-settings`

## Fitur Selesai
- Tambah pegawai tersimpan ke MySQL.
- Edit data pegawai tersimpan ke MySQL.
- Status pegawai aktif/nonaktif tersimpan ke MySQL.
- Dropdown divisi dan jabatan membaca database.
- Konfigurasi BPJS tersimpan ke database.
- Profil perusahaan pada Settings tersimpan ke database.
- Halaman Client dan Project tetap memakai API yang sudah ada.
- Data pegawai tidak lagi bergantung pada financeStore atau localStorage.