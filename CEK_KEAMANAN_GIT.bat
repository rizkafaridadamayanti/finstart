@echo off
setlocal
cd /d "%~dp0"
where git >nul 2>nul
if errorlevel 1 (
  echo Git tidak ditemukan di PATH.
  pause
  exit /b 1
)
if not exist ".git" (
  echo Folder ini belum menjadi repository Git aktif.
  echo Jalankan pemeriksaan ini setelah source ditempatkan di repository asli.
  pause
  exit /b 0
)
set "FOUND="
for /f "delims=" %%F in ('git ls-files ^| findstr /R /I "\(^\|/\)\.env$ \(^\|/\)\.env\.local$ \(^\|/\)\.env\.production$"') do (
  echo PERINGATAN: file environment masih dilacak Git: %%F
  set "FOUND=1"
)
if defined FOUND (
  echo.
  echo Hapus dari index Git dengan: git rm --cached nama-file-env
  pause
  exit /b 1
)
echo Aman: tidak ada file .env yang dilacak Git.
pause
endlocal
