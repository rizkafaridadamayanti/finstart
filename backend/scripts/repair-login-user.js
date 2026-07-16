require('dotenv').config()

const db = require('../config/db')
const { hashPassword } = require('../utils/password')

async function main() {
  const email = String(process.env.FINSTART_REPAIR_EMAIL || '').trim().toLowerCase()
  const password = String(process.env.FINSTART_REPAIR_PASSWORD || '')

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Email pemulihan tidak valid.')
  }
  if (password.length < 8) {
    throw new Error('Password baru minimal 8 karakter.')
  }

  const [rows] = await db.query('SELECT id, name, status FROM users WHERE email = ? LIMIT 1', [email])
  const user = rows[0]
  if (!user) throw new Error(`Akun ${email} tidak ditemukan.`)

  await db.query(
    'UPDATE users SET password_hash = ?, status = ? WHERE id = ?',
    [hashPassword(password), 'active', user.id],
  )
  await db.query(
    'UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
    [user.id],
  )

  console.log(`Login dipulihkan untuk ${email}. Semua sesi lama ditutup; silakan login memakai password baru.`)
}

main()
  .catch((error) => {
    console.error(`Pemulihan login gagal: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.end()
  })
