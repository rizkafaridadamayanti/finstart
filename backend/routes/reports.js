const express = require('express')
const db = require('../config/db')

const router = express.Router()

function numberValue(value) {
  return Number(value || 0)
}

function getPeriodData(requestedPeriod) {
  const today = new Date()
  const fallback = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const period = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedPeriod || '')
    ? requestedPeriod
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

  return {
    period,
    startDate,
    endDate,
    label,
  }
}

async function getAccountBalances(endDateExclusive) {
  const [rows] = await db.query(
    `
      SELECT
        accounts.id,
        accounts.code,
        accounts.name,
        accounts.type,
        accounts.normal_balance,
        COALESCE(accounts.opening_balance, 0) AS opening_balance,
        COALESCE(SUM(
          CASE
            WHEN journal_entries.status = 'posted'
              AND journal_entries.transaction_date < ?
            THEN
              CASE
                WHEN accounts.normal_balance = 'debit'
                THEN journal_lines.debit - journal_lines.credit
                ELSE journal_lines.credit - journal_lines.debit
              END
            ELSE 0
          END
        ), 0) AS movement
      FROM accounts
      LEFT JOIN journal_lines
        ON journal_lines.account_id = accounts.id
      LEFT JOIN journal_entries
        ON journal_entries.id = journal_lines.journal_entry_id
      WHERE accounts.status = 'active'
      GROUP BY
        accounts.id,
        accounts.code,
        accounts.name,
        accounts.type,
        accounts.normal_balance,
        accounts.opening_balance
      ORDER BY accounts.code ASC
    `,
    [endDateExclusive],
  )

  return rows.map((account) => ({
    ...account,
    opening_balance: numberValue(account.opening_balance),
    movement: numberValue(account.movement),
    balance: numberValue(account.opening_balance) + numberValue(account.movement),
  }))
}

function getCashBalance(accounts) {
  return accounts
    .filter((account) => ['1110', '1120'].includes(account.code))
    .reduce((total, account) => total + numberValue(account.balance), 0)
}

function sumBalances(accounts) {
  return accounts.reduce((total, account) => {
    return total + numberValue(account.balance)
  }, 0)
}

/*
  Klasifikasi Arus Kas FinStart

  OPERASI:
  - Pendapatan dan beban
  - Piutang Usaha / penerimaan invoice (1130)
  - Utang Usaha / pembayaran vendor (2100)
  - Utang Pajak, PPN, serta PPh 23 (2200, 2210, 2211)
  - Payroll pegawai dan semua setoran pajak

  INVESTASI:
  - Pembelian/penjualan aset tetap selain Piutang Usaha
    dan akun pajak operasional

  PENDANAAN:
  - Modal pemilik, pinjaman, pelunasan pinjaman,
    serta transaksi ekuitas
*/
function classifyCashMovement(
  counterpartTypes,
  counterpartCodes,
  sourceType,
) {
  const types = String(counterpartTypes || '')
    .split(',')
    .map((type) => type.trim())
    .filter(Boolean)

  const codes = String(counterpartCodes || '')
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean)

  const operatingSourceTypes = [
    'invoice_payment',
    'bill_payment',
    'tax_payment',
    'employee_payroll',
  ]

  const operatingCodes = [
    '1130', // Piutang Usaha
    '2100', // Utang Usaha
    '2200', // Utang Pajak
    '2210', // PPN Keluaran
    '2211', // Utang PPh 23
  ]

  if (operatingSourceTypes.includes(String(sourceType || ''))) {
    return 'operating'
  }

  if (codes.some((code) => operatingCodes.includes(code))) {
    return 'operating'
  }

  if (types.some((type) => ['revenue', 'expense'].includes(type))) {
    return 'operating'
  }

  if (types.includes('asset')) {
    return 'investing'
  }

  if (types.some((type) => ['liability', 'equity'].includes(type))) {
    return 'financing'
  }

  return 'operating'
}

/*
  GET /api/reports?period=YYYY-MM

  Menghasilkan:
  - Laporan Laba Rugi
  - Neraca
  - Laporan Arus Kas

  Semua data hanya dihitung dari jurnal berstatus posted.
*/
router.get('/', async (req, res) => {
  try {
    const { period, startDate, endDate, label } = getPeriodData(req.query.period)

    const [
      profitRows,
      balanceAtEnd,
      balanceBeforePeriod,
      cashMovementRows,
    ] = await Promise.all([
      db
        .query(
          `
            SELECT
              accounts.id,
              accounts.code,
              accounts.name,
              accounts.type,
              COALESCE(SUM(
                CASE
                  WHEN accounts.type = 'revenue'
                  THEN journal_lines.credit - journal_lines.debit
                  ELSE journal_lines.debit - journal_lines.credit
                END
              ), 0) AS amount
            FROM accounts
            INNER JOIN journal_lines
              ON journal_lines.account_id = accounts.id
            INNER JOIN journal_entries
              ON journal_entries.id = journal_lines.journal_entry_id
            WHERE accounts.status = 'active'
              AND accounts.type IN ('revenue', 'expense')
              AND journal_entries.status = 'posted'
              AND journal_entries.transaction_date >= ?
              AND journal_entries.transaction_date < ?
            GROUP BY
              accounts.id,
              accounts.code,
              accounts.name,
              accounts.type
            ORDER BY accounts.code ASC
          `,
          [startDate, endDate],
        )
        .then(([rows]) => rows),

      getAccountBalances(endDate),

      getAccountBalances(startDate),

      db
        .query(
          `
            SELECT
              journal_entries.id,
              journal_entries.voucher_number,
              journal_entries.transaction_date,
              journal_entries.description,
              journal_entries.source_type,

              COALESCE(SUM(
                CASE
                  WHEN accounts.code IN ('1110', '1120')
                  THEN journal_lines.debit - journal_lines.credit
                  ELSE 0
                END
              ), 0) AS cash_change,

              GROUP_CONCAT(DISTINCT
                CASE
                  WHEN accounts.code NOT IN ('1110', '1120')
                  THEN accounts.type
                  ELSE NULL
                END
              ) AS counterpart_types,

              GROUP_CONCAT(DISTINCT
                CASE
                  WHEN accounts.code NOT IN ('1110', '1120')
                  THEN accounts.code
                  ELSE NULL
                END
              ) AS counterpart_codes
            FROM journal_entries
            INNER JOIN journal_lines
              ON journal_lines.journal_entry_id = journal_entries.id
            INNER JOIN accounts
              ON accounts.id = journal_lines.account_id
            WHERE journal_entries.status = 'posted'
              AND journal_entries.transaction_date >= ?
              AND journal_entries.transaction_date < ?
            GROUP BY
              journal_entries.id,
              journal_entries.voucher_number,
              journal_entries.transaction_date,
              journal_entries.description,
              journal_entries.source_type
            ORDER BY
              journal_entries.transaction_date ASC,
              journal_entries.id ASC
          `,
          [startDate, endDate],
        )
        .then(([rows]) => rows),
    ])

    const revenueItems = profitRows
      .filter((account) => account.type === 'revenue')
      .map((account) => ({
        ...account,
        amount: numberValue(account.amount),
      }))

    const expenseItems = profitRows
      .filter((account) => account.type === 'expense')
      .map((account) => ({
        ...account,
        amount: numberValue(account.amount),
      }))

    const totalRevenue = revenueItems.reduce(
      (total, item) => total + item.amount,
      0,
    )

    const totalExpense = expenseItems.reduce(
      (total, item) => total + item.amount,
      0,
    )

    const assets = balanceAtEnd
      .filter((account) => account.type === 'asset')
      .map((account) => ({
        ...account,
        balance: numberValue(account.balance),
      }))

    const liabilities = balanceAtEnd
      .filter((account) => account.type === 'liability')
      .map((account) => ({
        ...account,
        balance: numberValue(account.balance),
      }))

    const equityBase = balanceAtEnd
      .filter((account) => account.type === 'equity')
      .map((account) => ({
        ...account,
        balance: numberValue(account.balance),
      }))

    const revenueToDate = sumBalances(
      balanceAtEnd.filter((account) => account.type === 'revenue'),
    )

    const expenseToDate = sumBalances(
      balanceAtEnd.filter((account) => account.type === 'expense'),
    )

    const currentEarnings = revenueToDate - expenseToDate

    const equity = [
      ...equityBase,
      {
        id: 'current-earnings',
        code: 'LABA-BERJALAN',
        name: 'Laba Berjalan',
        type: 'equity',
        balance: currentEarnings,
        generated: true,
      },
    ]

    const totalAssets = sumBalances(assets)
    const totalLiabilities = sumBalances(liabilities)
    const totalEquity = sumBalances(equity)

    const cashFlow = {
      operating: [],
      investing: [],
      financing: [],
    }

    cashMovementRows.forEach((transaction) => {
      const amount = numberValue(transaction.cash_change)

      if (amount === 0) return

      const category = classifyCashMovement(
        transaction.counterpart_types,
        transaction.counterpart_codes,
        transaction.source_type,
      )

      cashFlow[category].push({
        id: transaction.id,
        voucher_number: transaction.voucher_number,
        transaction_date: transaction.transaction_date,
        description: transaction.description || 'Tanpa keterangan',
        amount,
      })
    })

    const operatingCashFlow = cashFlow.operating.reduce(
      (total, item) => total + item.amount,
      0,
    )

    const investingCashFlow = cashFlow.investing.reduce(
      (total, item) => total + item.amount,
      0,
    )

    const financingCashFlow = cashFlow.financing.reduce(
      (total, item) => total + item.amount,
      0,
    )

    const beginningCash = getCashBalance(balanceBeforePeriod)
    const endingCash = getCashBalance(balanceAtEnd)
    const netCashIncrease =
      operatingCashFlow + investingCashFlow + financingCashFlow

    res.json({
      success: true,
      message: 'Laporan keuangan berhasil diambil',
      data: {
        period,
        period_label: label,

        income_statement: {
          revenue_items: revenueItems,
          expense_items: expenseItems,
          total_revenue: totalRevenue,
          total_expense: totalExpense,
          net_profit: totalRevenue - totalExpense,
        },

        balance_sheet: {
          assets,
          liabilities,
          equity,
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          total_equity: totalEquity,
          total_liabilities_and_equity: totalLiabilities + totalEquity,
          balance_difference:
            totalAssets - (totalLiabilities + totalEquity),
        },

        cash_flow: {
          operating_items: cashFlow.operating,
          investing_items: cashFlow.investing,
          financing_items: cashFlow.financing,
          operating_cash_flow: operatingCashFlow,
          investing_cash_flow: investingCashFlow,
          financing_cash_flow: financingCashFlow,
          net_cash_increase: netCashIncrease,
          beginning_cash: beginningCash,
          ending_cash: endingCash,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil laporan keuangan',
      error: error.message,
    })
  }
})

module.exports = router
