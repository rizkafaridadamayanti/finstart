@echo off
setlocal
cd /d "%~dp0"
title Setup dan Jalankan FinStart
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0SETUP_DAN_JALANKAN.ps1"
if errorlevel 1 (
  echo.
  echo Setup belum berhasil. Baca pesan kesalahan di atas.
  pause
)
endlocal
