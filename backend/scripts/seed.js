require('dotenv').config()

const { createDrizzleDatabase } = require('../db/drizzle')
const { seedChartOfAccounts } = require('./seed-chart-of-accounts')
const { seedDemoUser } = require('./seed-demo-user')
const { seedDummyData } = require('./seed-dummy-data')

async function main() {
  const { pool, db } = createDrizzleDatabase({ multipleStatements: true })

  try {
    await seedChartOfAccounts(db)
    try {
      await seedDemoUser(db)
    } catch (err) {
      console.warn(`Seed demo user dilewati: ${err.message}`)
    }
    try {
      await seedDummyData()
    } catch (err) {
      console.warn(`Seed dummy data dilewati: ${err.message}`)
    }
    console.log('Seluruh data demo berhasil disiapkan melalui Drizzle seeder.')
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error('Seeder gagal:', error.message)
  process.exit(1)
})
