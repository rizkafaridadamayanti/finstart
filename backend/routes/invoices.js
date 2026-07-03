const express = require('express')
const db = require('../config/db')

const router = express.Router()

const AR_ACCOUNT_CODE = '1130'
const DEFAULT_REVENUE_ACCOUNT_CODE = '4100'
const DEFAULT_BANK_ACCOUNT_CODE = '1120'
const VAT_OUTPUT_ACCOUNT_CODE = '2210'

function numberValue(value) {
  return Number(value || 0)
}

function money(value) {
  return Math.round((numberValue(value) + Number.EPSILON) * 100) / 100
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getOutstanding(invoice) {
  return Math.max(
    numberValue(invoice.total_amount) - numberValue(invoice.paid_amount),
    0,
  )
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Invoice harus memiliki minimal satu item.')
  }

  return items.map((item, index) => {
    const description = String(item.description || '').trim()
    const quantity = numberValue(item.quantity || 1)
    const unitPrice = numberValue(item.unit_price ?? item.unitPrice)

    if (!description) {
      throw new Error(`Deskripsi item ke-${index + 1} wajib diisi.`)
    }

    if (quantity <= 0) {
      throw new Error(`Kuantitas item ke-${index + 1} harus lebih dari 0.`)
    }

    if (unitPrice < 0) {
      throw new Error(`Harga item ke-${index + 1} tidak valid.`)
    }

    const lineTotal = money(quantity * unitPrice)

    if (lineTotal <= 0) {
      throw new Error(`Total item ke-${index + 1} harus lebih dari 0.`)
    }

    return {
      description,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    }
  })
}

function normalizePpn(tax, dppAmount) {
  const enabled = Boolean(tax?.ppn_enabled)

  if (!enabled) {
    return {
      enabled: false,
      rate: 0,
      amount: 0,
    }
  }

  const rate = numberValue(tax?.ppn_rate)

  if (rate <= 0 || rate > 100) {
    throw new Error('Tarif PPN harus diisi antara 0 sampai 100 persen.')
  }

  return {
    enabled: true,
    rate,
    amount: money(dppAmount * rate / 100),
  }
}

async function refreshOverdueInvoices(executor = db) {
  await executor.query(`
    UPDATE invoices
    SET status = 'overdue'
    WHERE status IN ('unpaid', 'partial')
      AND due_date IS NOT NULL
      AND due_date < CURDATE()
      AND paid_amount < total_amount
  `)
}

async function ensureVatPeriodOpen(connection, period, hasPpn) {
  if (!hasPpn) return

  const [rows] = await connection.query(
    `
      SELECT id
      FROM vat_period_closings
      WHERE tax_period = ?
      LIMIT 1
    `,
    [period],
  )

  if (rows[0]) {
    throw new Error(
      `Masa PPN ${period} sudah ditutup. Buat invoice PPN pada masa pajak yang masih terbuka.`,
    )
  }
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
  const debitTotal = money(payload.lines.reduce(
    (total, line) => total + numberValue(line.debit),
    0,
  ))

  const creditTotal = money(payload.lines.reduce(
    (total, line) => total + numberValue(line.credit),
    0,
  ))

  if (
    payload.lines.length < 2 ||
    debitTotal <= 0 ||
    Math.abs(debitTotal - creditTotal) > 0.005
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
      throw new Error('Akun jurnal tidak ditemukan.')
    }

    const delta =
      account.normal_balance === 'debit'
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

async function generateInvoiceNumber(connection, issueDate) {
  const period = String(issueDate).slice(0, 7).replace('-', '')

  const [rows] = await connection.query(
    `
      SELECT COUNT(*) + 1 AS sequence_number
      FROM invoices
      WHERE DATE_FORMAT(issue_date, '%Y%m') = ?
    `,
    [period],
  )

  return `INV/${period}/${String(rows[0].sequence_number).padStart(3, '0')}`
}

async function getInvoiceTaxes(executor, invoiceId) {
  const [rows] = await executor.query(
    `
      SELECT
        id,
        tax_type,
        tax_period,
        dpp_amount,
        tax_rate,
        tax_amount,
        status,
        journal_entry_id
      FROM transaction_taxes
      WHERE source_type = 'invoice'
        AND source_id = ?
      ORDER BY id ASC
    `,
    [invoiceId],
  )

  return rows.map((tax) => ({
    ...tax,
    dpp_amount: numberValue(tax.dpp_amount),
    tax_rate: numberValue(tax.tax_rate),
    tax_amount: numberValue(tax.tax_amount),
  }))
}

async function getInvoiceDetail(executor, invoiceId) {
  const [invoiceRows] = await executor.query(
    `
      SELECT
        invoices.*,
        clients.company_name AS client_name,
        projects.project_name,
        GREATEST(invoices.total_amount - invoices.paid_amount, 0) AS outstanding_amount,
        CASE
          WHEN invoices.status IN ('unpaid', 'partial')
            AND invoices.due_date IS NOT NULL
            AND invoices.due_date < CURDATE()
            AND invoices.paid_amount < invoices.total_amount
          THEN 'overdue'
          ELSE invoices.status
        END AS display_status
      FROM invoices
      INNER JOIN clients
        ON clients.id = invoices.client_id
      LEFT JOIN projects
        ON projects.id = invoices.project_id
      WHERE invoices.id = ?
      LIMIT 1
    `,
    [invoiceId],
  )

  const invoice = invoiceRows[0]

  if (!invoice) return null

  const [items] = await executor.query(
    `
      SELECT id, description, quantity, unit_price, line_total
      FROM invoice_items
      WHERE invoice_id = ?
      ORDER BY id ASC
    `,
    [invoiceId],
  )

  const [payments] = await executor.query(
    `
      SELECT
        invoice_payments.*,
        journal_entries.voucher_number AS journal_voucher_number
      FROM invoice_payments
      LEFT JOIN journal_entries
        ON journal_entries.id = invoice_payments.journal_entry_id
      WHERE invoice_payments.invoice_id = ?
      ORDER BY invoice_payments.payment_date ASC, invoice_payments.id ASC
    `,
    [invoiceId],
  )

  const taxes = await getInvoiceTaxes(executor, invoiceId)
  const ppn = taxes.find((tax) => tax.tax_type === 'PPN_OUTPUT')
  const dppAmount = items.reduce(
    (total, item) => total + numberValue(item.line_total),
    0,
  )

  return {
    ...invoice,
    dpp_amount: money(dppAmount),
    ppn_amount: numberValue(ppn?.tax_amount),
    ppn_rate: numberValue(ppn?.tax_rate),
    ppn_enabled: Boolean(ppn),
    total_amount: numberValue(invoice.total_amount),
    paid_amount: numberValue(invoice.paid_amount),
    outstanding_amount: numberValue(invoice.outstanding_amount),
    taxes,
    items: items.map((item) => ({
      ...item,
      quantity: numberValue(item.quantity),
      unit_price: numberValue(item.unit_price),
      line_total: numberValue(item.line_total),
    })),
    payments: payments.map((payment) => ({
      ...payment,
      amount: numberValue(payment.amount),
    })),
  }
}

router.get('/summary', async (req, res) => {
  try {
    await refreshOverdueInvoices()

    const [[summaryRows], [agingRows]] = await Promise.all([
      db.query(`
        SELECT
          COALESCE(SUM(CASE
            WHEN status IN ('unpaid', 'partial', 'overdue')
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS total_receivable,

          COALESCE(SUM(CASE
            WHEN status = 'overdue'
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS total_overdue,

          COALESCE(SUM(paid_amount), 0) AS total_paid,

          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_count,
          SUM(CASE WHEN status IN ('unpaid', 'partial', 'overdue') THEN 1 ELSE 0 END) AS open_count,
          SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_count
        FROM invoices
        WHERE status <> 'cancelled'
      `),
      db.query(`
        SELECT
          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), issue_date) BETWEEN 0 AND 30
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS days_0_30,

          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), issue_date) BETWEEN 31 AND 60
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS days_31_60,

          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), issue_date) BETWEEN 61 AND 90
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS days_61_90,

          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), issue_date) > 90
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS days_over_90
        FROM invoices
        WHERE status IN ('unpaid', 'partial', 'overdue')
          AND paid_amount < total_amount
      `),
    ])

    res.json({
      success: true,
      message: 'Ringkasan piutang berhasil diambil',
      data: {
        total_receivable: numberValue(summaryRows[0].total_receivable),
        total_overdue: numberValue(summaryRows[0].total_overdue),
        total_paid: numberValue(summaryRows[0].total_paid),
        draft_count: Number(summaryRows[0].draft_count || 0),
        open_count: Number(summaryRows[0].open_count || 0),
        overdue_count: Number(summaryRows[0].overdue_count || 0),
        aging: {
          days_0_30: numberValue(agingRows[0].days_0_30),
          days_31_60: numberValue(agingRows[0].days_31_60),
          days_61_90: numberValue(agingRows[0].days_61_90),
          days_over_90: numberValue(agingRows[0].days_over_90),
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan piutang',
      error: error.message,
    })
  }
})

router.get('/', async (req, res) => {
  try {
    await refreshOverdueInvoices()

    const keyword = String(req.query.search || '').trim()
    const status = String(req.query.status || '').trim().toLowerCase()
    const whereParts = []
    const params = []

    if (status && status !== 'all') {
      whereParts.push('invoices.status = ?')
      params.push(status)
    }

    if (keyword) {
      whereParts.push(`(
        invoices.invoice_number LIKE ?
        OR clients.company_name LIKE ?
        OR COALESCE(projects.project_name, '') LIKE ?
      )`)
      const query = `%${keyword}%`
      params.push(query, query, query)
    }

    const whereClause = whereParts.length
      ? `WHERE ${whereParts.join(' AND ')}`
      : ''

    const [rows] = await db.query(
      `
        SELECT
          invoices.*,
          clients.company_name AS client_name,
          projects.project_name,
          COALESCE((
            SELECT transaction_taxes.tax_amount
            FROM transaction_taxes
            WHERE transaction_taxes.source_type = 'invoice'
              AND transaction_taxes.source_id = invoices.id
              AND transaction_taxes.tax_type = 'PPN_OUTPUT'
            LIMIT 1
          ), 0) AS ppn_amount,
          GREATEST(invoices.total_amount - invoices.paid_amount, 0) AS outstanding_amount,
          CASE
            WHEN invoices.status IN ('unpaid', 'partial')
              AND invoices.due_date IS NOT NULL
              AND invoices.due_date < CURDATE()
              AND invoices.paid_amount < invoices.total_amount
            THEN 'overdue'
            ELSE invoices.status
          END AS display_status
        FROM invoices
        INNER JOIN clients
          ON clients.id = invoices.client_id
        LEFT JOIN projects
          ON projects.id = invoices.project_id
        ${whereClause}
        ORDER BY
          FIELD(invoices.status, 'overdue', 'partial', 'unpaid', 'draft', 'paid', 'cancelled'),
          invoices.due_date ASC,
          invoices.id DESC
      `,
      params,
    )

    res.json({
      success: true,
      message: 'Daftar invoice berhasil diambil',
      data: rows.map((invoice) => ({
        ...invoice,
        ppn_amount: numberValue(invoice.ppn_amount),
        dpp_amount: money(numberValue(invoice.total_amount) - numberValue(invoice.ppn_amount)),
        total_amount: numberValue(invoice.total_amount),
        paid_amount: numberValue(invoice.paid_amount),
        outstanding_amount: numberValue(invoice.outstanding_amount),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar invoice',
      error: error.message,
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    await refreshOverdueInvoices()

    const invoice = await getInvoiceDetail(db, req.params.id)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      message: 'Detail invoice berhasil diambil',
      data: invoice,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail invoice',
      error: error.message,
    })
  }
})

router.post('/', async (req, res) => {
  let connection

  try {
    const {
      client_id,
      project_id,
      invoice_number,
      issue_date,
      due_date,
      notes,
      items,
      tax,
    } = req.body || {}

    const clientId = Number(client_id)
    const projectId = project_id ? Number(project_id) : null
    const issueDate = issue_date || getToday()
    const dueDate = due_date || null

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Klien wajib dipilih.',
      })
    }

    if (!isValidDate(issueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal invoice tidak valid.',
      })
    }

    if (dueDate && (!isValidDate(dueDate) || dueDate < issueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal jatuh tempo tidak valid.',
      })
    }

    const normalizedItems = normalizeItems(items)
    const dppAmount = money(normalizedItems.reduce(
      (total, item) => total + item.line_total,
      0,
    ))
    const ppn = normalizePpn(tax, dppAmount)
    const totalAmount = money(dppAmount + ppn.amount)
    const taxPeriod = String(issueDate).slice(0, 7)

    connection = await db.getConnection()
    await connection.beginTransaction()

    await ensureVatPeriodOpen(connection, taxPeriod, ppn.enabled)

    const [clientRows] = await connection.query(
      'SELECT id FROM clients WHERE id = ? LIMIT 1',
      [clientId],
    )

    if (!clientRows[0]) {
      throw new Error('Klien tidak ditemukan.')
    }

    if (projectId) {
      const [projectRows] = await connection.query(
        'SELECT id, client_id FROM projects WHERE id = ? LIMIT 1',
        [projectId],
      )

      const project = projectRows[0]

      if (!project) {
        throw new Error('Proyek tidak ditemukan.')
      }

      if (Number(project.client_id) !== clientId) {
        throw new Error('Proyek harus milik klien yang sama dengan invoice.')
      }
    }

    const invoiceNumber = String(invoice_number || '').trim() ||
      await generateInvoiceNumber(connection, issueDate)

    const [invoiceResult] = await connection.query(
      `
        INSERT INTO invoices (
          client_id,
          project_id,
          invoice_number,
          issue_date,
          due_date,
          total_amount,
          paid_amount,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 'draft', ?)
      `,
      [
        clientId,
        projectId,
        invoiceNumber,
        issueDate,
        dueDate,
        totalAmount,
        String(notes || '').trim() || null,
      ],
    )

    const invoiceId = invoiceResult.insertId
    const placeholders = normalizedItems.map(() => '(?, ?, ?, ?, ?)').join(', ')
    const itemValues = normalizedItems.flatMap((item) => [
      invoiceId,
      item.description,
      item.quantity,
      item.unit_price,
      item.line_total,
    ])

    await connection.query(
      `
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          line_total
        ) VALUES ${placeholders}
      `,
      itemValues,
    )

    if (ppn.enabled) {
      await connection.query(
        `
          INSERT INTO transaction_taxes (
            source_type,
            source_id,
            tax_type,
            tax_period,
            dpp_amount,
            tax_rate,
            tax_amount,
            is_creditable,
            status
          ) VALUES ('invoice', ?, 'PPN_OUTPUT', ?, ?, ?, ?, 0, 'draft')
        `,
        [
          invoiceId,
          taxPeriod,
          dppAmount,
          ppn.rate,
          ppn.amount,
        ],
      )
    }

    await connection.commit()

    const invoice = await getInvoiceDetail(db, invoiceId)

    res.status(201).json({
      success: true,
      message: ppn.enabled
        ? 'Invoice draft berhasil dibuat beserta PPN Keluaran. Terbitkan untuk memposting piutang, pendapatan, dan PPN.'
        : 'Invoice draft berhasil dibuat. Terbitkan invoice untuk mencatat piutang dan pendapatan.',
      data: invoice,
    })
  } catch (error) {
    if (connection) await connection.rollback()

    const statusCode = error.code === 'ER_DUP_ENTRY' ? 409 : 400

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Gagal membuat invoice.',
    })
  } finally {
    if (connection) connection.release()
  }
})

router.delete('/:id', async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [invoiceRows] = await connection.query(
      'SELECT id, status FROM invoices WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const invoice = invoiceRows[0]

    if (!invoice) {
      throw new Error('Invoice tidak ditemukan.')
    }

    if (invoice.status !== 'draft') {
      throw new Error('Hanya invoice draft yang dapat dihapus.')
    }

    await connection.query(
      `
        DELETE FROM transaction_taxes
        WHERE source_type = 'invoice'
          AND source_id = ?
      `,
      [invoice.id],
    )

    await connection.query('DELETE FROM invoices WHERE id = ?', [invoice.id])
    await connection.commit()

    res.json({
      success: true,
      message: 'Invoice draft berhasil dihapus.',
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus invoice.',
    })
  } finally {
    if (connection) connection.release()
  }
})

router.post('/:id/issue', async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [invoiceRows] = await connection.query(
      'SELECT * FROM invoices WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const invoice = invoiceRows[0]

    if (!invoice) {
      throw new Error('Invoice tidak ditemukan.')
    }

    if (invoice.status !== 'draft') {
      throw new Error('Hanya invoice draft yang dapat diterbitkan.')
    }

    const [existingJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'invoice'
          AND source_id = ?
        LIMIT 1
      `,
      [invoice.id],
    )

    if (existingJournalRows[0]) {
      throw new Error('Jurnal invoice sudah pernah dibuat.')
    }

    const [taxRows] = await connection.query(
      `
        SELECT *
        FROM transaction_taxes
        WHERE source_type = 'invoice'
          AND source_id = ?
          AND tax_type = 'PPN_OUTPUT'
        FOR UPDATE
      `,
      [invoice.id],
    )

    const ppnTax = taxRows[0]
    const ppnAmount = numberValue(ppnTax?.tax_amount)
    const dppAmount = money(numberValue(invoice.total_amount) - ppnAmount)

    await ensureVatPeriodOpen(
      connection,
      String(invoice.issue_date).slice(0, 7),
      ppnAmount > 0,
    )

    const receivableAccount = await findAccountByCode(
      connection,
      AR_ACCOUNT_CODE,
      'asset',
    )

    const revenueAccountId = req.body?.revenue_account_id
    const revenueAccount = revenueAccountId
      ? await findAccountById(connection, revenueAccountId, 'revenue')
      : await findAccountByCode(
          connection,
          DEFAULT_REVENUE_ACCOUNT_CODE,
          'revenue',
        )

    const vatOutputAccount = ppnAmount > 0
      ? await findAccountByCode(
          connection,
          VAT_OUTPUT_ACCOUNT_CODE,
          'liability',
        )
      : null

    if (!receivableAccount) {
      throw new Error(
        `Akun Piutang Usaha dengan kode ${AR_ACCOUNT_CODE} tidak ditemukan.`,
      )
    }

    if (!revenueAccount) {
      throw new Error('Akun pendapatan tidak ditemukan atau tidak aktif.')
    }

    if (ppnAmount > 0 && !vatOutputAccount) {
      throw new Error(
        `Akun PPN Keluaran dengan kode ${VAT_OUTPUT_ACCOUNT_CODE} tidak ditemukan. Jalankan migration pajak terlebih dahulu.`,
      )
    }

    const lines = [
      {
        account_id: receivableAccount.id,
        description: `Piutang ${invoice.invoice_number}`,
        debit: numberValue(invoice.total_amount),
        credit: 0,
      },
      {
        account_id: revenueAccount.id,
        description: `Pendapatan ${invoice.invoice_number}`,
        debit: 0,
        credit: dppAmount,
      },
    ]

    if (ppnAmount > 0) {
      lines.push({
        account_id: vatOutputAccount.id,
        description: `PPN Keluaran ${invoice.invoice_number}`,
        debit: 0,
        credit: ppnAmount,
      })
    }

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `AR-INV-${invoice.id}`,
      transaction_date: invoice.issue_date,
      description: `Penerbitan invoice ${invoice.invoice_number}`,
      source_type: 'invoice',
      source_id: invoice.id,
      lines,
    })

    if (ppnTax) {
      await connection.query(
        `
          UPDATE transaction_taxes
          SET
            status = 'posted',
            journal_entry_id = ?
          WHERE id = ?
        `,
        [journalId, ppnTax.id],
      )
    }

    const nextStatus =
      invoice.due_date && invoice.due_date < getToday()
        ? 'overdue'
        : 'unpaid'

    await connection.query(
      'UPDATE invoices SET status = ? WHERE id = ?',
      [nextStatus, invoice.id],
    )

    await connection.commit()

    const updatedInvoice = await getInvoiceDetail(db, invoice.id)

    res.json({
      success: true,
      message: ppnAmount > 0
        ? 'Invoice diterbitkan. Piutang, pendapatan, dan PPN Keluaran otomatis diposting.'
        : 'Invoice berhasil diterbitkan dan jurnal piutang otomatis diposting.',
      data: {
        invoice: updatedInvoice,
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menerbitkan invoice.',
    })
  } finally {
    if (connection) connection.release()
  }
})

router.post('/:id/payments', async (req, res) => {
  let connection

  try {
    const {
      payment_date,
      payment_method,
      amount,
      reference_number,
      notes,
      cash_account_id,
    } = req.body || {}

    const paymentDate = payment_date || getToday()
    const paymentAmount = money(amount)

    if (!isValidDate(paymentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal pembayaran tidak valid.',
      })
    }

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal pembayaran harus lebih dari 0.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [invoiceRows] = await connection.query(
      'SELECT * FROM invoices WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const invoice = invoiceRows[0]

    if (!invoice) {
      throw new Error('Invoice tidak ditemukan.')
    }

    if (invoice.status === 'draft') {
      throw new Error(
        'Terbitkan invoice terlebih dahulu sebelum mencatat pembayaran.',
      )
    }

    if (invoice.status === 'cancelled' || invoice.status === 'paid') {
      throw new Error('Invoice ini tidak dapat menerima pembayaran lagi.')
    }

    if (paymentDate < invoice.issue_date) {
      throw new Error(
        'Tanggal pembayaran tidak boleh sebelum tanggal invoice.',
      )
    }

    const outstanding = getOutstanding(invoice)

    if (paymentAmount > outstanding) {
      throw new Error('Nominal pembayaran melebihi sisa piutang.')
    }

    const [invoiceJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'invoice'
          AND source_id = ?
          AND status = 'posted'
        LIMIT 1
      `,
      [invoice.id],
    )

    if (!invoiceJournalRows[0]) {
      throw new Error('Jurnal invoice belum diposting.')
    }

    const receivableAccount = await findAccountByCode(
      connection,
      AR_ACCOUNT_CODE,
      'asset',
    )

    const cashAccount = cash_account_id
      ? await findAccountById(connection, cash_account_id, 'asset')
      : await findAccountByCode(
          connection,
          DEFAULT_BANK_ACCOUNT_CODE,
          'asset',
        )

    if (!receivableAccount) {
      throw new Error(
        `Akun Piutang Usaha dengan kode ${AR_ACCOUNT_CODE} tidak ditemukan.`,
      )
    }

    if (!cashAccount || Number(cashAccount.id) === Number(receivableAccount.id)) {
      throw new Error(
        'Pilih akun Kas atau Bank yang valid untuk penerimaan pembayaran.',
      )
    }

    const [paymentResult] = await connection.query(
      `
        INSERT INTO invoice_payments (
          invoice_id,
          payment_date,
          payment_method,
          amount,
          reference_number,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        invoice.id,
        paymentDate,
        String(payment_method || '').trim() || null,
        paymentAmount,
        String(reference_number || '').trim() || null,
        String(notes || '').trim() || null,
      ],
    )

    const paymentId = paymentResult.insertId

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `AR-RCP-${invoice.id}-${paymentId}`,
      transaction_date: paymentDate,
      description: `Penerimaan pembayaran invoice ${invoice.invoice_number}`,
      source_type: 'invoice_payment',
      source_id: paymentId,
      lines: [
        {
          account_id: cashAccount.id,
          description: `Penerimaan ${invoice.invoice_number}`,
          debit: paymentAmount,
          credit: 0,
        },
        {
          account_id: receivableAccount.id,
          description: `Pelunasan piutang ${invoice.invoice_number}`,
          debit: 0,
          credit: paymentAmount,
        },
      ],
    })

    await connection.query(
      'UPDATE invoice_payments SET journal_entry_id = ? WHERE id = ?',
      [journalId, paymentId],
    )

    const newPaidAmount = money(numberValue(invoice.paid_amount) + paymentAmount)
    const newOutstanding = money(numberValue(invoice.total_amount) - newPaidAmount)
    const newStatus =
      newOutstanding <= 0
        ? 'paid'
        : (
          invoice.due_date && invoice.due_date < paymentDate
            ? 'overdue'
            : 'partial'
        )

    await connection.query(
      `
        UPDATE invoices
        SET
          paid_amount = ?,
          status = ?
        WHERE id = ?
      `,
      [newPaidAmount, newStatus, invoice.id],
    )

    await connection.commit()

    const updatedInvoice = await getInvoiceDetail(db, invoice.id)

    res.json({
      success: true,
      message: 'Pembayaran invoice berhasil dicatat dan jurnal penerimaan diposting.',
      data: {
        invoice: updatedInvoice,
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mencatat pembayaran invoice.',
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
