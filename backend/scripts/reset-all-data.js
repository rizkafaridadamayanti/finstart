/*
  Mengosongkan SELURUH data operasional/transaksi (klien, proyek, invoice,
  tagihan, jurnal, aset, SDM/payroll, langganan, proyeksi, notifikasi, dst).
  TIDAK menyentuh: users, roles, accounts (chart of akun), company_settings,
  user_security_settings, bpjs_configurations - supaya masih bisa login dan
  akun/COA dasar tetap ada.

  PERINGATAN: operasi ini TIDAK BISA DIBATALKAN. Pastikan DB_HOST/DB_NAME di
  .env (atau env var yang di-inject) memang benar-benar mengarah ke database
  yang ingin dikosongkan sebelum menjalankan ini.

  Cara pakai:
    cd backend
    node scripts/reset-all-data.js --confirm
*/
require('dotenv').config()

const { createPool } = require('../db/drizzle')

const TABLES_TO_TRUNCATE = [
  'activity_logs',
  'asset_depreciations',
  'assets',
  'asset_categories',
  'auth_sessions',
  'bill_payments',
  'bill_items',
  'bills',
  'budget_allocations',
  'divisions',
  'employees',
  'financial_projections',
  'invoice_payments',
  'invoice_items',
  'invoices',
  'journal_lines',
  'journal_entries',
  'notifications',
  'payroll_tax_calculations',
  'payroll_records',
  'positions',
  'project_members',
  'projects',
  'projection_scenarios',
  'subscription_bill_runs',
  'subscriptions',
  'tax_records',
  'transaction_taxes',
  'vat_period_closings',
  'clients',
]

const TABLES_PRESERVED = [
  'users',
  'roles',
  'accounts',
  'company_settings',
  'user_security_settings',
  'bpjs_configurations',
]

async function main() {
  if (!process.argv.includes('--confirm')) {
    console.log('Tidak dijalankan. Tambahkan flag --confirm untuk benar-benar mengosongkan data:')
    console.log('  node scripts/reset-all-data.js --confirm')
    console.log('')
    console.log(`Target koneksi saat ini: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306} / db "${process.env.DB_NAME || 'finstart_db'}"`)
    console.log('Pastikan itu benar-benar database yang dimaksud sebelum menambahkan --confirm.')
    return
  }

  const pool = createPool()
  try {
    console.log(`Mengosongkan data di ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306} / db "${process.env.DB_NAME || 'finstart_db'}" ...`)

    await pool.query('SET FOREIGN_KEY_CHECKS = 0')
    for (const table of TABLES_TO_TRUNCATE) {
      await pool.query(`TRUNCATE TABLE \`${table}\``)
      console.log(`  - ${table}: dikosongkan`)
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1')

    console.log('')
    console.log('Selesai. Tabel berikut TIDAK disentuh (login & COA tetap ada):')
    for (const table of TABLES_PRESERVED) console.log(`  - ${table}`)
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error('Gagal mengosongkan data:', error.message)
  process.exit(1)
})
