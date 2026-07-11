@echo off
setlocal
cd /d "%~dp0"
title Jalankan FinStart
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0JALANKAN_FINSTART.ps1"
if errorlevel 1 pause
endlocal
