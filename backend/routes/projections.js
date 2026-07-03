const express = require('express')
const db = require('../config/db')

const router = express.Router()

const MONTHS = [
  { number: 1, label: 'Januari', short_label: 'Jan' },
  { number: 2, label: 'Februari', short_label: 'Feb' },
  { number: 3, label: 'Maret', short_label: 'Mar' },
  { number: 4, label: 'April', short_label: 'Apr' },
  { number: 5, label: 'Mei', short_label: 'Mei' },
  { number: 6, label: 'Juni', short_label: 'Jun' },
  { number: 7, label: 'Juli', short_label: 'Jul' },
  { number: 8, label: 'Agustus', short_label: 'Agu' },
  { number: 9, label: 'September', short_label: 'Sep' },
  { number: 10, label: 'Oktober', short_label: 'Okt' },
  { number: 11, label: 'November', short_label: 'Nov' },
  { number: 12, label: 'Desember', short_label: 'Des' },
]

function numberValue(value) {
  return Number(value || 0)
}

function money(value) {
  return Math.round((numberValue(value) + Number.EPSILON) * 100) / 100
}

function isValidYear(value) {
  const year = Number(value)

  return Number.isInteger(year) && year >= 2000 && year <= 2100
}

function isValidMonth(value) {
  const month = Number(value)

  return Number.isInteger(month) && month >= 1 && month <= 12
}

function getCurrentDateInfo() {
  const now = new Date()

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

function getMonthStatus(row, currentDate) {
  const hasTarget =
    numberValue(row.revenue_target) > 0 ||
    numberValue(row.expense_target) > 0

  const hasActual = Number(row.posted_journal_count || 0) > 0

  if (!hasTarget) {
    return {
      label: 'Belum Disusun',
      key: 'empty',
    }
  }

  if (!hasActual) {
    return {
      label: row.month < currentDate.month && row.year <= currentDate.year
        ? 'Belum Ada Realisasi'
        : 'Target',
      key: 'target',
    }
  }

  if (numberValue(row.profit_actual) >= numberValue(row.profit_target)) {
    return {
      label: 'Di Atas Target',
      key: 'good',
    }
  }

  return {
    label: 'Perlu Evaluasi',
    key: 'watch',
  }
}

/*
  GET /api/projections?year=2026

  Target diambil dari financial_projections.
  Realisasi diambil otomatis dari jurnal posted:
  - Pendapatan: kredit - debit akun revenue
  - Beban: debit - kredit akun expense
*/
router.get('/', async (req, res) => {
  try {
    const currentDate = getCurrentDateInfo()
    const year = isValidYear(req.query.year)
      ? Number(req.query.year)
      : currentDate.year

    const [[targetRows], [actualRows]] = await Promise.all([
      db.query(
        `
          SELECT
            projection_year,
            projection_month,
            revenue_target,
            expense_target,
            notes
          FROM financial_projections
          WHERE projection_year = ?
          ORDER BY projection_month ASC
        `,
        [year],
      ),
      db.query(
        `
          SELECT
            MONTH(journal_entries.transaction_date) AS projection_month,

            COALESCE(SUM(
              CASE
                WHEN accounts.type = 'revenue'
                THEN journal_lines.credit - journal_lines.debit
                ELSE 0
              END
            ), 0) AS revenue_actual,

            COALESCE(SUM(
              CASE
                WHEN accounts.type = 'expense'
                THEN journal_lines.debit - journal_lines.credit
                ELSE 0
              END
            ), 0) AS expense_actual,

            COUNT(DISTINCT journal_entries.id) AS posted_journal_count
          FROM journal_entries
          INNER JOIN journal_lines
            ON journal_lines.journal_entry_id = journal_entries.id
          INNER JOIN accounts
            ON accounts.id = journal_lines.account_id
          WHERE journal_entries.status = 'posted'
            AND YEAR(journal_entries.transaction_date) = ?
          GROUP BY MONTH(journal_entries.transaction_date)
          ORDER BY MONTH(journal_entries.transaction_date) ASC
        `,
        [year],
      ),
    ])

    const targetByMonth = new Map(
      targetRows.map((row) => [Number(row.projection_month), row]),
    )

    const actualByMonth = new Map(
      actualRows.map((row) => [Number(row.projection_month), row]),
    )

    const months = MONTHS.map((month) => {
      const target = targetByMonth.get(month.number)
      const actual = actualByMonth.get(month.number)

      const revenueTarget = numberValue(target?.revenue_target)
      const expenseTarget = numberValue(target?.expense_target)
      const revenueActual = numberValue(actual?.revenue_actual)
      const expenseActual = numberValue(actual?.expense_actual)
      const postedJournalCount = Number(actual?.posted_journal_count || 0)

      const row = {
        year,
        month: month.number,
        label: month.label,
        short_label: month.short_label,
        revenue_target: revenueTarget,
        expense_target: expenseTarget,
        profit_target: money(revenueTarget - expenseTarget),
        revenue_actual: revenueActual,
        expense_actual: expenseActual,
        profit_actual: money(revenueActual - expenseActual),
        posted_journal_count: postedJournalCount,
        notes: target?.notes || '',
        has_target: Boolean(target),
        has_actual: postedJournalCount > 0,
      }

      /*
        Forecast menggunakan realisasi ketika bulan itu memiliki jurnal posted.
        Jika belum ada realisasi, target menjadi forecast bulan tersebut.
      */
      row.forecast_revenue = row.has_actual
        ? row.revenue_actual
        : row.revenue_target

      row.forecast_expense = row.has_actual
        ? row.expense_actual
        : row.expense_target

      row.forecast_profit = money(
        row.forecast_revenue - row.forecast_expense,
      )

      row.status = getMonthStatus(row, currentDate)

      return row
    })

    const totals = months.reduce(
      (summary, month) => {
        summary.revenue_target += month.revenue_target
        summary.expense_target += month.expense_target
        summary.profit_target += month.profit_target
        summary.revenue_actual += month.revenue_actual
        summary.expense_actual += month.expense_actual
        summary.profit_actual += month.profit_actual
        summary.forecast_revenue += month.forecast_revenue
        summary.forecast_expense += month.forecast_expense
        summary.forecast_profit += month.forecast_profit

        if (month.has_actual) {
          summary.months_with_actual += 1
        }

        if (month.has_target) {
          summary.months_with_target += 1
        }

        return summary
      },
      {
        revenue_target: 0,
        expense_target: 0,
        profit_target: 0,
        revenue_actual: 0,
        expense_actual: 0,
        profit_actual: 0,
        forecast_revenue: 0,
        forecast_expense: 0,
        forecast_profit: 0,
        months_with_actual: 0,
        months_with_target: 0,
      },
    )

    const planningStatus =
      totals.months_with_target === 0
        ? {
          label: 'Belum Disusun',
          key: 'empty',
        }
        : (
          totals.forecast_profit >= totals.profit_target
            ? {
              label: 'Sehat',
              key: 'good',
            }
            : {
              label: 'Perlu Evaluasi',
              key: 'watch',
            }
        )

    res.json({
      success: true,
      message: 'Data proyeksi bisnis berhasil diambil.',
      data: {
        year,
        current_month: currentDate.year === year
          ? currentDate.month
          : null,
        months,
        summary: {
          ...Object.fromEntries(
            Object.entries(totals).map(([key, value]) => [
              key,
              typeof value === 'number' ? money(value) : value,
            ]),
          ),
          planning_status: planningStatus,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data proyeksi bisnis.',
      error: error.message,
    })
  }
})

/*
  POST /api/projections

  Membuat atau memperbarui target per bulan.
*/
router.post('/', async (req, res) => {
  try {
    const {
      projection_year,
      projection_month,
      revenue_target,
      expense_target,
      notes,
    } = req.body || {}

    const year = Number(projection_year)
    const month = Number(projection_month)
    const revenueTarget = money(revenue_target)
    const expenseTarget = money(expense_target)
    const note = String(notes || '').trim() || null

    if (!isValidYear(year)) {
      return res.status(400).json({
        success: false,
        message: 'Tahun proyeksi tidak valid.',
      })
    }

    if (!isValidMonth(month)) {
      return res.status(400).json({
        success: false,
        message: 'Bulan proyeksi tidak valid.',
      })
    }

    if (revenueTarget < 0 || expenseTarget < 0) {
      return res.status(400).json({
        success: false,
        message: 'Target pendapatan dan beban tidak boleh negatif.',
      })
    }

    await db.query(
      `
        INSERT INTO financial_projections (
          projection_year,
          projection_month,
          revenue_target,
          expense_target,
          notes
        ) VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          revenue_target = VALUES(revenue_target),
          expense_target = VALUES(expense_target),
          notes = VALUES(notes),
          updated_at = CURRENT_TIMESTAMP
      `,
      [year, month, revenueTarget, expenseTarget, note],
    )

    res.json({
      success: true,
      message: 'Target proyeksi berhasil disimpan.',
      data: {
        projection_year: year,
        projection_month: month,
        revenue_target: revenueTarget,
        expense_target: expenseTarget,
        notes: note,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan target proyeksi.',
      error: error.message,
    })
  }
})

/*
  DELETE /api/projections/:year/:month

  Menghapus target bulan tertentu. Realisasi jurnal tidak dihapus.
*/
router.delete('/:year/:month', async (req, res) => {
  try {
    const year = Number(req.params.year)
    const month = Number(req.params.month)

    if (!isValidYear(year) || !isValidMonth(month)) {
      return res.status(400).json({
        success: false,
        message: 'Tahun atau bulan proyeksi tidak valid.',
      })
    }

    const [result] = await db.query(
      `
        DELETE FROM financial_projections
        WHERE projection_year = ?
          AND projection_month = ?
      `,
      [year, month],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Target proyeksi tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      message: 'Target proyeksi berhasil dihapus.',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus target proyeksi.',
      error: error.message,
    })
  }
})

module.exports = router
