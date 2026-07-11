const express = require('express')
const db = require('../config/db')

const router = express.Router()

const allowedStatuses = ['active', 'inactive']

function cleanText(value) {
  if (typeof value !== 'string') return null

  const result = value.trim()
  return result === '' ? null : result
}

/*
  GET /api/clients
  Mengambil seluruh data client.
*/
router.get('/', async (req, res) => {
  try {
    const [clients] = await db.query(`
      SELECT
        id,
        company_name,
        pic_name,
        email,
        phone,
        industry,
        category,
        location,
        address,
        status,
        created_at,
        updated_at
      FROM clients
      ORDER BY id DESC
    `)

    res.json({
      success: true,
      message: 'Data client berhasil diambil',
      data: clients,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data client',
    })
  }
})

/*
  GET /api/clients/:id
  Mengambil detail satu client berdasarkan ID.
*/
router.get('/:id', async (req, res) => {
  try {
    const [clients] = await db.query(
      'SELECT * FROM clients WHERE id = ?',
      [req.params.id],
    )

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client tidak ditemukan',
      })
    }

    res.json({
      success: true,
      message: 'Detail client berhasil diambil',
      data: clients[0],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail client',
    })
  }
})

/*
  POST /api/clients
  Menambah client baru.
*/
router.post('/', async (req, res) => {
  try {
    const {
      company_name,
      pic_name,
      email,
      phone,
      industry,
      category,
      location,
      address,
      status,
    } = req.body

    const companyName = cleanText(company_name)
    const picName = cleanText(pic_name)
    const clientStatus = cleanText(status) || 'active'

    if (!companyName || !picName) {
      return res.status(422).json({
        success: false,
        message: 'Nama perusahaan dan nama PIC wajib diisi',
      })
    }

    if (!allowedStatuses.includes(clientStatus)) {
      return res.status(422).json({
        success: false,
        message: 'Status client harus active atau inactive',
      })
    }

    const [result] = await db.query(
      `
        INSERT INTO clients (
          company_name,
          pic_name,
          email,
          phone,
          industry,
          category,
          location,
          address,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        companyName,
        picName,
        cleanText(email),
        cleanText(phone),
        cleanText(industry),
        cleanText(category),
        cleanText(location),
        cleanText(address),
        clientStatus,
      ],
    )

    const [newClient] = await db.query(
      'SELECT * FROM clients WHERE id = ?',
      [result.insertId],
    )

    res.status(201).json({
      success: true,
      message: 'Client berhasil ditambahkan',
      data: newClient[0],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan client',
    })
  }
})

/*
  PUT /api/clients/:id
  Mengubah data client berdasarkan ID.
*/
router.put('/:id', async (req, res) => {
  try {
    const {
      company_name,
      pic_name,
      email,
      phone,
      industry,
      category,
      location,
      address,
      status,
    } = req.body

    const companyName = cleanText(company_name)
    const picName = cleanText(pic_name)
    const clientStatus = cleanText(status) || 'active'

    if (!companyName || !picName) {
      return res.status(422).json({
        success: false,
        message: 'Nama perusahaan dan nama PIC wajib diisi',
      })
    }

    if (!allowedStatuses.includes(clientStatus)) {
      return res.status(422).json({
        success: false,
        message: 'Status client harus active atau inactive',
      })
    }

    const [result] = await db.query(
      `
        UPDATE clients
        SET
          company_name = ?,
          pic_name = ?,
          email = ?,
          phone = ?,
          industry = ?,
          category = ?,
          location = ?,
          address = ?,
          status = ?
        WHERE id = ?
      `,
      [
        companyName,
        picName,
        cleanText(email),
        cleanText(phone),
        cleanText(industry),
        cleanText(category),
        cleanText(location),
        cleanText(address),
        clientStatus,
        req.params.id,
      ],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client tidak ditemukan',
      })
    }

    const [updatedClient] = await db.query(
      'SELECT * FROM clients WHERE id = ?',
      [req.params.id],
    )

    res.json({
      success: true,
      message: 'Client berhasil diperbarui',
      data: updatedClient[0],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui client',
    })
  }
})

/*
  DELETE /api/clients/:id
  Menghapus client berdasarkan ID.
*/
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM clients WHERE id = ?',
      [req.params.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client tidak ditemukan',
      })
    }

    res.json({
      success: true,
      message: 'Client berhasil dihapus',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus client',
    })
  }
})

module.exports = router