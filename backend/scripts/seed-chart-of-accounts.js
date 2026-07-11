require('dotenv').config()

const { createDrizzleDatabase } = require('../db/drizzle')
const { accounts } = require('../db/schema')

const DEFAULT_ACCOUNTS = [
  { code: '1000', name: 'ASET', type: 'asset', normalBalance: 'debit' },
  { code: '1100', name: 'Aset Lancar', type: 'asset', normalBalance: 'debit' },
  { code: '1110', name: 'Kas', type: 'asset', normalBalance: 'debit' },
  { code: '1120', name: 'Bank', type: 'asset', normalBalance: 'debit' },
  { code: '1130', name: 'Piutang Usaha', type: 'asset', normalBalance: 'debit' },
  { code: '1140', name: 'Uang Muka', type: 'asset', normalBalance: 'debit' },
  { code: '1200', name: 'Aset Tetap', type: 'asset', normalBalance: 'debit' },
  { code: '1210', name: 'Peralatan', type: 'asset', normalBalance: 'debit' },
  { code: '1220', name: 'Akumulasi Penyusutan', type: 'asset', normalBalance: 'credit' },
  { code: '2000', name: 'KEWAJIBAN', type: 'liability', normalBalance: 'credit' },
  { code: '2100', name: 'Utang Usaha', type: 'liability', normalBalance: 'credit' },
  { code: '2200', name: 'Utang Pajak', type: 'liability', normalBalance: 'credit' },
  { code: '2300', name: 'Pendapatan Diterima Dimuka', type: 'liability', normalBalance: 'credit' },
  { code: '3000', name: 'EKUITAS', type: 'equity', normalBalance: 'credit' },
  { code: '3100', name: 'Modal Pemilik', type: 'equity', normalBalance: 'credit' },
  { code: '3200', name: 'Laba Ditahan', type: 'equity', normalBalance: 'credit' },
  { code: '4000', name: 'PENDAPATAN', type: 'revenue', normalBalance: 'credit' },
  { code: '4100', name: 'Pendapatan Jasa', type: 'revenue', normalBalance: 'credit' },
  { code: '4200', name: 'Pendapatan Lain-lain', type: 'revenue', normalBalance: 'credit' },
  { code: '5000', name: 'BEBAN', type: 'expense', normalBalance: 'debit' },
  { code: '5100', name: 'Beban Gaji', type: 'expense', normalBalance: 'debit' },
  { code: '5200', name: 'Beban Operasional', type: 'expense', normalBalance: 'debit' },
  { code: '5210', name: 'Beban Sewa', type: 'expense', normalBalance: 'debit' },
  { code: '5220', name: 'Beban Utilitas', type: 'expense', normalBalance: 'debit' },
  { code: '5230', name: 'Beban Internet dan Software', type: 'expense', normalBalance: 'debit' },
  { code: '5240', name: 'Beban Transportasi', type: 'expense', normalBalance: 'debit' },
]

async function seedChartOfAccounts(db) {
  for (const account of DEFAULT_ACCOUNTS) {
    await db.insert(accounts).values({
      ...account,
      openingBalance: '0.00',
      currentBalance: '0.00',
      status: 'active',
      parentId: null,
    }).onDuplicateKeyUpdate({
      set: {
        name: account.name,
        type: account.type,
        normalBalance: account.normalBalance,
        status: 'active',
      },
    })
  }

  console.log(`${DEFAULT_ACCOUNTS.length} akun COA bawaan berhasil disiapkan.`)
}

async function main() {
  const { pool, db } = createDrizzleDatabase()
  try {
    await seedChartOfAccounts(db)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Seed COA gagal:', error.message)
    process.exit(1)
  })
}

module.exports = { DEFAULT_ACCOUNTS, seedChartOfAccounts }
