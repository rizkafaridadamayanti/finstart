const express = require('express')
const db = require('../config/db')

const router = express.Router()
const ALLOWED_STATUSES = new Set(['active', 'inactive'])

function cleanText(value, maxLength = 255) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, maxLength) : null
}

function normalizeCode(value, fallbackPrefix = 'DIV') {
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
  if (error?.code === 'ER_DUP_ENTRY') return fallback
  return null
}

async function getDivisionById(id) {
  const [rows] = await db.query(
    `
      SELECT
        d.*,
        COUNT(DISTINCT p.id) AS position_count,
        COUNT(DISTINCT e.id) AS employee_count
      FROM divisions d
      LEFT JOIN positions p ON p.division_id = d.id
      LEFT JOIN employees e ON e.division_id = d.id
      WHERE d.id = ?
      GROUP BY d.id
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
    const where = []
    const params = []

    if (status && status !== 'all') {
      if (!ALLOWED_STATUSES.has(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status divisi tidak valid.',
        })
      }

      where.push('d.status = ?')
      params.push(status)
    }

    if (search) {
      where.push('(d.code LIKE ? OR d.name LIKE ? OR COALESCE(d.description, \'\') LIKE ?)')
      const term = `%${search}%`
      params.push(term, term, term)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [rows] = await db.query(
      `
        SELECT
          d.*,
          COUNT(DISTINCT p.id) AS position_count,
          COUNT(DISTINCT e.id) AS employee_count
        FROM divisions d
        LEFT JOIN positions p ON p.division_id = d.id
        LEFT JOIN employees e ON e.division_id = d.id
        ${whereClause}
        GROUP BY d.id
        ORDER BY d.status = 'active' DESC, d.name ASC
      `,
      params,
    )

    res.json({
      success: true,
      message: 'Daftar divisi berhasil diambil.',
      data: rows.map((row) => ({
        ...row,
        position_count: Number(row.position_count || 0),
        employee_count: Number(row.employee_count || 0),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar divisi.',
      error: error.message,
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const division = await getDivisionById(req.params.id)

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Divisi tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      message: 'Detail divisi berhasil diambil.',
      data: {
        ...division,
        position_count: Number(division.position_count || 0),
        employee_count: Number(division.employee_count || 0),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail divisi.',
      error: error.message,
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const name = cleanText(req.body?.name, 120)
    const code = normalizeCode(req.body?.code)
    const description = cleanText(req.body?.description, 2000)
    const status = getStatus(req.body?.status)

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama divisi wajib diisi.',
      })
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status divisi hanya boleh active atau inactive.',
      })
    }

    const [result] = await db.query(
      `
        INSERT INTO divisions (code, name, description, status)
        VALUES (?, ?, ?, ?)
      `,
      [code, name, description, status],
    )

    const division = await getDivisionById(result.insertId)

    res.status(201).json({
      success: true,
      message: 'Divisi berhasil ditambahkan.',
      data: division,
    })
  } catch (error) {
    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: duplicateMessage(error, 'Kode atau nama divisi sudah digunakan.') || 'Gagal menambahkan divisi.',
      error: error?.code === 'ER_DUP_ENTRY' ? undefined : error.message,
    })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await getDivisionById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Divisi tidak ditemukan.',
      })
    }

    const name = cleanText(req.body?.name, 120)
    const code = normalizeCode(req.body?.code || existing.code)
    const description = cleanText(req.body?.description, 2000)
    const status = getStatus(req.body?.status, existing.status)

    if (!name || !status) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan status divisi wajib valid.',
      })
    }

    if (status === 'inactive' && Number(existing.employee_count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Divisi masih dipakai oleh pegawai. Pindahkan atau nonaktifkan pegawai terkait terlebih dahulu.',
      })
    }

    await db.query(
      `
        UPDATE divisions
        SET code = ?, name = ?, description = ?, status = ?
        WHERE id = ?
      `,
      [code, name, description, status, req.params.id],
    )

    const division = await getDivisionById(req.params.id)

    res.json({
      success: true,
      message: 'Divisi berhasil diperbarui.',
      data: division,
    })
  } catch (error) {
    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: duplicateMessage(error, 'Kode atau nama divisi sudah digunakan.') || 'Gagal memperbarui divisi.',
      error: error?.code === 'ER_DUP_ENTRY' ? undefined : error.message,
    })
  }
})

router.patch('/:id/status', async (req, res) => {
  try {
    const status = getStatus(req.body?.status)

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status divisi hanya boleh active atau inactive.',
      })
    }

    const existing = await getDivisionById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Divisi tidak ditemukan.',
      })
    }

    if (status === 'inactive' && Number(existing.employee_count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Divisi masih dipakai oleh pegawai. Pindahkan atau nonaktifkan pegawai terkait terlebih dahulu.',
      })
    }

    await db.query('UPDATE divisions SET status = ? WHERE id = ?', [status, req.params.id])
    const division = await getDivisionById(req.params.id)

    res.json({
      success: true,
      message: `Status divisi berhasil diubah menjadi ${status}.`,
      data: division,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status divisi.',
      error: error.message,
    })
  }
})


router.delete('/:id', async (req, res) => {
  try {
    const existing = await getDivisionById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Divisi tidak ditemukan.',
      })
    }

    if (Number(existing.employee_count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Divisi masih digunakan oleh pegawai. Pindahkan atau nonaktifkan pegawai terkait terlebih dahulu.',
      })
    }

    if (Number(existing.position_count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Divisi masih memiliki jabatan. Hapus atau pindahkan jabatan terkait terlebih dahulu.',
      })
    }

    await db.query('DELETE FROM divisions WHERE id = ?', [req.params.id])

    res.json({
      success: true,
      message: 'Divisi berhasil dihapus dari master data.',
      data: { id: Number(req.params.id) },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus divisi.',
      error: error.message,
    })
  }
})

module.exports = router
