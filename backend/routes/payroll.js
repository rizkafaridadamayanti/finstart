const express = require('express')
const db = require('../config/db')
const taxModule = require('./taxes')
const { buildEmployeePph21Calculation } = taxModule

const router = express.Router()

const SALARY_EXPENSE_CODE = '5100'
const BPJS_EXPENSE_CODE = '5110'
const BPJS_PAYABLE_CODE = '2220'
const DEFAULT_BANK_CODE = '1120'
const TAX_PAYABLE_CODE = '2200'
const EMPLOYEE_RECEIVABLE_CODE = '1150'
const OTHER_DEDUCTION_PAYABLE_CODE = '2225'

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

let payrollSchemaReady = null

async function addColumnIfMissing(executor, table, column, definition) {
  const [rows] = await executor.query(
    `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, column],
  )
  if (!rows.length) await executor.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`)
}

async function ensurePayrollEnhancements(executor = db) {
  if (executor === db && payrollSchemaReady) return payrollSchemaReady
  const work = (async () => {
    await addColumnIfMissing(executor, 'payroll_records', 'overtime_amount', 'DECIMAL(15,2) NOT NULL DEFAULT 0')
    await addColumnIfMissing(executor, 'payroll_records', 'allowance_amount', 'DECIMAL(15,2) NOT NULL DEFAULT 0')
    await addColumnIfMissing(executor, 'payroll_records', 'bonus_amount', 'DECIMAL(15,2) NOT NULL DEFAULT 0')
    await addColumnIfMissing(executor, 'payroll_records', 'loan_deduction', 'DECIMAL(15,2) NOT NULL DEFAULT 0')
    await addColumnIfMissing(executor, 'payroll_records', 'other_deduction', 'DECIMAL(15,2) NOT NULL DEFAULT 0')
    await addColumnIfMissing(executor, 'payroll_records', 'pph21_amount', 'DECIMAL(15,2) NOT NULL DEFAULT 0')
    await addColumnIfMissing(executor, 'payroll_records', 'tax_record_id', 'BIGINT UNSIGNED NULL')
  })()
  if (executor === db) payrollSchemaReady = work.catch((error) => { payrollSchemaReady = null; throw error })
  return work
}

async function ensureOperationalAccount(executor, code, name, type, normalBalance) {
  const existing = await findAccountByCode(executor, code, type)
  if (existing) return existing
  const [result] = await executor.query(
    `INSERT INTO accounts (code, name, type, normal_balance, opening_balance, current_balance, status) VALUES (?, ?, ?, ?, 0, 0, 'active')`,
    [code, name, type, normalBalance],
  )
  const [rows] = await executor.query(`SELECT id, code, name, type, normal_balance, status FROM accounts WHERE id = ? LIMIT 1`, [result.insertId])
  return rows[0]
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
        COALESCE(e.ptkp_status, 'TK/0') AS ptkp_status,
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

function calculatePayroll(employee, bpjsConfig, adjustments = {}) {
  const baseSalary = money(employee.base_salary)
  const overtimeAmount = money(adjustments.overtime_amount)
  const allowanceAmount = money(adjustments.allowance_amount)
  const bonusAmount = money(adjustments.bonus_amount)
  const loanDeduction = money(adjustments.loan_deduction)
  const otherDeduction = money(adjustments.other_deduction)
  const grossSalary = money(baseSalary + overtimeAmount + allowanceAmount + bonusAmount)
  const hasBpjs = employee.bpjs_status === 'active'

  const healthCompanyRate = hasBpjs ? numberValue(bpjsConfig.health_company_rate) : 0
  const healthEmployeeRate = hasBpjs ? numberValue(bpjsConfig.health_employee_rate) : 0
  const jhtCompanyRate = hasBpjs ? numberValue(bpjsConfig.jht_company_rate) : 0
  const jhtEmployeeRate = hasBpjs ? numberValue(bpjsConfig.jht_employee_rate) : 0
  const jpCompanyRate = hasBpjs ? numberValue(bpjsConfig.jp_company_rate) : 0
  const jpEmployeeRate = hasBpjs ? numberValue(bpjsConfig.jp_employee_rate) : 0

  const healthCompanyAmount = money(baseSalary * healthCompanyRate / 100)
  const healthEmployeeAmount = money(baseSalary * healthEmployeeRate / 100)
  const jhtCompanyAmount = money(baseSalary * jhtCompanyRate / 100)
  const jhtEmployeeAmount = money(baseSalary * jhtEmployeeRate / 100)
  const jpCompanyAmount = money(baseSalary * jpCompanyRate / 100)
  const jpEmployeeAmount = money(baseSalary * jpEmployeeRate / 100)

  const employeeBpjsDeduction = money(healthEmployeeAmount + jhtEmployeeAmount + jpEmployeeAmount)
  const employerBpjsContribution = money(healthCompanyAmount + jhtCompanyAmount + jpCompanyAmount)
  const bpjsPayableAmount = money(employeeBpjsDeduction + employerBpjsContribution)

  return {
    base_salary: baseSalary,
    overtime_amount: overtimeAmount,
    allowance_amount: allowanceAmount,
    bonus_amount: bonusAmount,
    loan_deduction: loanDeduction,
    other_deduction: otherDeduction,
    gross_salary: grossSalary,
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
    'overtime_amount',
    'allowance_amount',
    'bonus_amount',
    'loan_deduction',
    'other_deduction',
    'pph21_amount',
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

router.use(async (req, res, next) => {
  try { await ensurePayrollEnhancements(); next() } catch (error) { next(error) }
})

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
          COALESCE(SUM(overtime_amount + allowance_amount + bonus_amount), 0) AS total_additional_income,
          COALESCE(SUM(pph21_amount), 0) AS total_pph21_amount,
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
        total_additional_income: numberValue(rows.total_additional_income),
        total_pph21_amount: numberValue(rows.total_pph21_amount),
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
          pr.base_salary, pr.overtime_amount, pr.allowance_amount, pr.bonus_amount, pr.loan_deduction, pr.other_deduction, pr.pph21_amount,
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
        overtime_amount: numberValue(record.overtime_amount), allowance_amount: numberValue(record.allowance_amount), bonus_amount: numberValue(record.bonus_amount), loan_deduction: numberValue(record.loan_deduction), other_deduction: numberValue(record.other_deduction), pph21_amount: numberValue(record.pph21_amount),
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

async function processPayrollRecord(input) {
  await ensurePayrollEnhancements()
  let connection
  const employeeId = Number(input?.employee_id)
  const payrollPeriod = String(input?.payroll_period || currentPeriod())
  const paymentDate = String(input?.payment_date || today())
  const cashAccountId = input?.cash_account_id ? Number(input.cash_account_id) : null
  const notes = cleanText(input?.notes)
  const adjustments = {
    overtime_amount: money(input?.overtime_amount),
    allowance_amount: money(input?.allowance_amount),
    bonus_amount: money(input?.bonus_amount),
    loan_deduction: money(input?.loan_deduction),
    other_deduction: money(input?.other_deduction),
  }
  for (const [key, value] of Object.entries(adjustments)) if (value < 0) throw new Error(`${key} tidak boleh bernilai negatif.`)

  if (!Number.isInteger(employeeId) || employeeId <= 0) throw new Error('Pegawai payroll wajib dipilih.')
  if (!isValidPeriod(payrollPeriod)) throw new Error('Periode payroll harus berformat YYYY-MM.')
  if (!isValidDate(paymentDate)) throw new Error('Tanggal pembayaran payroll tidak valid.')

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()
    const employee = await getEmployeeForPayroll(connection, employeeId)
    if (!employee) throw new Error('Pegawai tidak ditemukan.')
    if (employee.employment_status !== 'active') throw new Error('Payroll hanya dapat diproses untuk pegawai aktif.')
    if (numberValue(employee.base_salary) <= 0) throw new Error('Gaji pokok pegawai harus lebih dari Rp0.')

    const [existingRows] = await connection.query(
      `SELECT id FROM payroll_records WHERE employee_id = ? AND payroll_period = ? FOR UPDATE`,
      [employeeId, payrollPeriod],
    )
    if (existingRows[0]) throw new Error(`Payroll ${employee.employee_name} untuk periode ${payrollPeriod} sudah pernah diproses.`)

    const [salaryExpense, bpjsExpense, bpjsPayable, cashAccount, bpjsConfig, taxPayable, employeeReceivable, otherDeductionPayable] = await Promise.all([
      ensureOperationalAccount(connection, SALARY_EXPENSE_CODE, 'Beban Gaji', 'expense', 'debit'),
      ensureOperationalAccount(connection, BPJS_EXPENSE_CODE, 'Beban BPJS Perusahaan', 'expense', 'debit'),
      ensureOperationalAccount(connection, BPJS_PAYABLE_CODE, 'Utang BPJS', 'liability', 'credit'),
      findCashAccount(connection, cashAccountId),
      getBpjsConfig(connection),
      ensureOperationalAccount(connection, TAX_PAYABLE_CODE, 'Utang Pajak', 'liability', 'credit'),
      ensureOperationalAccount(connection, EMPLOYEE_RECEIVABLE_CODE, 'Piutang Pegawai / Kasbon', 'asset', 'debit'),
      ensureOperationalAccount(connection, OTHER_DEDUCTION_PAYABLE_CODE, 'Utang Potongan Lain Payroll', 'liability', 'credit'),
    ])
    if (!salaryExpense) throw new Error(`Akun Beban Gaji (${SALARY_EXPENSE_CODE}) tidak ditemukan atau tidak aktif.`)
    if (!bpjsExpense) throw new Error(`Akun Beban BPJS Perusahaan (${BPJS_EXPENSE_CODE}) tidak ditemukan atau tidak aktif.`)
    if (!bpjsPayable) throw new Error(`Akun Utang BPJS (${BPJS_PAYABLE_CODE}) tidak ditemukan atau tidak aktif.`)
    if (!cashAccount) throw new Error('Akun Kas/Bank untuk pembayaran payroll tidak ditemukan atau tidak aktif.')

    const calculation = calculatePayroll(employee, bpjsConfig, adjustments)
    let pph21Amount = money(input?.pph21_amount)
    let pph21Info = null
    if (!pph21Amount && calculation.gross_salary > 0) {
      pph21Info = buildEmployeePph21Calculation({
        employee_name: employee.employee_name,
        employee_nik: employee.nik,
        employee_position: employee.position_name,
        tax_period: payrollPeriod,
        ptkp_status: employee.ptkp_status || 'TK/0',
        base_salary: money(calculation.base_salary + calculation.overtime_amount + calculation.bonus_amount),
        allowance_amount: calculation.allowance_amount,
      })
      if (pph21Info.needs_final_reconciliation) {
        throw new Error('Payroll Desember memerlukan rekonsiliasi PPh 21 tahunan. Isi PPh 21 final secara manual setelah perhitungan resmi.')
      }
      pph21Amount = money(pph21Info.pph21_amount)
    }
    const totalDeductions = money(calculation.employee_bpjs_deduction + pph21Amount + calculation.loan_deduction + calculation.other_deduction)
    const netPay = money(calculation.gross_salary - totalDeductions)
    if (netPay < 0) throw new Error('Total potongan payroll tidak boleh melebihi penghasilan bruto.')
    let taxRecordId = null
    if (pph21Amount > 0) {
      const dueDate = `${payrollPeriod}-01`
      const [taxResult] = await connection.query(
        `INSERT INTO tax_records (tax_type, tax_period, amount, due_date, status, notes) VALUES ('PPh 21', ?, ?, ?, 'unpaid', ?)`,
        [payrollPeriod, pph21Amount, dueDate, `PPh 21 payroll ${employee.employee_name}; PTKP ${employee.ptkp_status || 'TK/0'}.`],
      )
      taxRecordId = taxResult.insertId
    }
    const [recordResult] = await connection.query(
      `
        INSERT INTO payroll_records (
          employee_id, payroll_period, payment_date, employee_code, employee_name,
          employee_nik, employee_position, base_salary, overtime_amount, allowance_amount, bonus_amount,
          loan_deduction, other_deduction, pph21_amount, tax_record_id, health_company_rate,
          health_employee_rate, jht_company_rate, jht_employee_rate, jp_company_rate,
          jp_employee_rate, health_company_amount, health_employee_amount,
          jht_company_amount, jht_employee_amount, jp_company_amount, jp_employee_amount,
          employee_bpjs_deduction, employer_bpjs_contribution, net_pay,
          salary_expense_account_id, bpjs_expense_account_id, cash_account_id,
          bpjs_payable_account_id, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
      `,
      [
        employee.id, payrollPeriod, paymentDate, employee.employee_code,
        employee.employee_name, employee.nik, employee.position_name,
        calculation.base_salary, calculation.overtime_amount, calculation.allowance_amount, calculation.bonus_amount,
        calculation.loan_deduction, calculation.other_deduction, pph21Amount, taxRecordId,
        calculation.health_company_rate, calculation.health_employee_rate,
        calculation.jht_company_rate, calculation.jht_employee_rate, calculation.jp_company_rate,
        calculation.jp_employee_rate, calculation.health_company_amount,
        calculation.health_employee_amount, calculation.jht_company_amount,
        calculation.jht_employee_amount, calculation.jp_company_amount,
        calculation.jp_employee_amount, calculation.employee_bpjs_deduction,
        calculation.employer_bpjs_contribution, netPay,
        salaryExpense.id, bpjsExpense.id, cashAccount.id, bpjsPayable.id, notes,
      ],
    )

    const payrollId = recordResult.insertId
    const lines = [
      { account_id: salaryExpense.id, description: `Beban gaji ${employee.employee_name} periode ${payrollPeriod}`, debit: calculation.gross_salary, credit: 0 },
      { account_id: bpjsExpense.id, description: `Beban BPJS perusahaan ${employee.employee_name} periode ${payrollPeriod}`, debit: calculation.employer_bpjs_contribution, credit: 0 },
      { account_id: cashAccount.id, description: `Pembayaran gaji bersih ${employee.employee_name} periode ${payrollPeriod}`, debit: 0, credit: netPay },
      { account_id: bpjsPayable.id, description: `Utang BPJS ${employee.employee_name} periode ${payrollPeriod}`, debit: 0, credit: calculation.bpjs_payable_amount },
      { account_id: taxPayable.id, description: `Utang PPh 21 ${employee.employee_name} periode ${payrollPeriod}`, debit: 0, credit: pph21Amount },
      { account_id: employeeReceivable.id, description: `Pelunasan kasbon pegawai ${employee.employee_name} periode ${payrollPeriod}`, debit: 0, credit: calculation.loan_deduction },
      { account_id: otherDeductionPayable.id, description: `Potongan lain payroll ${employee.employee_name} periode ${payrollPeriod}`, debit: 0, credit: calculation.other_deduction },
    ].filter((line) => numberValue(line.debit) > 0 || numberValue(line.credit) > 0)

    const journalId = await postJournal(connection, {
      voucher_number: `PRL-${payrollPeriod.replace('-', '')}-${employee.id}`,
      transaction_date: paymentDate,
      description: `Payroll ${employee.employee_name} periode ${payrollPeriod}`,
      source_id: payrollId,
      lines,
    })

    await connection.query(
      `UPDATE payroll_records SET journal_entry_id = ?, status = 'posted' WHERE id = ?`,
      [journalId, payrollId],
    )
    await connection.commit()
    return await getPayrollRecord(db, payrollId)
  } catch (error) {
    if (connection) await connection.rollback()
    throw error
  } finally {
    if (connection) connection.release()
  }
}

router.get('/export/bank-transfer', async (req, res) => {
  try {
    const period = String(req.query.period || currentPeriod())
    if (!isValidPeriod(period)) return res.status(400).json({ success: false, message: 'Periode payroll harus berformat YYYY-MM.' })
    const [rows] = await db.query(
      `SELECT pr.id, pr.payroll_period, pr.payment_date, pr.employee_code, pr.employee_name,
              pr.net_pay, e.bank_name, e.bank_account_number,
              COALESCE(e.bank_account_holder, e.full_name, e.name) AS bank_account_holder
       FROM payroll_records pr
       INNER JOIN employees e ON e.id = pr.employee_id
       WHERE pr.payroll_period = ? AND pr.status = 'posted'
       ORDER BY pr.employee_name ASC`,
      [period],
    )
    res.json({
      success: true,
      message: 'Data transfer bank payroll berhasil diambil.',
      data: rows.map((row) => ({ ...row, net_pay: numberValue(row.net_pay) })),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil export transfer bank.', error: error.message })
  }
})

router.get('/:id/payslip', async (req, res) => {
  try {
    const record = await getPayrollRecord(db, req.params.id)
    if (!record) return res.status(404).json({ success: false, message: 'Data payroll tidak ditemukan.' })
    const [employees] = await db.query(
      `SELECT email, phone, bank_name, bank_account_number,
              COALESCE(bank_account_holder, full_name, name) AS bank_account_holder
       FROM employees WHERE id = ? LIMIT 1`,
      [record.employee_id],
    )
    res.json({ success: true, message: 'Payslip berhasil diambil.', data: { ...record, employee_contact: employees[0] || null } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil payslip.', error: error.message })
  }
})

router.post('/process', async (req, res) => {
  try {
    const record = await processPayrollRecord(req.body || {})
    res.status(201).json({
      success: true,
      message: 'Payroll berhasil dicatat dan jurnal otomatis berhasil diposting.',
      data: record,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal memproses payroll.' })
  }
})

router.post('/process-bulk', async (req, res) => {
  try {
    const payrollPeriod = String(req.body?.payroll_period || currentPeriod())
    const paymentDate = String(req.body?.payment_date || today())
    const cashAccountId = Number(req.body?.cash_account_id)
    const requestedIds = Array.isArray(req.body?.employee_ids)
      ? req.body.employee_ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
      : []

    if (!isValidPeriod(payrollPeriod)) return res.status(400).json({ success: false, message: 'Periode payroll harus berformat YYYY-MM.' })
    if (!isValidDate(paymentDate)) return res.status(400).json({ success: false, message: 'Tanggal pembayaran payroll tidak valid.' })
    if (!Number.isInteger(cashAccountId) || cashAccountId <= 0) return res.status(400).json({ success: false, message: 'Akun Kas/Bank wajib dipilih.' })

    const params = []
    let filter = "employment_status = 'active' AND COALESCE(base_salary, 0) > 0"
    if (requestedIds.length) {
      filter += ' AND id IN (?)'
      params.push([...new Set(requestedIds)])
    }
    const [employees] = await db.query(`SELECT id, full_name, name FROM employees WHERE ${filter} ORDER BY full_name, name, id`, params)
    if (!employees.length) return res.status(400).json({ success: false, message: 'Tidak ada pegawai aktif bergaji yang dapat diproses.' })

    const processed = []
    const skipped = []
    for (const employee of employees) {
      try {
        const record = await processPayrollRecord({
          employee_id: employee.id,
          payroll_period: payrollPeriod,
          payment_date: paymentDate,
          cash_account_id: cashAccountId,
          notes: req.body?.notes || 'Payroll massal diproses dari workspace FinStart.',
        })
        processed.push(record)
      } catch (error) {
        skipped.push({ employee_id: employee.id, employee_name: employee.full_name || employee.name, reason: error.message })
      }
    }

    res.status(processed.length ? 201 : 400).json({
      success: processed.length > 0,
      message: processed.length
        ? `Payroll massal berhasil diproses untuk ${processed.length} pegawai.`
        : 'Tidak ada payroll baru yang diproses.',
      data: { payroll_period: payrollPeriod, processed, skipped },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memproses payroll massal.', error: error.message })
  }
})

module.exports = router
