const express = require('express')
const db = require('../config/db')
const { safePublicMessage } = require('../utils/api-errors')
const { todayInJakarta } = require('../utils/date-validation')

const router = express.Router()

const FINAL_INVOICE_TERMS_DAYS = 14

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

function money(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100
}

function getToday() {
  return todayInJakarta()
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + Number(days || 0))
  return date.toISOString().slice(0, 10)
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

async function getProjectMembers(projectIds, executor = db, skipEnsure = false) {
  if (!projectIds.length) return new Map()


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
      SELECT
        project_id,
        COALESCE(SUM(CASE
          WHEN status <> 'cancelled'
          THEN total_amount
          ELSE 0
        END), 0) AS invoiced_amount,
        COALESCE(SUM(CASE
          WHEN status IN ('unpaid', 'partial', 'paid', 'overdue')
          THEN total_amount - COALESCE((
            SELECT transaction_taxes.tax_amount
            FROM transaction_taxes
            WHERE transaction_taxes.source_type = 'invoice'
              AND transaction_taxes.source_id = invoices.id
              AND transaction_taxes.tax_type = 'PPN_OUTPUT'
            LIMIT 1
          ), 0)
          ELSE 0
        END), 0) AS actual_revenue,
        COALESCE(SUM(CASE
          WHEN status <> 'cancelled'
          THEN paid_amount
          ELSE 0
        END), 0) AS collected_amount
      FROM invoices
      WHERE project_id IN (?)
      GROUP BY project_id
    `,
    [projectIds],
  )
  const [costs] = await executor.query(
    `
      SELECT
        project_id,
        COALESCE(SUM(
          total_amount - COALESCE((
            SELECT transaction_taxes.tax_amount
            FROM transaction_taxes
            WHERE transaction_taxes.source_type = 'bill'
              AND transaction_taxes.source_id = bills.id
              AND transaction_taxes.tax_type = 'PPN_INPUT'
            LIMIT 1
          ), 0)
        ), 0) AS actual_cost
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
      invoiced_amount: Number(row.invoiced_amount || 0),
      actual_revenue: Number(row.actual_revenue || 0),
      collected_amount: Number(row.collected_amount || 0),
      actual_cost: 0,
    })
  }
  for (const row of costs) {
    const current = totals.get(String(row.project_id)) || {
      invoiced_amount: 0,
      actual_revenue: 0,
      collected_amount: 0,
      actual_cost: 0,
    }
    current.actual_cost = Number(row.actual_cost || 0)
    totals.set(String(row.project_id), current)
  }
  return totals
}

async function getProjectUsage(projectId, executor = db) {
  const [rows] = await executor.query(
    `
      SELECT
        (SELECT COUNT(*) FROM project_members WHERE project_id = ?) AS member_count,
        (SELECT COUNT(*) FROM invoices WHERE project_id = ?) AS invoice_count,
        (SELECT COUNT(*) FROM bills WHERE project_id = ?) AS bill_count
    `,
    [projectId, projectId, projectId],
  )

  const row = rows?.[0] || {}
  return {
    member_count: Number(row.member_count || 0),
    invoice_count: Number(row.invoice_count || 0),
    bill_count: Number(row.bill_count || 0),
  }
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
      invoiced_amount: 0,
      actual_revenue: 0,
      collected_amount: 0,
      actual_cost: 0,
    }
    const invoicedAmount = Number(financials.invoiced_amount || 0)
    const actualRevenue = Number(financials.actual_revenue || 0)
    const collectedAmount = Number(financials.collected_amount || 0)
    const actualCost = Number(financials.actual_cost || 0)

    return {
      ...project,
      budget_amount: budgetAmount,
      invoiced_amount: invoicedAmount,
      actual_revenue: actualRevenue,
      collected_amount: collectedAmount,
      unbilled_amount: Math.max(money(contractValue - invoicedAmount), 0),
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
      'SELECT id, full_name, name, employment_status FROM employees WHERE id IN (?)',
      [[...new Set(employeeIds)]],
    )
    const inactiveEmployee = employees.find(
      (employee) => String(employee.employment_status || 'active').toLowerCase() !== 'active',
    )

    if (inactiveEmployee) {
      const error = new Error(
        `Pegawai ${inactiveEmployee.full_name || inactiveEmployee.name || inactiveEmployee.id} berstatus nonaktif dan tidak bisa dimasukkan ke proyek.`,
      )
      error.status = 422
      throw error
    }

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

async function generateFinalInvoiceNumber(connection, issueDate) {
  const period = String(issueDate).slice(0, 7).replace('-', '')

  const [rows] = await connection.query(
    `
      SELECT COUNT(*) + 1 AS sequence_number
      FROM invoices
      WHERE DATE_FORMAT(issue_date, '%Y%m') = ?
    `,
    [period],
  )

  return `INV/${period}/${String(rows[0].sequence_number).padStart(3, '0')}`
}

async function closeProjectAndCreateFinalInvoice(connection, projectId, options = {}) {
  const issueDate = options.issueDate || getToday()
  const dueDate = options.dueDate || addDays(issueDate, FINAL_INVOICE_TERMS_DAYS)
  const shouldCreateInvoice = options.createInvoice !== false
  const notes = cleanText(options.notes)

  const [projectRows] = await connection.query(
    `
      SELECT
        projects.*,
        clients.company_name AS client_name
      FROM projects
      INNER JOIN clients ON clients.id = projects.client_id
      WHERE projects.id = ?
      FOR UPDATE
    `,
    [projectId],
  )

  const project = projectRows[0]

  if (!project) {
    const error = new Error('Project tidak ditemukan')
    error.status = 404
    throw error
  }

  if (project.status === 'cancelled') {
    const error = new Error('Project yang dibatalkan tidak dapat ditutup')
    error.status = 422
    throw error
  }

  const [invoiceTotals] = await connection.query(
    `
      SELECT
        COALESCE(SUM(CASE
          WHEN status <> 'cancelled'
          THEN total_amount
          ELSE 0
        END), 0) AS invoiced_amount,
        COALESCE(SUM(CASE
          WHEN status IN ('unpaid', 'partial', 'paid', 'overdue')
          THEN total_amount - paid_amount
          ELSE 0
        END), 0) AS outstanding_amount
      FROM invoices
      WHERE project_id = ?
    `,
    [projectId],
  )

  const contractValue = money(project.contract_value)
  const invoicedAmount = money(invoiceTotals[0]?.invoiced_amount)
  const outstandingAmount = money(invoiceTotals[0]?.outstanding_amount)
  const unbilledAmount = Math.max(money(contractValue - invoicedAmount), 0)
  let invoiceId = null

  if (shouldCreateInvoice && unbilledAmount > 0) {
    const invoiceNumber = cleanText(options.invoiceNumber) ||
      await generateFinalInvoiceNumber(connection, issueDate)

    const [invoiceResult] = await connection.query(
      `
        INSERT INTO invoices (
          client_id,
          project_id,
          invoice_number,
          issue_date,
          due_date,
          total_amount,
          paid_amount,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 'draft', ?)
      `,
      [
        project.client_id,
        project.id,
        invoiceNumber,
        issueDate,
        dueDate,
        unbilledAmount,
        [
          `Invoice final proyek ${project.project_code} - ${project.project_name}.`,
          notes,
        ].filter(Boolean).join(' '),
      ],
    )

    invoiceId = invoiceResult.insertId

    await connection.query(
      `
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          line_total
        ) VALUES (?, ?, 1, ?, ?)
      `,
      [
        invoiceId,
        `Tagihan final proyek ${project.project_name}`,
        unbilledAmount,
        unbilledAmount,
      ],
    )
  }

  await connection.query(
    "UPDATE projects SET status = 'completed' WHERE id = ?",
    [project.id],
  )

  const closedProject = await getProjectById(project.id, connection, true)

  return {
    project: closedProject,
    final_invoice_id: invoiceId,
    contract_value: contractValue,
    invoiced_amount: invoicedAmount,
    unbilled_amount: unbilledAmount,
    outstanding_amount: outstandingAmount,
    next_step: invoiceId
      ? 'Terbitkan invoice final untuk mencatat piutang dan pendapatan, lalu catat pembayaran untuk menambah kas.'
      : 'Pastikan invoice yang masih outstanding sudah ditagih dan pembayarannya dicatat.',
  }
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


    const [clients] = await db.query(
      'SELECT id, status FROM clients WHERE id = ?',
      [clientId],
    )

    if (clients.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'Client yang dipilih tidak ditemukan',
      })
    }

    if (String(clients[0].status || 'active').toLowerCase() !== 'active') {
      return res.status(422).json({
        success: false,
        message: 'Klien berstatus nonaktif dan tidak bisa dipilih untuk proyek.',
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

    const closingResult = projectStatus === 'completed'
      ? await closeProjectAndCreateFinalInvoice(connection, result.insertId)
      : null

    const newProject = closingResult?.project ||
      await getProjectById(result.insertId, connection, true)

    await connection.commit()

    res.status(201).json({
      success: true,
      message: closingResult?.final_invoice_id
        ? 'Project berhasil ditambahkan, ditutup, dan draft invoice final dibuat'
        : 'Project berhasil ditambahkan',
      data: {
        ...newProject,
        final_invoice_id: closingResult?.final_invoice_id || null,
        closing: closingResult,
      },
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

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: safePublicMessage(error, 'Permintaan tidak dapat diproses.'),
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan project',
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


    const [clients] = await db.query(
      'SELECT id, status FROM clients WHERE id = ?',
      [clientId],
    )

    if (clients.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'Client yang dipilih tidak ditemukan',
      })
    }

    if (String(clients[0].status || 'active').toLowerCase() !== 'active') {
      return res.status(422).json({
        success: false,
        message: 'Klien berstatus nonaktif dan tidak bisa dipilih untuk proyek.',
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

    const closingResult = projectStatus === 'completed'
      ? await closeProjectAndCreateFinalInvoice(connection, req.params.id)
      : null

    const updatedProject = closingResult?.project ||
      await getProjectById(req.params.id, connection, true)

    await connection.commit()

    res.json({
      success: true,
      message: closingResult?.final_invoice_id
        ? 'Project berhasil diperbarui, ditutup, dan draft invoice final dibuat'
        : 'Project berhasil diperbarui',
      data: {
        ...updatedProject,
        final_invoice_id: closingResult?.final_invoice_id || null,
        closing: closingResult,
      },
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

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: safePublicMessage(error, 'Permintaan tidak dapat diproses.'),
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui project',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

/*
  POST /api/projects/:id/close
  Menutup proyek secara operasional dan membuat draft invoice final
  untuk sisa nilai kontrak yang belum ditagih.
*/
router.post('/:id/close', async (req, res) => {
  let connection

  try {
    const projectId = Number.parseInt(req.params.id, 10)
    const issueDate = cleanText(req.body?.issue_date) || getToday()
    const dueDate = cleanText(req.body?.due_date) || addDays(issueDate, FINAL_INVOICE_TERMS_DAYS)
    const shouldCreateInvoice = req.body?.create_invoice !== false
    const notes = cleanText(req.body?.notes)

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(422).json({
        success: false,
        message: 'ID project tidak valid',
      })
    }

    if (!isValidDate(issueDate) || !isValidDate(dueDate) || dueDate < issueDate) {
      return res.status(422).json({
        success: false,
        message: 'Tanggal invoice final tidak valid',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()


    const closingResult = await closeProjectAndCreateFinalInvoice(connection, projectId, {
      issueDate,
      dueDate,
      createInvoice: shouldCreateInvoice,
      invoiceNumber: req.body?.invoice_number,
      notes,
    })

    await connection.commit()

    res.json({
      success: true,
      message: closingResult.final_invoice_id
        ? 'Project berhasil ditutup dan draft invoice final dibuat.'
        : 'Project berhasil ditutup. Tidak ada sisa kontrak yang perlu dibuatkan invoice final.',
      data: closingResult,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: safePublicMessage(error, 'Permintaan tidak dapat diproses.'),
      })
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(422).json({
        success: false,
        message: 'Nomor invoice final sudah digunakan',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menutup project',
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
    const projectId = Number(req.params.id)

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID project tidak valid.',
      })
    }

    const [projects] = await db.query(
      'SELECT id, status FROM projects WHERE id = ? LIMIT 1',
      [projectId],
    )

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project tidak ditemukan',
      })
    }

    const usage = await getProjectUsage(projectId)
    const reasons = [
      usage.invoice_count > 0 ? `${usage.invoice_count} invoice` : '',
      usage.bill_count > 0 ? `${usage.bill_count} tagihan vendor` : '',
      usage.member_count > 0 ? `${usage.member_count} anggota proyek` : '',
    ].filter(Boolean)

    if (reasons.length > 0) {
      return res.status(409).json({
        success: false,
        code: 'PROJECT_IN_USE',
        message: `Project masih terhubung dengan ${reasons.join(', ')}. Record terpakai tidak boleh dihapus; ubah status project menjadi cancelled/completed atau lepaskan data terkait terlebih dahulu.`,
        data: usage,
      })
    }

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
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message: 'Project tidak dapat dihapus karena sudah dipakai data lain. Ubah status project atau lepaskan data terkait terlebih dahulu.',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menghapus project',
    })
  }
})

module.exports = router
