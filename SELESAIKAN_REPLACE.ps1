param([switch]$Quiet)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path (Join-Path $Root 'backend/package.json')) -or
    -not (Test-Path (Join-Path $Root 'frontend/package.json'))) {
  throw 'Script harus dijalankan dari folder utama FinStart.'
}

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$wwwRoot = Split-Path $Root -Parent
$legacyBackup = Join-Path $wwwRoot "finstart_legacy_sql_$timestamp"
$hasLegacySql = $false

$legacySqlFolders = @(
  (Join-Path $Root 'database'),
  (Join-Path $Root 'backend/database')
)

foreach ($folder in $legacySqlFolders) {
  if (Test-Path $folder) {
    if (-not $hasLegacySql) {
      New-Item -ItemType Directory -Path $legacyBackup -Force | Out-Null
      $hasLegacySql = $true
    }
    $name = if ($folder -like '*backend\database') { 'backend_database' } else { 'database' }
    Move-Item -LiteralPath $folder -Destination (Join-Path $legacyBackup $name) -Force
  }
}

$legacyDirectories = @(
  'source',
  'frontend/src/views',
  'frontend/src/stores',
  'frontend/src/router',
  'frontend/src/compat',
  'frontend/src/data',
  'frontend/src/components/layout',
  'frontend/src/components/landing',
  'backend/drizzle/generated'
)

foreach ($relative in $legacyDirectories) {
  $target = Join-Path $Root $relative
  if (Test-Path $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
  }
}

$legacyFiles = @(
  'PASANG_FINAL_BERSIH.bat',
  'PASANG_FINAL_BERSIH.ps1',
  'PETUNJUK_PEMASANGAN.txt',
  'package-lock.json',
  'frontend/src/components/common/MetricCard.vue',
  'frontend/src/components/common/StatusBadge.vue',
  'frontend/src/components/common/ToastHost.vue',
  'frontend/src/components/common/WorkspacePage.vue',
  'frontend/src/components/dashboard/FinStartAssistant.vue',
  'frontend/src/composables/useToast.js',
  'frontend/src/services/api.js',
  'frontend/src/utils/tablePagination.tsx',
  'frontend/src/assets/finstart-logo-mark.png',
  'frontend/src/assets/finstrat-logo.svg',
  'frontend/src/assets/kedata-logo-transparent.png',
  'frontend/src/assets/kedata-logo.svg',
  'frontend/src/assets/reference-react.css'
)

foreach ($relative in $legacyFiles) {
  $target = Join-Path $Root $relative
  if (Test-Path $target) {
    Remove-Item -LiteralPath $target -Force
  }
}

if (-not $Quiet) {
  Write-Host 'Pembersihan file lama selesai.' -ForegroundColor Green
  Write-Host '.git, .gitignore, backend/.env, node_modules, uploads, dan storage tidak diubah.' -ForegroundColor Cyan
  if ($hasLegacySql) {
    Write-Host "SQL legacy dipindahkan ke: $legacyBackup" -ForegroundColor Yellow
  }
}
