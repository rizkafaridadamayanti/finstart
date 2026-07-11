@echo off
setlocal
cd /d "%~dp0"
title Selesaikan Replace FinStart
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0SELESAIKAN_REPLACE.ps1"
if errorlevel 1 (
  echo.
  echo Pembersihan belum berhasil. Baca pesan kesalahan di atas.
  pause
  exit /b 1
)
echo.
echo Replace selesai dan file lama sudah dibersihkan.
pause
endlocal
