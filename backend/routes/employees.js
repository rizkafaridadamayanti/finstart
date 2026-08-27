const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const db = require('../config/db')
const { safePublicMessage } = require('../utils/api-errors')
const { currentPeriodInJakarta, isValidDate } = require('../utils/date-validation')

const router = express.Router()

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'employees')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const DOCUMENT_FIELDS = {
  cv: { column: 'cv_path', label: 'CV' },
  ktp: { column: 'ktp_path', label: 'KTP' },
  npwp: { column: 'npwp_document_path', label: 'NPWP' },
  sertifikat: { column: 'certificate_path', label: 'Sertifikat' },
}

const ALLOWED_DOCUMENT_MIME_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

const documentsUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: (req, file, cb) => {
    if (!DOCUMENT_FIELDS[file.fieldname]) {
      cb(new Error('Field dokumen tidak dikenal.'))
      return
    }
    if (!ALLOWED_DOCUMENT_MIME_TYPES[file.mimetype]) {
      cb(new Error('Format file harus PDF, JPG, atau PNG.'))
      return
    }
    cb(null, true)
  },
}).fields([
  { name: 'cv', maxCount: 1 },
  { name: 'ktp', maxCount: 1 },
  { name: 'npwp', maxCount: 1 },
  { name: 'sertifikat', maxCount: 1 },
])

function runDocumentsUpload(req, res) {
  return new Promise((resolve, reject) => {
    documentsUpload(req, res, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

const extraDocumentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_DOCUMENT_MIME_TYPES[file.mimetype]) {
      cb(new Error('Format file harus PDF, JPG, atau PNG.'))
      return
    }
    cb(null, true)
  },
}).single('file')

function runExtraDocumentUpload(req, res) {
  return new Promise((resolve, reject) => {
    extraDocumentUpload(req, res, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function multerErrorMessage(error) {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return 'Ukuran file maksimal 5MB.'
  }
  return error instanceof multer.MulterError
    ? error.message
    : safePublicMessage(error, 'Gagal mengunggah dokumen.')
}

const EMPLOYMENT_TYPES = new Set([
  'permanent',
  'contract',
  'intern',
  'freelance',
  'daily',
])

const PTKP_STATUSES = new Set([
  'TK/0',
  'TK/1',
  'TK/2',
  'TK/3',
  'K/0',
  'K/1',
  'K/2',
  'K/3',
])

const BPJS_STATUSES = new Set(['active', 'inactive'])
const EMPLOYMENT_STATUSES = new Set(['active', 'inactive'])

function cleanText(value, maxLength = 255) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, maxLength) : null
}

function numberValue(value) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : NaN
}

function normalizeEmployeeCode(value) {
  const text = cleanText(value, 50)

  if (!text) return null

  return text
    .toUpperCase()
    .replace(/[^A-Z0-9/-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

function normalizeEnum(value, allowed, fallback = null) {
  const normalized = String(value ?? fallback ?? '').trim()
  return allowed.has(normalized) ? normalized : null
}

async function generateEmployeeCode(connection) {
  const period = currentPeriodInJakarta().replace('-', '')

  const [rows] = await connection.query(
    `
      SELECT COUNT(*) + 1 AS sequence_number
      FROM employees
      WHERE employee_code LIKE ?
    `,
    [`EMP/${period}/%`],
  )

  return `EMP/${period}/${String(rows[0].sequence_number).padStart(3, '0')}`
}

async function getDivision(id) {
  const [rows] = await db.query(
    `
      SELECT id, code, name, status
      FROM divisions
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  )

  return rows[0] || null
}

async function getPosition(id) {
  const [rows] = await db.query(
    `
      SELECT id, division_id, code, name, status
      FROM positions
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  )

  return rows[0] || null
}

async function validateDivisionAndPosition(divisionId, positionId) {
  const division = await getDivision(divisionId)

  if (!division) {
    throw new Error('Divisi tidak ditemukan.')
  }

  const position = await getPosition(positionId)

  if (!position) {
    throw new Error('Jabatan tidak ditemukan.')
  }

  if (
    position.division_id &&
    Number(position.division_id) !== Number(divisionId)
  ) {
    throw new Error(
      'Jabatan yang dipilih tidak sesuai dengan divisi pegawai.',
    )
  }

  return { division, position }
}

async function getEmployeeById(id) {
  const [rows] = await db.query(
    `
      SELECT
        e.*,
        d.code AS division_code,
        d.name AS division_name,
        p.code AS position_code,
        p.name AS position_name
      FROM employees e
      LEFT JOIN divisions d ON d.id = e.division_id
      LEFT JOIN positions p ON p.id = e.position_id
      WHERE e.id = ?
      LIMIT 1
    `,
    [id],
  )

  const employee = rows[0]

  if (!employee) return null

  return {
    ...employee,
    employee_name: employee.full_name || employee.name,
    status: employee.employment_status,
    base_salary: Number(employee.base_salary || 0),
  }
}

function extractEmployeePayload(body, existing = null) {
  const employeeName = cleanText(
    body?.full_name ?? body?.employee_name ?? body?.name,
    150,
  )

  const nik = cleanText(body?.nik, 32)
  const email = cleanText(body?.email, 150)
  const phone = cleanText(body?.phone, 40)
  const npwp = cleanText(body?.npwp ?? existing?.npwp, 50)
  const bpjsHealthNumber = cleanText(body?.bpjs_health_number ?? body?.bpjs_kesehatan_no ?? existing?.bpjs_health_number, 50)
  const bpjsEmploymentNumber = cleanText(body?.bpjs_employment_number ?? body?.bpjs_ketenagakerjaan_no ?? existing?.bpjs_employment_number, 50)
  const bankName = cleanText(body?.bank_name ?? body?.bank_nama ?? existing?.bank_name, 100)
  const bankAccountNumber = cleanText(body?.bank_account_number ?? body?.no_rekening ?? existing?.bank_account_number, 80)
  const bankAccountHolder = cleanText(body?.bank_account_holder ?? existing?.bank_account_holder, 150)
  const address = cleanText(body?.address ?? existing?.address, 1000)

  const divisionId = Number(body?.division_id)
  const positionId = Number(body?.position_id)

  const employmentType = normalizeEnum(
    body?.employment_type,
    EMPLOYMENT_TYPES,
    existing?.employment_type || 'permanent',
  )

  const ptkpStatus = normalizeEnum(
    body?.ptkp_status,
    PTKP_STATUSES,
    existing?.ptkp_status || 'TK/0',
  )

  const bpjsStatus = normalizeEnum(
    body?.bpjs_status,
    BPJS_STATUSES,
    existing?.bpjs_status || 'active',
  )

  const employmentStatus = normalizeEnum(
    body?.employment_status ?? body?.status,
    EMPLOYMENT_STATUSES,
    existing?.employment_status || 'active',
  )

  const joinDate = body?.join_date ?? existing?.join_date ?? null

  const baseSalary = numberValue(
    body?.base_salary ?? existing?.base_salary ?? 0,
  )

  if (!employeeName) {
    throw new Error('Nama pegawai wajib diisi.')
  }

  if (!nik) {
    throw new Error('NIK wajib diisi.')
  }

  if (!Number.isInteger(divisionId) || divisionId <= 0) {
    throw new Error('Divisi wajib dipilih.')
  }

  if (!Number.isInteger(positionId) || positionId <= 0) {
    throw new Error('Jabatan wajib dipilih.')
  }

  if (!employmentType) {
    throw new Error('Jenis kerja tidak valid.')
  }

  if (!ptkpStatus) {
    throw new Error('Status PTKP tidak valid.')
  }

  if (!bpjsStatus) {
    throw new Error('Status BPJS tidak valid.')
  }

  if (!employmentStatus) {
    throw new Error('Status pegawai tidak valid.')
  }

  if (!isValidDate(joinDate)) {
    throw new Error('Tanggal bergabung tidak valid.')
  }

  if (!Number.isFinite(baseSalary) || baseSalary < 0) {
    throw new Error('Gaji pokok tidak valid.')
  }

  return {
    full_name: employeeName,
    nik,
    email,
    phone,
    npwp,
    bpjs_health_number: bpjsHealthNumber,
    bpjs_employment_number: bpjsEmploymentNumber,
    bank_name: bankName,
    bank_account_number: bankAccountNumber,
    bank_account_holder: bankAccountHolder,
    address,
    division_id: divisionId,
    position_id: positionId,
    employment_type: employmentType,
    ptkp_status: ptkpStatus,
    bpjs_status: bpjsStatus,
    employment_status: employmentStatus,
    join_date: joinDate,
    base_salary:
      Math.round((baseSalary + Number.EPSILON) * 100) / 100,
  }
}

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim()
    const status = String(req.query.status || '').trim().toLowerCase()

    const divisionId = req.query.division_id
      ? Number(req.query.division_id)
      : null

    const positionId = req.query.position_id
      ? Number(req.query.position_id)
      : null

    const where = []
    const params = []

    if (status && status !== 'all') {
      if (!EMPLOYMENT_STATUSES.has(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status pegawai tidak valid.',
        })
      }

      where.push('e.employment_status = ?')
      params.push(status)
    }

    if (divisionId) {
      where.push('e.division_id = ?')
      params.push(divisionId)
    }

    if (positionId) {
      where.push('e.position_id = ?')
      params.push(positionId)
    }

    if (search) {
      where.push(`(
        e.employee_code LIKE ?
        OR e.full_name LIKE ?
        OR e.nik LIKE ?
        OR COALESCE(e.email, '') LIKE ?
        OR COALESCE(d.name, '') LIKE ?
        OR COALESCE(p.name, '') LIKE ?
      )`)

      const term = `%${search}%`

      params.push(term, term, term, term, term, term)
    }

    const whereClause = where.length
      ? `WHERE ${where.join(' AND ')}`
      : ''

    const [rows] = await db.query(
      `
        SELECT
          e.*,
          d.code AS division_code,
          d.name AS division_name,
          p.code AS position_code,
          p.name AS position_name
        FROM employees e
        LEFT JOIN divisions d ON d.id = e.division_id
        LEFT JOIN positions p ON p.id = e.position_id
        ${whereClause}
        ORDER BY
          e.employment_status = 'active' DESC,
          e.full_name ASC,
          e.id DESC
      `,
      params,
    )

    res.json({
      success: true,
      message: 'Daftar pegawai berhasil diambil.',
      data: rows.map((employee) => ({
        ...employee,
        employee_name: employee.full_name || employee.name,
        status: employee.employment_status,
        base_salary: Number(employee.base_salary || 0),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar pegawai.',
    })
  }
})

router.get('/:id/usage', async (req, res) => {
  const employeeId = Number(req.params.id)

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID pegawai tidak valid.',
    })
  }

  try {
    const existing = await getEmployeeById(employeeId)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan.',
      })
    }

    const [payrollRows] = await db.query(
      'SELECT COUNT(*) AS total FROM payroll_records WHERE employee_id = ?',
      [employeeId],
    )
    const [projectRows] = await db.query(
      `
        SELECT COUNT(DISTINCT project_id) AS total
        FROM project_members
        WHERE employee_id = ?
      `,
      [employeeId],
    )
    const [projectSamples] = await db.query(
      `
        SELECT projects.project_name
        FROM project_members
        INNER JOIN projects ON projects.id = project_members.project_id
        WHERE project_members.employee_id = ?
        ORDER BY projects.id DESC
        LIMIT 3
      `,
      [employeeId],
    )

    const payrollCount = Number(payrollRows?.[0]?.total || 0)
    const projectCount = Number(projectRows?.[0]?.total || 0)

    res.json({
      success: true,
      message: 'Pemakaian pegawai berhasil diambil.',
      data: {
        employee_id: employeeId,
        payroll_count: payrollCount,
        project_count: projectCount,
        can_delete: payrollCount === 0 && projectCount === 0,
        project_names: projectSamples.map((row) => row.project_name).filter(Boolean),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pemakaian pegawai.',
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const employee = await getEmployeeById(req.params.id)

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      message: 'Detail pegawai berhasil diambil.',
      data: employee,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail pegawai.',
    })
  }
})

router.post('/', async (req, res) => {
  let connection

  try {
    const payload = extractEmployeePayload(req.body)

    const requestedCode = normalizeEmployeeCode(
      req.body?.employee_code,
    )

    await validateDivisionAndPosition(
      payload.division_id,
      payload.position_id,
    )

    connection = await db.getConnection()
    await connection.beginTransaction()

    const employeeCode =
      requestedCode || (await generateEmployeeCode(connection))

    const [result] = await connection.query(
      `
        INSERT INTO employees (
          employee_code,
          name,
          full_name,
          nik,
          email,
          phone,
          npwp,
          bpjs_health_number,
          bpjs_employment_number,
          bank_name,
          bank_account_number,
          bank_account_holder,
          address,
          division_id,
          position_id,
          employment_type,
          ptkp_status,
          bpjs_status,
          employment_status,
          join_date,
          base_salary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        employeeCode,
        payload.full_name,
        payload.full_name,
        payload.nik,
        payload.email,
        payload.phone,
        payload.npwp,
        payload.bpjs_health_number,
        payload.bpjs_employment_number,
        payload.bank_name,
        payload.bank_account_number,
        payload.bank_account_holder,
        payload.address,
        payload.division_id,
        payload.position_id,
        payload.employment_type,
        payload.ptkp_status,
        payload.bpjs_status,
        payload.employment_status,
        payload.join_date,
        payload.base_salary,
      ],
    )

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Pegawai berhasil ditambahkan.',
      data: await getEmployeeById(result.insertId),
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 400).json({
      success: false,
      message:
        error?.code === 'ER_DUP_ENTRY'
          ? 'Kode pegawai atau NIK sudah digunakan.'
          : safePublicMessage(error, 'Gagal menambahkan pegawai.'),
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await getEmployeeById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan.',
      })
    }

    const payload = extractEmployeePayload(req.body, existing)

    const employeeCode = normalizeEmployeeCode(
      req.body?.employee_code || existing.employee_code,
    )

    if (!employeeCode) {
      return res.status(400).json({
        success: false,
        message: 'Kode pegawai wajib valid.',
      })
    }

    await validateDivisionAndPosition(
      payload.division_id,
      payload.position_id,
    )

    await db.query(
      `
        UPDATE employees
        SET
          employee_code = ?,
          name = ?,
          full_name = ?,
          nik = ?,
          email = ?,
          phone = ?,
          npwp = ?,
          bpjs_health_number = ?,
          bpjs_employment_number = ?,
          bank_name = ?,
          bank_account_number = ?,
          bank_account_holder = ?,
          address = ?,
          division_id = ?,
          position_id = ?,
          employment_type = ?,
          ptkp_status = ?,
          bpjs_status = ?,
          employment_status = ?,
          join_date = ?,
          base_salary = ?
        WHERE id = ?
      `,
      [
        employeeCode,
        payload.full_name,
        payload.full_name,
        payload.nik,
        payload.email,
        payload.phone,
        payload.npwp,
        payload.bpjs_health_number,
        payload.bpjs_employment_number,
        payload.bank_name,
        payload.bank_account_number,
        payload.bank_account_holder,
        payload.address,
        payload.division_id,
        payload.position_id,
        payload.employment_type,
        payload.ptkp_status,
        payload.bpjs_status,
        payload.employment_status,
        payload.join_date,
        payload.base_salary,
        req.params.id,
      ],
    )

    res.json({
      success: true,
      message: 'Data pegawai berhasil diperbarui.',
      data: await getEmployeeById(req.params.id),
    })
  } catch (error) {
    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 400).json({
      success: false,
      message:
        error?.code === 'ER_DUP_ENTRY'
          ? 'Kode pegawai atau NIK sudah digunakan.'
          : safePublicMessage(error, 'Gagal memperbarui pegawai.'),
    })
  }
})

/*
  POST /api/employees/:id/documents
  Unggah dokumen pegawai (CV, KTP, NPWP, Sertifikat). Semua field bersifat
  opsional - kirim hanya field yang ingin diunggah/diganti.
*/
router.post('/:id/documents', async (req, res) => {
  const employeeId = Number(req.params.id)

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID pegawai tidak valid.',
    })
  }

  try {
    await runDocumentsUpload(req, res)

    const existing = await getEmployeeById(employeeId)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan.',
      })
    }

    const updates = []
    const params = []

    for (const [fieldName, config] of Object.entries(DOCUMENT_FIELDS)) {
      const file = req.files?.[fieldName]?.[0]
      if (!file) continue

      const extension = ALLOWED_DOCUMENT_MIME_TYPES[file.mimetype]
      const filename = `emp${employeeId}-${fieldName}-${Date.now()}.${extension}`
      fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer)

      const previousFilename = existing[config.column]
      if (previousFilename) {
        fs.unlink(path.join(UPLOAD_DIR, path.basename(previousFilename)), () => {})
      }

      updates.push(`${config.column} = ?`)
      params.push(filename)
    }

    if (!updates.length) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diunggah.',
      })
    }

    params.push(employeeId)
    await db.query(
      `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
      params,
    )

    res.json({
      success: true,
      message: 'Dokumen pegawai berhasil diunggah.',
      data: await getEmployeeById(employeeId),
    })
  } catch (error) {
    const message = multerErrorMessage(error)

    res.status(400).json({
      success: false,
      message,
    })
  }
})

/*
  Route "extra" (dokumen berlabel bebas) didaftarkan SEBELUM
  GET /:id/documents/:type di bawah - Express mencocokkan route
  berdasarkan urutan pendaftaran, dan ":type" adalah wildcard yang juga
  akan menangkap literal "extra" kalau didaftarkan lebih dulu.
*/

/*
  GET /api/employees/:id/documents/extra
  Daftar dokumen tambahan (label bebas) milik seorang pegawai.
*/
router.get('/:id/documents/extra', async (req, res) => {
  const employeeId = Number(req.params.id)

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID pegawai tidak valid.',
    })
  }

  try {
    const [rows] = await db.query(
      `
        SELECT id, employee_id, label, filename, created_at
        FROM employee_documents
        WHERE employee_id = ?
        ORDER BY id ASC
      `,
      [employeeId],
    )

    res.json({
      success: true,
      message: 'Dokumen tambahan berhasil diambil.',
      data: rows,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil dokumen tambahan.',
    })
  }
})

/*
  POST /api/employees/:id/documents/extra
  Unggah satu dokumen tambahan dengan label bebas (mis. "Ijazah").
*/
router.post('/:id/documents/extra', async (req, res) => {
  const employeeId = Number(req.params.id)

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID pegawai tidak valid.',
    })
  }

  try {
    await runExtraDocumentUpload(req, res)

    const existing = await getEmployeeById(employeeId)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan.',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File wajib dipilih.',
      })
    }

    const label = cleanText(req.body?.label, 100) || 'Dokumen Tambahan'
    const extension = ALLOWED_DOCUMENT_MIME_TYPES[req.file.mimetype]
    const filename = `emp${employeeId}-extra-${Date.now()}.${extension}`
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file.buffer)

    const [result] = await db.query(
      'INSERT INTO employee_documents (employee_id, label, filename) VALUES (?, ?, ?)',
      [employeeId, label, filename],
    )

    res.status(201).json({
      success: true,
      message: 'Dokumen tambahan berhasil diunggah.',
      data: {
        id: result.insertId,
        employee_id: employeeId,
        label,
        filename,
      },
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: multerErrorMessage(error),
    })
  }
})

/*
  GET /api/employees/:id/documents/extra/:docId/file
  Unduh/lihat isi satu dokumen tambahan.
*/
router.get('/:id/documents/extra/:docId/file', async (req, res) => {
  const employeeId = Number(req.params.id)
  const docId = Number(req.params.docId)

  if (
    !Number.isInteger(employeeId) || employeeId <= 0 ||
    !Number.isInteger(docId) || docId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'ID tidak valid.',
    })
  }

  try {
    const [rows] = await db.query(
      'SELECT filename FROM employee_documents WHERE id = ? AND employee_id = ? LIMIT 1',
      [docId, employeeId],
    )
    const document = rows[0]

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan.',
      })
    }

    const filePath = path.join(UPLOAD_DIR, path.basename(document.filename))

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File dokumen tidak ditemukan di server.',
      })
    }

    res.sendFile(filePath)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil dokumen tambahan.',
    })
  }
})

/*
  DELETE /api/employees/:id/documents/extra/:docId
*/
router.delete('/:id/documents/extra/:docId', async (req, res) => {
  const employeeId = Number(req.params.id)
  const docId = Number(req.params.docId)

  if (
    !Number.isInteger(employeeId) || employeeId <= 0 ||
    !Number.isInteger(docId) || docId <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'ID tidak valid.',
    })
  }

  try {
    const [rows] = await db.query(
      'SELECT filename FROM employee_documents WHERE id = ? AND employee_id = ? LIMIT 1',
      [docId, employeeId],
    )
    const document = rows[0]

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan.',
      })
    }

    await db.query('DELETE FROM employee_documents WHERE id = ?', [docId])
    fs.unlink(path.join(UPLOAD_DIR, path.basename(document.filename)), () => {})

    res.json({
      success: true,
      message: 'Dokumen tambahan berhasil dihapus.',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus dokumen tambahan.',
    })
  }
})

/*
  GET /api/employees/:id/documents/:type
  Unduh/lihat dokumen pegawai yang sudah diunggah. type: cv | ktp | npwp | sertifikat
*/
router.get('/:id/documents/:type', async (req, res) => {
  const employeeId = Number(req.params.id)
  const config = DOCUMENT_FIELDS[String(req.params.type || '')]

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID pegawai tidak valid.',
    })
  }

  if (!config) {
    return res.status(400).json({
      success: false,
      message: 'Jenis dokumen tidak dikenal.',
    })
  }

  try {
    const existing = await getEmployeeById(employeeId)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan.',
      })
    }

    const filename = existing[config.column]

    if (!filename) {
      return res.status(404).json({
        success: false,
        message: `Dokumen ${config.label} belum diunggah.`,
      })
    }

    const filePath = path.join(UPLOAD_DIR, path.basename(filename))

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File dokumen tidak ditemukan di server.',
      })
    }

    res.sendFile(filePath)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil dokumen pegawai.',
    })
  }
})

router.patch('/:id/status', async (req, res) => {
  try {
    const status = normalizeEnum(
      req.body?.employment_status ?? req.body?.status,
      EMPLOYMENT_STATUSES,
    )

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          'Status pegawai hanya boleh active atau inactive.',
      })
    }

    const existing = await getEmployeeById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan.',
      })
    }

    await db.query(
      `
        UPDATE employees
        SET employment_status = ?
        WHERE id = ?
      `,
      [status, req.params.id],
    )

    res.json({
      success: true,
      message: `Status pegawai berhasil diubah menjadi ${status}.`,
      data: await getEmployeeById(req.params.id),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status pegawai.',
    })
  }
})



/*
  DELETE /api/employees/:id
  Penghapusan hanya diizinkan untuk pegawai yang belum memiliki riwayat payroll.
  Jika sudah ada payroll, gunakan status inactive agar jejak akuntansi tetap terjaga.
*/
router.delete('/:id', async (req, res) => {
  const employeeId = Number(req.params.id)

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID pegawai tidak valid.',
    })
  }

  let connection

  try {
    const existing = await getEmployeeById(employeeId)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [payrollRows] = await connection.query(
      'SELECT COUNT(*) AS total FROM payroll_records WHERE employee_id = ?',
      [employeeId],
    )
    const [projectRows] = await connection.query(
      `
        SELECT COUNT(DISTINCT project_id) AS total
        FROM project_members
        WHERE employee_id = ?
      `,
      [employeeId],
    )

    const payrollCount = Number(payrollRows?.[0]?.total || 0)
    const projectCount = Number(projectRows?.[0]?.total || 0)

    if (payrollCount > 0 || projectCount > 0) {
      const reasons = [
        payrollCount > 0 ? `${payrollCount} riwayat payroll` : '',
        projectCount > 0 ? `${projectCount} proyek CRM` : '',
      ].filter(Boolean).join(' dan ')

      await connection.rollback()
      return res.status(409).json({
        success: false,
        code: 'EMPLOYEE_IN_USE',
        message:
          `Pegawai tidak dapat dihapus karena masih terhubung dengan ${reasons}. Ubah statusnya menjadi Nonaktif agar riwayat tetap aman.`,
        data: {
          payroll_count: payrollCount,
          project_count: projectCount,
        },
      })
    }

    const [extraDocuments] = await connection.query(
      'SELECT filename FROM employee_documents WHERE employee_id = ?',
      [employeeId],
    )

    await connection.query('DELETE FROM employee_documents WHERE employee_id = ?', [employeeId])
    await connection.query('DELETE FROM employees WHERE id = ?', [employeeId])

    for (const config of Object.values(DOCUMENT_FIELDS)) {
      const filename = existing[config.column]
      if (filename) fs.unlink(path.join(UPLOAD_DIR, path.basename(filename)), () => {})
    }
    for (const document of extraDocuments) {
      fs.unlink(path.join(UPLOAD_DIR, path.basename(document.filename)), () => {})
    }
    await connection.commit()

    res.json({
      success: true,
      message: `Pegawai ${existing.employee_name} berhasil dihapus.`,
    })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (_) {
        // Abaikan rollback tambahan bila transaksi sudah selesai.
      }
    }

    if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message:
          'Pegawai tidak dapat dihapus karena sudah dipakai data operasional. Ubah statusnya menjadi Nonaktif.',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menghapus pegawai.',
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
