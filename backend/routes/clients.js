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
        code,
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
  GET /api/clients/next-code
  Mengambil preview kode klien yang akan otomatis dibuat untuk registrasi berikutnya.
*/
router.get('/next-code', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        SELECT AUTO_INCREMENT AS nextId
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clients'
      `,
    )

    const nextId = Number(rows[0]?.nextId || 1)
    const code = `KLN-${String(nextId).padStart(4, '0')}`

    res.json({
      success: true,
      message: 'Preview kode klien berikutnya berhasil diambil',
      data: { code },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil preview kode klien',
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

    const code = `KLN-${String(result.insertId).padStart(4, '0')}`
    await db.query('UPDATE clients SET code = ? WHERE id = ?', [code, result.insertId])

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
    const [clients] = await db.query(
      'SELECT id, status FROM clients WHERE id = ? LIMIT 1',
      [req.params.id],
    )

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client tidak ditemukan',
      })
    }

    const [usageRows] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM projects
        WHERE client_id = ?
      `,
      [req.params.id],
    )
    const usageCount = Number(usageRows[0]?.total || 0)

    if (usageCount > 0) {
      return res.status(409).json({
        success: false,
        code: 'CLIENT_IN_USE',
        message: `Klien masih terhubung dengan ${usageCount} proyek CRM. Record terpakai tidak boleh dihapus; nonaktifkan klien jika sudah tidak digunakan.`,
        data: {
          project_count: usageCount,
          current_status: clients[0].status,
        },
      })
    }

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
