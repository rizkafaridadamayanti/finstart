require('dotenv').config()

const { createDrizzleDatabase } = require('../db/drizzle')
const { seedChartOfAccounts } = require('./seed-chart-of-accounts')
const { seedDemoUser } = require('./seed-demo-user')

async function main() {
  const { pool, db } = createDrizzleDatabase()

  try {
    await seedChartOfAccounts(db)
    await seedDemoUser(db)
    console.log('Seluruh data demo berhasil disiapkan melalui Drizzle seeder.')
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error('Seeder gagal:', error.message)
  process.exit(1)
})
