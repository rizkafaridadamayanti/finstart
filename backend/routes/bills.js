const express = require('express')
const db = require('../config/db')

const router = express.Router()

const AP_ACCOUNT_CODE = '2100'
const DEFAULT_EXPENSE_ACCOUNT_CODE = '5100'
const DEFAULT_BANK_ACCOUNT_CODE = '1120'

function numberValue(value) {
  return Number(value || 0)
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getOutstanding(bill) {
  return Math.max(
    numberValue(bill.total_amount) - numberValue(bill.paid_amount),
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

    const lineTotal = quantity * unitPrice

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

async function refreshOverdueBills(executor = db) {
  await executor.query(`
    UPDATE bills
    SET status = 'overdue'
    WHERE status IN ('unpaid', 'partial')
      AND due_date IS NOT NULL
      AND due_date < CURDATE()
      AND paid_amount < total_amount
  `)
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
  const debitTotal = payload.lines.reduce(
    (total, line) => total + numberValue(line.debit),
    0,
  )

  const creditTotal = payload.lines.reduce(
    (total, line) => total + numberValue(line.credit),
    0,
  )

  if (payload.lines.length < 2 || debitTotal <= 0 || debitTotal !== creditTotal) {
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
    numberValue(line.debit),
    numberValue(line.credit),
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
        ? numberValue(line.debit) - numberValue(line.credit)
        : numberValue(line.credit) - numberValue(line.debit)

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

async function getBillDetail(executor, billId) {
  const [billRows] = await executor.query(
    `
      SELECT
        bills.*,
        projects.project_name,
        GREATEST(bills.total_amount - bills.paid_amount, 0) AS outstanding_amount,
        CASE
          WHEN bills.status IN ('unpaid', 'partial')
            AND bills.due_date IS NOT NULL
            AND bills.due_date < CURDATE()
            AND bills.paid_amount < bills.total_amount
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

  return {
    ...bill,
    total_amount: numberValue(bill.total_amount),
    paid_amount: numberValue(bill.paid_amount),
    outstanding_amount: numberValue(bill.outstanding_amount),
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

/*
  GET /api/bills/summary
  Ringkasan Utang Usaha dan aging tagihan vendor.
*/
router.get('/summary', async (req, res) => {
  try {
    await refreshOverdueBills()

    const [[summaryRows], [agingRows]] = await Promise.all([
      db.query(`
        SELECT
          COALESCE(SUM(CASE
            WHEN status IN ('unpaid', 'partial', 'overdue')
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS total_payable,

          COALESCE(SUM(CASE
            WHEN status = 'overdue'
            THEN total_amount - paid_amount
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
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS days_0_30,

          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), bill_date) BETWEEN 31 AND 60
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS days_31_60,

          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), bill_date) BETWEEN 61 AND 90
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS days_61_90,

          COALESCE(SUM(CASE
            WHEN DATEDIFF(CURDATE(), bill_date) > 90
            THEN total_amount - paid_amount
            ELSE 0
          END), 0) AS days_over_90
        FROM bills
        WHERE status IN ('unpaid', 'partial', 'overdue')
          AND paid_amount < total_amount
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
      error: error.message,
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

    const [rows] = await db.query(
      `
        SELECT
          bills.*,
          projects.project_name,
          GREATEST(bills.total_amount - bills.paid_amount, 0) AS outstanding_amount,
          CASE
            WHEN bills.status IN ('unpaid', 'partial')
              AND bills.due_date IS NOT NULL
              AND bills.due_date < CURDATE()
              AND bills.paid_amount < bills.total_amount
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
        total_amount: numberValue(bill.total_amount),
        paid_amount: numberValue(bill.paid_amount),
        outstanding_amount: numberValue(bill.outstanding_amount),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar tagihan',
      error: error.message,
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
        message: 'Tagihan tidak ditemukan',
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
      error: error.message,
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
    const totalAmount = normalizedItems.reduce(
      (total, item) => total + item.line_total,
      0,
    )

    connection = await db.getConnection()
    await connection.beginTransaction()

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

    await connection.commit()

    const bill = await getBillDetail(db, billId)

    res.status(201).json({
      success: true,
      message: 'Tagihan draft berhasil dibuat. Terbitkan tagihan untuk mencatat utang dan beban.',
      data: bill,
    })
  } catch (error) {
    if (connection) await connection.rollback()

    const statusCode = error.code === 'ER_DUP_ENTRY' ? 409 : 400

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Gagal membuat tagihan',
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
      message: error.message || 'Gagal menghapus tagihan',
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

    const payableAccount = await findAccountByCode(
      connection,
      AP_ACCOUNT_CODE,
      'liability',
    )

    // Tombol Terbitkan dari Vue boleh tidak mengirim body.
    const expenseAccountId = req.body?.expense_account_id

    const expenseAccount = expenseAccountId
      ? await findAccountById(connection, expenseAccountId, 'expense')
      : await findAccountByCode(
          connection,
          DEFAULT_EXPENSE_ACCOUNT_CODE,
          'expense',
        )

    if (!payableAccount) {
      throw new Error(`Akun Utang Usaha dengan kode ${AP_ACCOUNT_CODE} tidak ditemukan.`)
    }

    if (!expenseAccount) {
      throw new Error('Akun beban tidak ditemukan atau tidak aktif.')
    }

    const totalAmount = numberValue(bill.total_amount)

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `AP-BIL-${bill.id}`,
      transaction_date: bill.bill_date,
      description: `Penerbitan tagihan ${bill.bill_number} dari ${bill.vendor_name}`,
      source_type: 'bill',
      source_id: bill.id,
      lines: [
        {
          account_id: expenseAccount.id,
          description: `Beban ${bill.bill_number}`,
          debit: totalAmount,
          credit: 0,
        },
        {
          account_id: payableAccount.id,
          description: `Utang ${bill.bill_number}`,
          debit: 0,
          credit: totalAmount,
        },
      ],
    })

    const nextStatus =
      bill.due_date && bill.due_date < getToday() ? 'overdue' : 'unpaid'

    await connection.query(
      'UPDATE bills SET status = ? WHERE id = ?',
      [nextStatus, bill.id],
    )

    await connection.commit()

    const updatedBill = await getBillDetail(db, bill.id)

    res.json({
      success: true,
      message: 'Tagihan berhasil diterbitkan dan jurnal utang otomatis diposting.',
      data: {
        bill: updatedBill,
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menerbitkan tagihan',
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
    const paymentAmount = numberValue(amount)

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
      throw new Error('Terbitkan tagihan terlebih dahulu sebelum mencatat pembayaran.')
    }

    if (bill.status === 'cancelled' || bill.status === 'paid') {
      throw new Error('Tagihan ini tidak dapat menerima pembayaran lagi.')
    }

    if (paymentDate < bill.bill_date) {
      throw new Error('Tanggal pembayaran tidak boleh sebelum tanggal tagihan.')
    }

    const outstanding = getOutstanding(bill)

    if (paymentAmount > outstanding) {
      throw new Error('Nominal pembayaran melebihi sisa utang.')
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
      throw new Error('Jurnal tagihan belum diposting.')
    }

    const payableAccount = await findAccountByCode(
      connection,
      AP_ACCOUNT_CODE,
      'liability',
    )

    const cashAccount = cash_account_id
      ? await findAccountById(connection, cash_account_id, 'asset')
      : await findAccountByCode(connection, DEFAULT_BANK_ACCOUNT_CODE, 'asset')

    if (!payableAccount) {
      throw new Error(`Akun Utang Usaha dengan kode ${AP_ACCOUNT_CODE} tidak ditemukan.`)
    }

    if (!cashAccount || Number(cashAccount.id) === Number(payableAccount.id)) {
      throw new Error('Pilih akun Kas atau Bank yang valid untuk pembayaran.')
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

    const newPaidAmount = numberValue(bill.paid_amount) + paymentAmount
    const isPaid =
      Math.abs(newPaidAmount - numberValue(bill.total_amount)) < 0.005

    await connection.query(
      `
        UPDATE bill_payments
        SET journal_entry_id = ?
        WHERE id = ?
      `,
      [journalId, paymentId],
    )

    await connection.query(
      `
        UPDATE bills
        SET paid_amount = ?, status = ?
        WHERE id = ?
      `,
      [newPaidAmount, isPaid ? 'paid' : 'partial', bill.id],
    )

    await connection.commit()

    const updatedBill = await getBillDetail(db, bill.id)

    res.status(201).json({
      success: true,
      message: 'Pembayaran utang berhasil dicatat dan jurnal otomatis diposting.',
      data: {
        bill: updatedBill,
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mencatat pembayaran tagihan',
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
