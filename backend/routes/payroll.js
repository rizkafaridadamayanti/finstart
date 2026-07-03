const express = require('express')
const db = require('../config/db')

const router = express.Router()

const SALARY_EXPENSE_CODE = '5100'
const BPJS_EXPENSE_CODE = '5110'
const BPJS_PAYABLE_CODE = '2220'
const DEFAULT_BANK_CODE = '1120'

function numberValue(value) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

function money(value) {
  return Math.round((numberValue(value) + Number.EPSILON) * 100) / 100
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function currentPeriod() {
  return new Date().toISOString().slice(0, 7)
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
}

function isValidPeriod(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ''))
}

function cleanText(value, maxLength = 5000) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, maxLength) : null
}

async function findAccountByCode(executor, code, expectedType = null) {
  const values = [code]
  let typeClause = ''

  if (expectedType) {
    typeClause = 'AND type = ?'
    values.push(expectedType)
  }

  const [rows] = await executor.query(
    `
      SELECT id, code, name, type, normal_balance, status
      FROM accounts
      WHERE code = ?
        AND status = 'active'
        ${typeClause}
      LIMIT 1
    `,
    values,
  )

  return rows[0] || null
}

async function findCashAccount(executor, id) {
  if (id) {
    const [rows] = await executor.query(
      `
        SELECT id, code, name, type, normal_balance, status
        FROM accounts
        WHERE id = ?
          AND type = 'asset'
          AND status = 'active'
        LIMIT 1
      `,
      [id],
    )

    return rows[0] || null
  }

  return findAccountByCode(executor, DEFAULT_BANK_CODE, 'asset')
}

async function getBpjsConfig(executor) {
  const [rows] = await executor.query(
    `
      SELECT
        health_company_rate,
        health_employee_rate,
        jht_company_rate,
        jht_employee_rate,
        jp_company_rate,
        jp_employee_rate
      FROM bpjs_configurations
      WHERE id = 1
      LIMIT 1
    `,
  )

  const config = rows[0] || {}

  return {
    health_company_rate: numberValue(config.health_company_rate),
    health_employee_rate: numberValue(config.health_employee_rate),
    jht_company_rate: numberValue(config.jht_company_rate),
    jht_employee_rate: numberValue(config.jht_employee_rate),
    jp_company_rate: numberValue(config.jp_company_rate),
    jp_employee_rate: numberValue(config.jp_employee_rate),
  }
}

async function getEmployeeForPayroll(executor, employeeId) {
  const [rows] = await executor.query(
    `
      SELECT
        e.id,
        e.employee_code,
        COALESCE(NULLIF(e.full_name, ''), e.name) AS employee_name,
        e.nik,
        COALESCE(NULLIF(p.name, ''), NULLIF(e.position, ''), '-') AS position_name,
        e.employment_status,
        e.bpjs_status,
        COALESCE(NULLIF(e.base_salary, 0), e.salary, 0) AS base_salary
      FROM employees e
      LEFT JOIN positions p ON p.id = e.position_id
      WHERE e.id = ?
      LIMIT 1
    `,
    [employeeId],
  )

  return rows[0] || null
}

function calculatePayroll(employee, bpjsConfig) {
  const baseSalary = money(employee.base_salary)
  const hasBpjs = employee.bpjs_status === 'active'

  const healthCompanyRate = hasBpjs
    ? numberValue(bpjsConfig.health_company_rate)
    : 0
  const healthEmployeeRate = hasBpjs
    ? numberValue(bpjsConfig.health_employee_rate)
    : 0
  const jhtCompanyRate = hasBpjs
    ? numberValue(bpjsConfig.jht_company_rate)
    : 0
  const jhtEmployeeRate = hasBpjs
    ? numberValue(bpjsConfig.jht_employee_rate)
    : 0
  const jpCompanyRate = hasBpjs
    ? numberValue(bpjsConfig.jp_company_rate)
    : 0
  const jpEmployeeRate = hasBpjs
    ? numberValue(bpjsConfig.jp_employee_rate)
    : 0

  const healthCompanyAmount = money(baseSalary * healthCompanyRate / 100)
  const healthEmployeeAmount = money(baseSalary * healthEmployeeRate / 100)
  const jhtCompanyAmount = money(baseSalary * jhtCompanyRate / 100)
  const jhtEmployeeAmount = money(baseSalary * jhtEmployeeRate / 100)
  const jpCompanyAmount = money(baseSalary * jpCompanyRate / 100)
  const jpEmployeeAmount = money(baseSalary * jpEmployeeRate / 100)

  const employeeBpjsDeduction = money(
    healthEmployeeAmount + jhtEmployeeAmount + jpEmployeeAmount,
  )

  const employerBpjsContribution = money(
    healthCompanyAmount + jhtCompanyAmount + jpCompanyAmount,
  )

  const netPay = money(baseSalary - employeeBpjsDeduction)
  const bpjsPayableAmount = money(
    employeeBpjsDeduction + employerBpjsContribution,
  )

  return {
    base_salary: baseSalary,
    health_company_rate: healthCompanyRate,
    health_employee_rate: healthEmployeeRate,
    jht_company_rate: jhtCompanyRate,
    jht_employee_rate: jhtEmployeeRate,
    jp_company_rate: jpCompanyRate,
    jp_employee_rate: jpEmployeeRate,
    health_company_amount: healthCompanyAmount,
    health_employee_amount: healthEmployeeAmount,
    jht_company_amount: jhtCompanyAmount,
    jht_employee_amount: jhtEmployeeAmount,
    jp_company_amount: jpCompanyAmount,
    jp_employee_amount: jpEmployeeAmount,
    employee_bpjs_deduction: employeeBpjsDeduction,
    employer_bpjs_contribution: employerBpjsContribution,
    bpjs_payable_amount: bpjsPayableAmount,
    net_pay: netPay,
  }
}

async function postJournal(connection, payload) {
  const totalDebit = money(payload.lines.reduce(
    (total, line) => total + numberValue(line.debit),
    0,
  ))

  const totalCredit = money(payload.lines.reduce(
    (total, line) => total + numberValue(line.credit),
    0,
  ))

  if (
    payload.lines.length < 2 ||
    totalDebit <= 0 ||
    Math.abs(totalDebit - totalCredit) > 0.005
  ) {
    throw new Error('Jurnal payroll tidak seimbang.')
  }

  const [journalResult] = await connection.query(
    `
      INSERT INTO journal_entries (
        voucher_number,
        transaction_date,
        description,
        source_type,
        source_id,
        status,
        posted_at
      ) VALUES (?, ?, ?, 'payroll', ?, 'posted', NOW())
    `,
    [
      payload.voucher_number,
      payload.transaction_date,
      payload.description,
      payload.source_id,
    ],
  )

  const journalEntryId = journalResult.insertId
  const placeholders = payload.lines.map(() => '(?, ?, ?, ?, ?)').join(', ')
  const values = payload.lines.flatMap((line) => [
    journalEntryId,
    line.account_id,
    line.description || null,
    money(line.debit),
    money(line.credit),
  ])

  await connection.query(
    `
      INSERT INTO journal_lines (
        journal_entry_id,
        account_id,
        description,
        debit,
        credit
      ) VALUES ${placeholders}
    `,
    values,
  )

  for (const line of payload.lines) {
    const [accountRows] = await connection.query(
      `
        SELECT id, normal_balance
        FROM accounts
        WHERE id = ?
        FOR UPDATE
      `,
      [line.account_id],
    )

    const account = accountRows[0]

    if (!account) {
      throw new Error('Akun jurnal payroll tidak ditemukan.')
    }

    const delta = account.normal_balance === 'debit'
      ? money(line.debit) - money(line.credit)
      : money(line.credit) - money(line.debit)

    await connection.query(
      `
        UPDATE accounts
        SET current_balance = current_balance + ?
        WHERE id = ?
      `,
      [delta, account.id],
    )
  }

  return journalEntryId
}

async function getPayrollRecord(executor, id) {
  const [rows] = await executor.query(
    `
      SELECT
        pr.*,
        a_salary.code AS salary_expense_code,
        a_salary.name AS salary_expense_name,
        a_bpjs_expense.code AS bpjs_expense_code,
        a_bpjs_expense.name AS bpjs_expense_name,
        a_cash.code AS cash_account_code,
        a_cash.name AS cash_account_name,
        a_bpjs_payable.code AS bpjs_payable_code,
        a_bpjs_payable.name AS bpjs_payable_name,
        je.voucher_number
      FROM payroll_records pr
      INNER JOIN accounts a_salary ON a_salary.id = pr.salary_expense_account_id
      INNER JOIN accounts a_bpjs_expense ON a_bpjs_expense.id = pr.bpjs_expense_account_id
      INNER JOIN accounts a_cash ON a_cash.id = pr.cash_account_id
      INNER JOIN accounts a_bpjs_payable ON a_bpjs_payable.id = pr.bpjs_payable_account_id
      LEFT JOIN journal_entries je ON je.id = pr.journal_entry_id
      WHERE pr.id = ?
      LIMIT 1
    `,
    [id],
  )

  const record = rows[0]
  if (!record) return null

  const moneyFields = [
    'base_salary',
    'health_company_rate',
    'health_employee_rate',
    'jht_company_rate',
    'jht_employee_rate',
    'jp_company_rate',
    'jp_employee_rate',
    'health_company_amount',
    'health_employee_amount',
    'jht_company_amount',
    'jht_employee_amount',
    'jp_company_amount',
    'jp_employee_amount',
    'employee_bpjs_deduction',
    'employer_bpjs_contribution',
    'net_pay',
  ]

  for (const field of moneyFields) {
    record[field] = numberValue(record[field])
  }

  return record
}

router.get('/accounts', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        SELECT id, code, name
        FROM accounts
        WHERE type = 'asset'
          AND status = 'active'
          AND (
            code IN ('1110', '1120')
            OR name REGEXP '(Kas|Bank)'
          )
        ORDER BY code ASC
      `,
    )

    res.json({
      success: true,
      message: 'Daftar akun pembayaran payroll berhasil diambil.',
      data: rows,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil akun pembayaran payroll.',
      error: error.message,
    })
  }
})

router.get('/summary', async (req, res) => {
  try {
    const period = String(req.query.period || currentPeriod())

    if (!isValidPeriod(period)) {
      return res.status(400).json({
        success: false,
        message: 'Periode payroll harus berformat YYYY-MM.',
      })
    }

    const [[rows]] = await db.query(
      `
        SELECT
          COUNT(*) AS payroll_count,
          COALESCE(SUM(base_salary), 0) AS total_base_salary,
          COALESCE(SUM(employee_bpjs_deduction), 0) AS total_employee_bpjs_deduction,
          COALESCE(SUM(employer_bpjs_contribution), 0) AS total_employer_bpjs_contribution,
          COALESCE(SUM(net_pay), 0) AS total_net_pay
        FROM payroll_records
        WHERE payroll_period = ?
          AND status = 'posted'
      `,
      [period],
    )

    res.json({
      success: true,
      message: 'Ringkasan payroll berhasil diambil.',
      data: {
        payroll_period: period,
        payroll_count: Number(rows.payroll_count || 0),
        total_base_salary: numberValue(rows.total_base_salary),
        total_employee_bpjs_deduction: numberValue(rows.total_employee_bpjs_deduction),
        total_employer_bpjs_contribution: numberValue(rows.total_employer_bpjs_contribution),
        total_net_pay: numberValue(rows.total_net_pay),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan payroll.',
      error: error.message,
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const period = req.query.period ? String(req.query.period) : null
    const employeeId = req.query.employee_id ? Number(req.query.employee_id) : null
    const where = []
    const params = []

    if (period) {
      if (!isValidPeriod(period)) {
        return res.status(400).json({
          success: false,
          message: 'Periode payroll harus berformat YYYY-MM.',
        })
      }
      where.push('pr.payroll_period = ?')
      params.push(period)
    }

    if (employeeId) {
      where.push('pr.employee_id = ?')
      params.push(employeeId)
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [rows] = await db.query(
      `
        SELECT
          pr.id,
          pr.employee_id,
          pr.payroll_period,
          pr.payment_date,
          pr.employee_code,
          pr.employee_name,
          pr.employee_nik,
          pr.employee_position,
          pr.base_salary,
          pr.employee_bpjs_deduction,
          pr.employer_bpjs_contribution,
          pr.net_pay,
          pr.status,
          pr.journal_entry_id,
          je.voucher_number
        FROM payroll_records pr
        LEFT JOIN journal_entries je ON je.id = pr.journal_entry_id
        ${whereClause}
        ORDER BY pr.payment_date DESC, pr.id DESC
      `,
      params,
    )

    res.json({
      success: true,
      message: 'Daftar payroll berhasil diambil.',
      data: rows.map((record) => ({
        ...record,
        base_salary: numberValue(record.base_salary),
        employee_bpjs_deduction: numberValue(record.employee_bpjs_deduction),
        employer_bpjs_contribution: numberValue(record.employer_bpjs_contribution),
        net_pay: numberValue(record.net_pay),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar payroll.',
      error: error.message,
    })
  }
})

router.post('/process', async (req, res) => {
  let connection

  try {
    const employeeId = Number(req.body?.employee_id)
    const payrollPeriod = String(req.body?.payroll_period || currentPeriod())
    const paymentDate = String(req.body?.payment_date || today())
    const cashAccountId = req.body?.cash_account_id
      ? Number(req.body.cash_account_id)
      : null
    const notes = cleanText(req.body?.notes)

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Pegawai payroll wajib dipilih.',
      })
    }

    if (!isValidPeriod(payrollPeriod)) {
      return res.status(400).json({
        success: false,
        message: 'Periode payroll harus berformat YYYY-MM.',
      })
    }

    if (!isValidDate(paymentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal pembayaran payroll tidak valid.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const employee = await getEmployeeForPayroll(connection, employeeId)

    if (!employee) {
      throw new Error('Pegawai tidak ditemukan.')
    }

    if (employee.employment_status !== 'active') {
      throw new Error('Payroll hanya dapat diproses untuk pegawai aktif.')
    }

    if (numberValue(employee.base_salary) <= 0) {
      throw new Error('Gaji pokok pegawai harus lebih dari Rp0.')
    }

    const [existingRows] = await connection.query(
      `
        SELECT id
        FROM payroll_records
        WHERE employee_id = ?
          AND payroll_period = ?
        FOR UPDATE
      `,
      [employeeId, payrollPeriod],
    )

    if (existingRows[0]) {
      throw new Error(
        `Payroll ${employee.employee_name} untuk periode ${payrollPeriod} sudah pernah diproses.`,
      )
    }

    const [salaryExpense, bpjsExpense, bpjsPayable, cashAccount, bpjsConfig] = await Promise.all([
      findAccountByCode(connection, SALARY_EXPENSE_CODE, 'expense'),
      findAccountByCode(connection, BPJS_EXPENSE_CODE, 'expense'),
      findAccountByCode(connection, BPJS_PAYABLE_CODE, 'liability'),
      findCashAccount(connection, cashAccountId),
      getBpjsConfig(connection),
    ])

    if (!salaryExpense) {
      throw new Error(`Akun Beban Gaji (${SALARY_EXPENSE_CODE}) tidak ditemukan atau tidak aktif.`)
    }

    if (!bpjsExpense) {
      throw new Error(`Akun Beban BPJS Perusahaan (${BPJS_EXPENSE_CODE}) tidak ditemukan atau tidak aktif.`)
    }

    if (!bpjsPayable) {
      throw new Error(`Akun Utang BPJS (${BPJS_PAYABLE_CODE}) tidak ditemukan atau tidak aktif.`)
    }

    if (!cashAccount) {
      throw new Error('Akun Kas/Bank untuk pembayaran payroll tidak ditemukan atau tidak aktif.')
    }

    const calculation = calculatePayroll(employee, bpjsConfig)

    const [recordResult] = await connection.query(
      `
        INSERT INTO payroll_records (
          employee_id,
          payroll_period,
          payment_date,
          employee_code,
          employee_name,
          employee_nik,
          employee_position,
          base_salary,
          health_company_rate,
          health_employee_rate,
          jht_company_rate,
          jht_employee_rate,
          jp_company_rate,
          jp_employee_rate,
          health_company_amount,
          health_employee_amount,
          jht_company_amount,
          jht_employee_amount,
          jp_company_amount,
          jp_employee_amount,
          employee_bpjs_deduction,
          employer_bpjs_contribution,
          net_pay,
          salary_expense_account_id,
          bpjs_expense_account_id,
          cash_account_id,
          bpjs_payable_account_id,
          notes,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
      `,
      [
        employee.id,
        payrollPeriod,
        paymentDate,
        employee.employee_code,
        employee.employee_name,
        employee.nik,
        employee.position_name,
        calculation.base_salary,
        calculation.health_company_rate,
        calculation.health_employee_rate,
        calculation.jht_company_rate,
        calculation.jht_employee_rate,
        calculation.jp_company_rate,
        calculation.jp_employee_rate,
        calculation.health_company_amount,
        calculation.health_employee_amount,
        calculation.jht_company_amount,
        calculation.jht_employee_amount,
        calculation.jp_company_amount,
        calculation.jp_employee_amount,
        calculation.employee_bpjs_deduction,
        calculation.employer_bpjs_contribution,
        calculation.net_pay,
        salaryExpense.id,
        bpjsExpense.id,
        cashAccount.id,
        bpjsPayable.id,
        notes,
      ],
    )

    const payrollId = recordResult.insertId
    const lines = [
      {
        account_id: salaryExpense.id,
        description: `Beban gaji ${employee.employee_name} periode ${payrollPeriod}`,
        debit: calculation.base_salary,
        credit: 0,
      },
      {
        account_id: bpjsExpense.id,
        description: `Beban BPJS perusahaan ${employee.employee_name} periode ${payrollPeriod}`,
        debit: calculation.employer_bpjs_contribution,
        credit: 0,
      },
      {
        account_id: cashAccount.id,
        description: `Pembayaran gaji bersih ${employee.employee_name} periode ${payrollPeriod}`,
        debit: 0,
        credit: calculation.net_pay,
      },
      {
        account_id: bpjsPayable.id,
        description: `Utang BPJS ${employee.employee_name} periode ${payrollPeriod}`,
        debit: 0,
        credit: calculation.bpjs_payable_amount,
      },
    ].filter((line) => numberValue(line.debit) > 0 || numberValue(line.credit) > 0)

    const journalId = await postJournal(connection, {
      voucher_number: `PRL-${payrollPeriod.replace('-', '')}-${employee.id}`,
      transaction_date: paymentDate,
      description: `Payroll ${employee.employee_name} periode ${payrollPeriod}`,
      source_id: payrollId,
      lines,
    })

    await connection.query(
      `
        UPDATE payroll_records
        SET
          journal_entry_id = ?,
          status = 'posted'
        WHERE id = ?
      `,
      [journalId, payrollId],
    )

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Payroll berhasil dicatat dan jurnal otomatis berhasil diposting.',
      data: await getPayrollRecord(db, payrollId),
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memproses payroll.',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

module.exports = router
