const express = require('express')
const db = require('../config/db')
const { safePublicMessage } = require('../utils/api-errors')

const router = express.Router()

const AP_ACCOUNT_CODE = '2100'
const DEFAULT_EXPENSE_ACCOUNT_CODE = '5100'
const DEFAULT_BANK_ACCOUNT_CODE = '1120'
const VAT_INPUT_ACCOUNT_CODE = '1145'
const PPH23_PAYABLE_ACCOUNT_CODE = '2211'

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

function getOutstanding(bill) {
  return Math.max(
    numberValue(bill.vendor_payable_amount ?? bill.total_amount) -
      numberValue(bill.paid_amount),
    0,
  )
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Tagihan harus memiliki minimal satu item.')
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

function normalizeBillTaxes(tax, dppAmount) {
  const ppnEnabled = Boolean(tax?.ppn_enabled)
  const ppnRate = numberValue(tax?.ppn_rate)

  if (ppnEnabled && (ppnRate <= 0 || ppnRate > 100)) {
    throw new Error('Tarif PPN Masukan harus diisi antara 0 sampai 100 persen.')
  }

  const pph23Enabled = Boolean(tax?.pph23_enabled)
  const pph23BaseRate = numberValue(tax?.pph23_rate)
  const vendorHasNpwp = tax?.vendor_has_npwp !== false
  const pph23Object = String(tax?.pph23_object || '').trim() || null

  if (pph23Enabled && (pph23BaseRate <= 0 || pph23BaseRate > 100)) {
    throw new Error('Tarif dasar PPh 23 harus diisi antara 0 sampai 100 persen.')
  }

  const pph23EffectiveRate = pph23Enabled
    ? money(pph23BaseRate * (vendorHasNpwp ? 1 : 2))
    : 0

  return {
    ppn: {
      enabled: ppnEnabled,
      rate: ppnEnabled ? ppnRate : 0,
      amount: ppnEnabled ? money(dppAmount * ppnRate / 100) : 0,
    },
    pph23: {
      enabled: pph23Enabled,
      base_rate: pph23Enabled ? pph23BaseRate : 0,
      effective_rate: pph23EffectiveRate,
      amount: pph23Enabled
        ? money(dppAmount * pph23EffectiveRate / 100)
        : 0,
      vendor_has_npwp: vendorHasNpwp,
      object: pph23Object,
    },
  }
}

async function refreshOverdueBills(executor = db) {
  await executor.query(`
    UPDATE bills
    SET status = 'overdue'
    WHERE status IN ('unpaid', 'partial')
      AND due_date IS NOT NULL
      AND due_date < CURDATE()
      AND paid_amount < GREATEST(
        total_amount - COALESCE((
          SELECT transaction_taxes.tax_amount
          FROM transaction_taxes
          WHERE transaction_taxes.source_type = 'bill'
            AND transaction_taxes.source_id = bills.id
            AND transaction_taxes.tax_type = 'PPH23'
          LIMIT 1
        ), 0),
        0
      )
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
      `Masa PPN ${period} sudah ditutup. Buat tagihan PPN pada masa pajak yang masih terbuka.`,
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

async function ensureBillIssueJournal(connection, bill, expenseAccountId = null) {
  const [existingJournalRows] = await connection.query(
    `
      SELECT id
      FROM journal_entries
      WHERE source_type = 'bill'
        AND source_id = ?
        AND status = 'posted'
      LIMIT 1
    `,
    [bill.id],
  )

  if (existingJournalRows[0]) {
    return existingJournalRows[0].id
  }

  const [taxRows] = await connection.query(
    `
      SELECT *
      FROM transaction_taxes
      WHERE source_type = 'bill'
        AND source_id = ?
      FOR UPDATE
    `,
    [bill.id],
  )

  const ppnTax = taxRows.find((tax) => tax.tax_type === 'PPN_INPUT')
  const pph23Tax = taxRows.find((tax) => tax.tax_type === 'PPH23')
  const ppnAmount = numberValue(ppnTax?.tax_amount)
  const pph23Amount = numberValue(pph23Tax?.tax_amount)
  const dppAmount = money(numberValue(bill.total_amount) - ppnAmount)
  const vendorPayableAmount = money(
    numberValue(bill.total_amount) - pph23Amount,
  )

  await ensureVatPeriodOpen(
    connection,
    String(bill.bill_date).slice(0, 7),
    ppnAmount > 0,
  )

  const payableAccount = await findAccountByCode(
    connection,
    AP_ACCOUNT_CODE,
    'liability',
  )

  const expenseAccount = expenseAccountId
    ? await findAccountById(connection, expenseAccountId, 'expense')
    : await findAccountByCode(
        connection,
        DEFAULT_EXPENSE_ACCOUNT_CODE,
        'expense',
      )

  const vatInputAccount = ppnAmount > 0
    ? await findAccountByCode(
        connection,
        VAT_INPUT_ACCOUNT_CODE,
        'asset',
      )
    : null

  const pph23PayableAccount = pph23Amount > 0
    ? await findAccountByCode(
        connection,
        PPH23_PAYABLE_ACCOUNT_CODE,
        'liability',
      )
    : null

  if (!payableAccount) {
    throw new Error(
      `Akun Utang Usaha dengan kode ${AP_ACCOUNT_CODE} tidak ditemukan.`,
    )
  }

  if (!expenseAccount) {
    throw new Error('Akun beban tidak ditemukan atau tidak aktif.')
  }

  if (ppnAmount > 0 && !vatInputAccount) {
    throw new Error(
      `Akun PPN Masukan dengan kode ${VAT_INPUT_ACCOUNT_CODE} tidak ditemukan. Jalankan migration pajak terlebih dahulu.`,
    )
  }

  if (pph23Amount > 0 && !pph23PayableAccount) {
    throw new Error(
      `Akun Utang PPh 23 dengan kode ${PPH23_PAYABLE_ACCOUNT_CODE} tidak ditemukan. Jalankan migration pajak terlebih dahulu.`,
    )
  }

  const lines = [
    {
      account_id: expenseAccount.id,
      description: `Beban ${bill.bill_number}`,
      debit: dppAmount,
      credit: 0,
    },
  ]

  if (ppnAmount > 0) {
    lines.push({
      account_id: vatInputAccount.id,
      description: `PPN Masukan ${bill.bill_number}`,
      debit: ppnAmount,
      credit: 0,
    })
  }

  lines.push({
    account_id: payableAccount.id,
    description: `Utang vendor ${bill.bill_number}`,
    debit: 0,
    credit: vendorPayableAmount,
  })

  if (pph23Amount > 0) {
    lines.push({
      account_id: pph23PayableAccount.id,
      description: `Utang PPh 23 ${bill.bill_number}`,
      debit: 0,
      credit: pph23Amount,
    })
  }

  const journalId = await postAutomaticJournal(connection, {
    voucher_number: `AP-BIL-${bill.id}`,
    transaction_date: bill.bill_date,
    description: `Penerbitan tagihan ${bill.bill_number} dari ${bill.vendor_name}`,
    source_type: 'bill',
    source_id: bill.id,
    lines,
  })

  let pph23TaxRecordId = null

  if (pph23Tax && pph23Amount > 0) {
    const [taxRecordResult] = await connection.query(
      `
        INSERT INTO tax_records (
          tax_type,
          tax_period,
          amount,
          due_date,
          status,
          notes
        ) VALUES ('PPh 23', ?, ?, NULL, 'unpaid', ?)
      `,
      [
        String(bill.bill_date).slice(0, 7),
        pph23Amount,
        [
          `Dibuat otomatis dari tagihan vendor ${bill.bill_number}.`,
          `Vendor: ${bill.vendor_name}.`,
          `Objek: ${pph23Tax.pph23_object || 'PPh 23'}.`,
          `Tarif efektif: ${numberValue(pph23Tax.tax_rate)}%.`,
        ].join(' '),
      ],
    )

    pph23TaxRecordId = taxRecordResult.insertId
  }

  for (const taxRow of taxRows) {
    await connection.query(
      `
        UPDATE transaction_taxes
        SET
          status = 'posted',
          journal_entry_id = ?,
          tax_record_id = ?
        WHERE id = ?
      `,
      [
        journalId,
        taxRow.tax_type === 'PPH23' ? pph23TaxRecordId : null,
        taxRow.id,
      ],
    )
  }

  return journalId
}

async function generateBillNumber(connection, billDate) {
  const period = String(billDate).slice(0, 7).replace('-', '')

  const [rows] = await connection.query(
    `
      SELECT COUNT(*) + 1 AS sequence_number
      FROM bills
      WHERE DATE_FORMAT(bill_date, '%Y%m') = ?
    `,
    [period],
  )

  return `BIL/${period}/${String(rows[0].sequence_number).padStart(3, '0')}`
}

async function getBillTaxes(executor, billId) {
  const [rows] = await executor.query(
    `
      SELECT
        id,
        tax_type,
        tax_period,
        dpp_amount,
        tax_rate,
        tax_amount,
        is_creditable,
        pph23_object,
        vendor_has_npwp,
        tax_record_id,
        status,
        journal_entry_id
      FROM transaction_taxes
      WHERE source_type = 'bill'
        AND source_id = ?
      ORDER BY id ASC
    `,
    [billId],
  )

  return rows.map((tax) => ({
    ...tax,
    dpp_amount: numberValue(tax.dpp_amount),
    tax_rate: numberValue(tax.tax_rate),
    tax_amount: numberValue(tax.tax_amount),
    is_creditable: Boolean(tax.is_creditable),
    vendor_has_npwp: tax.vendor_has_npwp === null
      ? null
      : Boolean(tax.vendor_has_npwp),
  }))
}

async function getBillDetail(executor, billId) {
  const [billRows] = await executor.query(
    `
      SELECT
        bills.*,
        projects.project_name,
        CASE
          WHEN bills.status IN ('unpaid', 'partial')
            AND bills.due_date IS NOT NULL
            AND bills.due_date < CURDATE()
          THEN 'overdue'
          ELSE bills.status
        END AS display_status
      FROM bills
      LEFT JOIN projects
        ON projects.id = bills.project_id
      WHERE bills.id = ?
      LIMIT 1
    `,
    [billId],
  )

  const bill = billRows[0]

  if (!bill) return null

  const [items] = await executor.query(
    `
      SELECT id, description, quantity, unit_price, line_total
      FROM bill_items
      WHERE bill_id = ?
      ORDER BY id ASC
    `,
    [billId],
  )

  const [payments] = await executor.query(
    `
      SELECT
        bill_payments.*,
        journal_entries.voucher_number AS journal_voucher_number
      FROM bill_payments
      LEFT JOIN journal_entries
        ON journal_entries.id = bill_payments.journal_entry_id
      WHERE bill_payments.bill_id = ?
      ORDER BY bill_payments.payment_date ASC, bill_payments.id ASC
    `,
    [billId],
  )

  const taxes = await getBillTaxes(executor, billId)
  const ppn = taxes.find((tax) => tax.tax_type === 'PPN_INPUT')
  const pph23 = taxes.find((tax) => tax.tax_type === 'PPH23')
  const vendorPayableAmount = money(
    numberValue(bill.total_amount) - numberValue(pph23?.tax_amount),
  )

  return {
    ...bill,
    dpp_amount: items.reduce(
      (total, item) => total + numberValue(item.line_total),
      0,
    ),
    ppn_amount: numberValue(ppn?.tax_amount),
    ppn_rate: numberValue(ppn?.tax_rate),
    pph23_amount: numberValue(pph23?.tax_amount),
    pph23_rate: numberValue(pph23?.tax_rate),
    pph23_object: pph23?.pph23_object || null,
    vendor_has_npwp: pph23?.vendor_has_npwp ?? null,
    total_amount: numberValue(bill.total_amount),
    vendor_payable_amount: vendorPayableAmount,
    paid_amount: numberValue(bill.paid_amount),
    outstanding_amount: Math.max(
      vendorPayableAmount - numberValue(bill.paid_amount),
      0,
    ),
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

function taxAmountSubquery(type) {
  return `
    COALESCE((
      SELECT transaction_taxes.tax_amount
      FROM transaction_taxes
      WHERE transaction_taxes.source_type = 'bill'
        AND transaction_taxes.source_id = bills.id
        AND transaction_taxes.tax_type = '${type}'
      LIMIT 1
    ), 0)
  `
}

router.get('/summary', async (req, res) => {
  try {
    await refreshOverdueBills()

    const pph23Amount = taxAmountSubquery('PPH23')

    const [[summaryRows], [agingRows]] = await Promise.all([
      db.query(`
        SELECT
          COALESCE(SUM(CASE
            WHEN status IN ('unpaid', 'partial', 'overdue')
            THEN GREATEST(total_amount - (${pph23Amount}) - paid_amount, 0)
            ELSE 0
          END), 0) AS total_payable,

          COALESCE(SUM(CASE
            WHEN status = 'overdue'
            THEN GREATEST(total_amount - (${pph23Amount}) - paid_amount, 0)
            ELSE 0
          END), 0) AS total_overdue,

          COALESCE(SUM(paid_amount), 0) AS total_paid,

          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_count,
          SUM(CASE WHEN status IN ('unpaid', 'partial', 'overdue') THEN 1 ELSE 0 END) AS open_count,
          SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_count
        FROM bills
        WHERE status <> 'cancelled'
      `),
      db.query(`
        SELECT
          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), bill_date) BETWEEN 0 AND 30
            THEN GREATEST(total_amount - (${pph23Amount}) - paid_amount, 0)
            ELSE 0
          END), 0) AS days_0_30,

          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), bill_date) BETWEEN 31 AND 60
            THEN GREATEST(total_amount - (${pph23Amount}) - paid_amount, 0)
            ELSE 0
          END), 0) AS days_31_60,

          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), bill_date) BETWEEN 61 AND 90
            THEN GREATEST(total_amount - (${pph23Amount}) - paid_amount, 0)
            ELSE 0
          END), 0) AS days_61_90,

          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), bill_date) > 90
            THEN GREATEST(total_amount - (${pph23Amount}) - paid_amount, 0)
            ELSE 0
          END), 0) AS days_over_90
        FROM bills
        WHERE status IN ('unpaid', 'partial', 'overdue')
      `),
    ])

    res.json({
      success: true,
      message: 'Ringkasan utang berhasil diambil',
      data: {
        total_payable: numberValue(summaryRows[0].total_payable),
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
      message: 'Gagal mengambil ringkasan utang',
    })
  }
})

router.get('/', async (req, res) => {
  try {
    await refreshOverdueBills()

    const keyword = String(req.query.search || '').trim()
    const status = String(req.query.status || '').trim().toLowerCase()
    const whereParts = []
    const params = []

    if (status && status !== 'all') {
      whereParts.push('bills.status = ?')
      params.push(status)
    }

    if (keyword) {
      whereParts.push(`(
        bills.bill_number LIKE ?
        OR bills.vendor_name LIKE ?
        OR COALESCE(projects.project_name, '') LIKE ?
      )`)
      const query = `%${keyword}%`
      params.push(query, query, query)
    }

    const whereClause = whereParts.length
      ? `WHERE ${whereParts.join(' AND ')}`
      : ''

    const ppnAmount = taxAmountSubquery('PPN_INPUT')
    const pph23Amount = taxAmountSubquery('PPH23')

    const [rows] = await db.query(
      `
        SELECT
          bills.*,
          projects.project_name,
          ${ppnAmount} AS ppn_amount,
          ${pph23Amount} AS pph23_amount,
          GREATEST(bills.total_amount - (${pph23Amount}), 0) AS vendor_payable_amount,
          GREATEST(
            bills.total_amount - (${pph23Amount}) - bills.paid_amount,
            0
          ) AS outstanding_amount,
          CASE
            WHEN bills.status IN ('unpaid', 'partial')
              AND bills.due_date IS NOT NULL
              AND bills.due_date < CURDATE()
              AND bills.paid_amount < bills.total_amount - (${pph23Amount})
            THEN 'overdue'
            ELSE bills.status
          END AS display_status
        FROM bills
        LEFT JOIN projects
          ON projects.id = bills.project_id
        ${whereClause}
        ORDER BY
          FIELD(bills.status, 'overdue', 'partial', 'unpaid', 'draft', 'paid', 'cancelled'),
          bills.due_date ASC,
          bills.id DESC
      `,
      params,
    )

    res.json({
      success: true,
      message: 'Daftar tagihan berhasil diambil',
      data: rows.map((bill) => ({
        ...bill,
        ppn_amount: numberValue(bill.ppn_amount),
        pph23_amount: numberValue(bill.pph23_amount),
        dpp_amount: money(
          numberValue(bill.total_amount) - numberValue(bill.ppn_amount),
        ),
        total_amount: numberValue(bill.total_amount),
        vendor_payable_amount: numberValue(bill.vendor_payable_amount),
        paid_amount: numberValue(bill.paid_amount),
        outstanding_amount: numberValue(bill.outstanding_amount),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar tagihan',
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    await refreshOverdueBills()

    const bill = await getBillDetail(db, req.params.id)

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Tagihan tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      message: 'Detail tagihan berhasil diambil',
      data: bill,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail tagihan',
    })
  }
})

router.post('/', async (req, res) => {
  let connection

  try {
    const {
      vendor_name,
      project_id,
      bill_number,
      bill_date,
      due_date,
      notes,
      items,
      tax,
    } = req.body || {}

    const vendorName = String(vendor_name || '').trim()
    const projectId = project_id ? Number(project_id) : null
    const billDate = bill_date || getToday()
    const dueDate = due_date || null

    if (!vendorName) {
      return res.status(400).json({
        success: false,
        message: 'Nama vendor wajib diisi.',
      })
    }

    if (!isValidDate(billDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal tagihan tidak valid.',
      })
    }

    if (dueDate && (!isValidDate(dueDate) || dueDate < billDate)) {
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
    const taxes = normalizeBillTaxes(tax, dppAmount)
    const totalAmount = money(dppAmount + taxes.ppn.amount)
    const taxPeriod = String(billDate).slice(0, 7)

    connection = await db.getConnection()
    await connection.beginTransaction()

    await ensureVatPeriodOpen(connection, taxPeriod, taxes.ppn.enabled)

    if (projectId) {
      const [projectRows] = await connection.query(
        'SELECT id FROM projects WHERE id = ? LIMIT 1',
        [projectId],
      )

      if (!projectRows[0]) {
        throw new Error('Proyek tidak ditemukan.')
      }
    }

    const billNumber = String(bill_number || '').trim() ||
      await generateBillNumber(connection, billDate)

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
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 'draft', ?)
      `,
      [
        vendorName,
        projectId,
        billNumber,
        billDate,
        dueDate,
        totalAmount,
        String(notes || '').trim() || null,
      ],
    )

    const billId = billResult.insertId
    const placeholders = normalizedItems.map(() => '(?, ?, ?, ?, ?)').join(', ')
    const itemValues = normalizedItems.flatMap((item) => [
      billId,
      item.description,
      item.quantity,
      item.unit_price,
      item.line_total,
    ])

    await connection.query(
      `
        INSERT INTO bill_items (
          bill_id,
          description,
          quantity,
          unit_price,
          line_total
        ) VALUES ${placeholders}
      `,
      itemValues,
    )

    if (taxes.ppn.enabled) {
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
          ) VALUES ('bill', ?, 'PPN_INPUT', ?, ?, ?, ?, 1, 'draft')
        `,
        [
          billId,
          taxPeriod,
          dppAmount,
          taxes.ppn.rate,
          taxes.ppn.amount,
        ],
      )
    }

    if (taxes.pph23.enabled) {
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
            pph23_object,
            vendor_has_npwp,
            status
          ) VALUES ('bill', ?, 'PPH23', ?, ?, ?, ?, 0, ?, ?, 'draft')
        `,
        [
          billId,
          taxPeriod,
          dppAmount,
          taxes.pph23.effective_rate,
          taxes.pph23.amount,
          taxes.pph23.object,
          taxes.pph23.vendor_has_npwp ? 1 : 0,
        ],
      )
    }

    await connection.commit()

    const bill = await getBillDetail(db, billId)

    res.status(201).json({
      success: true,
      message: 'Tagihan draft berhasil dibuat. Terbitkan untuk mencatat beban, utang vendor, PPN Masukan, dan/atau PPh 23.',
      data: bill,
    })
  } catch (error) {
    if (connection) await connection.rollback()

    const statusCode = error.code === 'ER_DUP_ENTRY' ? 409 : 400

    res.status(statusCode).json({
      success: false,
      message: safePublicMessage(error, 'Gagal membuat tagihan.'),
    })
  } finally {
    if (connection) connection.release()
  }
})


router.put('/:id', async (req, res) => {
  let connection
  try {
    const { vendor_name, project_id, bill_number, bill_date, due_date, notes, items, tax } = req.body || {}
    const vendorName = String(vendor_name || '').trim()
    const projectId = project_id ? Number(project_id) : null
    const billDate = bill_date || getToday()
    const dueDate = due_date || null
    if (!vendorName) throw new Error('Nama vendor wajib diisi.')
    if (!isValidDate(billDate)) throw new Error('Tanggal tagihan tidak valid.')
    if (dueDate && (!isValidDate(dueDate) || dueDate < billDate)) throw new Error('Tanggal jatuh tempo tidak valid.')
    const normalizedItems = normalizeItems(items)
    const dppAmount = money(normalizedItems.reduce((total, item) => total + item.line_total, 0))
    const taxes = normalizeBillTaxes(tax, dppAmount)
    const totalAmount = money(dppAmount + taxes.ppn.amount)
    const taxPeriod = String(billDate).slice(0, 7)
    connection = await db.getConnection()
    await connection.beginTransaction()
    const [existingRows] = await connection.query('SELECT id, status FROM bills WHERE id = ? FOR UPDATE', [req.params.id])
    const existing = existingRows[0]
    if (!existing) throw new Error('Tagihan tidak ditemukan.')
    if (existing.status !== 'draft') throw new Error('Hanya tagihan draft yang dapat diubah.')
    await ensureVatPeriodOpen(connection, taxPeriod, taxes.ppn.enabled)
    if (projectId) {
      const [projects] = await connection.query('SELECT id FROM projects WHERE id = ? LIMIT 1', [projectId])
      if (!projects[0]) throw new Error('Proyek tidak ditemukan.')
    }
    const number = String(bill_number || '').trim()
    if (!number) throw new Error('Nomor tagihan wajib diisi.')
    await connection.query(
      `UPDATE bills SET vendor_name = ?, project_id = ?, bill_number = ?, bill_date = ?, due_date = ?, total_amount = ?, paid_amount = 0, notes = ? WHERE id = ?`,
      [vendorName, projectId, number, billDate, dueDate, totalAmount, String(notes || '').trim() || null, existing.id],
    )
    await connection.query('DELETE FROM bill_items WHERE bill_id = ?', [existing.id])
    await connection.query("DELETE FROM transaction_taxes WHERE source_type = 'bill' AND source_id = ?", [existing.id])
    const itemPlaceholders = normalizedItems.map(() => '(?, ?, ?, ?, ?)').join(', ')
    await connection.query(
      `INSERT INTO bill_items (bill_id, description, quantity, unit_price, line_total) VALUES ${itemPlaceholders}`,
      normalizedItems.flatMap((item) => [existing.id, item.description, item.quantity, item.unit_price, item.line_total]),
    )
    if (taxes.ppn.enabled) {
      await connection.query(`INSERT INTO transaction_taxes (source_type, source_id, tax_type, tax_period, dpp_amount, tax_rate, tax_amount, is_creditable, status) VALUES ('bill', ?, 'PPN_INPUT', ?, ?, ?, ?, 1, 'draft')`, [existing.id, taxPeriod, dppAmount, taxes.ppn.rate, taxes.ppn.amount])
    }
    if (taxes.pph23.enabled) {
      await connection.query(`INSERT INTO transaction_taxes (source_type, source_id, tax_type, tax_period, dpp_amount, tax_rate, tax_amount, is_creditable, pph23_object, vendor_has_npwp, status) VALUES ('bill', ?, 'PPH23', ?, ?, ?, ?, 0, ?, ?, 'draft')`, [existing.id, taxPeriod, dppAmount, taxes.pph23.effective_rate, taxes.pph23.amount, taxes.pph23.object, taxes.pph23.vendor_has_npwp ? 1 : 0])
    }
    await connection.commit()
    const bill = await getBillDetail(db, existing.id)
    res.json({ success: true, message: 'Tagihan draft berhasil diperbarui.', data: bill })
  } catch (error) {
    if (connection) await connection.rollback()
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 400).json({ success: false, message: safePublicMessage(error, 'Gagal memperbarui tagihan.') })
  } finally { if (connection) connection.release() }
})

async function reverseBillJournal(connection, billId, cancellationDate, reason) {
  const [voidRows] = await connection.query("SELECT id FROM journal_entries WHERE source_type = 'bill_void' AND source_id = ? LIMIT 1", [billId])
  if (voidRows[0]) return
  const [journalRows] = await connection.query("SELECT id, voucher_number FROM journal_entries WHERE source_type = 'bill' AND source_id = ? AND status = 'posted' LIMIT 1", [billId])
  const journal = journalRows[0]
  if (!journal) return
  const [lines] = await connection.query('SELECT account_id, description, debit, credit FROM journal_lines WHERE journal_entry_id = ? ORDER BY id', [journal.id])
  if (!lines.length) throw new Error('Baris jurnal tagihan tidak ditemukan.')
  await postAutomaticJournal(connection, {
    voucher_number: `VOID-${journal.voucher_number}`.slice(0, 100),
    transaction_date: cancellationDate,
    description: `Pembatalan tagihan ${billId}: ${reason || 'dibatalkan'}`,
    source_type: 'bill_void',
    source_id: billId,
    lines: lines.map((line) => ({ account_id: line.account_id, description: `Balik jurnal ${line.description || ''}`.slice(0, 255), debit: numberValue(line.credit), credit: numberValue(line.debit) })),
  })
}

router.post('/:id/cancel', async (req, res) => {
  let connection
  try {
    const cancellationDate = req.body?.cancellation_date || getToday()
    const reason = String(req.body?.reason || '').trim()
    if (!isValidDate(cancellationDate)) throw new Error('Tanggal pembatalan tidak valid.')
    connection = await db.getConnection()
    await connection.beginTransaction()
    const [rows] = await connection.query('SELECT * FROM bills WHERE id = ? FOR UPDATE', [req.params.id])
    const bill = rows[0]
    if (!bill) throw new Error('Tagihan tidak ditemukan.')
    if (bill.status === 'cancelled') throw new Error('Tagihan sudah dibatalkan.')
    if (numberValue(bill.paid_amount) > 0) throw new Error('Tagihan yang sudah memiliki pembayaran tidak dapat dibatalkan. Gunakan koreksi/nota debit agar jejak pembayaran tetap akurat.')
    if (bill.status !== 'draft') await reverseBillJournal(connection, bill.id, cancellationDate, reason)
    await connection.query("UPDATE bills SET status = 'cancelled', notes = CONCAT(COALESCE(notes, ''), ?) WHERE id = ?", [`\n[Dibatalkan ${cancellationDate}] ${reason || '-'}`, bill.id])
    await connection.query("UPDATE transaction_taxes SET status = 'closed' WHERE source_type = 'bill' AND source_id = ?", [bill.id])
    await connection.commit()
    const updated = await getBillDetail(db, bill.id)
    res.json({ success: true, message: 'Tagihan dibatalkan dan jurnal sumber dibalik.', data: updated })
  } catch (error) {
    if (connection) await connection.rollback()
    res.status(400).json({ success: false, message: safePublicMessage(error, 'Gagal membatalkan tagihan.') })
  } finally { if (connection) connection.release() }
})

router.delete('/:id', async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [billRows] = await connection.query(
      'SELECT id, status FROM bills WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const bill = billRows[0]

    if (!bill) {
      throw new Error('Tagihan tidak ditemukan.')
    }

    if (bill.status !== 'draft') {
      throw new Error('Hanya tagihan draft yang dapat dihapus.')
    }

    await connection.query(
      `
        DELETE FROM transaction_taxes
        WHERE source_type = 'bill'
          AND source_id = ?
      `,
      [bill.id],
    )

    await connection.query('DELETE FROM bills WHERE id = ?', [bill.id])
    await connection.commit()

    res.json({
      success: true,
      message: 'Tagihan draft berhasil dihapus.',
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: safePublicMessage(error, 'Gagal menghapus tagihan.'),
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

    const [billRows] = await connection.query(
      'SELECT * FROM bills WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const bill = billRows[0]

    if (!bill) {
      throw new Error('Tagihan tidak ditemukan.')
    }

    if (bill.status !== 'draft') {
      throw new Error('Hanya tagihan draft yang dapat diterbitkan.')
    }

    const [existingJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'bill'
          AND source_id = ?
        LIMIT 1
      `,
      [bill.id],
    )

    if (existingJournalRows[0]) {
      throw new Error('Jurnal tagihan sudah pernah dibuat.')
    }

    const [taxRows] = await connection.query(
      `
        SELECT *
        FROM transaction_taxes
        WHERE source_type = 'bill'
          AND source_id = ?
        FOR UPDATE
      `,
      [bill.id],
    )

    const ppnTax = taxRows.find((tax) => tax.tax_type === 'PPN_INPUT')
    const pph23Tax = taxRows.find((tax) => tax.tax_type === 'PPH23')
    const ppnAmount = numberValue(ppnTax?.tax_amount)
    const pph23Amount = numberValue(pph23Tax?.tax_amount)
    const dppAmount = money(numberValue(bill.total_amount) - ppnAmount)
    const vendorPayableAmount = money(
      numberValue(bill.total_amount) - pph23Amount,
    )

    await ensureVatPeriodOpen(
      connection,
      String(bill.bill_date).slice(0, 7),
      ppnAmount > 0,
    )

    const payableAccount = await findAccountByCode(
      connection,
      AP_ACCOUNT_CODE,
      'liability',
    )

    const expenseAccountId = req.body?.expense_account_id
    const expenseAccount = expenseAccountId
      ? await findAccountById(connection, expenseAccountId, 'expense')
      : await findAccountByCode(
          connection,
          DEFAULT_EXPENSE_ACCOUNT_CODE,
          'expense',
        )

    const vatInputAccount = ppnAmount > 0
      ? await findAccountByCode(
          connection,
          VAT_INPUT_ACCOUNT_CODE,
          'asset',
        )
      : null

    const pph23PayableAccount = pph23Amount > 0
      ? await findAccountByCode(
          connection,
          PPH23_PAYABLE_ACCOUNT_CODE,
          'liability',
        )
      : null

    if (!payableAccount) {
      throw new Error(
        `Akun Utang Usaha dengan kode ${AP_ACCOUNT_CODE} tidak ditemukan.`,
      )
    }

    if (!expenseAccount) {
      throw new Error('Akun beban tidak ditemukan atau tidak aktif.')
    }

    if (ppnAmount > 0 && !vatInputAccount) {
      throw new Error(
        `Akun PPN Masukan dengan kode ${VAT_INPUT_ACCOUNT_CODE} tidak ditemukan. Jalankan migration pajak terlebih dahulu.`,
      )
    }

    if (pph23Amount > 0 && !pph23PayableAccount) {
      throw new Error(
        `Akun Utang PPh 23 dengan kode ${PPH23_PAYABLE_ACCOUNT_CODE} tidak ditemukan. Jalankan migration pajak terlebih dahulu.`,
      )
    }

    const lines = [
      {
        account_id: expenseAccount.id,
        description: `Beban ${bill.bill_number}`,
        debit: dppAmount,
        credit: 0,
      },
    ]

    if (ppnAmount > 0) {
      lines.push({
        account_id: vatInputAccount.id,
        description: `PPN Masukan ${bill.bill_number}`,
        debit: ppnAmount,
        credit: 0,
      })
    }

    lines.push({
      account_id: payableAccount.id,
      description: `Utang vendor ${bill.bill_number}`,
      debit: 0,
      credit: vendorPayableAmount,
    })

    if (pph23Amount > 0) {
      lines.push({
        account_id: pph23PayableAccount.id,
        description: `Utang PPh 23 ${bill.bill_number}`,
        debit: 0,
        credit: pph23Amount,
      })
    }

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `AP-BIL-${bill.id}`,
      transaction_date: bill.bill_date,
      description: `Penerbitan tagihan ${bill.bill_number} dari ${bill.vendor_name}`,
      source_type: 'bill',
      source_id: bill.id,
      lines,
    })

    let pph23TaxRecordId = null

    if (pph23Tax && pph23Amount > 0) {
      const [taxRecordResult] = await connection.query(
        `
          INSERT INTO tax_records (
            tax_type,
            tax_period,
            amount,
            due_date,
            status,
            notes
          ) VALUES ('PPh 23', ?, ?, NULL, 'unpaid', ?)
        `,
        [
          String(bill.bill_date).slice(0, 7),
          pph23Amount,
          [
            `Dibuat otomatis dari tagihan vendor ${bill.bill_number}.`,
            `Vendor: ${bill.vendor_name}.`,
            `Objek: ${pph23Tax.pph23_object || 'PPh 23'}.`,
            `Tarif efektif: ${numberValue(pph23Tax.tax_rate)}%.`,
          ].join(' '),
        ],
      )

      pph23TaxRecordId = taxRecordResult.insertId
    }

    for (const taxRow of taxRows) {
      await connection.query(
        `
          UPDATE transaction_taxes
          SET
            status = 'posted',
            journal_entry_id = ?,
            tax_record_id = ?
          WHERE id = ?
        `,
        [
          journalId,
          taxRow.tax_type === 'PPH23' ? pph23TaxRecordId : null,
          taxRow.id,
        ],
      )
    }

    const nextStatus =
      bill.due_date && bill.due_date < getToday()
        ? 'overdue'
        : 'unpaid'

    await connection.query(
      'UPDATE bills SET status = ? WHERE id = ?',
      [nextStatus, bill.id],
    )

    await connection.commit()

    const updatedBill = await getBillDetail(db, bill.id)

    res.json({
      success: true,
      message: pph23Amount > 0
        ? 'Tagihan diterbitkan. Beban, utang vendor, dan kewajiban PPh 23 otomatis diposting.'
        : (
          ppnAmount > 0
            ? 'Tagihan diterbitkan. Beban, utang vendor, dan PPN Masukan otomatis diposting.'
            : 'Tagihan berhasil diterbitkan dan jurnal utang otomatis diposting.'
        ),
      data: {
        bill: updatedBill,
        journal_entry_id: journalId,
        pph23_tax_record_id: pph23TaxRecordId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: safePublicMessage(error, 'Gagal menerbitkan tagihan.'),
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

    const [billRows] = await connection.query(
      'SELECT * FROM bills WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const bill = billRows[0]

    if (!bill) {
      throw new Error('Tagihan tidak ditemukan.')
    }

    if (bill.status === 'draft') {
      throw new Error(
        'Terbitkan tagihan terlebih dahulu sebelum mencatat pembayaran.',
      )
    }

    if (bill.status === 'cancelled' || bill.status === 'paid') {
      throw new Error('Tagihan ini tidak dapat menerima pembayaran lagi.')
    }

    if (paymentDate < bill.bill_date) {
      throw new Error(
        'Tanggal pembayaran tidak boleh sebelum tanggal tagihan.',
      )
    }

    const [pph23Rows] = await connection.query(
      `
        SELECT tax_amount
        FROM transaction_taxes
        WHERE source_type = 'bill'
          AND source_id = ?
          AND tax_type = 'PPH23'
        LIMIT 1
      `,
      [bill.id],
    )

    const pph23Amount = numberValue(pph23Rows[0]?.tax_amount)
    const vendorPayableAmount = money(
      numberValue(bill.total_amount) - pph23Amount,
    )
    const outstanding = Math.max(
      vendorPayableAmount - numberValue(bill.paid_amount),
      0,
    )

    if (paymentAmount > outstanding) {
      throw new Error(
        'Nominal pembayaran melebihi sisa utang vendor setelah potongan PPh 23.',
      )
    }

    const [billJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'bill'
          AND source_id = ?
          AND status = 'posted'
        LIMIT 1
      `,
      [bill.id],
    )

    if (!billJournalRows[0]) {
      await ensureBillIssueJournal(connection, bill)
    }

    const payableAccount = await findAccountByCode(
      connection,
      AP_ACCOUNT_CODE,
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
      throw new Error(
        `Akun Utang Usaha dengan kode ${AP_ACCOUNT_CODE} tidak ditemukan.`,
      )
    }

    if (!cashAccount || Number(cashAccount.id) === Number(payableAccount.id)) {
      throw new Error(
        'Pilih akun Kas atau Bank yang valid untuk pembayaran.',
      )
    }

    const [paymentResult] = await connection.query(
      `
        INSERT INTO bill_payments (
          bill_id,
          payment_date,
          payment_method,
          amount,
          reference_number,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        bill.id,
        paymentDate,
        String(payment_method || '').trim() || null,
        paymentAmount,
        String(reference_number || '').trim() || null,
        String(notes || '').trim() || null,
      ],
    )

    const paymentId = paymentResult.insertId

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `AP-PAY-${bill.id}-${paymentId}`,
      transaction_date: paymentDate,
      description: `Pembayaran tagihan ${bill.bill_number} ke ${bill.vendor_name}`,
      source_type: 'bill_payment',
      source_id: paymentId,
      lines: [
        {
          account_id: payableAccount.id,
          description: `Pelunasan utang ${bill.bill_number}`,
          debit: paymentAmount,
          credit: 0,
        },
        {
          account_id: cashAccount.id,
          description: `Pembayaran ${bill.bill_number}`,
          debit: 0,
          credit: paymentAmount,
        },
      ],
    })

    await connection.query(
      'UPDATE bill_payments SET journal_entry_id = ? WHERE id = ?',
      [journalId, paymentId],
    )

    const newPaidAmount = money(numberValue(bill.paid_amount) + paymentAmount)
    const newOutstanding = money(vendorPayableAmount - newPaidAmount)
    const newStatus =
      newOutstanding <= 0
        ? 'paid'
        : (
          bill.due_date && bill.due_date < paymentDate
            ? 'overdue'
            : 'partial'
        )

    await connection.query(
      `
        UPDATE bills
        SET
          paid_amount = ?,
          status = ?
        WHERE id = ?
      `,
      [newPaidAmount, newStatus, bill.id],
    )

    await connection.commit()

    const updatedBill = await getBillDetail(db, bill.id)

    res.json({
      success: true,
      message: 'Pembayaran vendor berhasil dicatat. PPh 23, bila ada, tetap muncul sebagai kewajiban setor pajak.',
      data: {
        bill: updatedBill,
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: safePublicMessage(error, 'Gagal mencatat pembayaran tagihan.'),
    })
  } finally {
    if (connection) connection.release()
  }
})

// Diekspos terbatas untuk pengujian otomatis tanpa koneksi database.
router.getOutstandingForTest = getOutstanding
router.normalizeBillTaxesForTest = normalizeBillTaxes

module.exports = router
