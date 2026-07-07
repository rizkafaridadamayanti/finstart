const express = require('express')
const db = require('../config/db')

const router = express.Router()

function numberValue(value) {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function getPeriodData(requestedPeriod) {
  const today = new Date()
  const fallback = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const period = /^\d{4}-(0[1-9]|1[0-2])$/.test(String(requestedPeriod || ''))
    ? String(requestedPeriod)
    : fallback

  const [yearText, monthText] = period.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const startDate = `${period}-01`
  const nextDate = new Date(year, month, 1)
  const endDate = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-01`
  const label = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))

  return { period, startDate, endDate, label }
}

function dateOnly(value) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

function ageBucket(days) {
  const value = Math.max(0, Number(days || 0))
  if (value <= 30) return '0-30 hari'
  if (value <= 60) return '31-60 hari'
  if (value <= 90) return '61-90 hari'
  return '> 90 hari'
}

function classifyCashMovement(counterparts, sourceType) {
  const source = String(sourceType || '').toLowerCase()
  const types = counterparts.map((item) => String(item.account_type || '').toLowerCase())
  const codes = counterparts.map((item) => String(item.account_code || ''))

  if (['invoice_payment', 'bill_payment', 'tax_payment', 'employee_payroll'].includes(source)) {
    return 'operating'
  }

  if (codes.some((code) => ['1130', '2100', '2200', '2210', '2211', '2220', '2225'].includes(code))) {
    return 'operating'
  }

  if (types.includes('asset')) return 'investing'
  if (types.includes('liability') || types.includes('equity')) return 'financing'
  return 'operating'
}

async function safeRows(query, params, warnings, section) {
  try {
    const [rows] = await db.query(query, params)
    return Array.isArray(rows) ? rows : []
  } catch (error) {
    const message = error?.message || 'Query tidak dapat dijalankan.'
    console.warn(`[reports] ${section}: ${message}`)
    warnings.push({ section, message })
    return []
  }
}

function emptyReportData({ period, label, startDate, endDate }, warnings = []) {
  return {
    period,
    period_label: label,
    income_statement: {
      revenue_items: [],
      expense_items: [],
      total_revenue: 0,
      total_expense: 0,
      net_profit: 0,
    },
    balance_sheet: {
      assets: [],
      liabilities: [],
      equity: [],
      total_assets: 0,
      total_liabilities: 0,
      total_equity: 0,
      total_liabilities_and_equity: 0,
      balance_difference: 0,
    },
    cash_flow: {
      operating_items: [],
      investing_items: [],
      financing_items: [],
      operating_cash_flow: 0,
      investing_cash_flow: 0,
      financing_cash_flow: 0,
      net_cash_increase: 0,
      beginning_cash: 0,
      ending_cash: 0,
    },
    trial_balance: {
      items: [],
      total_debit: 0,
      total_credit: 0,
      difference: 0,
    },
    general_ledger: {
      items: [],
      start_date: startDate,
      end_date_exclusive: endDate,
    },
    receivable_aging: { items: [], total_outstanding: 0 },
    payable_aging: { items: [], total_outstanding: 0 },
    tax_report: { items: [], total: 0 },
    payroll_report: {
      items: [],
      summary: { total_records: 0, total_net_salary: 0, net_salary: 0 },
    },
    asset_report: { items: [], total_book_value: 0, total_period_depreciation: 0 },
    project_profitability: {
      items: [],
      total_profit: 0,
      note: 'Biaya aktual berasal dari bill yang dialokasikan ke proyek.',
    },
    warnings,
  }
}

/*
  GET /api/reports/periods
  Hanya menampilkan periode yang benar-benar memiliki jurnal posted.
*/
router.get('/periods', async (req, res) => {
  const warnings = []
  const rows = await safeRows(
    `
      SELECT DATE_FORMAT(transaction_date, '%Y-%m') AS period,
             COUNT(*) AS posted_journal_count,
             MAX(transaction_date) AS latest_transaction_date
      FROM journal_entries
      WHERE status = 'posted'
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY period DESC
    `,
    [],
    warnings,
    'Daftar periode laporan',
  )

  res.json({
    success: true,
    message: 'Periode laporan berhasil diambil.',
    data: rows.map((row) => ({
      period: row.period,
      label: getPeriodData(row.period).label,
      posted_journal_count: numberValue(row.posted_journal_count),
      latest_transaction_date: row.latest_transaction_date || null,
    })),
    warnings,
  })
})

/*
  GET /api/reports?period=YYYY-MM

  Perhitungan utama sengaja memakai dua query inti yang sederhana:
  1. daftar akun, dan
  2. seluruh baris jurnal posted sampai akhir periode.

  Saldo, laba rugi, trial balance, buku besar, dan arus kas dihitung di Node.
  Dengan cara ini laporan tetap kompatibel dengan database finstart_db yang sudah
  ada dan tidak gagal hanya karena tabel laporan tambahan belum tersedia.
*/
router.get('/', async (req, res) => {
  const periodData = getPeriodData(req.query.period)
  const { period, startDate, endDate, label } = periodData
  const warnings = []
  const data = emptyReportData(periodData, warnings)

  try {
    const accounts = await safeRows(
      `
        SELECT id, code, name, type, normal_balance,
               COALESCE(opening_balance, 0) AS opening_balance,
               status
        FROM accounts
        ORDER BY code ASC
      `,
      [],
      warnings,
      'Daftar akun',
    )

    const journalLines = await safeRows(
      `
        SELECT
          je.id AS journal_entry_id,
          je.voucher_number,
          je.transaction_date,
          je.description AS journal_description,
          je.source_type,
          jl.id AS line_id,
          jl.account_id,
          jl.description AS line_description,
          jl.debit,
          jl.credit,
          a.code AS account_code,
          a.name AS account_name,
          a.type AS account_type,
          a.normal_balance
        FROM journal_entries je
        INNER JOIN journal_lines jl ON jl.journal_entry_id = je.id
        INNER JOIN accounts a ON a.id = jl.account_id
        WHERE je.status = 'posted'
          AND je.transaction_date < ?
        ORDER BY je.transaction_date ASC, je.id ASC, jl.id ASC
      `,
      [endDate],
      warnings,
      'Jurnal posted',
    )

    // Bila query inti gagal, kirim respons sukses dengan peringatan terperinci.
    // UI tidak lagi menyamarkan kegagalan API sebagai angka nol tanpa penjelasan.
    if (accounts.length === 0 && journalLines.length === 0 && warnings.length > 0) {
      data.warnings = warnings
      return res.json({
        success: true,
        message: 'Laporan belum dapat dihitung karena query inti gagal.',
        data,
      })
    }

    const accountMap = new Map()
    accounts.forEach((account) => {
      const normal = String(account.normal_balance || 'debit').toLowerCase()
      accountMap.set(Number(account.id), {
        id: Number(account.id),
        code: account.code,
        name: account.name,
        type: account.type,
        normal_balance: normal,
        opening_balance: numberValue(account.opening_balance),
        balance: numberValue(account.opening_balance),
        period_debit: 0,
        period_credit: 0,
      })
    })

    // Buat akun fallback dari baris jurnal jika akun baru belum muncul di daftar.
    journalLines.forEach((line) => {
      const accountId = Number(line.account_id)
      if (!accountMap.has(accountId)) {
        accountMap.set(accountId, {
          id: accountId,
          code: line.account_code,
          name: line.account_name,
          type: line.account_type,
          normal_balance: String(line.normal_balance || 'debit').toLowerCase(),
          opening_balance: 0,
          balance: 0,
          period_debit: 0,
          period_credit: 0,
        })
      }

      const account = accountMap.get(accountId)
      const debit = numberValue(line.debit)
      const credit = numberValue(line.credit)
      const isDebitNormal = account.normal_balance !== 'credit'
      account.balance += isDebitNormal ? debit - credit : credit - debit

      const transactionDate = dateOnly(line.transaction_date)
      if (transactionDate >= startDate && transactionDate < endDate) {
        account.period_debit += debit
        account.period_credit += credit
      }
    })

    const accountsAtEnd = [...accountMap.values()]
      .filter((item) => item.status !== 'inactive')
      .sort((left, right) => String(left.code).localeCompare(String(right.code)))

    const periodAccounts = accountsAtEnd
      .map((account) => ({
        ...account,
        period_amount:
          account.type === 'revenue'
            ? account.period_credit - account.period_debit
            : account.period_debit - account.period_credit,
      }))

    const revenueItems = periodAccounts
      .filter((account) => account.type === 'revenue' && account.period_amount !== 0)
      .map((account) => ({
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        amount: account.period_amount,
      }))

    const expenseItems = periodAccounts
      .filter((account) => account.type === 'expense' && account.period_amount !== 0)
      .map((account) => ({
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        amount: account.period_amount,
      }))

    const totalRevenue = revenueItems.reduce((total, item) => total + item.amount, 0)
    const totalExpense = expenseItems.reduce((total, item) => total + item.amount, 0)

    const balanceItems = (type) => accountsAtEnd
      .filter((account) => account.type === type && account.balance !== 0)
      .map((account) => ({
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        balance: account.balance,
      }))

    const assets = balanceItems('asset')
    const liabilities = balanceItems('liability')
    const equityBase = balanceItems('equity')
    const cumulativeRevenue = accountsAtEnd
      .filter((account) => account.type === 'revenue')
      .reduce((total, account) => total + account.balance, 0)
    const cumulativeExpense = accountsAtEnd
      .filter((account) => account.type === 'expense')
      .reduce((total, account) => total + account.balance, 0)
    const retainedEarnings = cumulativeRevenue - cumulativeExpense
    const equity = [
      ...equityBase,
      {
        id: 'current-earnings',
        code: 'LABA-BERJALAN',
        name: 'Laba Berjalan',
        type: 'equity',
        balance: retainedEarnings,
        generated: true,
      },
    ]

    const totalAssets = assets.reduce((total, item) => total + item.balance, 0)
    const totalLiabilities = liabilities.reduce((total, item) => total + item.balance, 0)
    const totalEquity = equity.reduce((total, item) => total + item.balance, 0)

    const cashCodes = new Set(['1110', '1120'])
    const beginningBalances = new Map()
    accounts.forEach((account) => {
      beginningBalances.set(Number(account.id), numberValue(account.opening_balance))
    })

    journalLines.forEach((line) => {
      const transactionDate = dateOnly(line.transaction_date)
      if (transactionDate >= startDate) return
      const accountId = Number(line.account_id)
      const normal = String(line.normal_balance || 'debit').toLowerCase()
      const amount = normal === 'credit'
        ? numberValue(line.credit) - numberValue(line.debit)
        : numberValue(line.debit) - numberValue(line.credit)
      beginningBalances.set(accountId, numberValue(beginningBalances.get(accountId)) + amount)
    })

    const beginningCash = [...accountMap.values()]
      .filter((account) => cashCodes.has(String(account.code)))
      .reduce((total, account) => total + numberValue(beginningBalances.get(account.id)), 0)
    const endingCash = accountsAtEnd
      .filter((account) => cashCodes.has(String(account.code)))
      .reduce((total, account) => total + account.balance, 0)

    const periodLines = journalLines.filter((line) => {
      const transactionDate = dateOnly(line.transaction_date)
      return transactionDate >= startDate && transactionDate < endDate
    })

    const journalMap = new Map()
    periodLines.forEach((line) => {
      const key = Number(line.journal_entry_id)
      if (!journalMap.has(key)) {
        journalMap.set(key, {
          id: key,
          voucher_number: line.voucher_number,
          transaction_date: dateOnly(line.transaction_date),
          description: line.journal_description || line.line_description || 'Tanpa keterangan',
          source_type: line.source_type,
          lines: [],
        })
      }
      journalMap.get(key).lines.push(line)
    })

    const cashFlow = { operating: [], investing: [], financing: [] }
    journalMap.forEach((journal) => {
      const cashChange = journal.lines
        .filter((line) => cashCodes.has(String(line.account_code)))
        .reduce((total, line) => total + numberValue(line.debit) - numberValue(line.credit), 0)
      if (!cashChange) return

      const counterparts = journal.lines.filter((line) => !cashCodes.has(String(line.account_code)))
      const bucket = classifyCashMovement(counterparts, journal.source_type)
      cashFlow[bucket].push({
        id: journal.id,
        voucher_number: journal.voucher_number,
        transaction_date: journal.transaction_date,
        description: journal.description,
        amount: cashChange,
      })
    })

    const operatingCashFlow = cashFlow.operating.reduce((total, item) => total + item.amount, 0)
    const investingCashFlow = cashFlow.investing.reduce((total, item) => total + item.amount, 0)
    const financingCashFlow = cashFlow.financing.reduce((total, item) => total + item.amount, 0)

    const trialItems = accountsAtEnd.map((account) => {
      const isDebitNormal = account.normal_balance !== 'credit'
      const debit = isDebitNormal
        ? Math.max(account.balance, 0)
        : Math.max(-account.balance, 0)
      const credit = isDebitNormal
        ? Math.max(-account.balance, 0)
        : Math.max(account.balance, 0)
      return {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        debit,
        credit,
      }
    })

    const totalTrialDebit = trialItems.reduce((total, item) => total + item.debit, 0)
    const totalTrialCredit = trialItems.reduce((total, item) => total + item.credit, 0)

    data.income_statement = {
      revenue_items: revenueItems,
      expense_items: expenseItems,
      total_revenue: totalRevenue,
      total_expense: totalExpense,
      net_profit: totalRevenue - totalExpense,
    }
    data.balance_sheet = {
      assets,
      liabilities,
      equity,
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      total_equity: totalEquity,
      total_liabilities_and_equity: totalLiabilities + totalEquity,
      balance_difference: totalAssets - (totalLiabilities + totalEquity),
    }
    data.cash_flow = {
      operating_items: cashFlow.operating,
      investing_items: cashFlow.investing,
      financing_items: cashFlow.financing,
      operating_cash_flow: operatingCashFlow,
      investing_cash_flow: investingCashFlow,
      financing_cash_flow: financingCashFlow,
      net_cash_increase: operatingCashFlow + investingCashFlow + financingCashFlow,
      beginning_cash: beginningCash,
      ending_cash: endingCash,
    }
    data.trial_balance = {
      items: trialItems,
      total_debit: totalTrialDebit,
      total_credit: totalTrialCredit,
      difference: totalTrialDebit - totalTrialCredit,
    }
    data.general_ledger = {
      items: periodLines.map((line) => ({
        id: line.line_id,
        voucher_number: line.voucher_number,
        transaction_date: dateOnly(line.transaction_date),
        journal_description: line.journal_description,
        account_code: line.account_code,
        account_name: line.account_name,
        normal_balance: line.normal_balance,
        line_description: line.line_description,
        debit: numberValue(line.debit),
        credit: numberValue(line.credit),
      })),
      start_date: startDate,
      end_date_exclusive: endDate,
    }

    const [receivableRows, payableRows, taxRows, payrollRows, assetRows, projectRows] = await Promise.all([
      safeRows(
        `
          SELECT i.invoice_number, i.issue_date, i.due_date, i.status,
                 GREATEST(i.total_amount - i.paid_amount, 0) AS outstanding_amount,
                 c.company_name AS client_name,
                 GREATEST(DATEDIFF(CURDATE(), COALESCE(i.due_date, i.issue_date)), 0) AS overdue_days
          FROM invoices i
          LEFT JOIN clients c ON c.id = i.client_id
          WHERE i.status IN ('unpaid', 'partial', 'overdue')
            AND i.total_amount > i.paid_amount
          ORDER BY i.due_date ASC, i.id ASC
        `,
        [], warnings, 'Umur Piutang',
      ),
      safeRows(
        `
          SELECT bill_number, vendor_name, bill_date, due_date, status,
                 GREATEST(total_amount - paid_amount, 0) AS outstanding_amount,
                 GREATEST(DATEDIFF(CURDATE(), COALESCE(due_date, bill_date)), 0) AS overdue_days
          FROM bills
          WHERE status IN ('unpaid', 'partial', 'overdue')
            AND total_amount > paid_amount
          ORDER BY due_date ASC, id ASC
        `,
        [], warnings, 'Umur Utang',
      ),
      safeRows(
        `
          SELECT tax_type, tax_period, tax_number, amount, due_date, payment_date, status, notes
          FROM tax_records
          WHERE tax_period = ? OR tax_period LIKE ?
          ORDER BY due_date ASC, id ASC
        `,
        [period, `${period}%`], warnings, 'Laporan Pajak',
      ),
      safeRows(
        `
          SELECT payroll_period, payment_date, employee_code, employee_name, employee_position,
                 base_salary, employee_bpjs_deduction, employer_bpjs_contribution, net_pay, status
          FROM payroll_records
          WHERE payroll_period = ?
          ORDER BY employee_name ASC
        `,
        [period], warnings, 'Laporan Payroll',
      ),
      safeRows(
        `
          SELECT a.asset_code, a.asset_name, a.category, a.acquisition_cost,
                 a.accumulated_depreciation, a.residual_value, a.status,
                 COALESCE(SUM(CASE WHEN ad.depreciation_period = ? AND ad.status = 'posted'
                   THEN ad.depreciation_amount ELSE 0 END), 0) AS period_depreciation
          FROM assets a
          LEFT JOIN asset_depreciations ad ON ad.asset_id = a.id
          GROUP BY a.id, a.asset_code, a.asset_name, a.category, a.acquisition_cost,
                   a.accumulated_depreciation, a.residual_value, a.status
          ORDER BY a.asset_code ASC
        `,
        [period], warnings, 'Laporan Aset',
      ),
      safeRows(
        `
          SELECT p.id, p.project_code, p.project_name, p.contract_value, p.status,
                 c.company_name AS client_name,
                 COALESCE((SELECT SUM(i.total_amount) FROM invoices i
                   WHERE i.project_id = p.id AND i.status <> 'cancelled'), 0) AS billed_amount,
                 COALESCE((SELECT SUM(i.paid_amount) FROM invoices i
                   WHERE i.project_id = p.id AND i.status <> 'cancelled'), 0) AS collected_amount,
                 COALESCE((SELECT SUM(b.total_amount) FROM bills b
                   WHERE b.project_id = p.id AND b.status <> 'cancelled'), 0) AS actual_cost
          FROM projects p
          LEFT JOIN clients c ON c.id = p.client_id
          ORDER BY p.status = 'ongoing' DESC, p.project_name ASC
        `,
        [], warnings, 'Profitabilitas Proyek',
      ),
    ])

    const receivableAging = receivableRows.map((row) => ({
      ...row,
      outstanding_amount: numberValue(row.outstanding_amount),
      overdue_days: numberValue(row.overdue_days),
      aging_bucket: ageBucket(row.overdue_days),
    }))
    const payableAging = payableRows.map((row) => ({
      ...row,
      outstanding_amount: numberValue(row.outstanding_amount),
      overdue_days: numberValue(row.overdue_days),
      aging_bucket: ageBucket(row.overdue_days),
    }))
    const payrollItems = payrollRows.map((row) => ({
      ...row,
      net_pay: numberValue(row.net_pay),
    }))
    const assetItems = assetRows.map((row) => ({
      ...row,
      acquisition_cost: numberValue(row.acquisition_cost),
      accumulated_depreciation: numberValue(row.accumulated_depreciation),
      residual_value: numberValue(row.residual_value),
      period_depreciation: numberValue(row.period_depreciation),
      book_value: Math.max(0, numberValue(row.acquisition_cost) - numberValue(row.accumulated_depreciation)),
    }))
    const projectItems = projectRows.map((row) => ({
      ...row,
      billed_amount: numberValue(row.billed_amount),
      collected_amount: numberValue(row.collected_amount),
      actual_cost: numberValue(row.actual_cost),
      profit: numberValue(row.billed_amount) - numberValue(row.actual_cost),
    }))

    data.receivable_aging = {
      items: receivableAging,
      total_outstanding: receivableAging.reduce((total, item) => total + item.outstanding_amount, 0),
    }
    data.payable_aging = {
      items: payableAging,
      total_outstanding: payableAging.reduce((total, item) => total + item.outstanding_amount, 0),
    }
    data.tax_report = {
      items: taxRows.map((row) => ({ ...row, amount: numberValue(row.amount) })),
      total: taxRows.reduce((total, row) => total + numberValue(row.amount), 0),
    }
    data.payroll_report = {
      items: payrollItems,
      summary: {
        total_records: payrollItems.length,
        total_net_salary: payrollItems.reduce((total, item) => total + item.net_pay, 0),
        net_salary: payrollItems.reduce((total, item) => total + item.net_pay, 0),
      },
    }
    data.asset_report = {
      items: assetItems,
      total_book_value: assetItems.reduce((total, item) => total + item.book_value, 0),
      total_period_depreciation: assetItems.reduce((total, item) => total + item.period_depreciation, 0),
    }
    data.project_profitability = {
      items: projectItems,
      total_profit: projectItems.reduce((total, item) => total + item.profit, 0),
      note: 'Biaya aktual dihitung dari bill vendor yang dialokasikan ke proyek.',
    }

    if (journalLines.length === 0) {
      warnings.push({
        section: 'Data periode',
        message: `Belum ada jurnal posted sebelum akhir ${label}.`,
      })
    }

    res.json({
      success: true,
      message: 'Laporan keuangan berhasil diambil.',
      data,
    })
  } catch (error) {
    console.error(`[reports] Gagal menghitung laporan: ${error?.message || error}`)
    warnings.push({
      section: 'Laporan Keuangan',
      message: error?.message || 'Terjadi kesalahan saat menghitung laporan.',
    })
    data.warnings = warnings
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil laporan keuangan.',
      error: error?.message,
      data,
    })
  }
})

module.exports = router
