const express = require('express')
const db = require('../config/db')

const router = express.Router()

const allowedStatuses = [
  'planning',
  'ongoing',
  'completed',
  'cancelled',
]

function cleanText(value) {
  if (typeof value !== 'string') return null

  const result = value.trim()
  return result === '' ? null : result
}

function isValidDate(value) {
  if (!value) return true

  const dateText = String(value)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return false
  }

  const date = new Date(`${dateText}T00:00:00Z`)

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateText
  )
}

async function getProjectById(id) {
  const [projects] = await db.query(
    `
      SELECT
        projects.*,
        clients.company_name AS client_name,
        clients.pic_name AS client_pic_name
      FROM projects
      INNER JOIN clients ON clients.id = projects.client_id
      WHERE projects.id = ?
    `,
    [id],
  )

  return projects[0] || null
}

/*
  GET /api/projects
  Mengambil seluruh project.
*/
router.get('/', async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT
        projects.*,
        clients.company_name AS client_name,
        clients.pic_name AS client_pic_name
      FROM projects
      INNER JOIN clients ON clients.id = projects.client_id
      ORDER BY projects.id DESC
    `)

    res.json({
      success: true,
      message: 'Data project berhasil diambil',
      data: projects,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data project',
      error: error.message,
    })
  }
})

/*
  GET /api/projects/:id
  Mengambil detail satu project.
*/
router.get('/:id', async (req, res) => {
  try {
    const project = await getProjectById(req.params.id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project tidak ditemukan',
      })
    }

    res.json({
      success: true,
      message: 'Detail project berhasil diambil',
      data: project,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail project',
      error: error.message,
    })
  }
})

/*
  POST /api/projects
  Menambah project baru.
*/
router.post('/', async (req, res) => {
  try {
    const {
      client_id,
      project_name,
      project_code,
      contract_value,
      status,
      start_date,
      end_date,
      description,
    } = req.body

    const clientId = Number.parseInt(client_id, 10)
    const projectName = cleanText(project_name)
    const projectCode = cleanText(project_code)
    const projectStatus = cleanText(status) || 'planning'
    const startDate = cleanText(start_date)
    const endDate = cleanText(end_date)
    const projectDescription = cleanText(description)
    const contractValue = Number(contract_value ?? 0)

    if (!Number.isInteger(clientId) || clientId <= 0) {
      return res.status(422).json({
        success: false,
        message: 'Client wajib dipilih',
      })
    }

    if (!projectName || !projectCode) {
      return res.status(422).json({
        success: false,
        message: 'Nama project dan kode project wajib diisi',
      })
    }

    if (!allowedStatuses.includes(projectStatus)) {
      return res.status(422).json({
        success: false,
        message: 'Status project tidak valid',
      })
    }

    if (!Number.isFinite(contractValue) || contractValue < 0) {
      return res.status(422).json({
        success: false,
        message: 'Nilai kontrak harus berupa angka dan tidak boleh negatif',
      })
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(422).json({
        success: false,
        message: 'Format tanggal harus YYYY-MM-DD',
      })
    }

    if (startDate && endDate && endDate < startDate) {
      return res.status(422).json({
        success: false,
        message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
      })
    }

    const [clients] = await db.query(
      'SELECT id FROM clients WHERE id = ?',
      [clientId],
    )

    if (clients.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'Client yang dipilih tidak ditemukan',
      })
    }

    const [result] = await db.query(
      `
        INSERT INTO projects (
          client_id,
          project_name,
          project_code,
          contract_value,
          status,
          start_date,
          end_date,
          description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clientId,
        projectName,
        projectCode,
        contractValue,
        projectStatus,
        startDate,
        endDate,
        projectDescription,
      ],
    )

    const newProject = await getProjectById(result.insertId)

    res.status(201).json({
      success: true,
      message: 'Project berhasil ditambahkan',
      data: newProject,
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(422).json({
        success: false,
        message: 'Kode project sudah digunakan',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan project',
      error: error.message,
    })
  }
})

/*
  PUT /api/projects/:id
  Mengubah project berdasarkan ID.
*/
router.put('/:id', async (req, res) => {
  try {
    const existingProject = await getProjectById(req.params.id)

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project tidak ditemukan',
      })
    }

    const {
      client_id,
      project_name,
      project_code,
      contract_value,
      status,
      start_date,
      end_date,
      description,
    } = req.body

    const clientId = Number.parseInt(client_id, 10)
    const projectName = cleanText(project_name)
    const projectCode = cleanText(project_code)
    const projectStatus = cleanText(status) || 'planning'
    const startDate = cleanText(start_date)
    const endDate = cleanText(end_date)
    const projectDescription = cleanText(description)
    const contractValue = Number(contract_value ?? 0)

    if (!Number.isInteger(clientId) || clientId <= 0) {
      return res.status(422).json({
        success: false,
        message: 'Client wajib dipilih',
      })
    }

    if (!projectName || !projectCode) {
      return res.status(422).json({
        success: false,
        message: 'Nama project dan kode project wajib diisi',
      })
    }

    if (!allowedStatuses.includes(projectStatus)) {
      return res.status(422).json({
        success: false,
        message: 'Status project tidak valid',
      })
    }

    if (!Number.isFinite(contractValue) || contractValue < 0) {
      return res.status(422).json({
        success: false,
        message: 'Nilai kontrak harus berupa angka dan tidak boleh negatif',
      })
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res.status(422).json({
        success: false,
        message: 'Format tanggal harus YYYY-MM-DD',
      })
    }

    if (startDate && endDate && endDate < startDate) {
      return res.status(422).json({
        success: false,
        message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
      })
    }

    const [clients] = await db.query(
      'SELECT id FROM clients WHERE id = ?',
      [clientId],
    )

    if (clients.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'Client yang dipilih tidak ditemukan',
      })
    }

    await db.query(
      `
        UPDATE projects
        SET
          client_id = ?,
          project_name = ?,
          project_code = ?,
          contract_value = ?,
          status = ?,
          start_date = ?,
          end_date = ?,
          description = ?
        WHERE id = ?
      `,
      [
        clientId,
        projectName,
        projectCode,
        contractValue,
        projectStatus,
        startDate,
        endDate,
        projectDescription,
        req.params.id,
      ],
    )

    const updatedProject = await getProjectById(req.params.id)

    res.json({
      success: true,
      message: 'Project berhasil diperbarui',
      data: updatedProject,
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(422).json({
        success: false,
        message: 'Kode project sudah digunakan',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui project',
      error: error.message,
    })
  }
})

/*
  DELETE /api/projects/:id
  Menghapus project berdasarkan ID.
*/
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM projects WHERE id = ?',
      [req.params.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project tidak ditemukan',
      })
    }

    res.json({
      success: true,
      message: 'Project berhasil dihapus',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus project',
      error: error.message,
    })
  }
})

module.exports = router