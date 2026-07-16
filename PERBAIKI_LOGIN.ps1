$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root 'backend'

if (-not (Test-Path (Join-Path $Backend '.env'))) {
  throw 'backend/.env tidak ditemukan. Tempel paket ke project FinStart yang sudah memiliki backend/.env.'
}

$email = (Read-Host 'Masukkan email akun yang akan dipulihkan').Trim().ToLower()
while ($true) {
  $secure = Read-Host 'Masukkan password baru (minimal 8 karakter)' -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
  if ($password.Length -ge 8) { break }
  Write-Host 'Password minimal 8 karakter.' -ForegroundColor Yellow
}

$env:FINSTART_REPAIR_EMAIL = $email
$env:FINSTART_REPAIR_PASSWORD = $password
try {
  Push-Location $Backend
  npm.cmd run auth:repair
  if ($LASTEXITCODE -ne 0) { throw 'Pemulihan login gagal.' }
} finally {
  Pop-Location
  Remove-Item Env:FINSTART_REPAIR_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:FINSTART_REPAIR_PASSWORD -ErrorAction SilentlyContinue
  $password = $null
}

Write-Host 'Akun berhasil dipulihkan. Jalankan FinStart lalu login memakai password baru.' -ForegroundColor Green
