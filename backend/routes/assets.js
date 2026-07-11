const express = require('express')
const db = require('../config/db')
const { safePublicMessage } = require('../utils/api-errors')

const router = express.Router()

const ASSET_ACCOUNT_CODE = '1210'
const ACCUMULATED_DEPRECIATION_ACCOUNT_CODE = '1220'
const DEPRECIATION_EXPENSE_ACCOUNT_CODE = '5250'
const PAYMENT_ACCOUNT_CODES = ['1001', '1110', '1120', '2100']

function numberValue(value) {
  return Number(value || 0)
}

function money(value) {
  return Math.round((numberValue(value) + Number.EPSILON) * 100) / 100
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
}

function isValidPeriod(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ''))
}

function dateText(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value || '').slice(0, 10)
}

function nextPeriod(period) {
  const [year, month] = period.split('-').map(Number)
  return new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7)
}

function monthDifference(startPeriod, endPeriod) {
  const [startYear, startMonth] = startPeriod.split('-').map(Number)
  const [endYear, endMonth] = endPeriod.split('-').map(Number)
  return (endYear - startYear) * 12 + (endMonth - startMonth)
}

function lastDateOfPeriod(period) {
  const [year, month] = period.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return `${period}-${String(lastDay).padStart(2, '0')}`
}

async function findAccountByCode(connection, code) {
  const [rows] = await connection.query(
    `
      SELECT id, code, name, type, normal_balance, status
      FROM accounts
      WHERE code = ? AND status = 'active'
      LIMIT 1
    `,
    [code],
  )
  return rows[0] || null
}

async function ensureAccountByCode(connection, code, name, type, normalBalance, parentCode = null) {
  const existing = await findAccountByCode(connection, code)
  if (existing) return existing

  let parentId = null
  if (parentCode) {
    const [parents] = await connection.query('SELECT id FROM accounts WHERE code = ? LIMIT 1', [parentCode])
    parentId = parents[0]?.id || null
  }

  const [result] = await connection.query(
    `INSERT INTO accounts (code, name, type, normal_balance, opening_balance, current_balance, status, parent_id)
     VALUES (?, ?, ?, ?, 0, 0, 'active', ?)`,
    [code, name, type, normalBalance, parentId],
  )
  const [rows] = await connection.query(
    'SELECT id, code, name, type, normal_balance, status FROM accounts WHERE id = ? LIMIT 1',
    [result.insertId],
  )
  return rows[0]
}

async function getAccountByCode(connection, code) {
  const account = await findAccountByCode(connection, code)
  if (!account) throw new Error(`Akun COA ${code} belum tersedia atau tidak aktif.`)
  return account
}

async function getPaymentAccount(connection, accountId) {
  const [rows] = await connection.query(
    `
      SELECT id, code, name, normal_balance
      FROM accounts
      WHERE id = ?
        AND code IN (${PAYMENT_ACCOUNT_CODES.map(() => '?').join(', ')})
        AND status = 'active'
      LIMIT 1
    `,
    [accountId, ...PAYMENT_ACCOUNT_CODES],
  )

  if (!rows[0]) {
    throw new Error('Sumber pembayaran harus Kas, Bank, atau Utang Usaha yang aktif.')
  }

  return rows[0]
}

async function updateAccountBalance(connection, accountId, debit, credit) {
  const [rows] = await connection.query(
    `
      SELECT id, normal_balance
      FROM accounts
      WHERE id = ?
      FOR UPDATE
    `,
    [accountId],
  )

  const account = rows[0]
  if (!account) throw new Error('Akun jurnal tidak ditemukan.')

  const delta = account.normal_balance === 'debit'
    ? money(debit) - money(credit)
    : money(credit) - money(debit)

  await connection.query(
    'UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?',
    [delta, account.id],
  )
}

async function postAutomaticJournal(connection, payload) {
  const totalDebit = money(payload.lines.reduce((sum, line) => sum + numberValue(line.debit), 0))
  const totalCredit = money(payload.lines.reduce((sum, line) => sum + numberValue(line.credit), 0))

  if (payload.lines.length < 2 || totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.005) {
    throw new Error('Jurnal otomatis tidak seimbang.')
  }

  const [result] = await connection.query(
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

  const journalEntryId = result.insertId
  const placeholders = payload.lines.map(() => '(?, ?, ?, ?, ?)').join(', ')
  const values = payload.lines.flatMap((line) => [
    journalEntryId,
    line.account_id,
    line.description || null,
    money(line.debit),
    money(line.credit),
  ])

  await connection.query(
    `
      INSERT INTO journal_lines (
        journal_entry_id, account_id, description, debit, credit
      ) VALUES ${placeholders}
    `,
    values,
  )

  for (const line of payload.lines) {
    await updateAccountBalance(connection, line.account_id, line.debit, line.credit)
  }

  return { id: journalEntryId, voucher_number: payload.voucher_number }
}

async function generateAssetCode(connection, acquisitionDate) {
  const prefix = `AST-${acquisitionDate.replaceAll('-', '')}`
  const [rows] = await connection.query(
    'SELECT asset_code FROM assets WHERE asset_code LIKE ? ORDER BY id DESC LIMIT 1',
    [`${prefix}-%`],
  )

  let sequence = 1
  if (rows[0]?.asset_code) {
    const lastPart = String(rows[0].asset_code).split('-').pop()
    const parsed = Number(lastPart)
    if (Number.isInteger(parsed) && parsed > 0) sequence = parsed + 1
  }

  return `${prefix}-${String(sequence).padStart(3, '0')}`
}

function makeDepreciationPlan(asset, period) {
  const acquisitionDate = dateText(asset.acquisition_date)
  const acquisitionMonth = acquisitionDate.slice(0, 7)
  const firstPeriod = nextPeriod(acquisitionMonth)
  const usefulLife = Number(asset.useful_life_months || 0)
  const cost = money(asset.acquisition_cost)
  const residual = money(asset.residual_value)
  const accumulated = money(asset.accumulated_depreciation)

  if (!isValidDate(acquisitionDate)) throw new Error('Tanggal perolehan aset belum valid.')
  if (usefulLife <= 0) throw new Error('Masa manfaat aset harus lebih dari 0 bulan.')
  if (cost <= 0 || residual < 0 || residual >= cost) throw new Error('Nilai aset atau residu tidak valid.')
  if (period < firstPeriod) throw new Error(`Penyusutan dimulai pada periode ${firstPeriod}.`)

  const sequence = monthDifference(firstPeriod, period) + 1
  if (sequence > usefulLife) throw new Error('Aset sudah melewati masa manfaatnya.')

  const depreciableAmount = money(cost - residual)
  const monthlyAmount = money(depreciableAmount / usefulLife)
  const remainingAmount = money(depreciableAmount - accumulated)
  const amount = money(Math.min(monthlyAmount, remainingAmount))

  if (amount <= 0) throw new Error('Aset sudah sepenuhnya disusutkan.')

  const accumulatedAfter = money(accumulated + amount)
  const bookValueAfter = money(Math.max(cost - accumulatedAfter, residual))

  return { amount, accumulatedAfter, bookValueAfter }
}

async function postDepreciation(connection, asset, period, notes = null) {
  const [existingRows] = await connection.query(
    `
      SELECT id
      FROM asset_depreciations
      WHERE asset_id = ? AND depreciation_period = ?
      LIMIT 1
      FOR UPDATE
    `,
    [asset.id, period],
  )

  if (existingRows[0]) {
    throw new Error(`Penyusutan periode ${period} sudah pernah diposting.`)
  }

  const plan = makeDepreciationPlan(asset, period)
  const expenseAccount = await ensureAccountByCode(connection, DEPRECIATION_EXPENSE_ACCOUNT_CODE, 'Beban Penyusutan Aset', 'expense', 'debit', '5000')
  const accumulatedAccount = await ensureAccountByCode(connection, ACCUMULATED_DEPRECIATION_ACCOUNT_CODE, 'Akumulasi Penyusutan Aset', 'asset', 'credit', '1200')

  const [depreciationResult] = await connection.query(
    `
      INSERT INTO asset_depreciations (
        asset_id,
        depreciation_period,
        depreciation_date,
        depreciation_amount,
        accumulated_depreciation_after,
        book_value_after,
        status,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, 'posted', ?)
    `,
    [
      asset.id,
      period,
      lastDateOfPeriod(period),
      plan.amount,
      plan.accumulatedAfter,
      plan.bookValueAfter,
      notes || null,
    ],
  )

  const depreciationId = depreciationResult.insertId
  const journal = await postAutomaticJournal(connection, {
    voucher_number: `DEP-${period.replace('-', '')}-A${asset.id}`,
    transaction_date: lastDateOfPeriod(period),
    description: `Penyusutan aset ${asset.asset_name} (${asset.asset_code}) periode ${period}`,
    source_type: 'asset_depreciation',
    source_id: depreciationId,
    lines: [
      {
        account_id: expenseAccount.id,
        description: `Beban penyusutan ${asset.asset_name}`,
        debit: plan.amount,
        credit: 0,
      },
      {
        account_id: accumulatedAccount.id,
        description: `Akumulasi penyusutan ${asset.asset_name}`,
        debit: 0,
        credit: plan.amount,
      },
    ],
  })

  await connection.query(
    'UPDATE asset_depreciations SET journal_entry_id = ? WHERE id = ?',
    [journal.id, depreciationId],
  )

  await connection.query(
    'UPDATE assets SET accumulated_depreciation = ? WHERE id = ?',
    [plan.accumulatedAfter, asset.id],
  )

  return {
    asset_id: asset.id,
    asset_name: asset.asset_name,
    depreciation_amount: plan.amount,
    accumulated_depreciation_after: plan.accumulatedAfter,
    book_value_after: plan.bookValueAfter,
    journal_voucher_number: journal.voucher_number,
  }
}

router.get('/', async (req, res) => {
  try {
    const requestedStatus = String(req.query.status || 'all')
    const validStatuses = ['all', 'active', 'inactive', 'disposed']
    const status = validStatuses.includes(requestedStatus) ? requestedStatus : 'all'
    const params = []
    const where = status === 'all' ? '' : (() => {
      params.push(status)
      return 'WHERE a.status = ?'
    })()

    const [assets] = await db.query(
      `
        SELECT
          a.*,
          ROUND(
            GREATEST(a.acquisition_cost - a.residual_value, 0)
              / NULLIF(a.useful_life_months, 0),
            2
          ) AS monthly_depreciation,
          GREATEST(a.acquisition_cost - a.accumulated_depreciation, a.residual_value) AS book_value,
          COALESCE(dep.depreciation_count, 0) AS depreciation_count,
          dep.last_depreciation_period,
          acquisition.voucher_number AS acquisition_voucher_number
        FROM assets a
        LEFT JOIN (
          SELECT asset_id, COUNT(*) AS depreciation_count, MAX(depreciation_period) AS last_depreciation_period
          FROM asset_depreciations
          WHERE status = 'posted'
          GROUP BY asset_id
        ) dep ON dep.asset_id = a.id
        LEFT JOIN journal_entries acquisition
          ON acquisition.source_type = 'asset_acquisition'
          AND acquisition.source_id = a.id
          AND acquisition.status = 'posted'
        ${where}
        ORDER BY CASE a.status WHEN 'active' THEN 0 ELSE 1 END, a.acquisition_date DESC, a.id DESC
      `,
      params,
    )

    const [summaryRows] = await db.query(
      `
        SELECT
          COUNT(*) AS total_assets,
          COALESCE(SUM(status = 'active'), 0) AS active_assets,
          COALESCE(SUM(acquisition_cost), 0) AS total_acquisition_cost,
          COALESCE(SUM(accumulated_depreciation), 0) AS total_accumulated_depreciation,
          COALESCE(SUM(GREATEST(acquisition_cost - accumulated_depreciation, residual_value)), 0) AS total_book_value
        FROM assets
      `,
    )

    const [paymentAccounts] = await db.query(
      `
        SELECT id, code, name
        FROM accounts
        WHERE code IN (${PAYMENT_ACCOUNT_CODES.map(() => '?').join(', ')})
          AND status = 'active'
        ORDER BY FIELD(code, '1120', '1110', '2100')
      `,
      PAYMENT_ACCOUNT_CODES,
    )

    res.json({
      success: true,
      message: 'Data aset berhasil diambil.',
      data: {
        assets,
        summary: summaryRows[0],
        payment_accounts: paymentAccounts,
        accounting_policy: {
          method: 'Garis lurus',
          start: 'Penyusutan dimulai pada bulan setelah tanggal perolehan.',
        },
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data aset.'})
  }
})

router.get('/:id/depreciations', async (req, res) => {
  const assetId = Number(req.params.id)
  if (!Number.isInteger(assetId) || assetId <= 0) {
    return res.status(400).json({ success: false, message: 'ID aset tidak valid.' })
  }

  try {
    const [assetRows] = await db.query(
      'SELECT id, asset_code, asset_name, accumulated_depreciation, residual_value FROM assets WHERE id = ? LIMIT 1',
      [assetId],
    )
    if (!assetRows[0]) return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' })

    const [rows] = await db.query(
      `
        SELECT ad.*, je.voucher_number AS journal_voucher_number
        FROM asset_depreciations ad
        LEFT JOIN journal_entries je ON je.id = ad.journal_entry_id
        WHERE ad.asset_id = ?
        ORDER BY ad.depreciation_period DESC, ad.id DESC
      `,
      [assetId],
    )

    res.json({ success: true, message: 'Riwayat penyusutan berhasil diambil.', data: { asset: assetRows[0], depreciations: rows } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat penyusutan.'})
  }
})

router.post('/', async (req, res) => {
  const assetName = String(req.body.asset_name || '').trim()
  const category = String(req.body.category || '').trim() || 'Peralatan'
  const acquisitionDate = String(req.body.acquisition_date || '').trim()
  const acquisitionCost = money(req.body.acquisition_cost)
  const usefulLifeMonths = Number(req.body.useful_life_months || 0)
  const residualValue = money(req.body.residual_value)
  const paymentAccountId = Number(req.body.payment_account_id)
  const notes = String(req.body.notes || '').trim() || null
  let assetCode = String(req.body.asset_code || '').trim().toUpperCase()

  if (!assetName) return res.status(400).json({ success: false, message: 'Nama aset wajib diisi.' })
  if (!isValidDate(acquisitionDate)) return res.status(400).json({ success: false, message: 'Tanggal perolehan aset tidak valid.' })
  if (acquisitionCost <= 0) return res.status(400).json({ success: false, message: 'Harga perolehan aset harus lebih dari 0.' })
  if (!Number.isInteger(usefulLifeMonths) || usefulLifeMonths <= 0) return res.status(400).json({ success: false, message: 'Masa manfaat aset harus lebih dari 0 bulan.' })
  if (residualValue < 0 || residualValue >= acquisitionCost) return res.status(400).json({ success: false, message: 'Nilai residu harus minimal 0 dan lebih kecil dari harga perolehan.' })
  if (!Number.isInteger(paymentAccountId) || paymentAccountId <= 0) return res.status(400).json({ success: false, message: 'Sumber pembayaran aset wajib dipilih.' })

  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const assetAccount = await ensureAccountByCode(connection, ASSET_ACCOUNT_CODE, 'Peralatan / Aset Teknologi', 'asset', 'debit', '1200')
    const paymentAccount = await getPaymentAccount(connection, paymentAccountId)
    if (!assetCode) assetCode = await generateAssetCode(connection, acquisitionDate)

    const [assetResult] = await connection.query(
      `
        INSERT INTO assets (
          asset_code, asset_name, category, acquisition_date,
          acquisition_cost, useful_life_months, residual_value,
          accumulated_depreciation, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active', ?)
      `,
      [assetCode, assetName, category, acquisitionDate, acquisitionCost, usefulLifeMonths, residualValue, notes],
    )

    const assetId = assetResult.insertId
    const journal = await postAutomaticJournal(connection, {
      voucher_number: `AST-${assetId}-${acquisitionDate.replaceAll('-', '')}`,
      transaction_date: acquisitionDate,
      description: `Perolehan aset ${assetName} (${assetCode})`,
      source_type: 'asset_acquisition',
      source_id: assetId,
      lines: [
        { account_id: assetAccount.id, description: `Perolehan ${assetName}`, debit: acquisitionCost, credit: 0 },
        { account_id: paymentAccount.id, description: `Sumber dana ${paymentAccount.name}`, debit: 0, credit: acquisitionCost },
      ],
    })

    await connection.commit()
    res.status(201).json({
      success: true,
      message: 'Aset dan jurnal perolehannya berhasil diposting.',
      data: { asset_id: assetId, asset_code: assetCode, journal_voucher_number: journal.voucher_number },
    })
  } catch (error) {
    if (connection) await connection.rollback()
    res.status(error?.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: error?.code === 'ER_DUP_ENTRY' ? 'Kode aset sudah digunakan.' : 'Gagal menyimpan aset.',
    })
  } finally {
    if (connection) connection.release()
  }
})


router.put('/:id', async (req, res) => {
  const assetId = Number(req.params.id)
  if (!Number.isInteger(assetId) || assetId <= 0) return res.status(400).json({ success: false, message: 'ID aset tidak valid.' })
  const assetName = String(req.body?.asset_name || '').trim()
  const category = String(req.body?.category || '').trim() || 'Peralatan'
  const usefulLifeMonths = Number(req.body?.useful_life_months || 0)
  const residualValue = money(req.body?.residual_value)
  const notes = String(req.body?.notes || '').trim() || null
  if (!assetName) return res.status(400).json({ success: false, message: 'Nama aset wajib diisi.' })
  if (!Number.isInteger(usefulLifeMonths) || usefulLifeMonths <= 0) return res.status(400).json({ success: false, message: 'Masa manfaat aset harus lebih dari 0 bulan.' })
  try {
    const [rows] = await db.query('SELECT acquisition_cost, accumulated_depreciation, status FROM assets WHERE id = ? LIMIT 1', [assetId])
    const asset = rows[0]
    if (!asset) return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' })
    if (asset.status === 'disposed') return res.status(422).json({ success: false, message: 'Aset yang sudah dilepas tidak dapat diubah.' })
    if (residualValue < 0 || residualValue >= Number(asset.acquisition_cost || 0)) return res.status(400).json({ success: false, message: 'Nilai residu harus minimal 0 dan lebih kecil dari harga perolehan.' })
    await db.query(
      `UPDATE assets SET asset_name = ?, category = ?, useful_life_months = ?, residual_value = ?, notes = ? WHERE id = ?`,
      [assetName, category, usefulLifeMonths, residualValue, notes, assetId],
    )
    res.json({ success: true, message: 'Data aset berhasil diperbarui.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui aset.'})
  }
})

async function ensureDisposalLossAccount(connection) {
  return ensureAccountByCode(connection, '5295', 'Rugi Pelepasan Aset', 'expense', 'debit', '5000')
}

router.post('/:id/dispose', async (req, res) => {
  const assetId = Number(req.params.id)
  const disposalDate = String(req.body?.disposal_date || '').trim()
  const reason = String(req.body?.reason || '').trim()
  if (!Number.isInteger(assetId) || assetId <= 0) return res.status(400).json({ success: false, message: 'ID aset tidak valid.' })
  if (!isValidDate(disposalDate)) return res.status(400).json({ success: false, message: 'Tanggal pelepasan aset tidak valid.' })
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()
    const [rows] = await connection.query('SELECT * FROM assets WHERE id = ? FOR UPDATE', [assetId])
    const asset = rows[0]
    if (!asset) throw new Error('Aset tidak ditemukan.')
    if (asset.status === 'disposed') throw new Error('Aset sudah dilepas sebelumnya.')
    const cost = money(asset.acquisition_cost)
    const accumulated = money(asset.accumulated_depreciation)
    const bookValue = money(Math.max(cost - accumulated, Number(asset.residual_value || 0)))
    const assetAccount = await ensureAccountByCode(connection, ASSET_ACCOUNT_CODE, 'Peralatan / Aset Teknologi', 'asset', 'debit', '1200')
    const accumulatedAccount = await ensureAccountByCode(connection, ACCUMULATED_DEPRECIATION_ACCOUNT_CODE, 'Akumulasi Penyusutan Aset', 'asset', 'credit', '1200')
    const lossAccount = await ensureDisposalLossAccount(connection)
    const lines = []
    if (accumulated > 0) lines.push({ account_id: accumulatedAccount.id, description: `Akumulasi penyusutan ${asset.asset_name}`, debit: accumulated, credit: 0 })
    if (bookValue > 0) lines.push({ account_id: lossAccount.id, description: `Rugi pelepasan ${asset.asset_name}`, debit: bookValue, credit: 0 })
    lines.push({ account_id: assetAccount.id, description: `Penghapusan aset ${asset.asset_name}`, debit: 0, credit: cost })
    const journal = await postAutomaticJournal(connection, {
      voucher_number: `DISP-${asset.id}-${disposalDate.replaceAll('-', '')}`,
      transaction_date: disposalDate,
      description: `Pelepasan/penghapusan aset ${asset.asset_name}${reason ? `: ${reason}` : ''}`,
      source_type: 'asset_disposal',
      source_id: asset.id,
      lines,
    })
    await connection.query(
      "UPDATE assets SET status = 'disposed', notes = CONCAT(COALESCE(notes, ''), ?) WHERE id = ?",
      [`\n[Dilepas ${disposalDate}] ${reason || '-'}`, asset.id],
    )
    await connection.commit()
    res.json({ success: true, message: 'Aset berhasil dilepas dan jurnal pelepasan diposting.', data: { asset_id: asset.id, journal_voucher_number: journal.voucher_number, book_value: bookValue } })
  } catch (error) {
    if (connection) await connection.rollback()
    res.status(400).json({ success: false, message: safePublicMessage(error, 'Gagal melepas aset.') })
  } finally { if (connection) connection.release() }
})

router.post('/depreciate-batch', async (req, res) => {
  const period = String(req.body.depreciation_period || '').trim()
  const notes = String(req.body.notes || '').trim() || null
  if (!isValidPeriod(period)) return res.status(400).json({ success: false, message: 'Periode penyusutan harus menggunakan format YYYY-MM.' })

  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()
    const [assetRows] = await connection.query("SELECT * FROM assets WHERE status = 'active' ORDER BY acquisition_date, id FOR UPDATE")

    const processed = []
    const skipped = []
    for (const asset of assetRows) {
      try {
        processed.push(await postDepreciation(connection, asset, period, notes))
      } catch (error) {
        skipped.push({ asset_id: asset.id, asset_name: asset.asset_name, reason: safePublicMessage(error, 'Tidak dapat diproses.') })
      }
    }

    await connection.commit()
    res.json({
      success: true,
      message: processed.length > 0
        ? `Penyusutan ${processed.length} aset untuk periode ${period} berhasil diposting.`
        : `Tidak ada aset yang dapat disusutkan untuk periode ${period}.`,
      data: { depreciation_period: period, processed, skipped },
    })
  } catch (error) {
    if (connection) await connection.rollback()
    res.status(500).json({ success: false, message: 'Gagal memproses penyusutan bulanan.'})
  } finally {
    if (connection) connection.release()
  }
})

router.post('/:id/depreciate', async (req, res) => {
  const assetId = Number(req.params.id)
  const period = String(req.body.depreciation_period || '').trim()
  const notes = String(req.body.notes || '').trim() || null

  if (!Number.isInteger(assetId) || assetId <= 0) return res.status(400).json({ success: false, message: 'ID aset tidak valid.' })
  if (!isValidPeriod(period)) return res.status(400).json({ success: false, message: 'Periode penyusutan harus menggunakan format YYYY-MM.' })

  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()
    const [assetRows] = await connection.query("SELECT * FROM assets WHERE id = ? AND status = 'active' LIMIT 1 FOR UPDATE", [assetId])
    if (!assetRows[0]) throw new Error('Aset aktif tidak ditemukan.')

    const depreciation = await postDepreciation(connection, assetRows[0], period, notes)
    await connection.commit()
    res.status(201).json({ success: true, message: 'Penyusutan aset dan jurnal beban berhasil diposting.', data: depreciation })
  } catch (error) {
    if (connection) await connection.rollback()
    res.status(400).json({ success: false, message: safePublicMessage(error, 'Gagal memproses penyusutan aset.') })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
