const express = require('express')
const db = require('../config/db')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100)
    const [rows] = await db.query(
      `SELECT id, title, message, type, is_read, reference_type, reference_id, created_at
       FROM notifications WHERE user_id = ? ORDER BY is_read ASC, created_at DESC LIMIT ?`,
      [req.user.id, limit],
    )
    res.json({ success: true, data: rows.map((row) => ({ ...row, is_read: Boolean(row.is_read) })) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi.', error: error.message })
  }
})

router.patch('/:id/read', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui notifikasi.', error: error.message })
  }
})

router.post('/read-all', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [req.user.id])
    res.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui notifikasi.', error: error.message })
  }
})

module.exports = router
