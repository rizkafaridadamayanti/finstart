const express = require('express')
const db = require('../config/db')

const router = express.Router()

function cleanText(value, maxLength = 120) {
  const text = String(value || '').trim()
  return text ? text.slice(0, maxLength) : ''
}

function isValidDate(value) {
  const dateText = String(value || '')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return false
  }

  const date = new Date(`${dateText}T00:00:00Z`)

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateText
  )
}

/*
  GET /api/journal-transactions?search=...&date=YYYY-MM-DD

  Menampilkan satu baris untuk setiap voucher jurnal.
  Kolom alokasi berisi kode akun debit dan kredit agar pengguna
  dapat membaca asal transaksi tanpa membuka detail terlebih dahulu.
*/
router.get('/', async (req, res) => {
  const search = cleanText(req.query.search, 100)
  const transactionDate = cleanText(req.query.date, 10)

  if (transactionDate && !isValidDate(transactionDate)) {
    return res.status(400).json({
      success: false,
      message: 'Tanggal filter harus menggunakan format YYYY-MM-DD.',
    })
  }

  try {
    const conditions = ['1 = 1']
    const params = []

    if (transactionDate) {
      conditions.push('je.transaction_date = ?')
      params.push(transactionDate)
    }

    if (search) {
      const pattern = `%${search}%`

      conditions.push(`
        (
          je.voucher_number LIKE ?
          OR je.description LIKE ?
          OR EXISTS (
            SELECT 1
            FROM journal_lines search_lines
            INNER JOIN accounts search_accounts
              ON search_accounts.id = search_lines.account_id
            WHERE search_lines.journal_entry_id = je.id
              AND (
                search_accounts.code LIKE ?
                OR search_accounts.name LIKE ?
                OR search_lines.description LIKE ?
              )
          )
        )
      `)

      params.push(pattern, pattern, pattern, pattern, pattern)
    }

    const [rows] = await db.query(
      `
        SELECT
          je.id,
          je.voucher_number,
          je.transaction_date,
          je.description,
          je.source_type,
          je.source_id,
          je.status,
          je.posted_at,
          je.created_at,
          COALESCE(SUM(jl.debit), 0) AS total_debit,
          COALESCE(SUM(jl.credit), 0) AS total_credit,

          GROUP_CONCAT(
            CASE
              WHEN jl.debit > 0
                THEN CONCAT('Dr ', accounts.code, ' - ', accounts.name)
              ELSE NULL
            END
            ORDER BY jl.id ASC
            SEPARATOR '||'
          ) AS debit_allocations,

          GROUP_CONCAT(
            CASE
              WHEN jl.credit > 0
                THEN CONCAT('Cr ', accounts.code, ' - ', accounts.name)
              ELSE NULL
            END
            ORDER BY jl.id ASC
            SEPARATOR '||'
          ) AS credit_allocations

        FROM journal_entries je
        LEFT JOIN journal_lines jl
          ON jl.journal_entry_id = je.id
        LEFT JOIN accounts
          ON accounts.id = jl.account_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY je.id
        ORDER BY je.transaction_date DESC, je.id DESC
      `,
      params,
    )

    const transactions = rows.map((row) => ({
      ...row,
      total_debit: Number(row.total_debit || 0),
      total_credit: Number(row.total_credit || 0),
      debit_allocations: row.debit_allocations
        ? row.debit_allocations.split('||').filter(Boolean)
        : [],
      credit_allocations: row.credit_allocations
        ? row.credit_allocations.split('||').filter(Boolean)
        : [],
    }))

    res.json({
      success: true,
      message: 'Data transaksi jurnal berhasil diambil.',
      data: transactions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data transaksi jurnal.',
      error: error.message,
    })
  }
})

module.exports = router
