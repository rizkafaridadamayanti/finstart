$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root 'backend'
$Frontend = Join-Path $Root 'frontend'
$BackendEnv = Join-Path $Backend '.env'
$FrontendEnv = Join-Path $Frontend '.env'
$Cleanup = Join-Path $Root 'SELESAIKAN_REPLACE.ps1'
if (Test-Path $Cleanup) { & $Cleanup -Quiet }

function Write-Step([string]$Text) {
  Write-Host "`n=== $Text ===" -ForegroundColor Cyan
}

function Read-Default([string]$Prompt, [string]$Default) {
  $answer = Read-Host "$Prompt [$Default]"
  if ([string]::IsNullOrWhiteSpace($answer)) { return $Default }
  return $answer.Trim()
}

function Read-Secret([string]$Prompt, [bool]$AllowEmpty = $false) {
  while ($true) {
    $secure = Read-Host $Prompt -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
      $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
    if ($AllowEmpty -or -not [string]::IsNullOrWhiteSpace($plain)) { return $plain }
    Write-Host 'Nilai tidak boleh kosong.' -ForegroundColor Yellow
  }
}

function Quote-Env([string]$Value) {
  $escaped = $Value.Replace('\', '\\').Replace('"', '\"')
  return '"' + $escaped + '"'
}

function Write-Utf8NoBom([string]$Path, [string]$Content) {
  [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding($false)))
}

function Upsert-EnvValue([string]$Path, [string]$Key, [string]$Value) {
  $lines = @()
  if (Test-Path $Path) { $lines = @(Get-Content -LiteralPath $Path) }
  $replacement = "$Key=$(Quote-Env $Value)"
  $matched = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match ('^\s*' + [regex]::Escape($Key) + '\s*=')) {
      $lines[$i] = $replacement
      $matched = $true
    }
  }
  if (-not $matched) { $lines += $replacement }
  Write-Utf8NoBom $Path (($lines -join "`r`n") + "`r`n")
}

function Run-Npm([string]$Directory, [string[]]$Arguments) {
  Push-Location $Directory
  try {
    & npm.cmd @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "Perintah npm gagal di ${Directory}: npm $($Arguments -join ' ')"
    }
  } finally {
    Pop-Location
  }
}

Write-Host 'FINSTART - SETUP OTOMATIS' -ForegroundColor Green
Write-Host 'Pastikan Apache/MySQL Laragon sudah dinyalakan sebelum melanjutkan.'

if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
  throw 'Node.js belum terpasang atau belum masuk PATH. Pasang Node.js 20.19 atau lebih baru.'
}
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  throw 'npm tidak ditemukan pada PATH.'
}

$nodeText = (& node.exe -p "process.versions.node").Trim()
$parts = $nodeText.Split('.')
$major = [int]$parts[0]
$minor = if ($parts.Count -gt 1) { [int]$parts[1] } else { 0 }
if ($major -lt 20 -or ($major -eq 20 -and $minor -lt 19)) {
  throw "Versi Node.js Anda $nodeText. Gunakan Node.js 20.19 atau lebih baru."
}
Write-Host "Node.js $nodeText terdeteksi." -ForegroundColor Green

$envAlreadyExists = Test-Path $BackendEnv
$keepExisting = $false
if ($envAlreadyExists) {
  $choice = Read-Host 'backend/.env sudah ada. Pertahankan konfigurasi database lama? [Y/n]'
  $keepExisting = [string]::IsNullOrWhiteSpace($choice) -or $choice.Trim().ToLower() -eq 'y'
}

if (-not $keepExisting) {
  Write-Step 'Membuat konfigurasi lokal'
  $dbHost = Read-Default 'DB host' '127.0.0.1'
  $dbPort = Read-Default 'DB port' '3306'
  $dbName = Read-Default 'Nama database' 'finstart_db'
  $dbUser = Read-Default 'DB user' 'root'
  $dbPassword = Read-Secret 'DB password (tekan Enter jika kosong)' $true
  $demoEmail = Read-Default 'Email user demo' 'finance@kedata.id'
  $demoName = Read-Default 'Nama user demo' 'Finance Manager'
  $demoPassword = Read-Secret 'Password user demo (minimal 8 karakter)'
  while ($demoPassword.Length -lt 8) {
    Write-Host 'Password demo minimal 8 karakter.' -ForegroundColor Yellow
    $demoPassword = Read-Secret 'Password user demo'
  }

  $backendContent = @"
NODE_ENV=development
PORT=4000

DB_HOST=$(Quote-Env $dbHost)
DB_PORT=$(Quote-Env $dbPort)
DB_NAME=$(Quote-Env $dbName)
DB_USER=$(Quote-Env $dbUser)
DB_PASSWORD=$(Quote-Env $dbPassword)
DB_POOL_SIZE=10

CORS_ORIGIN=http://localhost:5173
AUTH_SESSION_HOURS=8
AUTH_RESET_TOKEN_MINUTES=30
AUTH_LOGIN_MAX_ATTEMPTS=5
AUTH_LOGIN_LOCK_MINUTES=1
AUTH_SHOW_RESET_TOKEN=false

DEMO_USER_EMAIL=$(Quote-Env $demoEmail)
DEMO_USER_NAME=$(Quote-Env $demoName)
DEMO_USER_PASSWORD=$(Quote-Env $demoPassword)
"@
  Write-Utf8NoBom $BackendEnv ($backendContent.Trim() + "`r`n")
} else {
  Write-Host 'Konfigurasi backend/.env lama dipertahankan.' -ForegroundColor Green
  $envRaw = Get-Content -LiteralPath $BackendEnv -Raw
  if ($envRaw -notmatch '(?m)^\s*DEMO_USER_PASSWORD\s*=\s*.+$' -or $envRaw -match '(?m)^\s*DEMO_USER_PASSWORD\s*=\s*(""|\s*)$') {
    $demoPassword = Read-Secret 'DEMO_USER_PASSWORD belum diisi. Masukkan password user demo (minimal 8 karakter)'
    while ($demoPassword.Length -lt 8) {
      Write-Host 'Password demo minimal 8 karakter.' -ForegroundColor Yellow
      $demoPassword = Read-Secret 'Password user demo'
    }
    Upsert-EnvValue $BackendEnv 'DEMO_USER_PASSWORD' $demoPassword
  }
}

if (-not (Test-Path $FrontendEnv)) {
  Write-Utf8NoBom $FrontendEnv "VITE_API_URL=http://localhost:4000/api`r`n"
}

Write-Step 'Menghentikan proses Node lama'
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Step 'Memasang dependency backend dari registry npm publik'
Run-Npm -Directory $Backend -Arguments @('ci', '--registry=https://registry.npmjs.org/', '--no-audit', '--no-fund')

Write-Step 'Memasang dependency frontend dari registry npm publik'
Run-Npm -Directory $Frontend -Arguments @('ci', '--registry=https://registry.npmjs.org/', '--no-audit', '--no-fund')

Write-Step 'Memverifikasi backend dan schema Drizzle'
Run-Npm -Directory $Backend -Arguments @('run', 'db:check')
Run-Npm -Directory $Backend -Arguments @('test')

Write-Step 'Memverifikasi Vue native, kode tidak terpakai, tipe, dan build frontend'
Run-Npm -Directory $Frontend -Arguments @('run', 'check')

$defaultMigration = if ($envAlreadyExists -and $keepExisting) { 'n' } else { 'y' }
$migrationChoice = Read-Host "Jalankan migration database? Gunakan Y untuk database baru/kosong [$defaultMigration]"
if ([string]::IsNullOrWhiteSpace($migrationChoice)) { $migrationChoice = $defaultMigration }
$runMigration = $migrationChoice.Trim().ToLower() -eq 'y'

if ($runMigration) {
  Write-Step 'Menjalankan migration Drizzle'
  Run-Npm -Directory $Backend -Arguments @('run', 'db:migrate')
} else {
  Write-Host 'Migration dilewati karena menggunakan database lama.' -ForegroundColor Yellow
}

$defaultSeed = if ($envAlreadyExists -and $keepExisting) { 'n' } else { 'y' }
$seedChoice = Read-Host "Jalankan seeder demo dan chart of accounts? [$defaultSeed]"
if ([string]::IsNullOrWhiteSpace($seedChoice)) { $seedChoice = $defaultSeed }
if ($seedChoice.Trim().ToLower() -eq 'y') {
  Write-Step 'Menjalankan seeder Drizzle'
  Run-Npm -Directory $Backend -Arguments @('run', 'db:seed')
} else {
  Write-Host 'Seeder dilewati.' -ForegroundColor Yellow
}

Write-Step 'Membuka backend dan frontend'
$backendCommand = 'cd /d "' + $Backend + '" && npm run dev'
$frontendCommand = 'cd /d "' + $Frontend + '" && npm run dev'
Start-Process cmd.exe -ArgumentList '/k', $backendCommand
Start-Sleep -Seconds 2
Start-Process cmd.exe -ArgumentList '/k', $frontendCommand
Start-Sleep -Seconds 4
Start-Process 'http://localhost:5173'

Write-Host "`nSetup selesai. Dua jendela terminal telah dibuka." -ForegroundColor Green
Write-Host 'Berikutnya cukup klik JALANKAN_FINSTART.bat.' -ForegroundColor Green
