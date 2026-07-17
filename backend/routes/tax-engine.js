const express = require('express')
const db = require('../config/db')
const { safePublicMessage } = require('../utils/api-errors')
const { currentPeriodInJakarta, isValidDate, isValidPeriod, todayInJakarta } = require('../utils/date-validation')

const router = express.Router()

const VAT_INPUT_ACCOUNT_CODE = '1145'
const VAT_CREDIT_ACCOUNT_CODE = '1146'
const TAX_PAYABLE_ACCOUNT_CODE = '2200'
const VAT_OUTPUT_ACCOUNT_CODE = '2210'
const PPH23_PAYABLE_ACCOUNT_CODE = '2211'
const DEFAULT_BANK_ACCOUNT_CODE = '1120'

function numberValue(value) {
  return Number(value || 0)
}

function money(value) {
  return Math.round((numberValue(value) + Number.EPSILON) * 100) / 100
}

function getToday() {
  return todayInJakarta()
}

function getDefaultPeriod() {
  return currentPeriodInJakarta()
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

async function getVatSummary(executor, period) {
  const [rows] = await executor.query(
    `
      SELECT
        COALESCE(SUM(CASE
          WHEN tax_type = 'PPN_OUTPUT'
            AND status IN ('posted', 'closed')
          THEN tax_amount
          ELSE 0
        END), 0) AS output_vat,

        COALESCE(SUM(CASE
          WHEN tax_type = 'PPN_INPUT'
            AND status IN ('posted', 'closed')
            AND is_creditable = 1
          THEN tax_amount
          ELSE 0
        END), 0) AS input_vat,

        SUM(CASE
          WHEN tax_type = 'PPN_OUTPUT'
            AND status IN ('posted', 'closed')
          THEN 1
          ELSE 0
        END) AS output_count,

        SUM(CASE
          WHEN tax_type = 'PPN_INPUT'
            AND status IN ('posted', 'closed')
            AND is_creditable = 1
          THEN 1
          ELSE 0
        END) AS input_count
      FROM transaction_taxes
      WHERE tax_period = ?
    `,
    [period],
  )

  const row = rows[0]
  const outputVat = numberValue(row.output_vat)
  const inputVat = numberValue(row.input_vat)
  const netVat = money(outputVat - inputVat)

  const [closingRows] = await executor.query(
    `
      SELECT *
      FROM vat_period_closings
      WHERE tax_period = ?
      LIMIT 1
    `,
    [period],
  )

  const closing = closingRows[0] || null

  return {
    period,
    output_vat: outputVat,
    input_vat: inputVat,
    net_vat: netVat,
    position: netVat > 0
      ? 'payable'
      : (netVat < 0 ? 'credit' : 'zero'),
    output_count: Number(row.output_count || 0),
    input_count: Number(row.input_count || 0),
    closing: closing
      ? {
        ...closing,
        output_vat: numberValue(closing.output_vat),
        input_vat: numberValue(closing.input_vat),
        net_vat: numberValue(closing.net_vat),
      }
      : null,
  }
}

/*
  GET /api/tax-engine/vat?period=YYYY-MM
*/
router.get('/vat', async (req, res) => {
  try {
    const period = isValidPeriod(req.query.period)
      ? req.query.period
      : getDefaultPeriod()

    const data = await getVatSummary(db, period)

    res.json({
      success: true,
      message: 'Ringkasan PPN Masa berhasil diambil.',
      data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan PPN Masa.',
    })
  }
})

/*
  POST /api/tax-engine/vat/close
  Menutup Masa PPN berdasarkan PPN Keluaran - PPN Masukan.

  Jika kurang bayar:
  Debit PPN Keluaran
  Kredit PPN Masukan
  Kredit Utang Pajak

  Jika lebih bayar:
  Debit PPN Keluaran
  Debit PPN Lebih Bayar
  Kredit PPN Masukan
*/
router.post('/vat/close', async (req, res) => {
  let connection

  try {
    const {
      period,
      due_date,
      notes,
    } = req.body || {}

    if (!isValidPeriod(period)) {
      return res.status(400).json({
        success: false,
        message: 'Periode PPN harus berformat YYYY-MM.',
      })
    }

    if (due_date && !isValidDate(due_date)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal jatuh tempo PPN tidak valid.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [existingRows] = await connection.query(
      `
        SELECT id
        FROM vat_period_closings
        WHERE tax_period = ?
        FOR UPDATE
      `,
      [period],
    )

    if (existingRows[0]) {
      throw new Error(
        'Masa PPN ini sudah ditutup. Pembukaan kembali harus dilakukan melalui jurnal koreksi.',
      )
    }

    const vatSummary = await getVatSummary(connection, period)

    if (vatSummary.output_vat <= 0 && vatSummary.input_vat <= 0) {
      throw new Error(
        'Belum ada PPN Keluaran atau PPN Masukan posted pada masa ini.',
      )
    }

    const status = vatSummary.net_vat > 0
      ? 'payable'
      : 'credit'

    const [closingResult] = await connection.query(
      `
        INSERT INTO vat_period_closings (
          tax_period,
          output_vat,
          input_vat,
          net_vat,
          due_date,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        period,
        vatSummary.output_vat,
        vatSummary.input_vat,
        vatSummary.net_vat,
        due_date || null,
        status,
        String(notes || '').trim() || null,
      ],
    )

    const closingId = closingResult.insertId

    const vatOutputAccount = await findAccountByCode(
      connection,
      VAT_OUTPUT_ACCOUNT_CODE,
      'liability',
    )

    const vatInputAccount = await findAccountByCode(
      connection,
      VAT_INPUT_ACCOUNT_CODE,
      'asset',
    )

    const taxPayableAccount = vatSummary.net_vat > 0
      ? await findAccountByCode(
          connection,
          TAX_PAYABLE_ACCOUNT_CODE,
          'liability',
        )
      : null

    const vatCreditAccount = vatSummary.net_vat < 0
      ? await findAccountByCode(
          connection,
          VAT_CREDIT_ACCOUNT_CODE,
          'asset',
        )
      : null

    if (!vatOutputAccount || !vatInputAccount) {
      throw new Error(
        'Akun PPN Keluaran atau PPN Masukan tidak ditemukan. Jalankan migration pajak terlebih dahulu.',
      )
    }

    if (vatSummary.net_vat > 0 && !taxPayableAccount) {
      throw new Error(
        `Akun Utang Pajak dengan kode ${TAX_PAYABLE_ACCOUNT_CODE} tidak ditemukan.`,
      )
    }

    if (vatSummary.net_vat < 0 && !vatCreditAccount) {
      throw new Error(
        `Akun PPN Lebih Bayar dengan kode ${VAT_CREDIT_ACCOUNT_CODE} tidak ditemukan.`,
      )
    }

    const lines = []

    if (vatSummary.output_vat > 0) {
      lines.push({
        account_id: vatOutputAccount.id,
        description: `Penutupan PPN Keluaran masa ${period}`,
        debit: vatSummary.output_vat,
        credit: 0,
      })
    }

    if (vatSummary.net_vat < 0) {
      lines.push({
        account_id: vatCreditAccount.id,
        description: `PPN Lebih Bayar masa ${period}`,
        debit: Math.abs(vatSummary.net_vat),
        credit: 0,
      })
    }

    if (vatSummary.input_vat > 0) {
      lines.push({
        account_id: vatInputAccount.id,
        description: `Kredit PPN Masukan masa ${period}`,
        debit: 0,
        credit: vatSummary.input_vat,
      })
    }

    if (vatSummary.net_vat > 0) {
      lines.push({
        account_id: taxPayableAccount.id,
        description: `Utang PPN masa ${period}`,
        debit: 0,
        credit: vatSummary.net_vat,
      })
    }

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `VAT-CLOSE-${period.replace('-', '')}`,
      transaction_date: getToday(),
      description: `Penutupan PPN Masa ${period}`,
      source_type: 'vat_closing',
      source_id: closingId,
      lines,
    })

    let taxRecordId = null

    if (vatSummary.net_vat > 0) {
      const [taxRecordResult] = await connection.query(
        `
          INSERT INTO tax_records (
            tax_type,
            tax_period,
            amount,
            due_date,
            status,
            notes
          ) VALUES ('PPN', ?, ?, ?, 'unpaid', ?)
        `,
        [
          period,
          vatSummary.net_vat,
          due_date || null,
          [
            `Dibuat otomatis dari penutupan PPN Masa ${period}.`,
            `PPN Keluaran ${vatSummary.output_vat}.`,
            `PPN Masukan ${vatSummary.input_vat}.`,
            String(notes || '').trim(),
          ].filter(Boolean).join(' '),
        ],
      )

      taxRecordId = taxRecordResult.insertId
    }

    await connection.query(
      `
        UPDATE vat_period_closings
        SET
          tax_record_id = ?,
          closing_journal_id = ?
        WHERE id = ?
      `,
      [taxRecordId, journalId, closingId],
    )

    await connection.query(
      `
        UPDATE transaction_taxes
        SET status = 'closed'
        WHERE tax_period = ?
          AND tax_type IN ('PPN_OUTPUT', 'PPN_INPUT')
          AND status = 'posted'
      `,
      [period],
    )

    await connection.commit()

    const data = await getVatSummary(db, period)

    res.json({
      success: true,
      message: vatSummary.net_vat > 0
        ? 'Masa PPN ditutup. PPN Kurang Bayar telah menjadi kewajiban setor.'
        : (
          vatSummary.net_vat < 0
            ? 'Masa PPN ditutup. Sistem mencatat PPN Lebih Bayar.'
            : 'Masa PPN ditutup dengan posisi nihil.'
        ),
      data,
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: safePublicMessage(error, 'Gagal menutup Masa PPN.'),
    })
  } finally {
    if (connection) connection.release()
  }
})

/*
  POST /api/tax-engine/tax-record/:id/pay

  Dipakai hanya untuk PPN hasil penutupan masa dan PPh 23 otomatis dari bill.
*/
router.post('/tax-record/:id/pay', async (req, res) => {
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

    if (!String(tax_number || '').trim()) {
      return res.status(400).json({
        success: false,
        message: 'NTPN atau nomor bukti setoran wajib diisi.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [taxRows] = await connection.query(
      `
        SELECT *
        FROM tax_records
        WHERE id = ?
        FOR UPDATE
      `,
      [req.params.id],
    )

    const taxRecord = taxRows[0]

    if (!taxRecord) {
      throw new Error('Kewajiban pajak tidak ditemukan.')
    }

    if (taxRecord.status === 'draft') {
      throw new Error('Kewajiban pajak ini belum diposting.')
    }

    if (taxRecord.status === 'paid') {
      throw new Error('Kewajiban pajak ini sudah disetor.')
    }

    const [vatRows] = await connection.query(
      `
        SELECT id, closing_journal_id
        FROM vat_period_closings
        WHERE tax_record_id = ?
        LIMIT 1
      `,
      [taxRecord.id],
    )

    const [pph23Rows] = await connection.query(
      `
        SELECT id, journal_entry_id
        FROM transaction_taxes
        WHERE tax_record_id = ?
          AND tax_type = 'PPH23'
          AND status = 'posted'
        LIMIT 1
      `,
      [taxRecord.id],
    )

    const vatClosing = vatRows[0]
    const pph23Tax = pph23Rows[0]

    if (!vatClosing && !pph23Tax) {
      throw new Error(
        'Endpoint ini hanya digunakan untuk PPN hasil penutupan Masa atau PPh 23 otomatis dari tagihan vendor.',
      )
    }

    const settlementAccount = vatClosing
      ? await findAccountByCode(
          connection,
          TAX_PAYABLE_ACCOUNT_CODE,
          'liability',
        )
      : await findAccountByCode(
          connection,
          PPH23_PAYABLE_ACCOUNT_CODE,
          'liability',
        )

    const cashAccount = cash_account_id
      ? await findAccountById(connection, cash_account_id, 'asset')
      : await findAccountByCode(
          connection,
          DEFAULT_BANK_ACCOUNT_CODE,
          'asset',
        )

    if (!settlementAccount) {
      throw new Error('Akun kewajiban pajak tidak ditemukan.')
    }

    if (!cashAccount || Number(cashAccount.id) === Number(settlementAccount.id)) {
      throw new Error('Pilih akun Kas atau Bank yang valid.')
    }

    const [existingPaymentRows] = await connection.query(
      `
        SELECT id
        FROM journal_entries
        WHERE source_type = 'tax_payment'
          AND source_id = ?
        LIMIT 1
      `,
      [taxRecord.id],
    )

    if (existingPaymentRows[0]) {
      throw new Error('Jurnal setoran pajak sudah pernah dibuat.')
    }

    const journalId = await postAutomaticJournal(connection, {
      voucher_number: `TAX-PAY-${taxRecord.id}`,
      transaction_date: paymentDate,
      description: `Setoran ${taxRecord.tax_type} periode ${taxRecord.tax_period || '-'}`,
      source_type: 'tax_payment',
      source_id: taxRecord.id,
      lines: [
        {
          account_id: settlementAccount.id,
          description: `Pelunasan ${taxRecord.tax_type}`,
          debit: numberValue(taxRecord.amount),
          credit: 0,
        },
        {
          account_id: cashAccount.id,
          description: `Setoran ${taxRecord.tax_type}`,
          debit: 0,
          credit: numberValue(taxRecord.amount),
        },
      ],
    })

    await connection.query(
      `
        UPDATE tax_records
        SET
          status = 'paid',
          payment_date = ?,
          tax_number = ?,
          notes = COALESCE(NULLIF(?, ''), notes)
        WHERE id = ?
      `,
      [
        paymentDate,
        String(tax_number).trim(),
        String(notes || '').trim(),
        taxRecord.id,
      ],
    )

    if (vatClosing) {
      await connection.query(
        `
          UPDATE vat_period_closings
          SET status = 'paid'
          WHERE id = ?
        `,
        [vatClosing.id],
      )
    }

    await connection.commit()

    res.json({
      success: true,
      message: 'Setoran pajak berhasil dicatat dan jurnal otomatis diposting.',
      data: {
        tax_record_id: Number(taxRecord.id),
        journal_entry_id: journalId,
      },
    })
  } catch (error) {
    if (connection) await connection.rollback()

    res.status(400).json({
      success: false,
      message: safePublicMessage(error, 'Gagal mencatat setoran pajak.'),
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
