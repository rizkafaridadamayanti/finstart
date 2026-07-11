const express = require('express')
const db = require('../config/db')
const { safePublicMessage } = require('../utils/api-errors')

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


const SCENARIO_DEFAULTS = {
  optimistic: { revenue_factor: 1.15, expense_factor: 0.95, label: 'Optimistis' },
  normal: { revenue_factor: 1, expense_factor: 1, label: 'Normal' },
  pessimistic: { revenue_factor: 0.85, expense_factor: 1.1, label: 'Pesimistis' },
}

function normalizeScenarioKey(value) {
  const key = String(value || 'normal').trim().toLowerCase()
  return Object.prototype.hasOwnProperty.call(SCENARIO_DEFAULTS, key) ? key : 'normal'
}

async function ensureDefaultScenarios(year) {
  for (const [scenarioKey, defaults] of Object.entries(SCENARIO_DEFAULTS)) {
    await db.query(
      `
        INSERT INTO projection_scenarios (
          projection_year,
          scenario_key,
          revenue_factor,
          expense_factor,
          notes
        ) VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE scenario_key = VALUES(scenario_key)
      `,
      [year, scenarioKey, defaults.revenue_factor, defaults.expense_factor, `Skenario ${defaults.label} FinStart`],
    )
  }
}

async function getScenarios(year) {
  const [rows] = await db.query(
    `
      SELECT projection_year, scenario_key, revenue_factor, expense_factor, notes
      FROM projection_scenarios
      WHERE projection_year = ?
      ORDER BY FIELD(scenario_key, 'optimistic', 'normal', 'pessimistic')
    `,
    [year],
  )

  return rows.map((row) => ({
    ...row,
    label: SCENARIO_DEFAULTS[row.scenario_key]?.label || row.scenario_key,
    revenue_factor: Number(row.revenue_factor || 1),
    expense_factor: Number(row.expense_factor || 1),
  }))
}

async function getBudgetAllocations(year, scenarioKey) {
  const [rows] = await db.query(
    `
      SELECT
        ba.id,
        ba.budget_year,
        ba.budget_month,
        ba.scenario_key,
        ba.account_id,
        ba.division_id,
        ba.budget_amount,
        ba.notes,
        accounts.code AS account_code,
        accounts.name AS account_name,
        accounts.type AS account_type,
        divisions.name AS division_name,
        COALESCE((
          SELECT SUM(
            CASE
              WHEN actual_accounts.type = 'revenue'
                THEN journal_lines.credit - journal_lines.debit
              ELSE journal_lines.debit - journal_lines.credit
            END
          )
          FROM journal_lines
          INNER JOIN journal_entries
            ON journal_entries.id = journal_lines.journal_entry_id
          INNER JOIN accounts AS actual_accounts
            ON actual_accounts.id = journal_lines.account_id
          WHERE journal_lines.account_id = ba.account_id
            AND journal_entries.status = 'posted'
            AND YEAR(journal_entries.transaction_date) = ba.budget_year
            AND (ba.budget_month IS NULL OR MONTH(journal_entries.transaction_date) = ba.budget_month)
            AND (ba.division_id IS NULL OR journal_entries.division_id = ba.division_id)
        ), 0) AS actual_amount
      FROM budget_allocations ba
      INNER JOIN accounts ON accounts.id = ba.account_id
      LEFT JOIN divisions ON divisions.id = ba.division_id
      WHERE ba.budget_year = ?
        AND ba.scenario_key = ?
      ORDER BY ba.budget_month IS NULL DESC, ba.budget_month ASC, accounts.code ASC
    `,
    [year, scenarioKey],
  )

  return rows.map((row) => {
    const budgetAmount = Number(row.budget_amount || 0)
    const actualAmount = Number(row.actual_amount || 0)
    return {
      ...row,
      budget_amount: budgetAmount,
      actual_amount: actualAmount,
      variance_amount: budgetAmount - actualAmount,
    }
  })
}

async function validateBudgetReferences(accountId, divisionId) {
  const [[accountRows], [divisionRows]] = await Promise.all([
    db.query('SELECT id, type, status FROM accounts WHERE id = ?', [accountId]),
    divisionId ? db.query('SELECT id, status FROM divisions WHERE id = ?', [divisionId]) : Promise.resolve([[]]),
  ])
  const account = accountRows[0]
  const division = divisionRows[0]
  if (!account || account.status !== 'active') {
    const error = new Error('Akun budget tidak ditemukan atau tidak aktif.')
    error.status = 422
    throw error
  }
  if (divisionId && (!division || division.status !== 'active')) {
    const error = new Error('Divisi budget tidak ditemukan atau tidak aktif.')
    error.status = 422
    throw error
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
    const scenarioKey = normalizeScenarioKey(req.query.scenario)

    await ensureDefaultScenarios(year)
    const scenarios = await getScenarios(year)
    const selectedScenario = scenarios.find((scenario) => scenario.scenario_key === scenarioKey) || {
      scenario_key: 'normal',
      label: 'Normal',
      revenue_factor: 1,
      expense_factor: 1,
    }

    const [[targetRows], [actualRows], [cashRows]] = await Promise.all([
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
      db.query(
        `
          SELECT COALESCE(SUM(current_balance), 0) AS cash_balance
          FROM accounts
          WHERE status = 'active'
            AND type = 'asset'
            AND (
              code LIKE '100%'
              OR LOWER(name) LIKE '%kas%'
              OR LOWER(name) LIKE '%bank%'
            )
        `,
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

      const revenueTarget = money(numberValue(target?.revenue_target) * Number(selectedScenario.revenue_factor || 1))
      const expenseTarget = money(numberValue(target?.expense_target) * Number(selectedScenario.expense_factor || 1))
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

    const budgetAllocations = await getBudgetAllocations(year, scenarioKey)
    const budgetSummary = budgetAllocations.reduce((summary, allocation) => {
      summary.total_budget += allocation.budget_amount
      summary.total_actual += allocation.actual_amount
      summary.total_variance += allocation.variance_amount
      return summary
    }, { total_budget: 0, total_actual: 0, total_variance: 0 })
    const completedActualMonths = Math.max(1, totals.months_with_actual)
    const monthlyBurnRate = money(
      totals.expense_actual > 0
        ? totals.expense_actual / completedActualMonths
        : totals.forecast_expense / 12,
    )
    const cashBalance = Number(cashRows[0]?.cash_balance || 0)
    const runwayMonths = monthlyBurnRate > 0
      ? money(cashBalance / monthlyBurnRate)
      : null

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
        scenario: selectedScenario,
        scenarios,
        current_month: currentDate.year === year
          ? currentDate.month
          : null,
        months,
        budget_allocations: budgetAllocations,
        budget_summary: {
          total_budget: money(budgetSummary.total_budget),
          total_actual: money(budgetSummary.total_actual),
          total_variance: money(budgetSummary.total_variance),
        },
        summary: {
          ...Object.fromEntries(
            Object.entries(totals).map(([key, value]) => [
              key,
              typeof value === 'number' ? money(value) : value,
            ]),
          ),
          planning_status: planningStatus,
          cash_balance: money(cashBalance),
          monthly_burn_rate: monthlyBurnRate,
          runway_months: runwayMonths,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data proyeksi bisnis.',
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
    })
  }
})


/*
  GET/PUT /api/projections/scenarios
  Skenario mengubah target dasar tanpa mengubah realisasi jurnal.
*/
router.get('/scenarios', async (req, res) => {
  try {
    const year = isValidYear(req.query.year) ? Number(req.query.year) : getCurrentDateInfo().year
    await ensureDefaultScenarios(year)
    res.json({ success: true, message: 'Skenario proyeksi berhasil diambil.', data: await getScenarios(year) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil skenario proyeksi.'})
  }
})

router.put('/scenarios/:key', async (req, res) => {
  try {
    const year = Number(req.body?.projection_year || req.query.year || getCurrentDateInfo().year)
    const scenarioKey = normalizeScenarioKey(req.params.key)
    const revenueFactor = Number(req.body?.revenue_factor)
    const expenseFactor = Number(req.body?.expense_factor)
    const notes = String(req.body?.notes || '').trim() || null
    if (!isValidYear(year) || !Number.isFinite(revenueFactor) || revenueFactor <= 0 || !Number.isFinite(expenseFactor) || expenseFactor <= 0) {
      return res.status(422).json({ success: false, message: 'Tahun dan faktor skenario harus bernilai positif.' })
    }
    await ensureDefaultScenarios(year)
    await db.query(
      `UPDATE projection_scenarios SET revenue_factor = ?, expense_factor = ?, notes = ? WHERE projection_year = ? AND scenario_key = ?`,
      [revenueFactor, expenseFactor, notes, year, scenarioKey],
    )
    const scenarios = await getScenarios(year)
    res.json({ success: true, message: 'Skenario proyeksi berhasil diperbarui.', data: scenarios.find((row) => row.scenario_key === scenarioKey) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui skenario proyeksi.'})
  }
})

/*
  Budget per akun dan/atau divisi. Realisasi dibaca dari jurnal posted.
*/
router.get('/budgets', async (req, res) => {
  try {
    const year = isValidYear(req.query.year) ? Number(req.query.year) : getCurrentDateInfo().year
    const scenarioKey = normalizeScenarioKey(req.query.scenario)
    await ensureDefaultScenarios(year)
    res.json({ success: true, message: 'Budget detail berhasil diambil.', data: await getBudgetAllocations(year, scenarioKey) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil budget detail.'})
  }
})

router.post('/budgets', async (req, res) => {
  try {
    const year = Number(req.body?.budget_year)
    const rawMonth = req.body?.budget_month
    const month = rawMonth === null || rawMonth === undefined || rawMonth === '' ? null : Number(rawMonth)
    const scenarioKey = normalizeScenarioKey(req.body?.scenario_key)
    const accountId = Number(req.body?.account_id)
    const rawDivisionId = req.body?.division_id
    const divisionId = rawDivisionId === null || rawDivisionId === undefined || rawDivisionId === '' ? null : Number(rawDivisionId)
    const budgetAmount = money(req.body?.budget_amount)
    const notes = String(req.body?.notes || '').trim() || null
    if (!isValidYear(year) || (month !== null && !isValidMonth(month)) || !Number.isInteger(accountId) || accountId <= 0 || (divisionId !== null && (!Number.isInteger(divisionId) || divisionId <= 0)) || budgetAmount < 0) {
      return res.status(422).json({ success: false, message: 'Data budget tidak valid.' })
    }
    await validateBudgetReferences(accountId, divisionId)
    const [result] = await db.query(
      `INSERT INTO budget_allocations (budget_year, budget_month, scenario_key, account_id, division_id, budget_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [year, month, scenarioKey, accountId, divisionId, budgetAmount, notes],
    )
    const rows = await getBudgetAllocations(year, scenarioKey)
    res.status(201).json({ success: true, message: 'Budget akun/divisi berhasil disimpan.', data: rows.find((row) => Number(row.id) === Number(result.insertId)) })
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: safePublicMessage(error, 'Gagal menyimpan budget.')})
  }
})

router.put('/budgets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const year = Number(req.body?.budget_year)
    const rawMonth = req.body?.budget_month
    const month = rawMonth === null || rawMonth === undefined || rawMonth === '' ? null : Number(rawMonth)
    const scenarioKey = normalizeScenarioKey(req.body?.scenario_key)
    const accountId = Number(req.body?.account_id)
    const rawDivisionId = req.body?.division_id
    const divisionId = rawDivisionId === null || rawDivisionId === undefined || rawDivisionId === '' ? null : Number(rawDivisionId)
    const budgetAmount = money(req.body?.budget_amount)
    const notes = String(req.body?.notes || '').trim() || null
    if (!Number.isInteger(id) || id <= 0 || !isValidYear(year) || (month !== null && !isValidMonth(month)) || !Number.isInteger(accountId) || accountId <= 0 || (divisionId !== null && (!Number.isInteger(divisionId) || divisionId <= 0)) || budgetAmount < 0) {
      return res.status(422).json({ success: false, message: 'Data budget tidak valid.' })
    }
    await validateBudgetReferences(accountId, divisionId)
    const [result] = await db.query(
      `UPDATE budget_allocations SET budget_year = ?, budget_month = ?, scenario_key = ?, account_id = ?, division_id = ?, budget_amount = ?, notes = ? WHERE id = ?`,
      [year, month, scenarioKey, accountId, divisionId, budgetAmount, notes, id],
    )
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Data budget tidak ditemukan.' })
    const rows = await getBudgetAllocations(year, scenarioKey)
    res.json({ success: true, message: 'Budget akun/divisi berhasil diperbarui.', data: rows.find((row) => Number(row.id) === id) })
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: safePublicMessage(error, 'Gagal memperbarui budget.')})
  }
})

router.delete('/budgets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(422).json({ success: false, message: 'ID budget tidak valid.' })
    const [result] = await db.query('DELETE FROM budget_allocations WHERE id = ?', [id])
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Data budget tidak ditemukan.' })
    res.json({ success: true, message: 'Budget berhasil dihapus.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus budget.'})
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
    })
  }
})

module.exports = router
