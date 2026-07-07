const express = require('express')
const db = require('../config/db')

const router = express.Router()

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

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
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
  const period = new Date().toISOString().slice(0, 7).replace('-', '')

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
      error: error.message,
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
      error: error.message,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          : error.message || 'Gagal menambahkan pegawai.',
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
          : error.message || 'Gagal memperbarui pegawai.',
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
      error: error.message,
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

    if (Number(payrollRows?.[0]?.total || 0) > 0) {
      await connection.rollback()
      return res.status(409).json({
        success: false,
        message:
          'Pegawai tidak dapat dihapus karena sudah memiliki riwayat payroll. Ubah statusnya menjadi Nonaktif agar riwayat tetap aman.',
      })
    }

    await connection.query('DELETE FROM employees WHERE id = ?', [employeeId])
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
      error: error?.message,
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router