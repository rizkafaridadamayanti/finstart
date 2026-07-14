const express = require('express')
const db = require('../config/db')

const router = express.Router()

function numberValue(value) {
  return Number(value || 0)
}

function mysqlDate(year, monthIndex, day = 1) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function buildLastMonths(totalMonths = 6) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  return Array.from({ length: totalMonths }, (_, index) => {
    const date = new Date(currentYear, currentMonth - (totalMonths - 1 - index), 1)

    return {
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('id-ID', {
        month: 'short',
      }).format(date),
      income: 0,
      expense: 0,
      net_cashflow: 0,
    }
  })
}

/*
  GET /api/dashboard/summary

  Mengambil ringkasan Dashboard dari jurnal berstatus posted.
  Termasuk cashflow_series untuk grafik garis 6 bulan terakhir.
*/
router.get('/summary', async (req, res) => {
  try {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    const firstMonth = new Date(currentYear, currentMonth - 5, 1)
    const nextMonth = new Date(currentYear, currentMonth + 1, 1)

    const chartStartDate = mysqlDate(
      firstMonth.getFullYear(),
      firstMonth.getMonth(),
      1,
    )

    const chartEndDate = mysqlDate(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      1,
    )

    const [
      [cashRows],
      [receivableRows],
      [payableRows],
      [profitRows],
      [monthlyRows],
      [projectRows],
      [invoiceRows],
      [recentTransactions],
      [cashflowRows],
    ] = await Promise.all([
      db.query(`
        SELECT COALESCE(SUM(current_balance), 0) AS cash_balance
        FROM accounts
        WHERE code IN ('1110', '1120')
          AND status = 'active'
      `),

      db.query(`
        SELECT COALESCE(SUM(current_balance), 0) AS total_receivable
        FROM accounts
        WHERE code = '1130'
          AND status = 'active'
      `),

      db.query(`
        SELECT COALESCE(SUM(current_balance), 0) AS total_payable
        FROM accounts
        WHERE code = '2100'
          AND status = 'active'
      `),

      db.query(`
        SELECT
          COALESCE(SUM(
            CASE
              WHEN type = 'revenue' THEN current_balance
              ELSE 0
            END
          ), 0) AS total_revenue,

          COALESCE(SUM(
            CASE
              WHEN type = 'expense' THEN current_balance
              ELSE 0
            END
          ), 0) AS total_expense
        FROM accounts
        WHERE status = 'active'
      `),

      db.query(`
        SELECT
          COALESCE(SUM(
            CASE
              WHEN accounts.type = 'revenue'
              THEN journal_lines.credit - journal_lines.debit
              ELSE 0
            END
          ), 0) AS monthly_income,

          COALESCE(SUM(
            CASE
              WHEN accounts.type = 'expense'
              THEN journal_lines.debit - journal_lines.credit
              ELSE 0
            END
          ), 0) AS monthly_expense
        FROM journal_entries
        INNER JOIN journal_lines
          ON journal_lines.journal_entry_id = journal_entries.id
        INNER JOIN accounts
          ON accounts.id = journal_lines.account_id
        WHERE journal_entries.status = 'posted'
          AND YEAR(journal_entries.transaction_date) = YEAR(CURDATE())
          AND MONTH(journal_entries.transaction_date) = MONTH(CURDATE())
      `),

      db.query(`
        SELECT COUNT(*) AS active_projects
        FROM projects
        WHERE status = 'ongoing'
      `),

      db.query(`
        SELECT COUNT(*) AS overdue_invoices
        FROM invoices
        WHERE status IN ('unpaid', 'partial', 'overdue')
          AND due_date IS NOT NULL
          AND due_date < CURDATE()
      `),

      db.query(`
        SELECT
          journal_entries.id,
          journal_entries.voucher_number,
          journal_entries.transaction_date,
          journal_entries.description,
          journal_entries.status,
          COALESCE(SUM(journal_lines.debit), 0) AS total_amount
        FROM journal_entries
        LEFT JOIN journal_lines
          ON journal_lines.journal_entry_id = journal_entries.id
        WHERE journal_entries.status = 'posted'
        GROUP BY journal_entries.id
        ORDER BY
          journal_entries.transaction_date DESC,
          journal_entries.id DESC
        LIMIT 5
      `),

      db.query(
        `
          SELECT
            DATE_FORMAT(journal_entries.transaction_date, '%Y-%m') AS month,

            COALESCE(SUM(
              CASE
                WHEN accounts.type = 'revenue'
                THEN journal_lines.credit - journal_lines.debit
                ELSE 0
              END
            ), 0) AS income,

            COALESCE(SUM(
              CASE
                WHEN accounts.type = 'expense'
                THEN journal_lines.debit - journal_lines.credit
                ELSE 0
              END
            ), 0) AS expense,

            COALESCE(SUM(
              CASE
                WHEN accounts.code IN ('1110', '1120')
                THEN journal_lines.debit - journal_lines.credit
                ELSE 0
              END
            ), 0) AS net_cashflow
          FROM journal_entries
          INNER JOIN journal_lines
            ON journal_lines.journal_entry_id = journal_entries.id
          INNER JOIN accounts
            ON accounts.id = journal_lines.account_id
          WHERE journal_entries.status = 'posted'
            AND journal_entries.transaction_date >= ?
            AND journal_entries.transaction_date < ?
          GROUP BY DATE_FORMAT(journal_entries.transaction_date, '%Y-%m')
          ORDER BY month ASC
        `,
        [chartStartDate, chartEndDate],
      ),
    ])

    const cashBalance = numberValue(cashRows[0]?.cash_balance)
    const totalReceivable = numberValue(
      receivableRows[0]?.total_receivable,
    )
    const totalPayable = numberValue(payableRows[0]?.total_payable)

    const totalRevenue = numberValue(profitRows[0]?.total_revenue)
    const totalExpense = numberValue(profitRows[0]?.total_expense)

    const monthlyIncome = numberValue(monthlyRows[0]?.monthly_income)
    const monthlyExpense = numberValue(monthlyRows[0]?.monthly_expense)

    const activeProjects = Number(projectRows[0]?.active_projects || 0)
    const overdueInvoices = Number(invoiceRows[0]?.overdue_invoices || 0)

    const chartMap = new Map(
      cashflowRows.map((row) => [
        row.month,
        {
          income: numberValue(row.income),
          expense: numberValue(row.expense),
          net_cashflow: numberValue(row.net_cashflow),
        },
      ]),
    )

    const cashflowSeries = buildLastMonths(6).map((month) => ({
      ...month,
      ...(chartMap.get(month.month) || {}),
    }))

    res.json({
      success: true,
      message: 'Ringkasan dashboard berhasil diambil',
      data: {
        cash_balance: cashBalance,
        total_receivable: totalReceivable,
        total_payable: totalPayable,

        total_revenue: totalRevenue,
        total_expense: totalExpense,
        net_profit: totalRevenue - totalExpense,

        monthly_income: monthlyIncome,
        monthly_expense: monthlyExpense,

        active_projects: activeProjects,
        overdue_invoices: overdueInvoices,

        cashflow_series: cashflowSeries,

        recent_transactions: recentTransactions.map((transaction) => ({
          ...transaction,
          total_amount: numberValue(transaction.total_amount),
        })),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan dashboard',
    })
  }
})

module.exports = router
