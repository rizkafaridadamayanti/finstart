$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root 'backend'
$Frontend = Join-Path $Root 'frontend'

if (-not (Test-Path (Join-Path $Backend '.env'))) {
  Write-Host 'Konfigurasi belum dibuat. Jalankan SETUP_DAN_JALANKAN.bat terlebih dahulu.' -ForegroundColor Yellow
  exit 1
}
if (-not (Test-Path (Join-Path $Backend 'node_modules'))) {
  Write-Host 'Dependency backend belum terpasang. Jalankan SETUP_DAN_JALANKAN.bat terlebih dahulu.' -ForegroundColor Yellow
  exit 1
}
if (-not (Test-Path (Join-Path $Frontend 'node_modules'))) {
  Write-Host 'Dependency frontend belum terpasang. Jalankan SETUP_DAN_JALANKAN.bat terlebih dahulu.' -ForegroundColor Yellow
  exit 1
}

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

$backendCommand = 'cd /d "' + $Backend + '" && npm run dev'
$frontendCommand = 'cd /d "' + $Frontend + '" && npm run dev'
Start-Process cmd.exe -ArgumentList '/k', $backendCommand
Start-Sleep -Seconds 2
Start-Process cmd.exe -ArgumentList '/k', $frontendCommand
Start-Sleep -Seconds 4
Start-Process 'http://localhost:5173'
Write-Host 'FinStart sedang dijalankan di http://localhost:5173' -ForegroundColor Green
