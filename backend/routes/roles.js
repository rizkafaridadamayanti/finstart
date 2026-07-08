const express = require('express')
const db = require('../config/db')

const router = express.Router()
const INTERNAL_ROLE = 'finance_manager'
const INTERNAL_DESCRIPTION = 'Keuangan Internal - satu jenis akses internal, dapat digunakan oleh banyak akun bagian keuangan.'

function text(value, max = 255) {
  const result = String(value ?? '').trim()
  return result ? result.slice(0, max) : null
}

async function ensureInternalRole() {
  await db.query('INSERT IGNORE INTO roles (name, description) VALUES (?, ?)', [INTERNAL_ROLE, INTERNAL_DESCRIPTION])
  await db.query('UPDATE roles SET description = ? WHERE name = ?', [INTERNAL_DESCRIPTION, INTERNAL_ROLE])
  const [rows] = await db.query(
    `SELECT roles.*, COUNT(users.id) AS user_count
     FROM roles LEFT JOIN users ON users.role_id = roles.id
     WHERE roles.name = ? GROUP BY roles.id LIMIT 1`,
    [INTERNAL_ROLE],
  )
  return rows[0] ? { ...rows[0], user_count: Number(rows[0].user_count || 0) } : null
}

async function getRole(id) {
  const [rows] = await db.query(
    `SELECT roles.*, COUNT(users.id) AS user_count
     FROM roles LEFT JOIN users ON users.role_id = roles.id
     WHERE roles.id = ? GROUP BY roles.id LIMIT 1`,
    [id],
  )
  return rows[0] ? { ...rows[0], user_count: Number(rows[0].user_count || 0) } : null
}

router.get('/', async (_req, res) => {
  try {
    const role = await ensureInternalRole()
    res.json({ success: true, data: role ? [role] : [] })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil role.', error: error.message })
  }
})

router.post('/', async (_req, res) => {
  try {
    const role = await ensureInternalRole()
    res.status(200).json({ success: true, message: 'Hak akses dibuat 1 saja: Keuangan Internal.', data: role })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal membuat role internal.', error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await getRole(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Role tidak ditemukan.' })
    if (String(existing.name || '').toLowerCase() !== INTERNAL_ROLE) {
      return res.status(422).json({ success: false, message: 'Aplikasi hanya menggunakan role Keuangan Internal.' })
    }
    const description = text(req.body?.description, 255) || INTERNAL_DESCRIPTION
    await db.query('UPDATE roles SET description = ? WHERE id = ?', [description, req.params.id])
    res.json({ success: true, message: 'Deskripsi akses internal diperbarui.', data: await getRole(req.params.id) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui role.', error: error.message })
  }
})

router.delete('/:id', async (_req, res) => {
  res.status(422).json({ success: false, message: 'Role Keuangan Internal tidak dapat dihapus karena sistem hanya memakai 1 jenis akses.' })
})

module.exports = router
