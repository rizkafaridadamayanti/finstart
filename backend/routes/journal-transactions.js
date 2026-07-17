const express = require('express')
const db = require('../config/db')
const { getTransactionStatus } = require('../utils/journal-transaction-status')

const router = express.Router()

function cleanText(value, maxLength = 120) {
  const text = String(value || '').trim()
  return text ? text.slice(0, maxLength) : ''
}

function isValidDate(value) {
  const dateText = String(value || '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return false
  const date = new Date(`${dateText}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateText
}

function dateOnly(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function allocations(value) {
  return value ? String(value).split('||').filter(Boolean) : []
}

function makeTransactionRow(row) {
  const debitAllocations = allocations(row.debit_allocations)
  const creditAllocations = allocations(row.credit_allocations)
  const status = getTransactionStatus({
    journalId: row.id,
    journalStatus: row.journal_status,
    sourceType: row.source_type,
    sourceStatus: row.source_status,
  })

  return {
    id: `J-${row.id}`,
    journal_id: Number(row.id),
    tanggal: dateOnly(row.transaction_date),
    refVoucher: row.voucher_number || '-',
    keterangan: row.description || '-',
    source_type: row.source_type || 'manual',
    source_status: row.source_status || null,
    source_number: row.source_number || null,
    party_name: row.party_name || null,
    nominal: Number(row.total_debit || row.total_credit || 0),
    total_debit: Number(row.total_debit || 0),
    total_credit: Number(row.total_credit || 0),
    debitAkun: debitAllocations[0] || '',
    kreditAkun: creditAllocations[0] || '',
    debit_allocations: debitAllocations,
    credit_allocations: creditAllocations,
    status,
    journal_status: row.journal_status,
    approved_at: row.approved_at || null,
    created_by_name: row.created_by_name || '-',
    approved_by_name: row.approved_by_name || '-',
    _raw: row,
  }
}

function makeUnpostedRow({
  prefix,
  id,
  date,
  voucher,
  description,
  sourceType,
  sourceStatus = 'draft',
  sourceNumber,
  partyName,
  amount,
  raw,
}) {
  const status = getTransactionStatus({
    journalId: null,
    journalStatus: null,
    sourceType,
    sourceStatus,
  })

  return {
    id: `${prefix}-${id}`,
    journal_id: null,
    tanggal: dateOnly(date),
    refVoucher: voucher || '-',
    keterangan: description || '-',
    source_type: sourceType,
    source_status: sourceStatus,
    source_number: sourceNumber || voucher || null,
    party_name: partyName || null,
    nominal: Number(amount || 0),
    total_debit: 0,
    total_credit: 0,
    debitAkun: '',
    kreditAkun: '',
    debit_allocations: [],
    credit_allocations: [],
    status,
    journal_status: null,
    approved_at: null,
    created_by_name: '-',
    approved_by_name: '-',
    _raw: raw,
  }
}

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
          OR inv.invoice_number LIKE ?
          OR inv_client.company_name LIKE ?
          OR bill.bill_number LIKE ?
          OR bill.vendor_name LIKE ?
          OR tax.tax_type LIKE ?
          OR tax.tax_number LIKE ?
          OR payroll.employee_name LIKE ?
          OR payroll.employee_code LIKE ?
          OR payroll_tax.employee_name LIKE ?
          OR subscription.subscription_name LIKE ?
          OR subscription.provider_name LIKE ?
          OR asset.asset_name LIKE ?
          OR asset.asset_code LIKE ?
          OR EXISTS (
            SELECT 1
            FROM journal_lines search_line
            INNER JOIN accounts search_account ON search_account.id = search_line.account_id
            WHERE search_line.journal_entry_id = je.id
              AND (
                search_account.code LIKE ?
                OR search_account.name LIKE ?
                OR search_line.description LIKE ?
              )
          )
        )
      `)
      params.push(
        pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern,
        pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern,
        pattern, pattern,
      )
    }

    const [journalRows] = await db.query(
      `
        SELECT
          je.id,
          je.voucher_number,
          je.transaction_date,
          je.description,
          je.source_type,
          je.source_id,
          je.status AS journal_status,
          je.posted_at,
          je.created_at,
          je.created_by,
          je.approved_by,
          je.approved_at,
          creator.name AS created_by_name,
          approver.name AS approved_by_name,

          CASE
            WHEN je.source_type IN ('invoice', 'invoice_payment', 'invoice_void') THEN inv.status
            WHEN je.source_type IN ('bill', 'bill_payment', 'bill_void') THEN bill.status
            WHEN je.source_type IN ('tax_record', 'tax_payment') THEN tax.status
            WHEN je.source_type = 'payroll' THEN payroll.status
            WHEN je.source_type = 'employee_payroll' THEN payroll_tax.status
            WHEN je.source_type = 'subscription' THEN 'paid'
            WHEN je.source_type IN ('asset_acquisition', 'asset_disposal') THEN asset.status
            WHEN je.source_type = 'asset_depreciation' THEN depreciation.status
            WHEN je.source_type = 'vat_closing' THEN vat_closing.status
            ELSE NULL
          END AS source_status,

          CASE
            WHEN je.source_type IN ('invoice', 'invoice_payment', 'invoice_void') THEN inv.invoice_number
            WHEN je.source_type IN ('bill', 'bill_payment', 'bill_void') THEN bill.bill_number
            WHEN je.source_type IN ('tax_record', 'tax_payment') THEN COALESCE(tax.tax_number, CONCAT(tax.tax_type, ' ', tax.tax_period))
            WHEN je.source_type = 'payroll' THEN CONCAT('PAYROLL-', payroll.payroll_period, '-', payroll.employee_code)
            WHEN je.source_type = 'employee_payroll' THEN CONCAT('PPH21-', payroll_tax.tax_period, '-', payroll_tax.employee_nik)
            WHEN je.source_type = 'subscription' THEN CONCAT('SUB-', subscription.id)
            WHEN je.source_type IN ('asset_acquisition', 'asset_disposal', 'asset_depreciation') THEN asset.asset_code
            WHEN je.source_type = 'vat_closing' THEN CONCAT('PPN-', vat_closing.tax_period)
            ELSE NULL
          END AS source_number,

          CASE
            WHEN je.source_type IN ('invoice', 'invoice_payment', 'invoice_void') THEN inv_client.company_name
            WHEN je.source_type IN ('bill', 'bill_payment', 'bill_void') THEN bill.vendor_name
            WHEN je.source_type = 'payroll' THEN payroll.employee_name
            WHEN je.source_type = 'employee_payroll' THEN payroll_tax.employee_name
            WHEN je.source_type = 'subscription' THEN CONCAT(subscription.subscription_name, ' - ', subscription.provider_name)
            WHEN je.source_type IN ('asset_acquisition', 'asset_disposal', 'asset_depreciation') THEN asset.asset_name
            ELSE NULL
          END AS party_name,

          COALESCE(SUM(jl.debit), 0) AS total_debit,
          COALESCE(SUM(jl.credit), 0) AS total_credit,
          GROUP_CONCAT(
            CASE WHEN jl.debit > 0 THEN CONCAT('Dr ', acc.code, ' - ', acc.name) END
            ORDER BY jl.id ASC SEPARATOR '||'
          ) AS debit_allocations,
          GROUP_CONCAT(
            CASE WHEN jl.credit > 0 THEN CONCAT('Cr ', acc.code, ' - ', acc.name) END
            ORDER BY jl.id ASC SEPARATOR '||'
          ) AS credit_allocations
        FROM journal_entries je
        LEFT JOIN users creator ON creator.id = je.created_by
        LEFT JOIN users approver ON approver.id = je.approved_by
        LEFT JOIN journal_lines jl ON jl.journal_entry_id = je.id
        LEFT JOIN accounts acc ON acc.id = jl.account_id

        LEFT JOIN invoice_payments invoice_payment
          ON invoice_payment.id = je.source_id AND je.source_type = 'invoice_payment'
        LEFT JOIN invoices inv
          ON inv.id = CASE
            WHEN je.source_type IN ('invoice', 'invoice_void') THEN je.source_id
            WHEN je.source_type = 'invoice_payment' THEN invoice_payment.invoice_id
            ELSE NULL
          END
        LEFT JOIN clients inv_client ON inv_client.id = inv.client_id

        LEFT JOIN bill_payments bill_payment
          ON bill_payment.id = je.source_id AND je.source_type = 'bill_payment'
        LEFT JOIN bills bill
          ON bill.id = CASE
            WHEN je.source_type IN ('bill', 'bill_void') THEN je.source_id
            WHEN je.source_type = 'bill_payment' THEN bill_payment.bill_id
            ELSE NULL
          END

        LEFT JOIN tax_records tax
          ON tax.id = je.source_id AND je.source_type IN ('tax_record', 'tax_payment')
        LEFT JOIN payroll_records payroll
          ON payroll.id = je.source_id AND je.source_type = 'payroll'
        LEFT JOIN payroll_tax_calculations payroll_tax
          ON payroll_tax.id = je.source_id AND je.source_type = 'employee_payroll'
        LEFT JOIN subscriptions subscription
          ON subscription.id = je.source_id AND je.source_type = 'subscription'

        LEFT JOIN asset_depreciations depreciation
          ON depreciation.id = je.source_id AND je.source_type = 'asset_depreciation'
        LEFT JOIN assets asset
          ON asset.id = CASE
            WHEN je.source_type IN ('asset_acquisition', 'asset_disposal') THEN je.source_id
            WHEN je.source_type = 'asset_depreciation' THEN depreciation.asset_id
            ELSE NULL
          END
        LEFT JOIN vat_period_closings vat_closing
          ON vat_closing.id = je.source_id AND je.source_type = 'vat_closing'

        WHERE ${conditions.join(' AND ')}
        GROUP BY
          je.id, je.voucher_number, je.transaction_date, je.description,
          je.source_type, je.source_id, je.status, je.posted_at, je.created_at,
          je.created_by, je.approved_by, je.approved_at,
          creator.name, approver.name,
          inv.status, inv.invoice_number, inv_client.company_name,
          bill.status, bill.bill_number, bill.vendor_name,
          tax.status, tax.tax_number, tax.tax_type, tax.tax_period,
          payroll.status, payroll.payroll_period, payroll.employee_code, payroll.employee_name,
          payroll_tax.status, payroll_tax.tax_period, payroll_tax.employee_nik, payroll_tax.employee_name,
          subscription.id, subscription.subscription_name, subscription.provider_name,
          asset.status, asset.asset_code, asset.asset_name,
          depreciation.status, vat_closing.status, vat_closing.tax_period
        ORDER BY je.transaction_date DESC, je.id DESC
      `,
      params,
    )

    const results = journalRows.map(makeTransactionRow)
    const [draftInvoices, draftBills, draftTaxes] = await Promise.all([
      db.query(
        `
          SELECT
            inv.id,
            inv.invoice_number,
            inv.issue_date,
            inv.created_at,
            inv.total_amount,
            inv.status,
            client.company_name AS client_name,
            project.project_name
          FROM invoices inv
          INNER JOIN clients client ON client.id = inv.client_id
          LEFT JOIN projects project ON project.id = inv.project_id
          WHERE inv.status IN ('draft', 'cancelled')
            AND NOT EXISTS (
              SELECT 1 FROM journal_entries je2
              WHERE je2.source_type = 'invoice' AND je2.source_id = inv.id
            )
            ${transactionDate ? 'AND inv.issue_date = ?' : ''}
            ${search ? 'AND (inv.invoice_number LIKE ? OR client.company_name LIKE ? OR project.project_name LIKE ?)' : ''}
          ORDER BY inv.created_at DESC, inv.id DESC
        `,
        [
          ...(transactionDate ? [transactionDate] : []),
          ...(search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []),
        ],
      ),
      db.query(
        `
          SELECT id, bill_number, bill_date, created_at, total_amount, vendor_name, notes, status
          FROM bills
          WHERE status IN ('draft', 'cancelled')
            AND NOT EXISTS (
              SELECT 1 FROM journal_entries je2
              WHERE je2.source_type = 'bill' AND je2.source_id = bills.id
            )
            ${transactionDate ? 'AND bill_date = ?' : ''}
            ${search ? 'AND (bill_number LIKE ? OR vendor_name LIKE ? OR notes LIKE ?)' : ''}
          ORDER BY created_at DESC, id DESC
        `,
        [
          ...(transactionDate ? [transactionDate] : []),
          ...(search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []),
        ],
      ),
      db.query(
        `
          SELECT id, tax_type, tax_period, tax_number, amount, due_date, created_at, notes
          FROM tax_records
          WHERE status = 'draft'
            AND NOT EXISTS (
              SELECT 1 FROM journal_entries je2
              WHERE je2.source_type = 'tax_record' AND je2.source_id = tax_records.id
            )
            ${transactionDate ? 'AND DATE(created_at) = ?' : ''}
            ${search ? 'AND (tax_type LIKE ? OR tax_period LIKE ? OR tax_number LIKE ? OR notes LIKE ?)' : ''}
          ORDER BY created_at DESC, id DESC
        `,
        [
          ...(transactionDate ? [transactionDate] : []),
          ...(search ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : []),
        ],
      ),
    ])

    for (const invoice of draftInvoices[0]) {
      results.push(makeUnpostedRow({
        prefix: 'INV',
        id: invoice.id,
        date: invoice.issue_date || invoice.created_at,
        voucher: invoice.invoice_number,
        description: `Piutang ${invoice.client_name || '-'}${invoice.project_name ? ` (${invoice.project_name})` : ''}`,
        sourceType: 'invoice_draft',
        sourceStatus: invoice.status,
        sourceNumber: invoice.invoice_number,
        partyName: invoice.client_name,
        amount: invoice.total_amount,
        raw: invoice,
      }))
    }

    for (const bill of draftBills[0]) {
      results.push(makeUnpostedRow({
        prefix: 'BIL',
        id: bill.id,
        date: bill.bill_date || bill.created_at,
        voucher: bill.bill_number,
        description: bill.notes || `Utang ${bill.vendor_name || '-'}`,
        sourceType: 'bill_draft',
        sourceStatus: bill.status,
        sourceNumber: bill.bill_number,
        partyName: bill.vendor_name,
        amount: bill.total_amount,
        raw: bill,
      }))
    }

    for (const tax of draftTaxes[0]) {
      results.push(makeUnpostedRow({
        prefix: 'TAX',
        id: tax.id,
        date: tax.created_at,
        voucher: tax.tax_number || `TAX-${tax.id}`,
        description: `${tax.tax_type} periode ${tax.tax_period || '-'}`,
        sourceType: 'tax_draft',
        sourceNumber: tax.tax_number || null,
        amount: tax.amount,
        raw: tax,
      }))
    }

    results.sort((left, right) => {
      const dateCompare = String(right.tanggal || '').localeCompare(String(left.tanggal || ''))
      if (dateCompare !== 0) return dateCompare
      return String(right.id).localeCompare(String(left.id), undefined, { numeric: true })
    })

    res.json({
      success: true,
      message: 'Data transaksi jurnal berhasil diambil.',
      data: results,
    })
  } catch (error) {
    console.error('journal-transactions error:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data transaksi jurnal.',
    })
  }
})

router.getTransactionStatusForTest = getTransactionStatus

module.exports = router
