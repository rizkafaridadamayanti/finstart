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

function optionalPositiveInteger(value) {
  const number = Number.parseInt(value, 10)
  return Number.isInteger(number) && number > 0 ? number : null
}

function moneyValue(value) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

function normalizeMilestones(value) {
  const source = Array.isArray(value) ? value : []
  return source.map((item) => ({
    title: cleanText(item?.title || item?.name || item?.nama),
    due_date: isValidDate(item?.due_date || item?.dueDate || item?.tanggal) ? (item?.due_date || item?.dueDate || item?.tanggal) : null,
    status: ['planned', 'in_progress', 'completed'].includes(String(item?.status || '').toLowerCase()) ? String(item.status).toLowerCase() : 'planned',
  })).filter((item) => item.title)
}

function parseMilestones(value) {
  if (!value) return []
  try { const parsed = typeof value === 'string' ? JSON.parse(value) : value; return Array.isArray(parsed) ? parsed : [] } catch (_) { return [] }
}

function normalizeMembers(rawMembers) {
  if (!Array.isArray(rawMembers)) return []

  return rawMembers
    .map((member) => {
      const employeeId = optionalPositiveInteger(member.employee_id ?? member.employeeId)
      const allocationPercent = Number(member.allocation_percent ?? member.alokasiPersen ?? 100)

      return {
        employee_id: employeeId,
        member_name: cleanText(member.member_name || member.name || member.nama),
        role_name: cleanText(member.role_name || member.jabatan),
        allocation_percent: Number.isFinite(allocationPercent)
          ? Math.max(0, Math.min(100, allocationPercent))
          : 100,
        estimated_cost: moneyValue(member.estimated_cost ?? member.estimasiBiaya),
      }
    })
    .filter((member) => member.employee_id || member.member_name || member.role_name)
}

async function addColumnIfMissing(executor, tableName, columnName, definition) {
  const [columns] = await executor.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName],
  )

  if (columns.length === 0) {
    await executor.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`)
  }
}

async function ensureProjectMemberSchema(executor = db) {
  await executor.query(`
    CREATE TABLE IF NOT EXISTS project_members (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      project_id BIGINT UNSIGNED NOT NULL,
      employee_id BIGINT UNSIGNED NULL,
      user_id BIGINT UNSIGNED NULL,
      member_name VARCHAR(150) NULL,
      role_name VARCHAR(100) NULL,
      allocation_percent DECIMAL(5,2) NOT NULL DEFAULT 100.00,
      estimated_cost DECIMAL(18,2) NOT NULL DEFAULT 0,
      assigned_at DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_project_members_project (project_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await addColumnIfMissing(executor, 'project_members', 'member_name', 'VARCHAR(150) NULL')
  await addColumnIfMissing(executor, 'project_members', 'estimated_cost', 'DECIMAL(18,2) NOT NULL DEFAULT 0')
  await addColumnIfMissing(executor, 'projects', 'budget_amount', 'DECIMAL(18,2) NOT NULL DEFAULT 0')
  await addColumnIfMissing(executor, 'projects', 'milestones_json', 'LONGTEXT NULL')
}

async function getProjectMembers(projectIds, executor = db, skipEnsure = false) {
  if (!projectIds.length) return new Map()

  if (!skipEnsure) {
    await ensureProjectMemberSchema(executor)
  }

  const [members] = await executor.query(
    `
      SELECT
        project_members.id,
        project_members.project_id,
        project_members.employee_id,
        COALESCE(project_members.member_name, employees.full_name, users.name) AS name,
        project_members.role_name,
        project_members.allocation_percent,
        project_members.estimated_cost,
        project_members.assigned_at
      FROM project_members
      LEFT JOIN employees ON employees.id = project_members.employee_id
      LEFT JOIN users ON users.id = project_members.user_id
      WHERE project_members.project_id IN (?)
      ORDER BY project_members.id ASC
    `,
    [projectIds],
  )

  return members.reduce((grouped, member) => {
    const key = String(member.project_id)
    const list = grouped.get(key) || []
    list.push({
      id: String(member.id),
      employeeId: member.employee_id ? String(member.employee_id) : '',
      nama: member.name || '-',
      jabatan: member.role_name || '-',
      alokasiPersen: Number(member.allocation_percent || 0),
      estimasiBiaya: Number(member.estimated_cost || 0),
      assignedAt: member.assigned_at,
    })
    grouped.set(key, list)
    return grouped
  }, new Map())
}

async function getProjectFinancials(projectIds, executor = db) {
  if (!projectIds.length) return new Map()

  const [revenues] = await executor.query(
    `
      SELECT project_id, COALESCE(SUM(total_amount), 0) AS actual_revenue
      FROM invoices
      WHERE project_id IN (?)
        AND status IN ('unpaid', 'partial', 'paid', 'overdue')
      GROUP BY project_id
    `,
    [projectIds],
  )
  const [costs] = await executor.query(
    `
      SELECT project_id, COALESCE(SUM(total_amount), 0) AS actual_cost
      FROM bills
      WHERE project_id IN (?)
        AND status IN ('unpaid', 'partial', 'paid', 'overdue')
      GROUP BY project_id
    `,
    [projectIds],
  )

  const totals = new Map()
  for (const row of revenues) {
    totals.set(String(row.project_id), {
      actual_revenue: Number(row.actual_revenue || 0),
      actual_cost: 0,
    })
  }
  for (const row of costs) {
    const current = totals.get(String(row.project_id)) || {
      actual_revenue: 0,
      actual_cost: 0,
    }
    current.actual_cost = Number(row.actual_cost || 0)
    totals.set(String(row.project_id), current)
  }
  return totals
}

async function attachProjectMembers(projects, executor = db, skipEnsure = false) {
  const projectIds = projects.map((project) => project.id)
  const [membersByProject, financialsByProject] = await Promise.all([
    getProjectMembers(projectIds, executor, skipEnsure),
    getProjectFinancials(projectIds, executor),
  ])

  return projects.map((project) => {
    const budgetAmount = Number(project.budget_amount || 0)
    const contractValue = Number(project.contract_value || 0)
    const financials = financialsByProject.get(String(project.id)) || {
      actual_revenue: 0,
      actual_cost: 0,
    }
    const actualRevenue = Number(financials.actual_revenue || 0)
    const actualCost = Number(financials.actual_cost || 0)

    return {
      ...project,
      budget_amount: budgetAmount,
      actual_revenue: actualRevenue,
      actual_cost: actualCost,
      budget_variance: budgetAmount - actualCost,
      actual_profit: actualRevenue - actualCost,
      forecast_profit: contractValue - actualCost,
      milestones: parseMilestones(project.milestones_json),
      team: membersByProject.get(String(project.id)) || [],
    }
  })
}

async function syncProjectMembers(executor, projectId, members, assignedAt = null) {
  const normalized = normalizeMembers(members)
  await executor.query('DELETE FROM project_members WHERE project_id = ?', [projectId])

  if (normalized.length === 0) return

  const employeeIds = normalized
    .map((member) => member.employee_id)
    .filter(Boolean)

  let validEmployeeIds = new Set()
  if (employeeIds.length) {
    const [employees] = await executor.query(
      'SELECT id FROM employees WHERE id IN (?)',
      [[...new Set(employeeIds)]],
    )
    validEmployeeIds = new Set(employees.map((employee) => Number(employee.id)))
  }

  const placeholders = normalized.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')
  const values = normalized.flatMap((member) => [
    projectId,
    member.employee_id && validEmployeeIds.has(Number(member.employee_id))
      ? member.employee_id
      : null,
    member.member_name,
    member.role_name,
    member.allocation_percent,
    member.estimated_cost,
    assignedAt,
  ])

  await executor.query(
    `
      INSERT INTO project_members (
        project_id,
        employee_id,
        member_name,
        role_name,
        allocation_percent,
        estimated_cost,
        assigned_at
      )
      VALUES ${placeholders}
    `,
    values,
  )
}

async function getProjectById(id, executor = db, skipEnsure = false) {
  const [projects] = await executor.query(
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

  if (!projects[0]) return null

  const [project] = await attachProjectMembers(projects, executor, skipEnsure)
  return project
}

/*
  GET /api/projects
  Mengambil seluruh project.
*/
router.get('/', async (req, res) => {
  try {
    await ensureProjectMemberSchema()
    const [projects] = await db.query(`
      SELECT
        projects.*,
        clients.company_name AS client_name,
        clients.pic_name AS client_pic_name
      FROM projects
      INNER JOIN clients ON clients.id = projects.client_id
      ORDER BY projects.id DESC
    `)

    const projectsWithMembers = await attachProjectMembers(projects)

    res.json({
      success: true,
      message: 'Data project berhasil diambil',
      data: projectsWithMembers,
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
    await ensureProjectMemberSchema()
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
  let connection

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
      members,
      budget_amount,
      milestones,
    } = req.body

    const clientId = Number.parseInt(client_id, 10)
    const projectName = cleanText(project_name)
    const projectCode = cleanText(project_code)
    const projectStatus = cleanText(status) || 'planning'
    const startDate = cleanText(start_date)
    const endDate = cleanText(end_date)
    const projectDescription = cleanText(description)
    const contractValue = Number(contract_value ?? 0)
    const budgetAmount = moneyValue(budget_amount)
    const milestonesJson = JSON.stringify(normalizeMilestones(milestones))

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

    await ensureProjectMemberSchema()

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

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [result] = await connection.query(
      `
        INSERT INTO projects (
          client_id,
          project_name,
          project_code,
          contract_value,
          status,
          start_date,
          end_date,
          description,
          budget_amount,
          milestones_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        budgetAmount,
        milestonesJson,
      ],
    )

    await syncProjectMembers(connection, result.insertId, members, startDate)

    const newProject = await getProjectById(result.insertId, connection, true)

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Project berhasil ditambahkan',
      data: newProject,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

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
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

/*
  PUT /api/projects/:id
  Mengubah project berdasarkan ID.
*/
router.put('/:id', async (req, res) => {
  let connection

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
      members,
      budget_amount,
      milestones,
    } = req.body

    const clientId = Number.parseInt(client_id, 10)
    const projectName = cleanText(project_name)
    const projectCode = cleanText(project_code)
    const projectStatus = cleanText(status) || 'planning'
    const startDate = cleanText(start_date)
    const endDate = cleanText(end_date)
    const projectDescription = cleanText(description)
    const contractValue = Number(contract_value ?? 0)
    const budgetAmount = moneyValue(budget_amount)
    const milestonesJson = JSON.stringify(normalizeMilestones(milestones))

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

    await ensureProjectMemberSchema()

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

    connection = await db.getConnection()
    await connection.beginTransaction()

    await connection.query(
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
          description = ?,
          budget_amount = ?,
          milestones_json = ?
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
        budgetAmount,
        milestonesJson,
        req.params.id,
      ],
    )

    await syncProjectMembers(connection, req.params.id, members, startDate)

    const updatedProject = await getProjectById(req.params.id, connection, true)

    await connection.commit()

    res.json({
      success: true,
      message: 'Project berhasil diperbarui',
      data: updatedProject,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

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
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

/*
  DELETE /api/projects/:id
  Menghapus project berdasarkan ID.
*/
router.delete('/:id', async (req, res) => {
  try {
    await ensureProjectMemberSchema()
    await db.query(
      'DELETE FROM project_members WHERE project_id = ?',
      [req.params.id],
    )

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
