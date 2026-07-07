const express = require('express')
const db = require('../config/db')

const router = express.Router()
const RESERVED_ROLES = new Set(['admin', 'finance_manager', 'finance', 'hr', 'tax', 'project_manager', 'director', 'auditor'])

function text(value, max = 255) {
  const result = String(value ?? '').trim()
  return result ? result.slice(0, max) : null
}

async function getRole(id) {
  const [rows] = await db.query(
    `SELECT roles.*, COUNT(users.id) AS user_count
     FROM roles LEFT JOIN users ON users.role_id = roles.id
     WHERE roles.id = ? GROUP BY roles.id LIMIT 1`,
    [id],
  )
  return rows[0] || null
}

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT roles.*, COUNT(users.id) AS user_count
       FROM roles LEFT JOIN users ON users.role_id = roles.id
       GROUP BY roles.id ORDER BY roles.name ASC`,
    )
    res.json({ success: true, data: rows.map((row) => ({ ...row, user_count: Number(row.user_count || 0) })) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil role.', error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const name = text(req.body?.name, 50)?.toLowerCase().replace(/\s+/g, '_')
    const description = text(req.body?.description, 255)
    if (!name) return res.status(422).json({ success: false, message: 'Nama role wajib diisi.' })
    const [result] = await db.query('INSERT INTO roles (name, description) VALUES (?, ?)', [name, description])
    res.status(201).json({ success: true, message: 'Role berhasil dibuat.', data: await getRole(result.insertId) })
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ success: false, message: error.code === 'ER_DUP_ENTRY' ? 'Nama role sudah digunakan.' : 'Gagal membuat role.', error: error.code === 'ER_DUP_ENTRY' ? undefined : error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await getRole(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Role tidak ditemukan.' })
    const description = text(req.body?.description, 255)
    await db.query('UPDATE roles SET description = ? WHERE id = ?', [description, req.params.id])
    res.json({ success: true, message: 'Deskripsi role diperbarui.', data: await getRole(req.params.id) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui role.', error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const existing = await getRole(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Role tidak ditemukan.' })
    if (RESERVED_ROLES.has(String(existing.name || '').toLowerCase())) {
      return res.status(422).json({ success: false, message: 'Role sistem tidak dapat dihapus.' })
    }
    if (Number(existing.user_count) > 0) {
      return res.status(422).json({ success: false, message: 'Role masih digunakan oleh pengguna.' })
    }
    await db.query('DELETE FROM roles WHERE id = ?', [req.params.id])
    res.json({ success: true, message: 'Role berhasil dihapus.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus role.', error: error.message })
  }
})

module.exports = router
