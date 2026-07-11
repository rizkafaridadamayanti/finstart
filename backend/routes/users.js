const express = require('express')
const db = require('../config/db')
const { hashPassword } = require('../utils/password')

const router = express.Router()
const STATUS = new Set(['active', 'inactive'])
const INTERNAL_ROLE = 'finance_manager'
const INTERNAL_DESCRIPTION = 'Keuangan Internal - satu jenis akses internal, dapat digunakan oleh banyak akun bagian keuangan.'

function text(value, max = 255) {
  const result = String(value ?? '').trim()
  return result ? result.slice(0, max) : null
}

function normalizeEmail(value) {
  const email = text(value, 150)?.toLowerCase() || null
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

async function ensureInternalRole() {
  await db.query('INSERT IGNORE INTO roles (name, description) VALUES (?, ?)', [INTERNAL_ROLE, INTERNAL_DESCRIPTION])
  await db.query('UPDATE roles SET description = ? WHERE name = ?', [INTERNAL_DESCRIPTION, INTERNAL_ROLE])
  const [rows] = await db.query('SELECT id, name FROM roles WHERE name = ? LIMIT 1', [INTERNAL_ROLE])
  return rows[0] || null
}

async function getUser(id) {
  const [rows] = await db.query(
    `SELECT users.id, users.name, users.email, users.phone, users.status, users.role_id,
            users.last_login_at, users.created_at, users.updated_at, roles.name AS role_name,
            roles.description AS role_description
     FROM users LEFT JOIN roles ON roles.id = users.role_id
     WHERE users.id = ? LIMIT 1`,
    [id],
  )
  return rows[0] || null
}

router.get('/', async (_req, res) => {
  try {
    const role = await ensureInternalRole()
    const [rows] = await db.query(
      `SELECT users.id, users.name, users.email, users.phone, users.status, users.role_id,
              users.last_login_at, users.created_at, users.updated_at, roles.name AS role_name,
              (SELECT COUNT(*) FROM auth_sessions s WHERE s.user_id = users.id AND s.revoked_at IS NULL AND s.expires_at > NOW()) AS active_session_count
       FROM users LEFT JOIN roles ON roles.id = users.role_id
       ORDER BY users.status = 'active' DESC, users.name ASC`,
    )
    const data = rows.map((row) => ({
      ...row,
      role_id: role?.id || row.role_id,
      role_name: INTERNAL_ROLE,
      active_session_count: Number(row.active_session_count || 0),
    }))
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pengguna.'})
  }
})

router.post('/', async (req, res) => {
  try {
    const role = await ensureInternalRole()
    const name = text(req.body?.name, 100)
    const email = normalizeEmail(req.body?.email)
    const password = String(req.body?.password || '')
    const phone = text(req.body?.phone, 30)
    const status = String(req.body?.status || 'active').toLowerCase()
    if (!name || !email || password.length < 8 || !STATUS.has(status) || !role?.id) {
      return res.status(422).json({ success: false, message: 'Nama, email valid, status, dan password minimal 8 karakter wajib diisi.' })
    }
    const [result] = await db.query(
      `INSERT INTO users (role_id, name, email, password_hash, phone, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [role.id, name, email, hashPassword(password), phone, status],
    )
    res.status(201).json({ success: true, message: 'Pengguna Keuangan Internal berhasil dibuat.', data: await getUser(result.insertId) })
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ success: false, message: error.code === 'ER_DUP_ENTRY' ? 'Email sudah digunakan.' : 'Gagal membuat pengguna.'})
  }
})

router.put('/:id', async (req, res) => {
  try {
    const role = await ensureInternalRole()
    const existing = await getUser(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' })
    const name = text(req.body?.name ?? existing.name, 100)
    const email = normalizeEmail(req.body?.email ?? existing.email)
    const phone = text(req.body?.phone ?? existing.phone, 30)
    const status = String(req.body?.status ?? existing.status).toLowerCase()
    if (!name || !email || !STATUS.has(status) || !role?.id) return res.status(422).json({ success: false, message: 'Data pengguna tidak valid.' })
    if (Number(existing.id) === Number(req.user.id) && status !== 'active') return res.status(422).json({ success: false, message: 'Anda tidak dapat menonaktifkan akun sendiri.' })
    await db.query('UPDATE users SET name = ?, email = ?, phone = ?, role_id = ?, status = ? WHERE id = ?', [name, email, phone, role.id, status, req.params.id])
    res.json({ success: true, message: 'Pengguna diperbarui.', data: await getUser(req.params.id) })
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ success: false, message: error.code === 'ER_DUP_ENTRY' ? 'Email sudah digunakan.' : 'Gagal memperbarui pengguna.'})
  }
})

router.patch('/:id/password', async (req, res) => {
  try {
    const existing = await getUser(req.params.id)
    const password = String(req.body?.password || '')
    if (!existing) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' })
    if (password.length < 8) return res.status(422).json({ success: false, message: 'Password minimal 8 karakter.' })
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(password), req.params.id])
    await db.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [req.params.id])
    res.json({ success: true, message: 'Password diubah dan sesi lama ditutup.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengubah password.'})
  }
})

module.exports = router
