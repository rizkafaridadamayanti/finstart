const express = require('express')
const db = require('../config/db')

const router = express.Router()

const TAX_PAYABLE_ACCOUNT_CODE = '2200'
const DEFAULT_TAX_EXPENSE_ACCOUNT_CODE = '5100'
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

function normalizeTaxType(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
}

async function refreshOverdueTaxes(executor = db) {
  await executor.query(`
    UPDATE tax_records
    SET status = 'overdue'
    WHERE status = 'unpaid'
      AND due_date IS NOT NULL
      AND due_date < CURDATE()
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

async function getTaxDetail(executor, taxId) {
  const [rows] = await executor.query(
    `
      SELECT
        tax_records.*,
        CASE
          WHEN tax_records.status = 'unpaid'
            AND tax_records.due_date IS NOT NULL
            AND tax_records.due_date < CURDATE()
          THEN 'overdue'
          ELSE tax_records.status
        END AS display_status,

        obligation_journal.voucher_number AS obligation_voucher_number,
        payment_journal.voucher_number AS payment_voucher_number
      FROM tax_records
      LEFT JOIN journal_entries AS obligation_journal
        ON obligation_journal.source_type = 'tax_record'
        AND obligation_journal.source_id = tax_records.id
      LEFT JOIN journal_entries AS payment_journal
        ON payment_journal.source_type = 'tax_payment'
        AND payment_journal.source_id = tax_records.id
      WHERE tax_records.id = ?
      LIMIT 1
    `,
    [taxId],
  )

  if (!rows[0]) return null

  return {
    ...rows[0],
    amount: numberValue(rows[0].amount),
  }
}

/*
  GET /api/taxes/summary
  Menampilkan total kewajiban pajak aktif, rincian PPN/PPh,
  serta status kepatuhan.
*/
router.get('/summary', async (req, res) => {
  try {
    await refreshOverdueTaxes()

    const [rows] = await db.query(`
      SELECT
        COALESCE(SUM(CASE
          WHEN status IN ('unpaid', 'overdue')
          THEN amount
          ELSE 0
        END), 0) AS total_unpaid,

        COALESCE(SUM(CASE
          WHEN LOWER(REPLACE(tax_type, ' ', '')) = 'ppn'
            AND status IN ('unpaid', 'overdue')
          THEN amount
          ELSE 0
        END), 0) AS ppn_due,

        COALESCE(SUM(CASE
          WHEN LOWER(REPLACE(tax_type, ' ', '')) = 'pph21'
            AND status IN ('unpaid', 'overdue')
          THEN amount
          ELSE 0
        END), 0) AS pph21_due,

        COALESCE(SUM(CASE
          WHEN LOWER(REPLACE(tax_type, ' ', '')) = 'pph23'
            AND status IN ('unpaid', 'overdue')
          THEN amount
          ELSE 0
        END), 0) AS pph23_due,

        COALESCE(SUM(CASE
          WHEN status = 'paid'
          THEN amount
          ELSE 0
        END), 0) AS total_paid,

        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_count,
        SUM(CASE WHEN status IN ('unpaid', 'overdue') THEN 1 ELSE 0 END) AS unpaid_count,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_count
      FROM tax_records
    `)

    const result = rows[0]

    res.json({
      success: true,
      message: 'Ringkasan pajak berhasil diambil',
      data: {
        total_unpaid: numberValue(result.total_unpaid),
        ppn_due: numberValue(result.ppn_due),
        pph21_due: numberValue(result.pph21_due),
        pph23_due: numberValue(result.pph23_due),
        total_paid: numberValue(result.total_paid),
        draft_count: Number(result.draft_count || 0),
        unpaid_count: Number(result.unpaid_count || 0),
        overdue_count: Number(result.overdue_count || 0),
        compliance_status:
          Number(result.overdue_count || 0) === 0
            ? 'Patuh'
            : 'Perlu Tindakan',
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan pajak',
      error: error.message,
    })
  }
})

/*
  GET /api/taxes?search=&status=&period=
*/
router.get('/', async (req, res) => {
  try {
    await refreshOverdueTaxes()

    const search = String(req.query.search || '').trim()
    const status = String(req.query.status || '').trim().toLowerCase()
    const period = String(req.query.period || '').trim()

    const whereParts = []
    const params = []

    if (status && status !== 'all') {
      whereParts.push('tax_records.status = ?')
      params.push(status)
    }

    if (period) {
      whereParts.push('tax_records.tax_period = ?')
      params.push(period)
    }

    if (search) {
      whereParts.push(`(
        tax_records.tax_type LIKE ?
        OR COALESCE(tax_records.tax_period, '') LIKE ?
        OR COALESCE(tax_records.tax_number, '') LIKE ?
        OR COALESCE(tax_records.notes, '') LIKE ?
      )`)
      const keyword = `%${search}%`
      params.push(keyword, keyword, keyword, keyword)
    }

    const whereClause = whereParts.length
      ? `WHERE ${whereParts.join(' AND ')}`
      : ''

    const [rows] = await db.query(
      `
        SELECT
          tax_records.*,
          CASE
            WHEN tax_records.status = 'unpaid'
              AND tax_records.due_date IS NOT NULL
              AND tax_records.due_date < CURDATE()
            THEN 'overdue'
            ELSE tax_records.status
          END AS display_status,

          obligation_journal.voucher_number AS obligation_voucher_number,
          payment_journal.voucher_number AS payment_voucher_number
        FROM tax_records
        LEFT JOIN journal_entries AS obligation_journal
          ON obligation_journal.source_type = 'tax_record'
          AND obligation_journal.source_id = tax_records.id
        LEFT JOIN journal_entries AS payment_journal
          ON payment_journal.source_type = 'tax_payment'
          AND payment_journal.source_id = tax_records.id
        ${whereClause}
        ORDER BY
          FIELD(tax_records.status, 'overdue', 'unpaid', 'draft', 'paid'),
          tax_records.due_date ASC,
          tax_records.id DESC
      `,
      params,
    )

    res.json({
      success: true,
      message: 'Daftar pajak berhasil diambil',
      data: rows.map((record) => ({
        ...record,
        amount: numberValue(record.amount),
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar pajak',
      error: error.message,
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    await refreshOverdueTaxes()

    const record = await getTaxDetail(db, req.params.id)

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Kewajiban pajak tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      message: 'Detail pajak berhasil diambil',
      data: record,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail pajak',
      error: error.message,
    })
  }
})

/*
  POST /api/taxes
  Membuat draft kewajiban pajak. Draft belum membuat jurnal.
*/
router.post('/', async (req, res) => {
  try {
    const {
      tax_type,
      tax_period,
      tax_number,
      amount,
      due_date,
      notes,
    } = req.body || {}

    const taxType = normalizeTaxType(tax_type)
    const taxPeriod = String(tax_period || '').trim()
    const taxNumber = String(tax_number || '').trim() || null
    const taxAmount = numberValue(amount)
    const dueDate = due_date || null
    const note = String(notes || '').trim() || null

    if (!taxType) {
      return res.status(400).json({
        success: false,
        message: 'Jenis pajak wajib dipilih.',
      })
    }

    if (!taxPeriod) {
      return res.status(400).json({
        success: false,
        message: 'Periode pajak wajib diisi.',
      })
    }

    if (taxAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal pajak harus lebih dari Rp0.',
      })
    }

    if (dueDate && !isValidDate(dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal jatuh tempo tidak valid.',
      })
    }

    const [result] = await db.query(
      `
        INSERT INTO tax_records (
          tax_type,
          tax_period,
          tax_number,
          amount,
          due_date,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, 'draft', ?)
      `,
      [
        taxType,
        taxPeriod,
        taxNumber,
        taxAmount,
        dueDate,
        note,
      ],
    )

    const record = await getTaxDetail(db, result.insertId)

    res.status(201).json({
      success: true,
      message: 'Draft kewajiban pajak berhasil dibuat.',
      data: record,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal membuat draft pajak',
      error: error.message,
    })
  }
})

/*
  DELETE /api/taxes/:id
  Hanya draft yang boleh dihapus.
*/
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, status FROM tax_records WHERE id = ? LIMIT 1',
      [req.params.id],
    )

    const record = rows[0]

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Kewajiban pajak tidak ditemukan.',
      })
    }

    if (record.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Hanya draft pajak yang dapat dihapus.',
      })
    }

    await db.query('DELETE FROM tax_records WHERE id = ?', [record.id])

    res.json({
      success: true,
      message: 'Draft pajak berhasil dihapus.',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus draft pajak',
      error: error.message,
    })
  }
})

/*
  POST /api/taxes/:id/issue
  Mencatat kewajiban pajak ke jurnal:
  Debit akun beban yang dipilih
  Kredit 2200 - Utang Pajak
*/
router.post('/:id/issue', async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [rows] = await connection.query(
      'SELECT * FROM tax_records WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const record = rows[0]

    if (!record) {
      throw new Error('Kewajiban pajak tidak ditemukan.')
    }

    if (record.status !== 'draft') {
      throw new Error('Hanya draft pajak yang dapat diterbitkan.')
    }

    const [existingJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'tax_record'
          AND source_id = ?
        LIMIT 1
      `,
      [record.id],
    )

    if (existingJournalRows[0]) {
      throw new Error('Jurnal kewajiban pajak sudah pernah dibuat.')
    }

    const payableAccount = await findAccountByCode(
      connection,
      TAX_PAYABLE_ACCOUNT_CODE,
      'liability',
    )

    const expenseAccountId = req.body?.expense_account_id
    const expenseAccount = expenseAccountId
      ? await findAccountById(connection, expenseAccountId, 'expense')
      : await findAccountByCode(
          connection,
          DEFAULT_TAX_EXPENSE_ACCOUNT_CODE,
          'expense',
        )

    if (!payableAccount) {
      throw new Error(
        `Akun Utang Pajak dengan kode ${TAX_PAYABLE_ACCOUNT_CODE} tidak ditemukan.`,
      )
    }

    if (!expenseAccount) {
      throw new Error(
        'Pilih akun beban aktif untuk mencatat kewajiban pajak.',
      )
    }

    const issueDate = record.due_date || getToday()
    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `TAX-OBL-${record.id}`,
      transaction_date: issueDate,
      description: `Kewajiban ${record.tax_type} periode ${record.tax_period}`,
      source_type: 'tax_record',
      source_id: record.id,
      lines: [
        {
          account_id: expenseAccount.id,
          description: `Beban ${record.tax_type}`,
          debit: numberValue(record.amount),
          credit: 0,
        },
        {
          account_id: payableAccount.id,
          description: `Utang ${record.tax_type}`,
          debit: 0,
          credit: numberValue(record.amount),
        },
      ],
    })

    const nextStatus =
      record.due_date && record.due_date < getToday()
        ? 'overdue'
        : 'unpaid'

    await connection.query(
      `
        UPDATE tax_records
        SET status = ?
        WHERE id = ?
      `,
      [nextStatus, record.id],
    )

    await connection.commit()

    const updatedRecord = await getTaxDetail(db, record.id)

    res.json({
      success: true,
      message: 'Kewajiban pajak berhasil diterbitkan dan jurnal otomatis diposting.',
      data: {
        tax_record: updatedRecord,
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal menerbitkan kewajiban pajak.',
    })
  } finally {
    if (connection) connection.release()
  }
})

/*
  POST /api/taxes/:id/pay
  Menyetor pajak penuh:
  Debit 2200 - Utang Pajak
  Kredit Kas / Bank
*/
router.post('/:id/pay', async (req, res) => {
  let connection

  try {
    const {
      payment_date,
      tax_number,
      cash_account_id,
      notes,
    } = req.body || {}

    const paymentDate = payment_date || getToday()

    if (!isValidDate(paymentDate)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal setoran pajak tidak valid.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [rows] = await connection.query(
      'SELECT * FROM tax_records WHERE id = ? FOR UPDATE',
      [req.params.id],
    )

    const record = rows[0]

    if (!record) {
      throw new Error('Kewajiban pajak tidak ditemukan.')
    }

    if (record.status === 'draft') {
      throw new Error('Terbitkan kewajiban pajak terlebih dahulu.')
    }

    if (record.status === 'paid') {
      throw new Error('Kewajiban pajak ini sudah disetor.')
    }

    const [obligationJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'tax_record'
          AND source_id = ?
          AND status = 'posted'
        LIMIT 1
      `,
      [record.id],
    )

    if (!obligationJournalRows[0]) {
      throw new Error('Jurnal kewajiban pajak belum diposting.')
    }

    const [paymentJournalRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'tax_payment'
          AND source_id = ?
        LIMIT 1
      `,
      [record.id],
    )

    if (paymentJournalRows[0]) {
      throw new Error('Jurnal setoran pajak sudah pernah dibuat.')
    }

    const payableAccount = await findAccountByCode(
      connection,
      TAX_PAYABLE_ACCOUNT_CODE,
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
        `Akun Utang Pajak dengan kode ${TAX_PAYABLE_ACCOUNT_CODE} tidak ditemukan.`,
      )
    }

    if (!cashAccount || Number(cashAccount.id) === Number(payableAccount.id)) {
      throw new Error('Pilih akun Kas atau Bank yang valid.')
    }

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `TAX-PAY-${record.id}`,
      transaction_date: paymentDate,
      description: `Setoran ${record.tax_type} periode ${record.tax_period}`,
      source_type: 'tax_payment',
      source_id: record.id,
      lines: [
        {
          account_id: payableAccount.id,
          description: `Pelunasan utang ${record.tax_type}`,
          debit: numberValue(record.amount),
          credit: 0,
        },
        {
          account_id: cashAccount.id,
          description: `Setoran ${record.tax_type}`,
          debit: 0,
          credit: numberValue(record.amount),
        },
      ],
    })

    await connection.query(
      `
        UPDATE tax_records
        SET
          status = 'paid',
          payment_date = ?,
          tax_number = COALESCE(NULLIF(?, ''), tax_number),
          notes = COALESCE(NULLIF(?, ''), notes)
        WHERE id = ?
      `,
      [
        paymentDate,
        String(tax_number || '').trim(),
        String(notes || '').trim(),
        record.id,
      ],
    )

    await connection.commit()

    const updatedRecord = await getTaxDetail(db, record.id)

    res.json({
      success: true,
      message: 'Setoran pajak berhasil dikonfirmasi dan jurnal otomatis diposting.',
      data: {
        tax_record: updatedRecord,
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengonfirmasi setoran pajak.',
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
