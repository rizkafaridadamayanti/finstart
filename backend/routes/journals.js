const express = require('express')
const db = require('../config/db')
const { requirePermission, hasPermission } = require('../middleware/authorization')

const router = express.Router()

function cleanText(value) {
  if (typeof value !== 'string') return null

  const text = value.trim()
  return text === '' ? null : text
}

function createAppError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function isValidDate(value) {
  if (!value) return false

  const dateText = String(value)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return false
  }

  const date = new Date(`${dateText}T00:00:00Z`)

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateText
  )
}

function optionalPositiveInteger(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null
  }

  const number = Number.parseInt(value, 10)

  if (!Number.isInteger(number) || number <= 0) {
    return null
  }

  return number
}


async function addColumnIfMissing(executor, tableName, columnName, definition) {
  const [columns] = await executor.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName],
  )
  if (columns.length === 0) {
    await executor.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`)
  }
}

async function ensureJournalDimensionSchema(executor = db) {
  await addColumnIfMissing(executor, 'journal_entries', 'division_id', 'BIGINT UNSIGNED NULL')
}

async function validateDivision(executor, divisionId) {
  if (!divisionId) return null
  const [rows] = await executor.query(
    `SELECT id, name, status FROM divisions WHERE id = ?`,
    [divisionId],
  )
  if (!rows[0] || rows[0].status !== 'active') {
    throw createAppError(422, 'Divisi jurnal tidak ditemukan atau tidak aktif.')
  }
  return rows[0]
}

function validateLines(rawLines) {
  if (!Array.isArray(rawLines) || rawLines.length < 2) {
    throw createAppError(
      422,
      'Jurnal minimal harus memiliki dua baris akun.',
    )
  }

  const lines = rawLines.map((line, index) => {
    const accountId = Number.parseInt(line.account_id, 10)
    const debit = Number(line.debit || 0)
    const credit = Number(line.credit || 0)

    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw createAppError(
        422,
        `Akun pada baris ke-${index + 1} wajib dipilih.`,
      )
    }

    if (
      !Number.isFinite(debit) ||
      !Number.isFinite(credit) ||
      debit < 0 ||
      credit < 0
    ) {
      throw createAppError(
        422,
        `Nilai debit atau kredit pada baris ke-${index + 1} tidak valid.`,
      )
    }

    if ((debit <= 0 && credit <= 0) || (debit > 0 && credit > 0)) {
      throw createAppError(
        422,
        `Baris ke-${index + 1} harus memiliki debit atau kredit, tidak boleh keduanya.`,
      )
    }

    return {
      account_id: accountId,
      description: cleanText(line.description),
      debit,
      credit,
    }
  })

  const totalDebit = lines.reduce((total, line) => total + line.debit, 0)
  const totalCredit = lines.reduce((total, line) => total + line.credit, 0)

  if (Math.abs(totalDebit - totalCredit) > 0.005) {
    throw createAppError(
      422,
      'Total debit harus sama dengan total kredit.',
    )
  }

  return lines
}

function validateJournalPayload(body) {
  const voucherNumber = cleanText(body.voucher_number)
  const transactionDate = cleanText(body.transaction_date)
  const description = cleanText(body.description)
  const sourceType = cleanText(body.source_type)
  const sourceId = optionalPositiveInteger(body.source_id)
  const divisionId = optionalPositiveInteger(body.division_id)

  if (!voucherNumber) {
    throw createAppError(422, 'Nomor voucher wajib diisi.')
  }

  if (!isValidDate(transactionDate)) {
    throw createAppError(
      422,
      'Tanggal transaksi wajib diisi dengan format YYYY-MM-DD.',
    )
  }

  if (
    body.source_id !== null &&
    body.source_id !== undefined &&
    String(body.source_id).trim() !== '' &&
    sourceId === null
  ) {
    throw createAppError(422, 'Source ID tidak valid.')
  }

  if (
    body.division_id !== null &&
    body.division_id !== undefined &&
    String(body.division_id).trim() !== '' &&
    divisionId === null
  ) {
    throw createAppError(422, 'Divisi jurnal tidak valid.')
  }

  const lines = validateLines(body.lines)

  return {
    voucherNumber,
    transactionDate,
    description,
    sourceType,
    sourceId,
    divisionId,
    lines,
  }
}

async function getJournalDetail(executor, journalId) {
  const [journals] = await executor.query(
    `
      SELECT
        journal_entries.*,
        creator.name AS created_by_name,
        approver.name AS approved_by_name,
        divisions.name AS division_name
      FROM journal_entries
      LEFT JOIN users AS creator ON creator.id = journal_entries.created_by
      LEFT JOIN users AS approver ON approver.id = journal_entries.approved_by
      LEFT JOIN divisions ON divisions.id = journal_entries.division_id
      WHERE journal_entries.id = ?
    `,
    [journalId],
  )

  if (journals.length === 0) {
    return null
  }

  const [lines] = await executor.query(
    `
      SELECT
        journal_lines.id,
        journal_lines.journal_entry_id,
        journal_lines.account_id,
        accounts.code AS account_code,
        accounts.name AS account_name,
        accounts.type AS account_type,
        journal_lines.description,
        journal_lines.debit,
        journal_lines.credit,
        journal_lines.created_at,
        journal_lines.updated_at
      FROM journal_lines
      INNER JOIN accounts ON accounts.id = journal_lines.account_id
      WHERE journal_lines.journal_entry_id = ?
      ORDER BY journal_lines.id ASC
    `,
    [journalId],
  )

  const totalDebit = lines.reduce(
    (total, line) => total + Number(line.debit || 0),
    0,
  )

  const totalCredit = lines.reduce(
    (total, line) => total + Number(line.credit || 0),
    0,
  )

  return {
    ...journals[0],
    total_debit: totalDebit,
    total_credit: totalCredit,
    lines,
  }
}

async function validateAccounts(executor, lines, lockRows = false) {
  const accountIds = [...new Set(lines.map((line) => line.account_id))]

  const [accounts] = await executor.query(
    `
      SELECT id, code, name, normal_balance, status
      FROM accounts
      WHERE id IN (?)
      ${lockRows ? 'FOR UPDATE' : ''}
    `,
    [accountIds],
  )

  if (accounts.length !== accountIds.length) {
    throw createAppError(
      422,
      'Salah satu akun jurnal tidak ditemukan.',
    )
  }

  const inactiveAccount = accounts.find(
    (account) => account.status !== 'active',
  )

  if (inactiveAccount) {
    throw createAppError(
      422,
      `Akun ${inactiveAccount.code} - ${inactiveAccount.name} sedang tidak aktif.`,
    )
  }

  return accounts
}

async function insertJournalLines(executor, journalId, lines) {
  const placeholders = lines
    .map(() => '(?, ?, ?, ?, ?)')
    .join(', ')

  const values = lines.flatMap((line) => [
    journalId,
    line.account_id,
    line.description,
    line.debit,
    line.credit,
  ])

  await executor.query(
    `
      INSERT INTO journal_lines (
        journal_entry_id,
        account_id,
        description,
        debit,
        credit
      )
      VALUES ${placeholders}
    `,
    values,
  )
}

/*
  GET /api/journals
*/
router.get('/', async (req, res) => {
  try {
    await ensureJournalDimensionSchema()
    const [journals] = await db.query(`
      SELECT
        journal_entries.id,
        journal_entries.voucher_number,
        journal_entries.transaction_date,
        journal_entries.description,
        journal_entries.source_type,
        journal_entries.source_id,
        journal_entries.status,
        journal_entries.created_by,
        journal_entries.approved_by,
        journal_entries.approved_at,
        journal_entries.posted_at,
        journal_entries.created_at,
        journal_entries.updated_at,
        journal_entries.division_id,
        divisions.name AS division_name,
        creator.name AS created_by_name,
        creator.email AS created_by_email,
        approver.name AS approved_by_name,
        approver.email AS approved_by_email,
        COALESCE(SUM(journal_lines.debit), 0) AS total_debit,
        COALESCE(SUM(journal_lines.credit), 0) AS total_credit
      FROM journal_entries
      LEFT JOIN users creator ON creator.id = journal_entries.created_by
      LEFT JOIN users approver ON approver.id = journal_entries.approved_by
      LEFT JOIN divisions ON divisions.id = journal_entries.division_id
      LEFT JOIN journal_lines
        ON journal_lines.journal_entry_id = journal_entries.id
      GROUP BY journal_entries.id, divisions.name, creator.name, creator.email, approver.name, approver.email
      ORDER BY journal_entries.transaction_date DESC, journal_entries.id DESC
    `)

    res.json({
      success: true,
      message: 'Data jurnal berhasil diambil',
      data: journals,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jurnal',
      error: error.message,
    })
  }
})

/*
  GET /api/journals/:id
*/
router.get('/:id', async (req, res) => {
  try {
    await ensureJournalDimensionSchema()
    const journal = await getJournalDetail(db, req.params.id)

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Jurnal tidak ditemukan',
      })
    }

    res.json({
      success: true,
      message: 'Detail jurnal berhasil diambil',
      data: journal,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail jurnal',
      error: error.message,
    })
  }
})

/*
  POST /api/journals
  Membuat jurnal berstatus draft.
*/
router.post('/', async (req, res) => {
  let connection

  try {
    const payload = validateJournalPayload(req.body)

    connection = await db.getConnection()
    await connection.beginTransaction()

    await ensureJournalDimensionSchema(connection)
    await validateAccounts(connection, payload.lines)
    await validateDivision(connection, payload.divisionId)

    const [result] = await connection.query(
      `
        INSERT INTO journal_entries (
          voucher_number,
          transaction_date,
          description,
          source_type,
          source_id,
          division_id,
          status,
          created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)
      `,
      [
        payload.voucherNumber,
        payload.transactionDate,
        payload.description,
        payload.sourceType,
        payload.sourceId,
        payload.divisionId,
        req.user.id,
      ],
    )

    await insertJournalLines(connection, result.insertId, payload.lines)

    const journal = await getJournalDetail(connection, result.insertId)

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Jurnal draft berhasil dibuat',
      data: journal,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(error.status || 500).json({
      success: false,
      message:
        error.code === 'ER_DUP_ENTRY'
          ? 'Nomor voucher sudah digunakan.'
          : error.message || 'Gagal membuat jurnal',
      error: error.status ? undefined : error.message,
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

/*
  PUT /api/journals/:id
  Hanya jurnal draft yang boleh diubah.
*/
router.put('/:id', async (req, res) => {
  let connection

  try {
    const payload = validateJournalPayload(req.body)
    const journalId = Number.parseInt(req.params.id, 10)

    if (!Number.isInteger(journalId) || journalId <= 0) {
      throw createAppError(422, 'ID jurnal tidak valid.')
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    await ensureJournalDimensionSchema(connection)
    const [existingJournals] = await connection.query(
      'SELECT id, status, created_by FROM journal_entries WHERE id = ? FOR UPDATE',
      [journalId],
    )

    if (existingJournals.length === 0) {
      throw createAppError(404, 'Jurnal tidak ditemukan.')
    }

    if (existingJournals[0].status !== 'draft') {
      throw createAppError(
        422,
        'Hanya jurnal berstatus draft yang boleh diubah.',
      )
    }

    await validateAccounts(connection, payload.lines)
    await validateDivision(connection, payload.divisionId)

    await connection.query(
      `
        UPDATE journal_entries
        SET
          voucher_number = ?,
          transaction_date = ?,
          description = ?,
          source_type = ?,
          source_id = ?,
          division_id = ?
        WHERE id = ?
      `,
      [
        payload.voucherNumber,
        payload.transactionDate,
        payload.description,
        payload.sourceType,
        payload.sourceId,
        payload.divisionId,
        journalId,
      ],
    )

    await connection.query(
      'DELETE FROM journal_lines WHERE journal_entry_id = ?',
      [journalId],
    )

    await insertJournalLines(connection, journalId, payload.lines)

    const journal = await getJournalDetail(connection, journalId)

    await connection.commit()

    res.json({
      success: true,
      message: 'Jurnal draft berhasil diperbarui',
      data: journal,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(error.status || 500).json({
      success: false,
      message:
        error.code === 'ER_DUP_ENTRY'
          ? 'Nomor voucher sudah digunakan.'
          : error.message || 'Gagal memperbarui jurnal',
      error: error.status ? undefined : error.message,
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

/*
  POST /api/journals/:id/approve
  Mengubah draft menjadi approved.
*/
router.post('/:id/approve', requirePermission('journals', 'approve'), async (req, res) => {
  let connection

  try {
    const journalId = Number.parseInt(req.params.id, 10)
    const approvedBy = req.user?.id

    if (!Number.isInteger(journalId) || journalId <= 0) {
      throw createAppError(422, 'ID jurnal tidak valid.')
    }

    if (!Number.isInteger(approvedBy) || approvedBy <= 0) {
      throw createAppError(401, 'User approval tidak valid. Silakan login ulang.')
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [journals] = await connection.query(
      'SELECT id, status, created_by FROM journal_entries WHERE id = ? FOR UPDATE',
      [journalId],
    )

    if (journals.length === 0) {
      throw createAppError(404, 'Jurnal tidak ditemukan.')
    }

    if (
      Number(journals[0].created_by) !== Number(req.user?.id) &&
      !hasPermission(req.user?.role_name, 'journals', 'approve')
    ) {
      throw createAppError(403, 'Hanya pembuat jurnal atau penyetuju berwenang yang dapat mengubah draft ini.')
    }

    if (journals[0].status !== 'draft') {
      throw createAppError(
        422,
        'Hanya jurnal draft yang dapat disetujui.',
      )
    }

    if (Number(journals[0].created_by) === Number(approvedBy)) {
      throw createAppError(
        403,
        'Pembuat jurnal tidak boleh menyetujui jurnalnya sendiri.',
      )
    }

    const [lines] = await connection.query(
      `
        SELECT account_id, debit, credit
        FROM journal_lines
        WHERE journal_entry_id = ?
      `,
      [journalId],
    )

    validateLines(lines)
    await validateAccounts(connection, lines)

    await connection.query(
      `
        UPDATE journal_entries
        SET
          status = 'approved',
          approved_by = ?,
          approved_at = NOW()
        WHERE id = ?
      `,
      [approvedBy, journalId],
    )

    const journal = await getJournalDetail(connection, journalId)

    await connection.commit()

    res.json({
      success: true,
      message: 'Jurnal berhasil disetujui',
      data: journal,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal menyetujui jurnal',
      error: error.status ? undefined : error.message,
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

/*
  POST /api/journals/:id/post
  Mengubah approved menjadi posted dan memperbarui saldo akun.
*/
router.post('/:id/post', requirePermission('journals', 'post'), async (req, res) => {
  let connection

  try {
    const journalId = Number.parseInt(req.params.id, 10)

    if (!Number.isInteger(journalId) || journalId <= 0) {
      throw createAppError(422, 'ID jurnal tidak valid.')
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [journals] = await connection.query(
      'SELECT id, status FROM journal_entries WHERE id = ? FOR UPDATE',
      [journalId],
    )

    if (journals.length === 0) {
      throw createAppError(404, 'Jurnal tidak ditemukan.')
    }

    if (journals[0].status !== 'approved') {
      throw createAppError(
        422,
        'Jurnal hanya dapat diposting setelah berstatus approved.',
      )
    }

    const [lines] = await connection.query(
      `
        SELECT account_id, debit, credit
        FROM journal_lines
        WHERE journal_entry_id = ?
      `,
      [journalId],
    )

    validateLines(lines)

    const accounts = await validateAccounts(connection, lines, true)

    const accountMap = new Map(
      accounts.map((account) => [account.id, account]),
    )

    for (const line of lines) {
      const account = accountMap.get(line.account_id)
      const debit = Number(line.debit || 0)
      const credit = Number(line.credit || 0)

      const balanceChange =
        account.normal_balance === 'debit'
          ? debit - credit
          : credit - debit

      await connection.query(
        `
          UPDATE accounts
          SET current_balance = current_balance + ?
          WHERE id = ?
        `,
        [balanceChange, account.id],
      )
    }

    await connection.query(
      `
        UPDATE journal_entries
        SET
          status = 'posted',
          posted_at = NOW()
        WHERE id = ?
      `,
      [journalId],
    )

    const journal = await getJournalDetail(connection, journalId)

    await connection.commit()

    res.json({
      success: true,
      message: 'Jurnal berhasil diposting dan saldo akun diperbarui',
      data: journal,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal memposting jurnal',
      error: error.status ? undefined : error.message,
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

/*
  DELETE /api/journals/:id
  Hanya jurnal draft yang boleh dihapus.
*/
router.delete('/:id', async (req, res) => {
  let connection

  try {
    const journalId = Number.parseInt(req.params.id, 10)

    if (!Number.isInteger(journalId) || journalId <= 0) {
      throw createAppError(422, 'ID jurnal tidak valid.')
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [journals] = await connection.query(
      'SELECT id, status FROM journal_entries WHERE id = ? FOR UPDATE',
      [journalId],
    )

    if (journals.length === 0) {
      throw createAppError(404, 'Jurnal tidak ditemukan.')
    }

    if (journals[0].status !== 'draft') {
      throw createAppError(
        422,
        'Hanya jurnal draft yang boleh dihapus.',
      )
    }

    await connection.query(
      'DELETE FROM journal_entries WHERE id = ?',
      [journalId],
    )

    await connection.commit()

    res.json({
      success: true,
      message: 'Jurnal draft berhasil dihapus',
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal menghapus jurnal',
      error: error.status ? undefined : error.message,
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// Diekspos terbatas untuk pengujian otomatis tanpa koneksi database.
router.validateLinesForTest = validateLines

module.exports = router
