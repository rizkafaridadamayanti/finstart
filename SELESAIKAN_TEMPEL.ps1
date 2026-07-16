$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root 'backend'
$Frontend = Join-Path $Root 'frontend'

if (-not (Test-Path (Join-Path $Backend 'package.json')) -or -not (Test-Path (Join-Path $Frontend 'package.json'))) {
  throw 'File harus ditempel langsung ke folder utama FinStart.'
}
if (-not (Test-Path (Join-Path $Backend '.env'))) {
  Write-Host 'PERINGATAN: backend/.env tidak ditemukan. Salin kembali .env lama sebelum menjalankan aplikasi.' -ForegroundColor Yellow
}

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Push-Location $Backend
try {
  npm.cmd ci --registry=https://registry.npmjs.org/ --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw 'npm ci backend gagal.' }
  npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw 'Pengujian backend gagal.' }
  npm.cmd run db:migrate
  if ($LASTEXITCODE -ne 0) { throw 'Migration database gagal.' }
} finally { Pop-Location }

Push-Location $Frontend
try {
  npm.cmd ci --registry=https://registry.npmjs.org/ --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw 'npm ci frontend gagal.' }
  npm.cmd run check
  if ($LASTEXITCODE -ne 0) { throw 'Pemeriksaan frontend gagal.' }
} finally { Pop-Location }

Write-Host ''
Write-Host 'Pemasangan selesai. Database, akun, password, .env, dan .git tidak diubah.' -ForegroundColor Green
Write-Host 'Jalankan JALANKAN_FINSTART.bat.' -ForegroundColor Cyan
Write-Host 'Bila akun memang sudah telanjur rusak, jalankan PERBAIKI_LOGIN.bat satu kali.' -ForegroundColor Yellow
