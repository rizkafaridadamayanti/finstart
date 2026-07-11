const express = require('express')
const db = require('../config/db')
const { safePublicMessage } = require('../utils/api-errors')

const router = express.Router()

const ALLOWED_CYCLES = ['monthly', 'quarterly', 'yearly']
const ALLOWED_STATUSES = ['active', 'inactive', 'cancelled']

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
        run_summary.last_billed_date,

        (
          SELECT b.id
          FROM subscription_bill_runs latest_run
          INNER JOIN bills b
            ON b.id = latest_run.bill_id
          WHERE latest_run.subscription_id = s.id
          ORDER BY latest_run.id DESC
          LIMIT 1
        ) AS latest_bill_id,

        (
          SELECT b.bill_number
          FROM subscription_bill_runs latest_run
          INNER JOIN bills b
            ON b.id = latest_run.bill_id
          WHERE latest_run.subscription_id = s.id
          ORDER BY latest_run.id DESC
          LIMIT 1
        ) AS latest_bill_number,

        (
          SELECT b.status
          FROM subscription_bill_runs latest_run
          INNER JOIN bills b
            ON b.id = latest_run.bill_id
          WHERE latest_run.subscription_id = s.id
          ORDER BY latest_run.id DESC
          LIMIT 1
        ) AS latest_bill_status

      FROM subscriptions s
      LEFT JOIN (
        SELECT
          subscription_id,
          COUNT(*) AS generated_bill_count,
          MAX(billing_date) AS last_billed_date
        FROM subscription_bill_runs
        GROUP BY subscription_id
      ) run_summary
        ON run_summary.subscription_id = s.id
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
  try {
    const payload = normalizeSubscriptionPayload(req.body || {})

    const [result] = await db.query(
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

    res.status(201).json({
      success: true,
      message: 'Langganan berhasil disimpan.',
      data: {
        id: result.insertId,
      },
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: safePublicMessage(error, 'Gagal menyimpan langganan.'),
    })
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
