const express = require('express')
const db = require('../config/db')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 100), 1), 250)
    const moduleName = String(req.query.module || '').trim()
    const params = []
    const conditions = []
    if (moduleName) { conditions.push('activity_logs.module = ?'); params.push(moduleName) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await db.query(
      `SELECT activity_logs.*, users.name AS user_name, users.email AS user_email
       FROM activity_logs LEFT JOIN users ON users.id = activity_logs.user_id
       ${where} ORDER BY activity_logs.created_at DESC LIMIT ?`,
      [...params, limit],
    )
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil audit trail.'})
  }
})

module.exports = router
