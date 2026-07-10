const express = require('express')
const db = require('../config/db')

const router = express.Router()

const TAX_PAYABLE_ACCOUNT_CODE = '2200'
const DEFAULT_TAX_EXPENSE_ACCOUNT_CODE = '5100'
const DEFAULT_BANK_ACCOUNT_CODE = '1120'
const PPH23_PAYABLE_ACCOUNT_CODE = '2211'

/*
  TER PPh 21 bulanan untuk pegawai tetap (masa Januari–November).
  Kategori PTKP:
  A = TK/0, TK/1, K/0
  B = TK/2, TK/3, K/1, K/2
  C = K/3
*/
const TER_MONTHLY = {
  A: [
    [5400000, 0], [5650000, 0.0025], [5950000, 0.005], [6300000, 0.0075],
    [6750000, 0.01], [7500000, 0.0125], [8550000, 0.015], [9650000, 0.0175],
    [10050000, 0.02], [10350000, 0.0225], [10700000, 0.025], [11050000, 0.03],
    [11600000, 0.035], [12500000, 0.04], [13750000, 0.05], [15100000, 0.06],
    [16950000, 0.07], [19750000, 0.08], [24150000, 0.09], [26450000, 0.10],
    [28000000, 0.11], [30050000, 0.12], [32400000, 0.13], [35400000, 0.14],
    [39100000, 0.15], [43850000, 0.16], [47800000, 0.17], [51400000, 0.18],
    [56300000, 0.19], [62200000, 0.20], [68600000, 0.21], [77500000, 0.22],
    [89000000, 0.23], [103000000, 0.24], [125000000, 0.25], [157000000, 0.26],
    [206000000, 0.27], [337000000, 0.28], [454000000, 0.29], [550000000, 0.30],
    [695000000, 0.31], [910000000, 0.32], [1400000000, 0.33], [Infinity, 0.34],
  ],
  B: [
    [6200000, 0], [6500000, 0.0025], [6850000, 0.005], [7300000, 0.0075],
    [9200000, 0.01], [10750000, 0.015], [11250000, 0.02], [11600000, 0.025],
    [12600000, 0.03], [13600000, 0.04], [14950000, 0.05], [16400000, 0.06],
    [18450000, 0.07], [21850000, 0.08], [26000000, 0.09], [27700000, 0.10],
    [29350000, 0.11], [31450000, 0.12], [33950000, 0.13], [37100000, 0.14],
    [41100000, 0.15], [45800000, 0.16], [49500000, 0.17], [53800000, 0.18],
    [58500000, 0.19], [64000000, 0.20], [71000000, 0.21], [80000000, 0.22],
    [93000000, 0.23], [109000000, 0.24], [129000000, 0.25], [163000000, 0.26],
    [211000000, 0.27], [374000000, 0.28], [459000000, 0.29], [555000000, 0.30],
    [704000000, 0.31], [957000000, 0.32], [1405000000, 0.33], [Infinity, 0.34],
  ],
  C: [
    [6600000, 0], [6950000, 0.0025], [7350000, 0.005], [7800000, 0.0075],
    [8850000, 0.01], [9800000, 0.0125], [10950000, 0.015], [11200000, 0.0175],
    [12050000, 0.02], [12950000, 0.03], [14150000, 0.04], [15550000, 0.05],
    [17050000, 0.06], [19500000, 0.07], [22700000, 0.08], [26600000, 0.09],
    [28100000, 0.10], [30100000, 0.11], [32600000, 0.12], [35400000, 0.13],
    [38900000, 0.14], [43000000, 0.15], [47400000, 0.16], [51200000, 0.17],
    [55800000, 0.18], [60400000, 0.19], [66700000, 0.20], [74500000, 0.21],
    [83200000, 0.22], [95600000, 0.23], [110000000, 0.24], [134000000, 0.25],
    [169000000, 0.26], [221000000, 0.27], [390000000, 0.28], [463000000, 0.29],
    [561000000, 0.30], [709000000, 0.31], [965000000, 0.32], [1419000000, 0.33],
    [Infinity, 0.34],
  ],
}

const PTKP_CATEGORY = {
  'TK/0': 'A',
  'TK/1': 'A',
  'K/0': 'A',
  'TK/2': 'B',
  'TK/3': 'B',
  'K/1': 'B',
  'K/2': 'B',
  'K/3': 'C',
}

function numberValue(value) {
  return Number(value || 0)
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
}

function isValidPeriod(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ''))
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getPeriodData(requestedPeriod) {
  const today = new Date()
  const fallback = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const period = isValidPeriod(requestedPeriod) ? requestedPeriod : fallback
  const [yearText, monthText] = period.split('-')
  const year = Number(yearText)
  const month = Number(monthText)

  const startDate = `${period}-01`
  const nextMonth = new Date(year, month, 1)
  const endDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

  return { period, year, month, startDate, endDate }
}

function normalizeTaxType(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function getTerRate(category, grossIncome) {
  const table = TER_MONTHLY[category]

  if (!table) {
    throw new Error('Kategori TER tidak valid.')
  }

  const row = table.find(([maximum]) => grossIncome <= maximum)
  return row ? row[1] : 0
}

function buildEmployeePph21Calculation(payload) {
  const employeeName = String(payload.employee_name || '').trim()
  const employeeNik = String(payload.employee_nik || '').trim() || null
  const employeePosition = String(payload.employee_position || '').trim() || null
  const periodInfo = getPeriodData(payload.tax_period)
  const ptkpStatus = String(payload.ptkp_status || '').trim()
  const category = PTKP_CATEGORY[ptkpStatus]
  const baseSalary = numberValue(payload.base_salary)
  const allowanceAmount = numberValue(payload.allowance_amount)

  if (!employeeName) {
    throw new Error('Nama pegawai wajib diisi.')
  }

  if (!category) {
    throw new Error('Pilih status PTKP yang tersedia.')
  }

  if (baseSalary < 0 || allowanceAmount < 0) {
    throw new Error('Gaji dan tunjangan tidak boleh bernilai negatif.')
  }

  const grossIncome = baseSalary + allowanceAmount

  if (grossIncome <= 0) {
    throw new Error('Total penghasilan bruto harus lebih dari Rp0.')
  }

  /*
    TER bulanan hanya dipakai selain masa pajak terakhir.
    Desember / masa terakhir perlu rekonsiliasi tahunan.
  */
  if (periodInfo.month === 12) {
    return {
      employee_name: employeeName,
      employee_nik: employeeNik,
      employee_position: employeePosition,
      tax_period: periodInfo.period,
      ptkp_status: ptkpStatus,
      ter_category: category,
      base_salary: baseSalary,
      allowance_amount: allowanceAmount,
      gross_income: grossIncome,
      ter_rate: null,
      pph21_amount: null,
      take_home_pay: null,
      needs_final_reconciliation: true,
      message:
        'Masa Desember perlu rekonsiliasi PPh 21 tahunan. Gunakan kalkulator atau proses resmi payroll akhir tahun sebelum menyimpan.',
    }
  }

  const terRate = getTerRate(category, grossIncome)
  const pph21Amount = Math.round(grossIncome * terRate)
  const takeHomePay = grossIncome - pph21Amount

  return {
    employee_name: employeeName,
    employee_nik: employeeNik,
    employee_position: employeePosition,
    tax_period: periodInfo.period,
    ptkp_status: ptkpStatus,
    ter_category: category,
    base_salary: baseSalary,
    allowance_amount: allowanceAmount,
    gross_income: grossIncome,
    ter_rate: terRate,
    pph21_amount: pph21Amount,
    take_home_pay: takeHomePay,
    needs_final_reconciliation: false,
  }
}

async function refreshOverdueTaxes(executor = db) {
  await executor.query(`
    UPDATE tax_records
    SET status = 'overdue'
    WHERE status = 'unpaid'
      AND due_date IS NOT NULL
      AND due_date < CURDATE()
  `)
}

async function findAccountByCode(executor, code, expectedType = null) {
  const params = [code]
  let typeFilter = ''

  if (expectedType) {
    typeFilter = 'AND type = ?'
    params.push(expectedType)
  }

  const [rows] = await executor.query(
    `
      SELECT id, code, name, type, normal_balance
      FROM accounts
      WHERE code = ?
        AND status = 'active'
        ${typeFilter}
      LIMIT 1
    `,
    params,
  )

  return rows[0] || null
}

async function findAccountById(executor, id, expectedType = null) {
  const params = [id]
  let typeFilter = ''

  if (expectedType) {
    typeFilter = 'AND type = ?'
    params.push(expectedType)
  }

  const [rows] = await executor.query(
    `
      SELECT id, code, name, type, normal_balance
      FROM accounts
      WHERE id = ?
        AND status = 'active'
        ${typeFilter}
      LIMIT 1
    `,
    params,
  )

  return rows[0] || null
}

async function postAutomaticJournal(connection, payload) {
  const totalDebit = payload.lines.reduce((total, line) => total + numberValue(line.debit), 0)
  const totalCredit = payload.lines.reduce((total, line) => total + numberValue(line.credit), 0)

  if (
    payload.lines.length < 2 ||
    totalDebit <= 0 ||
    Math.abs(totalDebit - totalCredit) > 0.005
  ) {
    throw new Error('Jurnal otomatis tidak seimbang.')
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
      ) VALUES (?, ?, ?, ?, ?, 'posted', NOW())
    `,
    [
      payload.voucher_number,
      payload.transaction_date,
      payload.description,
      payload.source_type,
      payload.source_id,
    ],
  )

  const journalId = journalResult.insertId
  const placeholders = payload.lines.map(() => '(?, ?, ?, ?, ?)').join(', ')
  const values = payload.lines.flatMap((line) => [
    journalId,
    line.account_id,
    line.description || null,
    numberValue(line.debit),
    numberValue(line.credit),
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
      throw new Error('Akun jurnal tidak ditemukan.')
    }

    const delta =
      account.normal_balance === 'debit'
        ? numberValue(line.debit) - numberValue(line.credit)
        : numberValue(line.credit) - numberValue(line.debit)

    await connection.query(
      `
        UPDATE accounts
        SET current_balance = current_balance + ?
        WHERE id = ?
      `,
      [delta, account.id],
    )
  }

  return journalId
}

async function getTaxDetail(executor, taxId) {
  const [rows] = await executor.query(
    `
      SELECT
        tax_records.*,
        CASE
          WHEN tax_records.status = 'unpaid'
            AND tax_records.due_date IS NOT NULL
            AND tax_records.due_date < CURDATE()
          THEN 'overdue'
          ELSE tax_records.status
        END AS display_status,
        obligation_journal.voucher_number AS obligation_voucher_number,
        payment_journal.voucher_number AS payment_voucher_number,
        payroll.id AS payroll_calculation_id,
        payroll.employee_name,
        payroll.payroll_journal_id
      FROM tax_records
      LEFT JOIN journal_entries AS obligation_journal
        ON obligation_journal.source_type = 'tax_record'
        AND obligation_journal.source_id = tax_records.id
      LEFT JOIN journal_entries AS payment_journal
        ON payment_journal.source_type = 'tax_payment'
        AND payment_journal.source_id = tax_records.id
      LEFT JOIN payroll_tax_calculations AS payroll
        ON payroll.tax_record_id = tax_records.id
      WHERE tax_records.id = ?
      LIMIT 1
    `,
    [taxId],
  )

  if (!rows[0]) return null

  return {
    ...rows[0],
    amount: numberValue(rows[0].amount),
  }
}

async function getPayrollTaxDetail(executor, payrollId) {
  const [rows] = await executor.query(
    `
      SELECT
        payroll.*,
        tax_records.status AS tax_status,
        tax_records.due_date,
        tax_records.payment_date,
        tax_records.tax_number,
        tax_records.notes,
        CASE
          WHEN tax_records.status = 'unpaid'
            AND tax_records.due_date IS NOT NULL
            AND tax_records.due_date < CURDATE()
          THEN 'overdue'
          ELSE tax_records.status
        END AS display_tax_status,
        payroll_journal.voucher_number AS payroll_voucher_number,
        tax_payment_journal.voucher_number AS tax_payment_voucher_number,
        salary_account.code AS salary_expense_code,
        salary_account.name AS salary_expense_name,
        cash_account.code AS cash_account_code,
        cash_account.name AS cash_account_name
      FROM payroll_tax_calculations AS payroll
      INNER JOIN tax_records
        ON tax_records.id = payroll.tax_record_id
      LEFT JOIN journal_entries AS payroll_journal
        ON payroll_journal.id = payroll.payroll_journal_id
      LEFT JOIN journal_entries AS tax_payment_journal
        ON tax_payment_journal.source_type = 'tax_payment'
        AND tax_payment_journal.source_id = tax_records.id
      LEFT JOIN accounts AS salary_account
        ON salary_account.id = payroll.salary_expense_account_id
      LEFT JOIN accounts AS cash_account
        ON cash_account.id = payroll.cash_account_id
      WHERE payroll.id = ?
      LIMIT 1
    `,
    [payrollId],
  )

  if (!rows[0]) return null

  return {
    ...rows[0],
    base_salary: numberValue(rows[0].base_salary),
    allowance_amount: numberValue(rows[0].allowance_amount),
    gross_income: numberValue(rows[0].gross_income),
    ter_rate: numberValue(rows[0].ter_rate),
    pph21_amount: numberValue(rows[0].pph21_amount),
    take_home_pay: numberValue(rows[0].take_home_pay),
  }
}

/*
  ===== PPh 21 PEGAWAI =====
*/

router.post('/employee-pph21/calculate', (req, res) => {
  try {
    const calculation = buildEmployeePph21Calculation(req.body || {})

    res.json({
      success: true,
      message: 'Estimasi PPh 21 pegawai berhasil dihitung',
      data: calculation,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghitung PPh 21 pegawai.',
    })
  }
})

router.get('/employee-pph21', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        SELECT
          payroll.*,
          tax_records.status AS tax_status,
          tax_records.due_date,
          tax_records.payment_date,
          tax_records.tax_number,
          tax_records.notes,
          CASE
            WHEN tax_records.status = 'unpaid'
              AND tax_records.due_date IS NOT NULL
              AND tax_records.due_date < CURDATE()
            THEN 'overdue'
            ELSE tax_records.status
          END AS display_tax_status,
          payroll_journal.voucher_number AS payroll_voucher_number,
          tax_payment_journal.voucher_number AS tax_payment_voucher_number
        FROM payroll_tax_calculations AS payroll
        INNER JOIN tax_records
          ON tax_records.id = payroll.tax_record_id
        LEFT JOIN journal_entries AS payroll_journal
          ON payroll_journal.id = payroll.payroll_journal_id
        LEFT JOIN journal_entries AS tax_payment_journal
          ON tax_payment_journal.source_type = 'tax_payment'
          AND tax_payment_journal.source_id = tax_records.id
        ORDER BY payroll.tax_period DESC, payroll.id DESC
      `,
    )

    res.json({
      success: true,
      message: 'Daftar perhitungan PPh 21 pegawai berhasil diambil',
      data: rows.map((row) => ({
        ...row,
        base_salary: numberValue(row.base_salary),
        allowance_amount: numberValue(row.allowance_amount),
        gross_income: numberValue(row.gross_income),
        ter_rate: numberValue(row.ter_rate),
        pph21_amount: numberValue(row.pph21_amount),
        take_home_pay: numberValue(row.take_home_pay),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data PPh 21 pegawai',
      error: error.message,
    })
  }
})

router.post('/employee-pph21', async (req, res) => {
  let connection

  try {
    const calculation = buildEmployeePph21Calculation(req.body || {})

    if (calculation.needs_final_reconciliation) {
      return res.status(400).json({
        success: false,
        message: calculation.message,
      })
    }

    const dueDate = req.body?.due_date || null

    if (dueDate && !isValidDate(dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal jatuh tempo pajak tidak valid.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const notes = [
      `PPh 21 pegawai: ${calculation.employee_name}.`,
      `PTKP ${calculation.ptkp_status} / TER ${calculation.ter_category}.`,
      `Bruto ${calculation.gross_income}.`,
      `Tarif TER ${(calculation.ter_rate * 100).toFixed(2)}%.`,
    ].join(' ')

    const [taxResult] = await connection.query(
      `
        INSERT INTO tax_records (
          tax_type,
          tax_period,
          amount,
          due_date,
          status,
          notes
        ) VALUES ('PPh 21', ?, ?, ?, 'draft', ?)
      `,
      [
        calculation.tax_period,
        calculation.pph21_amount,
        dueDate,
        notes,
      ],
    )

    const [payrollResult] = await connection.query(
      `
        INSERT INTO payroll_tax_calculations (
          tax_record_id,
          employee_name,
          employee_nik,
          employee_position,
          tax_period,
          ptkp_status,
          ter_category,
          base_salary,
          allowance_amount,
          gross_income,
          ter_rate,
          pph21_amount,
          take_home_pay,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
      `,
      [
        taxResult.insertId,
        calculation.employee_name,
        calculation.employee_nik,
        calculation.employee_position,
        calculation.tax_period,
        calculation.ptkp_status,
        calculation.ter_category,
        calculation.base_salary,
        calculation.allowance_amount,
        calculation.gross_income,
        calculation.ter_rate,
        calculation.pph21_amount,
        calculation.take_home_pay,
      ],
    )

    await connection.commit()

    const payroll = await getPayrollTaxDetail(db, payrollResult.insertId)

    res.status(201).json({
      success: true,
      message: 'Draft payroll dan PPh 21 pegawai berhasil dibuat.',
      data: payroll,
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat draft PPh 21 pegawai.',
    })
  } finally {
    if (connection) connection.release()
  }
})

router.post('/employee-pph21/:id/post', async (req, res) => {
  let connection

  try {
    const {
      payroll_date,
      salary_expense_account_id,
      cash_account_id,
    } = req.body || {}

    const payrollDate = payroll_date || getToday()

    if (!isValidDate(payrollDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal payroll tidak valid.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [rows] = await connection.query(
      `
        SELECT
          payroll.*,
          tax_records.status AS tax_status,
          tax_records.due_date
        FROM payroll_tax_calculations AS payroll
        INNER JOIN tax_records
          ON tax_records.id = payroll.tax_record_id
        WHERE payroll.id = ?
        FOR UPDATE
      `,
      [req.params.id],
    )

    const payroll = rows[0]

    if (!payroll) {
      throw new Error('Draft payroll PPh 21 tidak ditemukan.')
    }

    if (payroll.status !== 'draft') {
      throw new Error('Payroll ini sudah diposting.')
    }

    const salaryAccount = salary_expense_account_id
      ? await findAccountById(connection, salary_expense_account_id, 'expense')
      : await findAccountByCode(
          connection,
          DEFAULT_TAX_EXPENSE_ACCOUNT_CODE,
          'expense',
        )

    const cashAccount = cash_account_id
      ? await findAccountById(connection, cash_account_id, 'asset')
      : await findAccountByCode(
          connection,
          DEFAULT_BANK_ACCOUNT_CODE,
          'asset',
        )

    const taxPayableAccount = numberValue(payroll.pph21_amount) > 0
      ? await findAccountByCode(
          connection,
          TAX_PAYABLE_ACCOUNT_CODE,
          'liability',
        )
      : null

    if (!salaryAccount) {
      throw new Error('Pilih akun Beban Gaji yang aktif.')
    }

    if (!cashAccount) {
      throw new Error('Pilih akun Kas atau Bank yang aktif.')
    }

    if (numberValue(payroll.pph21_amount) > 0 && !taxPayableAccount) {
      throw new Error('Akun 2200 — Utang Pajak tidak ditemukan.')
    }

    const lines = [
      {
        account_id: salaryAccount.id,
        description: `Beban gaji ${payroll.employee_name}`,
        debit: numberValue(payroll.gross_income),
        credit: 0,
      },
      {
        account_id: cashAccount.id,
        description: `Gaji bersih ${payroll.employee_name}`,
        debit: 0,
        credit: numberValue(payroll.take_home_pay),
      },
    ]

    if (numberValue(payroll.pph21_amount) > 0) {
      lines.push({
        account_id: taxPayableAccount.id,
        description: `Utang PPh 21 ${payroll.employee_name}`,
        debit: 0,
        credit: numberValue(payroll.pph21_amount),
      })
    }

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `PAYROLL-${payroll.id}`,
      transaction_date: payrollDate,
      description: `Payroll ${payroll.employee_name} periode ${payroll.tax_period}`,
      source_type: 'employee_payroll',
      source_id: payroll.id,
      lines,
    })

    const taxStatus = numberValue(payroll.pph21_amount) > 0
      ? (
        payroll.due_date && payroll.due_date < payrollDate
          ? 'overdue'
          : 'unpaid'
      )
      : 'paid'

    await connection.query(
      `
        UPDATE payroll_tax_calculations
        SET
          status = 'posted',
          payroll_date = ?,
          salary_expense_account_id = ?,
          cash_account_id = ?,
          payroll_journal_id = ?
        WHERE id = ?
      `,
      [
        payrollDate,
        salaryAccount.id,
        cashAccount.id,
        journalId,
        payroll.id,
      ],
    )

    await connection.query(
      `
        UPDATE tax_records
        SET status = ?
        WHERE id = ?
      `,
      [taxStatus, payroll.tax_record_id],
    )

    await connection.commit()

    const updated = await getPayrollTaxDetail(db, payroll.id)

    res.json({
      success: true,
      message:
        numberValue(payroll.pph21_amount) > 0
          ? 'Payroll diposting. Gaji bersih dibayarkan dan PPh 21 menjadi Utang Pajak.'
          : 'Payroll diposting. Tidak ada PPh 21 terutang untuk penghasilan ini.',
      data: updated,
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal memposting payroll.',
    })
  } finally {
    if (connection) connection.release()
  }
})

/*
  ===== KALKULASI PAJAK USAHA =====
*/

router.get('/calculation', async (req, res) => {
  try {
    const { period, startDate, endDate } = getPeriodData(req.query.period)

    const [rows] = await db.query(
      `
        SELECT
          COALESCE(SUM(CASE
            WHEN accounts.type = 'revenue'
            THEN journal_lines.credit - journal_lines.debit
            ELSE 0
          END), 0) AS revenue,

          COALESCE(SUM(CASE
            WHEN accounts.type = 'expense'
            THEN journal_lines.debit - journal_lines.credit
            ELSE 0
          END), 0) AS expense,

          COUNT(DISTINCT journal_entries.id) AS posted_journal_count
        FROM journal_entries
        INNER JOIN journal_lines
          ON journal_lines.journal_entry_id = journal_entries.id
        INNER JOIN accounts
          ON accounts.id = journal_lines.account_id
        WHERE journal_entries.status = 'posted'
          AND journal_entries.transaction_date >= ?
          AND journal_entries.transaction_date < ?
      `,
      [startDate, endDate],
    )

    const result = rows[0]
    const revenue = numberValue(result.revenue)
    const expense = numberValue(result.expense)

    res.json({
      success: true,
      message: 'Dasar kalkulasi pajak berhasil diambil',
      data: {
        period,
        revenue,
        expense,
        net_profit: revenue - expense,
        posted_journal_count: Number(result.posted_journal_count || 0),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil dasar kalkulasi pajak',
      error: error.message,
    })
  }
})

router.get('/summary', async (req, res) => {
  try {
    await refreshOverdueTaxes()

    const [rows] = await db.query(`
      SELECT
        COALESCE(SUM(CASE
          WHEN status IN ('unpaid', 'overdue')
          THEN amount
          ELSE 0
        END), 0) AS total_unpaid,

        COALESCE(SUM(CASE
          WHEN LOWER(REPLACE(tax_type, ' ', '')) = 'ppn'
            AND status IN ('unpaid', 'overdue')
          THEN amount
          ELSE 0
        END), 0) AS ppn_due,

        COALESCE(SUM(CASE
          WHEN LOWER(REPLACE(tax_type, ' ', '')) = 'pph21'
            AND status IN ('unpaid', 'overdue')
          THEN amount
          ELSE 0
        END), 0) AS pph21_due,

        COALESCE(SUM(CASE
          WHEN LOWER(REPLACE(tax_type, ' ', '')) = 'pph23'
            AND status IN ('unpaid', 'overdue')
          THEN amount
          ELSE 0
        END), 0) AS pph23_due,

        COALESCE(SUM(CASE
          WHEN status = 'paid'
          THEN amount
          ELSE 0
        END), 0) AS total_paid,

        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_count,
        SUM(CASE WHEN status IN ('unpaid', 'overdue') THEN 1 ELSE 0 END) AS unpaid_count,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_count
      FROM tax_records
    `)

    const result = rows[0]

    res.json({
      success: true,
      message: 'Ringkasan pajak berhasil diambil',
      data: {
        total_unpaid: numberValue(result.total_unpaid),
        ppn_due: numberValue(result.ppn_due),
        pph21_due: numberValue(result.pph21_due),
        pph23_due: numberValue(result.pph23_due),
        total_paid: numberValue(result.total_paid),
        draft_count: Number(result.draft_count || 0),
        unpaid_count: Number(result.unpaid_count || 0),
        overdue_count: Number(result.overdue_count || 0),
        compliance_status:
          Number(result.overdue_count || 0) === 0
            ? 'Patuh'
            : 'Perlu Tindakan',
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan pajak',
      error: error.message,
    })
  }
})

router.get('/', async (req, res) => {
  try {
    await refreshOverdueTaxes()

    const search = String(req.query.search || '').trim()
    const status = String(req.query.status || '').trim().toLowerCase()
    const period = String(req.query.period || '').trim()

    const whereParts = []
    const params = []

    if (status && status !== 'all') {
      whereParts.push('tax_records.status = ?')
      params.push(status)
    }

    if (period) {
      whereParts.push('tax_records.tax_period = ?')
      params.push(period)
    }

    if (search) {
      whereParts.push(`(
        tax_records.tax_type LIKE ?
        OR COALESCE(tax_records.tax_period, '') LIKE ?
        OR COALESCE(tax_records.tax_number, '') LIKE ?
        OR COALESCE(tax_records.notes, '') LIKE ?
        OR COALESCE(payroll.employee_name, '') LIKE ?
      )`)

      const keyword = `%${search}%`
      params.push(keyword, keyword, keyword, keyword, keyword)
    }

    const whereClause = whereParts.length
      ? `WHERE ${whereParts.join(' AND ')}`
      : ''

    const [rows] = await db.query(
      `
        SELECT
          tax_records.*,
          CASE
            WHEN tax_records.status = 'unpaid'
              AND tax_records.due_date IS NOT NULL
              AND tax_records.due_date < CURDATE()
            THEN 'overdue'
            ELSE tax_records.status
          END AS display_status,
          obligation_journal.voucher_number AS obligation_voucher_number,
          payment_journal.voucher_number AS payment_voucher_number,
          payroll.id AS payroll_calculation_id,
          payroll.employee_name AS payroll_employee_name,
          payroll.status AS payroll_status
        FROM tax_records
        LEFT JOIN journal_entries AS obligation_journal
          ON obligation_journal.source_type = 'tax_record'
          AND obligation_journal.source_id = tax_records.id
        LEFT JOIN journal_entries AS payment_journal
          ON payment_journal.source_type = 'tax_payment'
          AND payment_journal.source_id = tax_records.id
        LEFT JOIN payroll_tax_calculations AS payroll
          ON payroll.tax_record_id = tax_records.id
        ${whereClause}
        ORDER BY
          FIELD(tax_records.status, 'overdue', 'unpaid', 'draft', 'paid'),
          tax_records.due_date ASC,
          tax_records.id DESC
      `,
      params,
    )

    res.json({
      success: true,
      message: 'Daftar pajak berhasil diambil',
      data: rows.map((record) => ({
        ...record,
        amount: numberValue(record.amount),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar pajak',
      error: error.message,
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    await refreshOverdueTaxes()

    const record = await getTaxDetail(db, req.params.id)

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Kewajiban pajak tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      message: 'Detail pajak berhasil diambil',
      data: record,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail pajak',
      error: error.message,
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const {
      tax_type,
      tax_period,
      tax_number,
      amount,
      due_date,
      notes,
    } = req.body || {}

    const taxType = normalizeTaxType(tax_type)
    const taxPeriod = String(tax_period || '').trim()
    const taxNumber = String(tax_number || '').trim() || null
    const taxAmount = numberValue(amount)
    const dueDate = due_date || null
    const note = String(notes || '').trim() || null

    if (!taxType) {
      return res.status(400).json({
        success: false,
        message: 'Jenis pajak wajib dipilih.',
      })
    }

    if (!isValidPeriod(taxPeriod)) {
      return res.status(400).json({
        success: false,
        message: 'Periode pajak harus berformat YYYY-MM.',
      })
    }

    if (taxAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal pajak harus lebih dari Rp0.',
      })
    }

    if (dueDate && !isValidDate(dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal jatuh tempo tidak valid.',
      })
    }

    const [result] = await db.query(
      `
        INSERT INTO tax_records (
          tax_type,
          tax_period,
          tax_number,
          amount,
          due_date,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, 'draft', ?)
      `,
      [taxType, taxPeriod, taxNumber, taxAmount, dueDate, note],
    )

    const record = await getTaxDetail(db, result.insertId)

    res.status(201).json({
      success: true,
      message: 'Draft kewajiban pajak berhasil dibuat.',
      data: record,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal membuat draft pajak',
      error: error.message,
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, status FROM tax_records WHERE id = ? LIMIT 1',
      [req.params.id],
    )

    const record = rows[0]

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Kewajiban pajak tidak ditemukan.',
      })
    }

    if (record.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Hanya draft pajak yang dapat dihapus.',
      })
    }

    await db.query('DELETE FROM tax_records WHERE id = ?', [record.id])

    res.json({
      success: true,
      message: 'Draft pajak berhasil dihapus.',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus draft pajak',
      error: error.message,
    })
  }
})

router.post('/:id/issue', async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [rows] = await connection.query(
      'SELECT * FROM tax_records WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const record = rows[0]

    if (!record) {
      throw new Error('Kewajiban pajak tidak ditemukan.')
    }

    if (record.status !== 'draft') {
      throw new Error('Hanya draft pajak yang dapat diterbitkan.')
    }

    const [payrollRows] = await connection.query(
      `
        SELECT id
        FROM payroll_tax_calculations
        WHERE tax_record_id = ?
        LIMIT 1
      `,
      [record.id],
    )

    if (payrollRows[0]) {
      throw new Error(
        'PPh 21 pegawai harus diposting melalui panel Payroll PPh 21 agar jurnal gaji dan potongan pajaknya benar.',
      )
    }

    const [existingJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'tax_record'
          AND source_id = ?
        LIMIT 1
      `,
      [record.id],
    )

    if (existingJournalRows[0]) {
      throw new Error('Jurnal kewajiban pajak sudah pernah dibuat.')
    }

    const payableAccount = await findAccountByCode(
      connection,
      TAX_PAYABLE_ACCOUNT_CODE,
      'liability',
    )

    const expenseAccountId = req.body?.expense_account_id
    const expenseAccount = expenseAccountId
      ? await findAccountById(connection, expenseAccountId, 'expense')
      : await findAccountByCode(
          connection,
          DEFAULT_TAX_EXPENSE_ACCOUNT_CODE,
          'expense',
        )

    if (!payableAccount) {
      throw new Error(`Akun Utang Pajak dengan kode ${TAX_PAYABLE_ACCOUNT_CODE} tidak ditemukan.`)
    }

    if (!expenseAccount) {
      throw new Error('Pilih akun beban aktif untuk mencatat kewajiban pajak.')
    }

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `TAX-OBL-${record.id}`,
      transaction_date: getToday(),
      description: `Kewajiban ${record.tax_type} periode ${record.tax_period}`,
      source_type: 'tax_record',
      source_id: record.id,
      lines: [
        {
          account_id: expenseAccount.id,
          description: `Beban ${record.tax_type}`,
          debit: numberValue(record.amount),
          credit: 0,
        },
        {
          account_id: payableAccount.id,
          description: `Utang ${record.tax_type}`,
          debit: 0,
          credit: numberValue(record.amount),
        },
      ],
    })

    const nextStatus =
      record.due_date && record.due_date < getToday()
        ? 'overdue'
        : 'unpaid'

    await connection.query(
      'UPDATE tax_records SET status = ? WHERE id = ?',
      [nextStatus, record.id],
    )

    await connection.commit()

    const updatedRecord = await getTaxDetail(db, record.id)

    res.json({
      success: true,
      message: 'Kewajiban pajak berhasil diterbitkan dan jurnal otomatis diposting.',
      data: {
        tax_record: updatedRecord,
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menerbitkan kewajiban pajak.',
    })
  } finally {
    if (connection) connection.release()
  }
})

router.post('/:id/pay', async (req, res) => {
  let connection

  try {
    const {
      payment_date,
      tax_number,
      cash_account_id,
      notes,
    } = req.body || {}

    const paymentDate = payment_date || getToday()

    if (!isValidDate(paymentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal setoran pajak tidak valid.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [rows] = await connection.query(
      'SELECT * FROM tax_records WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const record = rows[0]

    if (!record) {
      throw new Error('Kewajiban pajak tidak ditemukan.')
    }

    if (record.status === 'draft') {
      throw new Error('Terbitkan kewajiban pajak terlebih dahulu.')
    }

    if (record.status === 'paid') {
      throw new Error('Kewajiban pajak ini sudah disetor.')
    }

    const [vatRows] = await connection.query(
      `
        SELECT id
        FROM vat_period_closings
        WHERE tax_record_id = ?
        LIMIT 1
      `,
      [record.id],
    )

    const [pph23Rows] = await connection.query(
      `
        SELECT id, journal_entry_id
        FROM transaction_taxes
        WHERE tax_record_id = ?
          AND tax_type = 'PPH23'
          AND status = 'posted'
        LIMIT 1
      `,
      [record.id],
    )

    const [obligationJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE status = 'posted'
          AND (
            (source_type = 'tax_record' AND source_id = ?)
            OR (source_type = 'employee_payroll' AND source_id IN (
            SELECT id
            FROM payroll_tax_calculations
            WHERE tax_record_id = ?
            ))
            OR (source_type = 'payroll' AND source_id IN (
              SELECT id
              FROM payroll_records
              WHERE tax_record_id = ?
            ))
            OR (source_type = 'vat_closing' AND source_id IN (
              SELECT id
              FROM vat_period_closings
              WHERE tax_record_id = ?
            ))
            OR id IN (
              SELECT journal_entry_id
              FROM transaction_taxes
              WHERE tax_record_id = ?
                AND status = 'posted'
                AND journal_entry_id IS NOT NULL
            )
          )
        LIMIT 1
      `,
      [record.id, record.id, record.id, record.id, record.id],
    )

    if (!obligationJournalRows[0]) {
      throw new Error('Jurnal kewajiban pajak belum diposting.')
    }

    const [paymentJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'tax_payment'
          AND source_id = ?
        LIMIT 1
      `,
      [record.id],
    )

    if (paymentJournalRows[0]) {
      throw new Error('Jurnal setoran pajak sudah pernah dibuat.')
    }

    const settlementAccountCode = pph23Rows[0]
      ? PPH23_PAYABLE_ACCOUNT_CODE
      : TAX_PAYABLE_ACCOUNT_CODE

    const payableAccount = await findAccountByCode(
      connection,
      settlementAccountCode,
      'liability',
    )

    const cashAccount = cash_account_id
      ? await findAccountById(connection, cash_account_id, 'asset')
      : await findAccountByCode(
          connection,
          DEFAULT_BANK_ACCOUNT_CODE,
          'asset',
        )

    if (!payableAccount) {
      throw new Error(`Akun kewajiban pajak dengan kode ${settlementAccountCode} tidak ditemukan.`)
    }

    if (!cashAccount || Number(cashAccount.id) === Number(payableAccount.id)) {
      throw new Error('Pilih akun Kas atau Bank yang valid.')
    }

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `TAX-PAY-${record.id}`,
      transaction_date: paymentDate,
      description: `Setoran ${record.tax_type} periode ${record.tax_period}`,
      source_type: 'tax_payment',
      source_id: record.id,
      lines: [
        {
          account_id: payableAccount.id,
          description: `Pelunasan utang ${record.tax_type}`,
          debit: numberValue(record.amount),
          credit: 0,
        },
        {
          account_id: cashAccount.id,
          description: `Setoran ${record.tax_type}`,
          debit: 0,
          credit: numberValue(record.amount),
        },
      ],
    })

    await connection.query(
      `
        UPDATE tax_records
        SET
          status = 'paid',
          payment_date = ?,
          tax_number = COALESCE(NULLIF(?, ''), tax_number),
          notes = COALESCE(NULLIF(?, ''), notes)
        WHERE id = ?
      `,
      [
        paymentDate,
        String(tax_number || '').trim(),
        String(notes || '').trim(),
        record.id,
      ],
    )

    if (vatRows[0]) {
      await connection.query(
        "UPDATE vat_period_closings SET status = 'paid' WHERE id = ?",
        [vatRows[0].id],
      )
    }

    await connection.commit()

    const updatedRecord = await getTaxDetail(db, record.id)

    res.json({
      success: true,
      message: 'Setoran pajak berhasil dikonfirmasi dan jurnal otomatis diposting.',
      data: {
        tax_record: updatedRecord,
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengonfirmasi setoran pajak.',
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
module.exports.buildEmployeePph21Calculation = buildEmployeePph21Calculation
