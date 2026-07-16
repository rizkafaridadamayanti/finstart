const CANCELED_STATUSES = new Set(['cancelled', 'canceled', 'rejected', 'void'])
const UNPOSTED_JOURNAL_STATUSES = new Set(['draft', 'approved', 'unposted'])
const PAID_SOURCE_STATUSES = new Set(['paid', 'disposed'])
const UNPAID_SOURCE_STATUSES = new Set(['unpaid', 'partial', 'overdue', 'payable'])
const ALWAYS_PAID_SOURCE_TYPES = new Set([
  'invoice_payment',
  'bill_payment',
  'tax_payment',
  'payroll',
  'employee_payroll',
  'asset_acquisition',
  'asset_disposal',
])
const ALWAYS_UNPAID_SOURCE_TYPES = new Set([
  'invoice',
  'bill',
  'tax_record',
  'vat_closing',
])

function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase()
}

function getTransactionStatus({
  journalId = null,
  journalStatus = '',
  sourceType = '',
  sourceStatus = '',
} = {}) {
  const normalizedJournalStatus = normalizeStatus(journalStatus)
  const normalizedSourceType = normalizeStatus(sourceType)
  const normalizedSourceStatus = normalizeStatus(sourceStatus)

  if (
    CANCELED_STATUSES.has(normalizedJournalStatus) ||
    CANCELED_STATUSES.has(normalizedSourceStatus) ||
    normalizedSourceType.endsWith('_void')
  ) {
    return 'canceled'
  }

  if (!journalId || UNPOSTED_JOURNAL_STATUSES.has(normalizedJournalStatus)) {
    return 'unposted'
  }

  if (
    ALWAYS_PAID_SOURCE_TYPES.has(normalizedSourceType) ||
    PAID_SOURCE_STATUSES.has(normalizedSourceStatus)
  ) {
    return 'posted-paid'
  }

  if (
    ALWAYS_UNPAID_SOURCE_TYPES.has(normalizedSourceType) ||
    UNPAID_SOURCE_STATUSES.has(normalizedSourceStatus)
  ) {
    return 'posted-unpaid'
  }

  return 'posted'
}

module.exports = {
  getTransactionStatus,
}
