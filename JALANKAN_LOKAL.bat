@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   FinStart - Jalankan Lokal (tanpa Docker)
echo ============================================
echo.
echo Pastikan MySQL (Laragon) sudah menyala sebelum lanjut.
pause

echo.
echo [1/4] Menjalankan migrasi database...
cd backend
call npm run db:migrate
if errorlevel 1 echo   (Dilewati - kemungkinan database sudah punya struktur ini sebelumnya)

echo.
echo [2/4] Menyiapkan chart of accounts...
call npm run db:seed:coa
if errorlevel 1 echo   (Dilewati - kemungkinan sudah pernah disiapkan sebelumnya)

echo.
echo [3/4] Menyiapkan user login demo...
call npm run db:seed:user
if errorlevel 1 echo   (Dilewati - kemungkinan user demo sudah ada sebelumnya)
cd ..

echo.
echo [4/4] Membuka backend dan frontend di jendela terpisah...
start "FinStart Backend (port 4000)" cmd /k "cd /d "%~dp0backend" && npm run dev"
start "FinStart Frontend (port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Backend  : http://localhost:4000
echo Frontend : http://localhost:5173
echo Login    : lihat DEMO_USER_EMAIL / DEMO_USER_PASSWORD di backend\.env
echo.
echo Tutup jendela backend/frontend untuk menghentikan aplikasi.
pause
exit /b 0
