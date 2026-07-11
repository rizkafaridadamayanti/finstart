require('dotenv').config()

const { eq } = require('drizzle-orm')
const { createDrizzleDatabase } = require('../db/drizzle')
const { roles, users } = require('../db/schema')
const { hashPassword } = require('../utils/password')

const ROLE_NAME = 'finance_manager'
const ROLE_DESCRIPTION = 'Keuangan Internal - satu jenis akses internal untuk pengguna bagian keuangan.'

async function seedDemoUser(db) {
  const plainPassword = process.env.DEMO_USER_PASSWORD
  if (!plainPassword) {
    throw new Error('DEMO_USER_PASSWORD wajib diisi dalam backend/.env sebelum seeder user dijalankan.')
  }

  const email = String(process.env.DEMO_USER_EMAIL || 'finance@kedata.id').trim().toLowerCase()
  const name = String(process.env.DEMO_USER_NAME || 'Finance Manager').trim()
  const passwordHash = hashPassword(plainPassword)

  await db.insert(roles).values({ name: ROLE_NAME, description: ROLE_DESCRIPTION })
    .onDuplicateKeyUpdate({ set: { description: ROLE_DESCRIPTION } })

  const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, ROLE_NAME)).limit(1)
  if (!role) throw new Error('Role finance_manager tidak ditemukan.')

  await db.insert(users).values({
    roleId: role.id,
    name,
    email,
    passwordHash,
    status: 'active',
  }).onDuplicateKeyUpdate({
    set: { roleId: role.id, name, passwordHash, status: 'active' },
  })

  console.log(`Demo user berhasil disiapkan: ${email}`)
}

async function main() {
  const { pool, db } = createDrizzleDatabase()
  try {
    await seedDemoUser(db)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Seed demo user gagal:', error.message)
    process.exit(1)
  })
}

module.exports = { seedDemoUser }
