const express = require('express')
const db = require('../config/db')

const router = express.Router()
const ALLOWED_STATUSES = new Set(['active', 'inactive'])

function cleanText(value, maxLength = 255) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, maxLength) : null
}

function normalizeCode(value, fallbackPrefix = 'POS') {
  const text = cleanText(value, 50)
  if (!text) return `${fallbackPrefix}-${Date.now().toString().slice(-8)}`

  return text
    .toUpperCase()
    .replace(/[^A-Z0-9/-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

function getStatus(value, fallback = 'active') {
  const status = String(value ?? fallback).trim().toLowerCase()
  return ALLOWED_STATUSES.has(status) ? status : null
}

function duplicateMessage(error, fallback) {
  if (error?.code !== 'ER_DUP_ENTRY') return null

  const message = String(error?.sqlMessage || error?.message || '').toLowerCase()
  if (message.includes('uq_positions_code') || message.includes("'code'")) {
    return 'Kode sudah digunakan.'
  }

  return fallback
}

async function getDivision(id) {
  if (!id) return null
  const [rows] = await db.query(
    'SELECT id, code, name, status FROM divisions WHERE id = ? LIMIT 1',
    [id],
  )
  return rows[0] || null
}

async function getPositionById(id) {
  const [rows] = await db.query(
    `
      SELECT
        p.*,
        d.code AS division_code,
        d.name AS division_name,
        COUNT(DISTINCT e.id) AS employee_count
      FROM positions p
      LEFT JOIN divisions d ON d.id = p.division_id
      LEFT JOIN employees e ON e.position_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
      LIMIT 1
    `,
    [id],
  )

  return rows[0] || null
}

router.get('/', async (req, res) => {
  try {
    const status = String(req.query.status || '').trim().toLowerCase()
    const search = String(req.query.search || '').trim()
    const divisionId = req.query.division_id ? Number(req.query.division_id) : null
    const where = []
    const params = []

    if (status && status !== 'all') {
      if (!ALLOWED_STATUSES.has(status)) {
        return res.status(400).json({ success: false, message: 'Status jabatan tidak valid.' })
      }
      where.push('p.status = ?')
      params.push(status)
    }

    if (divisionId) {
      where.push('(p.division_id = ? OR p.division_id IS NULL)')
      params.push(divisionId)
    }

    if (search) {
      where.push('(p.code LIKE ? OR p.name LIKE ? OR COALESCE(p.description, \'\') LIKE ?)')
      const term = `%${search}%`
      params.push(term, term, term)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const [rows] = await db.query(
      `
        SELECT
          p.*,
          d.code AS division_code,
          d.name AS division_name,
          COUNT(DISTINCT e.id) AS employee_count
        FROM positions p
        LEFT JOIN divisions d ON d.id = p.division_id
        LEFT JOIN employees e ON e.position_id = p.id
        ${whereClause}
        GROUP BY p.id
        ORDER BY p.status = 'active' DESC, d.name ASC, p.name ASC
      `,
      params,
    )

    res.json({
      success: true,
      message: 'Daftar jabatan berhasil diambil.',
      data: rows.map((row) => ({
        ...row,
        employee_count: Number(row.employee_count || 0),
        usage_count: Number(row.employee_count || 0),
      })),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar jabatan.'})
  }
})

router.get('/:id', async (req, res) => {
  try {
    const position = await getPositionById(req.params.id)
    if (!position) return res.status(404).json({ success: false, message: 'Jabatan tidak ditemukan.' })

    res.json({
      success: true,
      message: 'Detail jabatan berhasil diambil.',
      data: { ...position, employee_count: Number(position.employee_count || 0) },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail jabatan.'})
  }
})

router.post('/', async (req, res) => {
  try {
    const name = cleanText(req.body?.name, 120)
    const code = normalizeCode(req.body?.code)
    const description = cleanText(req.body?.description, 2000)
    const status = getStatus(req.body?.status)
    const divisionId = req.body?.division_id ? Number(req.body.division_id) : null

    if (!name || !status) {
      return res.status(400).json({ success: false, message: 'Nama dan status jabatan wajib valid.' })
    }

    if (divisionId) {
      const division = await getDivision(divisionId)
      if (!division) return res.status(400).json({ success: false, message: 'Divisi jabatan tidak ditemukan.' })
    }

    const [result] = await db.query(
      `INSERT INTO positions (division_id, code, name, description, status) VALUES (?, ?, ?, ?, ?)`,
      [divisionId, code, name, description, status],
    )

    res.status(201).json({
      success: true,
      message: 'Jabatan berhasil ditambahkan.',
      data: await getPositionById(result.insertId),
    })
  } catch (error) {
    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: duplicateMessage(error, 'Kode sudah digunakan.') || 'Gagal menambahkan jabatan.',
    })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await getPositionById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Jabatan tidak ditemukan.' })

    const name = cleanText(req.body?.name, 120)
    const code = normalizeCode(req.body?.code || existing.code)
    const description = cleanText(req.body?.description, 2000)
    const status = getStatus(req.body?.status, existing.status)
    const divisionId = req.body?.division_id ? Number(req.body.division_id) : null

    if (!name || !status) {
      return res.status(400).json({ success: false, message: 'Nama dan status jabatan wajib valid.' })
    }

    if (divisionId) {
      const division = await getDivision(divisionId)
      if (!division) return res.status(400).json({ success: false, message: 'Divisi jabatan tidak ditemukan.' })
    }

    await db.query(
      `UPDATE positions SET division_id = ?, code = ?, name = ?, description = ?, status = ? WHERE id = ?`,
      [divisionId, code, name, description, status, req.params.id],
    )

    res.json({ success: true, message: 'Jabatan berhasil diperbarui.', data: await getPositionById(req.params.id) })
  } catch (error) {
    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: duplicateMessage(error, 'Kode sudah digunakan.') || 'Gagal memperbarui jabatan.',
    })
  }
})

router.patch('/:id/status', async (req, res) => {
  try {
    const status = getStatus(req.body?.status)
    if (!status) return res.status(400).json({ success: false, message: 'Status jabatan hanya boleh active atau inactive.' })

    const existing = await getPositionById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: 'Jabatan tidak ditemukan.' })

    if (status === 'inactive' && Number(existing.employee_count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Jabatan masih dipakai pegawai. Ubah jabatan atau nonaktifkan pegawai terkait terlebih dahulu.',
      })
    }

    await db.query('UPDATE positions SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ success: true, message: `Status jabatan berhasil diubah menjadi ${status}.`, data: await getPositionById(req.params.id) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengubah status jabatan.'})
  }
})


router.delete('/:id', async (req, res) => {
  try {
    const existing = await getPositionById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Jabatan tidak ditemukan.',
      })
    }

    if (Number(existing.employee_count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Jabatan masih digunakan oleh pegawai. Ubah jabatan atau nonaktifkan pegawai terkait terlebih dahulu.',
      })
    }

    await db.query('DELETE FROM positions WHERE id = ?', [req.params.id])

    res.json({
      success: true,
      message: 'Jabatan berhasil dihapus dari master data.',
      data: { id: Number(req.params.id) },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus jabatan.',
    })
  }
})

module.exports = router
