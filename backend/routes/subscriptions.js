const express = require('express')
const db = require('../config/db')
const { safePublicMessage } = require('../utils/api-errors')

const router = express.Router()

const ALLOWED_CYCLES = ['monthly', 'quarterly', 'yearly']
const ALLOWED_STATUSES = ['active', 'inactive', 'cancelled']
const SUBSCRIPTION_EXPENSE_ACCOUNT_CODES = {
  Infrastruktur: '5002',
  infrastructure: '5002',
  Software: '5001',
  'Software/SaaS': '5001',
  software: '5001',
  Marketing: '5001',
  marketing: '5001',
}
const SUBSCRIPTION_EXPENSE_ACCOUNT_NAMES = {
  5001: 'Beban Software dan Langganan',
  5002: 'Beban Infrastruktur Digital',
}
const DEFAULT_SUBSCRIPTION_EXPENSE_ACCOUNT_CODE = '5001'
const DEFAULT_CASH_BANK_CODE = '1120'
const CASH_BANK_CODES = ['1001', '1110', '1120', '1130']

function numberValue(value) {
  return Number(value || 0)
}

function money(value) {
  return Math.round((numberValue(value) + Number.EPSILON) * 100) / 100
}

function cleanText(value, maxLength = 255) {
  const text = String(value || '').trim()

  return text ? text.slice(0, maxLength) : null
}

function dateText(value) {
  return String(value || '').slice(0, 10)
}

function isValidDate(value) {
  const text = dateText(value)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false
  }

  const date = new Date(`${text}T00:00:00Z`)

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === text
  )
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(dateValue, days) {
  const date = new Date(`${dateText(dateValue)}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + Number(days || 0))

  return date.toISOString().slice(0, 10)
}

function addMonthsSafely(dateValue, monthsToAdd) {
  const [year, month, day] = dateText(dateValue).split('-').map(Number)
  const totalMonths = (year * 12) + (month - 1) + Number(monthsToAdd)
  const targetYear = Math.floor(totalMonths / 12)
  const targetMonth = (totalMonths % 12) + 1
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate()
  const targetDay = Math.min(day, lastDay)

  return [
    targetYear,
    String(targetMonth).padStart(2, '0'),
    String(targetDay).padStart(2, '0'),
  ].join('-')
}

function nextRenewalDate(currentRenewalDate, billingCycle) {
  const monthsByCycle = {
    monthly: 1,
    quarterly: 3,
    yearly: 12,
  }

  return addMonthsSafely(currentRenewalDate, monthsByCycle[billingCycle])
}

function monthlyEquivalent(amount, billingCycle) {
  const divisors = {
    monthly: 1,
    quarterly: 3,
    yearly: 12,
  }

  return money(numberValue(amount) / divisors[billingCycle])
}

async function findAccountByCode(executor, code, expectedType = null) {
  const params = [code]
  const typeClause = expectedType ? 'AND type = ?' : ''
  if (expectedType) params.push(expectedType)

  const [rows] = await executor.query(
    `
      SELECT id, code, name, type, normal_balance
      FROM accounts
      WHERE code = ?
        AND status = 'active'
        ${typeClause}
      LIMIT 1
    `,
    params,
  )

  return rows[0] || null
}

async function findCashAccount(executor) {
  for (const code of CASH_BANK_CODES) {
    const account = await findAccountByCode(executor, code, 'asset')
    if (account) return account
  }

  return ensureOperationalAccount(executor, DEFAULT_CASH_BANK_CODE, 'Bank Operasional', 'asset', 'debit')
}

async function ensureOperationalAccount(executor, code, name, type, normalBalance) {
  const existing = await findAccountByCode(executor, code, type)
  if (existing) return existing

  const [result] = await executor.query(
    `
      INSERT INTO accounts (
        code,
        name,
        type,
        normal_balance,
        opening_balance,
        current_balance,
        status
      ) VALUES (?, ?, ?, ?, 0, 0, 'active')
    `,
    [code, name, type, normalBalance],
  )

  const [rows] = await executor.query(
    `
      SELECT id, code, name, type, normal_balance, status
      FROM accounts
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId],
  )

  return rows[0]
}

async function postSubscriptionPaymentJournal(connection, subscription, userId = null) {
  const expenseCode =
    SUBSCRIPTION_EXPENSE_ACCOUNT_CODES[subscription.category] ||
    SUBSCRIPTION_EXPENSE_ACCOUNT_CODES[String(subscription.category || '').toLowerCase()] ||
    DEFAULT_SUBSCRIPTION_EXPENSE_ACCOUNT_CODE
  const expenseAccount = await ensureOperationalAccount(
    connection,
    expenseCode,
    SUBSCRIPTION_EXPENSE_ACCOUNT_NAMES[expenseCode] || 'Beban Langganan',
    'expense',
    'debit',
  )
  const cashAccount = await findCashAccount(connection)

  if (!expenseAccount) {
    throw new Error(`Akun beban langganan (${expenseCode}) belum tersedia atau belum aktif.`)
  }

  if (!cashAccount) {
    throw new Error('Akun kas/bank (1001/1110/1120/1130) belum tersedia atau belum aktif.')
  }

  const amount = money(subscription.amount)
  const transactionDate = dateText(subscription.start_date || subscription.renewal_date || getToday())

  const [journalResult] = await connection.query(
    `
      INSERT INTO journal_entries (
        voucher_number,
        transaction_date,
        description,
        source_type,
        source_id,
        status,
        posted_at,
        created_by
      ) VALUES (?, ?, ?, 'subscription', ?, 'posted', NOW(), ?)
    `,
    [
      `SUB-PAY-${subscription.id}`,
      transactionDate,
      `Pembayaran langganan ${subscription.subscription_name} (${subscription.provider_name || '-'})`,
      subscription.id,
      userId || null,
    ],
  )

  const journalId = journalResult.insertId
  await connection.query(
    `
      INSERT INTO journal_lines (
        journal_entry_id,
        account_id,
        description,
        debit,
        credit
      ) VALUES
        (?, ?, ?, ?, 0),
        (?, ?, ?, 0, ?)
    `,
    [
      journalId,
      expenseAccount.id,
      `Beban langganan: ${subscription.subscription_name}`,
      amount,
      journalId,
      cashAccount.id,
      `Pembayaran langganan: ${subscription.subscription_name}`,
      amount,
    ],
  )

  for (const line of [
    { account_id: expenseAccount.id, debit: amount, credit: 0 },
    { account_id: cashAccount.id, debit: 0, credit: amount },
  ]) {
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
      throw new Error('Akun jurnal langganan tidak ditemukan.')
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

  return journalId
}

function subscriptionRenewalStatus(subscription) {
  if (subscription.status !== 'active') {
    return {
      key: subscription.status,
      label: subscription.status === 'cancelled' ? 'Dibatalkan' : 'Tidak Aktif',
    }
  }

  const renewalDate = dateText(subscription.renewal_date)
  const today = getToday()

  if (!renewalDate) {
    return {
      key: 'missing_date',
      label: 'Tanggal Belum Diatur',
    }
  }

  if (renewalDate < today) {
    return {
      key: 'overdue',
      label: 'Perlu Dibuatkan Tagihan',
    }
  }

  if (renewalDate === today) {
    return {
      key: 'due',
      label: 'Jatuh Tempo Hari Ini',
    }
  }

  return {
    key: 'upcoming',
    label: 'Mendatang',
  }
}

function normalizeSubscriptionPayload(body) {
  const subscriptionName = cleanText(body.subscription_name, 150)
  const providerName = cleanText(body.provider_name, 150)
  const category = cleanText(body.category, 100) || 'Software'
  const amount = money(body.amount)
  const billingCycle = String(body.billing_cycle || 'monthly').trim()
  const startDate = dateText(body.start_date)
  const renewalDate = dateText(body.renewal_date)
  const paymentTermsDays = Number(body.payment_terms_days || 0)
  const status = String(body.status || 'active').trim()
  const notes = cleanText(body.notes, 2000)

  if (!subscriptionName) {
    throw new Error('Nama layanan langganan wajib diisi.')
  }

  if (!providerName) {
    throw new Error('Nama provider wajib diisi.')
  }

  if (amount <= 0) {
    throw new Error('Biaya langganan harus lebih dari 0.')
  }

  if (!ALLOWED_CYCLES.includes(billingCycle)) {
    throw new Error('Siklus tagihan tidak valid.')
  }

  if (!isValidDate(startDate)) {
    throw new Error('Tanggal mulai langganan tidak valid.')
  }

  if (!isValidDate(renewalDate)) {
    throw new Error('Tanggal tagihan berikutnya tidak valid.')
  }

  if (!Number.isInteger(paymentTermsDays) || paymentTermsDays < 0 || paymentTermsDays > 365) {
    throw new Error('Jangka waktu jatuh tempo harus antara 0 sampai 365 hari.')
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error('Status langganan tidak valid.')
  }

  return {
    subscriptionName,
    providerName,
    category,
    amount,
    billingCycle,
    startDate,
    renewalDate,
    paymentTermsDays,
    status,
    notes,
  }
}

async function getSubscriptionById(connection, subscriptionId, lock = false) {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM subscriptions
      WHERE id = ?
      LIMIT 1
      ${lock ? 'FOR UPDATE' : ''}
    `,
    [subscriptionId],
  )

  return rows[0] || null
}

async function createDraftBillFromSubscription(connection, subscription) {
  if (subscription.status !== 'active') {
    throw new Error('Hanya langganan aktif yang dapat dibuatkan draft tagihan.')
  }

  const billingDate = dateText(subscription.renewal_date)

  if (!isValidDate(billingDate)) {
    throw new Error('Tanggal tagihan berikutnya pada langganan belum valid.')
  }

  const [existingRunRows] = await connection.query(
    `
      SELECT id, bill_id
      FROM subscription_bill_runs
      WHERE subscription_id = ?
        AND billing_date = ?
      LIMIT 1
      FOR UPDATE
    `,
    [subscription.id, billingDate],
  )

  if (existingRunRows[0]) {
    throw new Error(
      `Draft tagihan untuk tanggal ${billingDate} sudah pernah dibuat.`,
    )
  }

  const amount = money(subscription.amount)
  const dueDate = addDays(billingDate, subscription.payment_terms_days)
  const billNumber = `SUB-${subscription.id}-${billingDate.replaceAll('-', '')}`
  const periodLabel = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${billingDate}T00:00:00Z`))

  const [billResult] = await connection.query(
    `
      INSERT INTO bills (
        vendor_name,
        project_id,
        bill_number,
        bill_date,
        due_date,
        total_amount,
        paid_amount,
        status,
        notes
      ) VALUES (?, NULL, ?, ?, ?, ?, 0, 'draft', ?)
    `,
    [
      subscription.provider_name,
      billNumber,
      billingDate,
      dueDate,
      amount,
      [
        `Dibuat dari langganan: ${subscription.subscription_name}.`,
        `Kategori: ${subscription.category || 'Software'}.`,
        `Siklus: ${subscription.billing_cycle}.`,
        'Jurnal belum dibuat sampai draft tagihan diterbitkan dari menu Utang.',
      ].join(' '),
    ],
  )

  const billId = billResult.insertId

  await connection.query(
    `
      INSERT INTO bill_items (
        bill_id,
        description,
        quantity,
        unit_price,
        line_total
      ) VALUES (?, ?, 1, ?, ?)
    `,
    [
      billId,
      `Langganan ${subscription.subscription_name} - ${periodLabel}`,
      amount,
      amount,
    ],
  )

  await connection.query(
    `
      INSERT INTO subscription_bill_runs (
        subscription_id,
        bill_id,
        billing_date
      ) VALUES (?, ?, ?)
    `,
    [subscription.id, billId, billingDate],
  )

  const nextDate = nextRenewalDate(billingDate, subscription.billing_cycle)

  await connection.query(
    `
      UPDATE subscriptions
      SET renewal_date = ?
      WHERE id = ?
    `,
    [nextDate, subscription.id],
  )

  return {
    subscription_id: subscription.id,
    subscription_name: subscription.subscription_name,
    bill_id: billId,
    bill_number: billNumber,
    bill_date: billingDate,
    due_date: dueDate,
    next_renewal_date: nextDate,
    amount,
  }
}

/*
  GET /api/subscriptions
*/
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.id,
        s.subscription_name,
        s.provider_name,
        s.category,
        s.amount,
        s.billing_cycle,
        s.start_date,
        s.renewal_date,
        s.payment_terms_days,
        s.status,
        s.notes,
        s.created_at,
        s.updated_at,

        COALESCE(run_summary.generated_bill_count, 0) AS generated_bill_count,
        COALESCE(run_summary.paid_bill_count, 0) AS paid_bill_count,
        COALESCE(run_summary.open_bill_count, 0) AS open_bill_count,
        COALESCE(run_summary.draft_bill_count, 0) AS draft_bill_count,
        COALESCE(run_summary.overdue_bill_count, 0) AS overdue_bill_count,
        run_summary.last_billed_date,
        COALESCE(journal_summary.paid_journal_count, 0) AS paid_journal_count,
        journal_summary.latest_journal_id,

        latest_bill.id AS latest_bill_id,
        latest_bill.bill_number AS latest_bill_number,
        latest_bill.bill_date AS latest_bill_date,
        latest_bill.due_date AS latest_bill_due_date,
        latest_bill.total_amount AS latest_bill_total_amount,
        latest_bill.paid_amount AS latest_bill_paid_amount,
        GREATEST(
          COALESCE(latest_bill.total_amount, 0) - COALESCE(latest_bill.paid_amount, 0),
          0
        ) AS latest_bill_outstanding_amount,
        latest_bill.status AS latest_bill_status,
        CASE
          WHEN latest_bill.status IN ('unpaid', 'partial')
            AND latest_bill.due_date IS NOT NULL
            AND latest_bill.due_date < CURDATE()
            AND latest_bill.paid_amount < latest_bill.total_amount
            THEN 'overdue'
          ELSE latest_bill.status
        END AS latest_bill_display_status

      FROM subscriptions s
      LEFT JOIN subscription_bill_runs latest_run
        ON latest_run.id = (
          SELECT id
          FROM subscription_bill_runs
          WHERE subscription_id = s.id
          ORDER BY id DESC
          LIMIT 1
        )
      LEFT JOIN bills latest_bill
        ON latest_bill.id = latest_run.bill_id
      LEFT JOIN (
        SELECT
          runs.subscription_id,
          COUNT(*) AS generated_bill_count,
          SUM(CASE WHEN bills.status = 'paid' THEN 1 ELSE 0 END) AS paid_bill_count,
          SUM(CASE WHEN bills.status IN ('unpaid', 'partial', 'overdue') THEN 1 ELSE 0 END) AS open_bill_count,
          SUM(CASE WHEN bills.status = 'draft' THEN 1 ELSE 0 END) AS draft_bill_count,
          SUM(CASE
            WHEN (
              bills.status = 'overdue'
              OR (
                bills.status IN ('unpaid', 'partial')
                AND bills.due_date IS NOT NULL
                AND bills.due_date < CURDATE()
                AND bills.paid_amount < bills.total_amount
              )
            ) THEN 1 ELSE 0
          END) AS overdue_bill_count,
          MAX(runs.billing_date) AS last_billed_date
        FROM subscription_bill_runs runs
        INNER JOIN bills
          ON bills.id = runs.bill_id
        GROUP BY runs.subscription_id
      ) run_summary
        ON run_summary.subscription_id = s.id
      LEFT JOIN (
        SELECT
          source_id AS subscription_id,
          COUNT(*) AS paid_journal_count,
          MAX(id) AS latest_journal_id
        FROM journal_entries
        WHERE source_type = 'subscription'
          AND status = 'posted'
        GROUP BY source_id
      ) journal_summary
        ON journal_summary.subscription_id = s.id
      ORDER BY
        CASE s.status WHEN 'active' THEN 0 ELSE 1 END,
        s.renewal_date ASC,
        s.id DESC
    `)

    const subscriptions = rows.map((subscription) => ({
      ...subscription,
      amount: money(subscription.amount),
      payment_terms_days: Number(subscription.payment_terms_days || 0),
      monthly_equivalent: monthlyEquivalent(
        subscription.amount,
        subscription.billing_cycle,
      ),
      renewal_status: subscriptionRenewalStatus(subscription),
    }))

    const summary = subscriptions.reduce(
      (result, subscription) => {
        if (subscription.status === 'active') {
          result.active_count += 1
          result.monthly_burn_rate = money(
            result.monthly_burn_rate + subscription.monthly_equivalent,
          )
        }

        if (
          subscription.renewal_status.key === 'due' ||
          subscription.renewal_status.key === 'overdue'
        ) {
          result.due_count += 1
        }

        if (subscription.latest_bill_status === 'draft') {
          result.draft_bill_count += 1
        }

        return result
      },
      {
        active_count: 0,
        monthly_burn_rate: 0,
        due_count: 0,
        draft_bill_count: 0,
      },
    )

    res.json({
      success: true,
      message: 'Data langganan berhasil diambil.',
      data: {
        subscriptions,
        summary,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data langganan.',
    })
  }
})

/*
  POST /api/subscriptions
*/
router.post('/', async (req, res) => {
  let connection

  try {
    const payload = normalizeSubscriptionPayload(req.body || {})

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [result] = await connection.query(
      `
        INSERT INTO subscriptions (
          subscription_name,
          provider_name,
          category,
          amount,
          billing_cycle,
          start_date,
          renewal_date,
          payment_terms_days,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.subscriptionName,
        payload.providerName,
        payload.category,
        payload.amount,
        payload.billingCycle,
        payload.startDate,
        payload.renewalDate,
        payload.paymentTermsDays,
        payload.status,
        payload.notes,
      ],
    )

    const subscriptionId = result.insertId
    const subscription = {
      id: subscriptionId,
      subscription_name: payload.subscriptionName,
      provider_name: payload.providerName,
      category: payload.category,
      amount: payload.amount,
      billing_cycle: payload.billingCycle,
      start_date: payload.startDate,
      renewal_date: payload.renewalDate,
      payment_terms_days: payload.paymentTermsDays,
      status: payload.status,
      notes: payload.notes,
    }
    const journalId = await postSubscriptionPaymentJournal(
      connection,
      subscription,
      req.user?.id,
    )
    const nextDate = nextRenewalDate(payload.renewalDate, payload.billingCycle)

    await connection.query(
      `
        UPDATE subscriptions
        SET renewal_date = ?
        WHERE id = ?
      `,
      [nextDate, subscriptionId],
    )

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Langganan berhasil disimpan dan jurnal pembayaran otomatis diposting.',
      data: {
        id: subscriptionId,
        journal_entry_id: journalId,
        next_renewal_date: nextDate,
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(400).json({
      success: false,
      message: safePublicMessage(error, 'Gagal menyimpan langganan.'),
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

/*
  PUT /api/subscriptions/:id
*/
router.put('/:id', async (req, res) => {
  const subscriptionId = Number(req.params.id)

  if (!Number.isInteger(subscriptionId) || subscriptionId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID langganan tidak valid.',
    })
  }

  try {
    const payload = normalizeSubscriptionPayload(req.body || {})

    const [result] = await db.query(
      `
        UPDATE subscriptions
        SET
          subscription_name = ?,
          provider_name = ?,
          category = ?,
          amount = ?,
          billing_cycle = ?,
          start_date = ?,
          renewal_date = ?,
          payment_terms_days = ?,
          status = ?,
          notes = ?
        WHERE id = ?
      `,
      [
        payload.subscriptionName,
        payload.providerName,
        payload.category,
        payload.amount,
        payload.billingCycle,
        payload.startDate,
        payload.renewalDate,
        payload.paymentTermsDays,
        payload.status,
        payload.notes,
        subscriptionId,
      ],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Langganan tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      message: 'Langganan berhasil diperbarui.',
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: safePublicMessage(error, 'Gagal memperbarui langganan.'),
    })
  }
})

/*
  POST /api/subscriptions/generate-due-bills
  Membuat draft bill untuk seluruh langganan aktif dengan renewal_date <= hari ini.
*/
router.post('/generate-due-bills', async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [subscriptionRows] = await connection.query(
      `
        SELECT *
        FROM subscriptions
        WHERE status = 'active'
          AND renewal_date IS NOT NULL
          AND renewal_date <= ?
        ORDER BY renewal_date ASC, id ASC
        FOR UPDATE
      `,
      [getToday()],
    )

    const created = []
    const skipped = []

    for (const subscription of subscriptionRows) {
      try {
        const bill = await createDraftBillFromSubscription(
          connection,
          subscription,
        )

        created.push(bill)
      } catch (error) {
        skipped.push({
          subscription_id: subscription.id,
          subscription_name: subscription.subscription_name,
          reason: safePublicMessage(error, 'Tidak dapat diproses.'),
        })
      }
    }

    await connection.commit()

    res.json({
      success: true,
      message:
        created.length > 0
          ? `${created.length} draft tagihan langganan berhasil dibuat.`
          : 'Tidak ada langganan jatuh tempo yang perlu dibuatkan draft tagihan.',
      data: {
        created,
        skipped,
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(500).json({
      success: false,
      message: 'Gagal membuat draft tagihan jatuh tempo.',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

/*
  POST /api/subscriptions/:id/create-bill
  Membuat satu draft bill sesuai renewal_date langganan yang dipilih.
*/
router.post('/:id/create-bill', async (req, res) => {
  const subscriptionId = Number(req.params.id)
  let connection

  if (!Number.isInteger(subscriptionId) || subscriptionId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID langganan tidak valid.',
    })
  }

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const subscription = await getSubscriptionById(
      connection,
      subscriptionId,
      true,
    )

    if (!subscription) {
      throw new Error('Langganan tidak ditemukan.')
    }

    const bill = await createDraftBillFromSubscription(connection, subscription)

    await connection.commit()

    res.status(201).json({
      success: true,
      message:
        'Draft tagihan berhasil dibuat. Terbitkan tagihan dari menu Utang untuk membuat jurnal.',
      data: bill,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(400).json({
      success: false,
      message: safePublicMessage(error, 'Gagal membuat draft tagihan langganan.'),
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

module.exports = router
