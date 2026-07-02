const express = require('express')
const db = require('../config/db')

const router = express.Router()

function numberValue(value) {
  return Number(value || 0)
}

/*
  GET /api/dashboard/summary

  Mengambil ringkasan dashboard dari:
  - saldo akun hasil jurnal posted
  - total pendapatan dan beban bulan berjalan
  - jumlah proyek ongoing
  - jumlah invoice overdue
  - transaksi posted terbaru
*/
router.get('/summary', async (req, res) => {
  try {
    const [
      [cashRows],
      [receivableRows],
      [payableRows],
      [profitRows],
      [monthlyRows],
      [projectRows],
      [invoiceRows],
      [recentTransactions],
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
      error: error.message,
    })
  }
})

module.exports = router