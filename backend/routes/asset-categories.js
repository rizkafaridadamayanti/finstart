const express = require('express')
const db = require('../config/db')

const router = express.Router()

function cleanText(value, maxLength = 255) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, maxLength) : null
}

function normalizeCode(value, fallbackPrefix = 'AST') {
  const text = cleanText(value, 50)
  if (!text) return `${fallbackPrefix}-${Date.now().toString().slice(-8)}`

  return text
    .toUpperCase()
    .replace(/[^A-Z0-9/-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

function duplicateMessage(error, fallback) {
  if (error?.code !== 'ER_DUP_ENTRY') return null

  const message = String(error?.sqlMessage || error?.message || '').toLowerCase()
  if (message.includes('uq_asset_categories_code') || message.includes("'code'")) {
    return 'Kode sudah digunakan.'
  }
  if (message.includes('uq_asset_categories_name') || message.includes("'name'")) {
    return 'Nama kategori sudah digunakan.'
  }

  return fallback
}

async function getCategoryById(id) {
  const [rows] = await db.query(
    `
      SELECT
        ac.*,
        COUNT(DISTINCT a.id) AS asset_count
      FROM asset_categories ac
      LEFT JOIN assets a ON a.category = ac.name AND a.status != 'disposed'
      WHERE ac.id = ?
      GROUP BY ac.id
      LIMIT 1
    `,
    [id],
  )

  return rows[0] || null
}

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim()
    const where = []
    const params = []

    if (search) {
      where.push("(ac.code LIKE ? OR ac.name LIKE ? OR COALESCE(ac.description, '') LIKE ?)")
      const term = `%${search}%`
      params.push(term, term, term)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [rows] = await db.query(
      `
        SELECT
          ac.*,
          COUNT(DISTINCT a.id) AS asset_count
        FROM asset_categories ac
        LEFT JOIN assets a ON a.category = ac.name AND a.status != 'disposed'
        ${whereClause}
        GROUP BY ac.id
        ORDER BY ac.name ASC
      `,
      params,
    )

    res.json({
      success: true,
      message: 'Daftar kategori aset berhasil diambil.',
      data: rows.map((row) => ({
        ...row,
        asset_count: Number(row.asset_count || 0),
        usage_count: Number(row.asset_count || 0),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar kategori aset.',
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const category = await getCategoryById(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori aset tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      message: 'Detail kategori aset berhasil diambil.',
      data: { ...category, asset_count: Number(category.asset_count || 0) },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail kategori aset.',
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const name = cleanText(req.body?.name, 120)
    const code = normalizeCode(req.body?.code)
    const description = cleanText(req.body?.description, 2000)

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi.',
      })
    }

    const [result] = await db.query(
      `
        INSERT INTO asset_categories (code, name, description)
        VALUES (?, ?, ?)
      `,
      [code, name, description],
    )

    const category = await getCategoryById(result.insertId)

    res.status(201).json({
      success: true,
      message: 'Kategori aset berhasil ditambahkan.',
      data: category,
    })
  } catch (error) {
    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: duplicateMessage(error, 'Kode sudah digunakan.') || 'Gagal menambahkan kategori aset.',
    })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await getCategoryById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Kategori aset tidak ditemukan.',
      })
    }

    const name = cleanText(req.body?.name, 120)
    const code = normalizeCode(req.body?.code || existing.code)
    const description = cleanText(req.body?.description, 2000)

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi.',
      })
    }

    await db.query(
      `
        UPDATE asset_categories
        SET code = ?, name = ?, description = ?
        WHERE id = ?
      `,
      [code, name, description, req.params.id],
    )

    if (name !== existing.name) {
      // Keep existing asset rows pointed at the renamed category (category is matched by name, not id).
      await db.query('UPDATE assets SET category = ? WHERE category = ?', [name, existing.name])
    }

    const category = await getCategoryById(req.params.id)

    res.json({
      success: true,
      message: 'Kategori aset berhasil diperbarui.',
      data: category,
    })
  } catch (error) {
    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: duplicateMessage(error, 'Kode sudah digunakan.') || 'Gagal memperbarui kategori aset.',
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const existing = await getCategoryById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Kategori aset tidak ditemukan.',
      })
    }

    if (Number(existing.asset_count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kategori masih digunakan oleh aset. Pindahkan kategori aset terkait terlebih dahulu.',
      })
    }

    await db.query('DELETE FROM asset_categories WHERE id = ?', [req.params.id])

    res.json({
      success: true,
      message: 'Kategori aset berhasil dihapus dari master data.',
      data: { id: Number(req.params.id) },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus kategori aset.',
    })
  }
})

module.exports = router
