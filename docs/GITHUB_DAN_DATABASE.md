# GitHub dan Database FinStart

Dokumen ini menjelaskan cara memasukkan source code final ke GitHub tanpa mengunggah kredensial atau folder besar.

## Database

- `database/finstart_db_final_seed.sql` adalah snapshot untuk **database kosong**.
- File tersebut tidak memuat sesi login, reset token, atau secret MFA.
- Untuk database `finstart_db` yang sudah terisi saat ini, **jangan import snapshot ini lagi**. Data dapat duplikat atau konflik.
- Backup sebelum perubahan:

```bat
mysqldump -u root -p finstart_db > backup_finstart_YYYYMMDD.sql
```

## File yang boleh masuk GitHub

- Source `backend/`, `frontend/src/`, `docs/`, dan `database/`
- `package.json`, `package-lock.json`
- `.env.example`

## File yang tidak boleh masuk GitHub

- `backend/.env` dan `frontend/.env`
- `node_modules/`, `frontend/dist/`, `.git/`
- Backup database pribadi (`*.sql` hasil export lokal), kecuali snapshot yang memang dipilih untuk project

`.gitignore` sudah menahan file runtime tersebut.

## Push branch feature ke GitHub

Dari folder root project:

```bat
cd C:\laragon\www\finstart
git status
git add .
git status
git commit -m "fix: laporan API, sidebar, dan konsistensi aksi tabel"
git push origin feature/integrasi-uiux-rizka
```

Setelah push selesai, buka repository GitHub, buat Pull Request dari `feature/integrasi-uiux-rizka` ke `main`, lalu merge. Setelah merge, tarik branch `main` pada komputer:

```bat
git checkout main
git pull origin main
```

Jangan pernah menjalankan `git add -f backend/.env`.
