<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '../services/api'

const taxes = ref([])
const payrollTaxes = ref([])
const accounts = ref([])

const summary = ref({
  total_unpaid: 0,
  ppn_due: 0,
  pph21_due: 0,
  pph23_due: 0,
  total_paid: 0,
  draft_count: 0,
  unpaid_count: 0,
  overdue_count: 0,
  compliance_status: 'Patuh',
})

const calculation = ref({
  period: '',
  revenue: 0,
  expense: 0,
  net_profit: 0,
  posted_journal_count: 0,
})

const keyword = ref('')
const selectedStatus = ref('all')
const activeTab = ref('unpaid')
const isLoading = ref(false)
const isSaving = ref(false)
const currentPage = ref(1)
const PAGE_SIZE = 10
const errorMessage = ref('')
const successMessage = ref('')

const showCreateTaxModal = ref(false)
const showIssueTaxModal = ref(false)
const showPayTaxModal = ref(false)
const showPayrollModal = ref(false)
const showPostPayrollModal = ref(false)

const today = new Date().toISOString().slice(0, 10)
const currentPeriod = `${new Date().getFullYear()}-${String(
  new Date().getMonth() + 1,
).padStart(2, '0')}`

const calculationPeriod = ref(currentPeriod)
const calculationTaxType = ref('PPh Final')
const calculationBasis = ref('revenue')
const calculationRate = ref(0)
const calculationDueDate = ref('')

const vatPeriod = ref(currentPeriod)
const vatDueDate = ref('')
const vatNotes = ref('')
const isVatClosing = ref(false)
const vatSummary = ref({
  period: currentPeriod,
  output_vat: 0,
  input_vat: 0,
  net_vat: 0,
  position: 'zero',
  output_count: 0,
  input_count: 0,
  closing: null,
})

function numberValue(value) {
  return Number(value || 0)
}

function emptyTaxForm() {
  return {
    tax_type: 'PPh Final',
    tax_period: currentPeriod,
    tax_number: '',
    amount: 0,
    due_date: '',
    notes: '',
  }
}

function emptyIssueForm() {
  return {
    tax_id: '',
    expense_account_id: '',
  }
}

function emptyTaxPaymentForm() {
  return {
    tax_id: '',
    payment_date: today,
    tax_number: '',
    cash_account_id: '',
    notes: '',
  }
}

function emptyPayrollForm() {
  return {
    employee_name: '',
    employee_nik: '',
    employee_position: '',
    tax_period: currentPeriod,
    ptkp_status: 'TK/0',
    base_salary: 0,
    allowance_amount: 0,
    due_date: '',
  }
}

function emptyPayrollPostForm() {
  return {
    payroll_id: '',
    payroll_date: today,
    salary_expense_account_id: '',
    cash_account_id: '',
  }
}

const taxForm = ref(emptyTaxForm())
const issueTaxForm = ref(emptyIssueForm())
const taxPaymentForm = ref(emptyTaxPaymentForm())
const payrollForm = ref(emptyPayrollForm())
const payrollPreview = ref(null)
const payrollPostForm = ref(emptyPayrollPostForm())

const expenseAccounts = computed(() => {
  return accounts.value.filter((account) => account.type === 'expense')
})

const cashAccounts = computed(() => {
  return accounts.value.filter((account) => {
    const isCashOrBank =
      ['1110', '1120'].includes(String(account.code)) ||
      /(kas|bank)/i.test(String(account.name || ''))

    return account.type === 'asset' &&
      String(account.code) !== '1130' &&
      isCashOrBank
  })
})

const filteredTaxes = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  const data = taxes.value.filter((record) => {
    const status = String(
      record.display_status || record.status || '',
    ).toLowerCase()

    const matchesStatus =
      selectedStatus.value === 'all' || status === selectedStatus.value

    const matchesTab =
      activeTab.value === 'paid'
        ? status === 'paid'
        : status !== 'paid'

    const matchesSearch =
      !search ||
      [
        record.tax_type,
        record.tax_period,
        record.tax_number,
        record.notes,
        record.payroll_employee_name,
        status,
      ].some((value) => String(value || '').toLowerCase().includes(search))

    return matchesStatus && matchesTab && matchesSearch
  })

  // Sort by newest first using due_date or created_at if available
  return [...data].sort((a, b) => {
    const dateA = a.due_date ? new Date(a.due_date) : (a.created_at ? new Date(a.created_at) : new Date(0))
    const dateB = b.due_date ? new Date(b.due_date) : (b.created_at ? new Date(b.created_at) : new Date(0))
    return dateB - dateA
  })
})

const paginatedTaxes = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredTaxes.value.slice(start, start + PAGE_SIZE)
})

const selectedIssueTax = computed(() => {
  return taxes.value.find((record) => {
    return Number(record.id) === Number(issueTaxForm.value.tax_id)
  })
})

const selectedTaxPayment = computed(() => {
  return taxes.value.find((record) => {
    return Number(record.id) === Number(taxPaymentForm.value.tax_id)
  })
})

const selectedPayrollPost = computed(() => {
  return payrollTaxes.value.find((record) => {
    return Number(record.id) === Number(payrollPostForm.value.payroll_id)
  })
})

const payableTaxes = computed(() => {
  return taxes.value.filter((record) => {
    const status = record.display_status || record.status

    return ['unpaid', 'overdue'].includes(status)
  })
})

const payrollDrafts = computed(() => {
  return payrollTaxes.value.filter((record) => record.status === 'draft')
})

const calculationBasisLabel = computed(() => {
  return calculationBasis.value === 'net_profit'
    ? 'Laba Bersih'
    : 'Pendapatan'
})

const calculationBaseValue = computed(() => {
  if (calculationBasis.value === 'net_profit') {
    return Math.max(numberValue(calculation.value.net_profit), 0)
  }

  return numberValue(calculation.value.revenue)
})

const estimatedBusinessTax = computed(() => {
  return Math.round(
    (calculationBaseValue.value * numberValue(calculationRate.value)) / 100,
  )
})

const vatPositionLabel = computed(() => {
  if (numberValue(vatSummary.value.net_vat) > 0) return 'PPN Kurang Bayar'
  if (numberValue(vatSummary.value.net_vat) < 0) return 'PPN Lebih Bayar'

  return 'PPN Nihil'
})

const vatPositionAmount = computed(() => {
  return Math.abs(numberValue(vatSummary.value.net_vat))
})

const vatIsClosed = computed(() => Boolean(vatSummary.value.closing))

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue(value))
}

function formatRate(value) {
  return `${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(numberValue(value) * 100)}%`
}

function formatDate(value) {
  if (!value) return '-'

  const [year, month, day] = String(value).slice(0, 10).split('-')

  if (!year || !month || !day) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(Number(year), Number(month) - 1, Number(day)))
}

function formatPeriod(value) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ''))) {
    return value || '-'
  }

  const [year, month] = String(value).split('-')

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Number(year), Number(month) - 1, 1))
}

function taxStatusLabel(status) {
  return {
    draft: 'Draft',
    unpaid: 'Menunggu Pembayaran',
    paid: 'Sudah Disetor',
    overdue: 'Terlambat',
  }[status] || status || '-'
}

function statusClass(status) {
  return {
    warning: ['draft', 'unpaid'].includes(status),
    danger: status === 'overdue',
    success: status === 'paid',
  }
}

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

async function loadData() {
  isLoading.value = true
  clearMessages()

  try {
    const [
      taxResponse,
      payrollResponse,
      summaryResponse,
      accountResponse,
    ] = await Promise.all([
      api.get('/taxes'),
      api.get('/taxes/employee-pph21'),
      api.get('/taxes/summary'),
      api.get('/accounts'),
    ])

    taxes.value = taxResponse.data.data || []
    payrollTaxes.value = payrollResponse.data.data || []
    accounts.value = accountResponse.data.data || []
    summary.value = {
      ...summary.value,
      ...(summaryResponse.data.data || {}),
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data pajak. Pastikan backend FinStart berjalan.',
    )
  } finally {
    isLoading.value = false
  }
}

async function loadCalculation() {
  try {
    const response = await api.get('/taxes/calculation', {
      params: {
        period: calculationPeriod.value,
      },
    })

    calculation.value = {
      ...calculation.value,
      ...(response.data.data || {}),
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil pendapatan dan laba untuk kalkulasi pajak.',
    )
  }
}

async function loadVatSummary() {
  try {
    const response = await api.get('/tax-engine/vat', {
      params: {
        period: vatPeriod.value,
      },
    })

    vatSummary.value = {
      ...vatSummary.value,
      ...(response.data.data || {}),
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil ringkasan PPN Masa. Pastikan backend dan migration PPN sudah dijalankan.',
    )
  }
}

async function refreshAll() {
  await Promise.all([loadData(), loadCalculation(), loadVatSummary()])
}

function openCreateTaxModal() {
  clearMessages()
  taxForm.value = emptyTaxForm()
  showCreateTaxModal.value = true
}

function closeCreateTaxModal() {
  showCreateTaxModal.value = false
  taxForm.value = emptyTaxForm()
}

function openIssueTaxModal(record) {
  clearMessages()

  const defaultExpense = expenseAccounts.value.find(
    (account) => String(account.code) === '5100',
  )

  issueTaxForm.value = {
    tax_id: String(record.id),
    expense_account_id: String(
      defaultExpense?.id || expenseAccounts.value[0]?.id || '',
    ),
  }

  showIssueTaxModal.value = true
}

function closeIssueTaxModal() {
  showIssueTaxModal.value = false
  issueTaxForm.value = emptyIssueForm()
}

function openTaxPaymentModal(record = null) {
  clearMessages()

  const target = record || payableTaxes.value[0]

  if (!target) {
    errorMessage.value =
      'Belum ada kewajiban pajak yang siap disetor.'
    return
  }

  const bankAccount = cashAccounts.value.find(
    (account) => String(account.code) === '1120',
  )

  taxPaymentForm.value = {
    ...emptyTaxPaymentForm(),
    tax_id: String(target.id),
    tax_number: target.tax_number || '',
    cash_account_id: String(
      bankAccount?.id || cashAccounts.value[0]?.id || '',
    ),
  }

  showPayTaxModal.value = true
}

function closeTaxPaymentModal() {
  showPayTaxModal.value = false
  taxPaymentForm.value = emptyTaxPaymentForm()
}

function openPayrollModal() {
  clearMessages()
  payrollForm.value = emptyPayrollForm()
  payrollPreview.value = null
  showPayrollModal.value = true
}

function closePayrollModal() {
  showPayrollModal.value = false
  payrollForm.value = emptyPayrollForm()
  payrollPreview.value = null
}

function openPostPayrollModal(record) {
  clearMessages()

  const salaryExpense = expenseAccounts.value.find(
    (account) => String(account.code) === '5100',
  )

  const bankAccount = cashAccounts.value.find(
    (account) => String(account.code) === '1120',
  )

  payrollPostForm.value = {
    payroll_id: String(record.id),
    payroll_date: today,
    salary_expense_account_id: String(
      salaryExpense?.id || expenseAccounts.value[0]?.id || '',
    ),
    cash_account_id: String(
      bankAccount?.id || cashAccounts.value[0]?.id || '',
    ),
  }

  showPostPayrollModal.value = true
}

function closePostPayrollModal() {
  showPostPayrollModal.value = false
  payrollPostForm.value = emptyPayrollPostForm()
}

async function calculatePayrollPph21() {
  clearMessages()

  if (!payrollForm.value.employee_name.trim()) {
    errorMessage.value = 'Nama pegawai wajib diisi.'
    return
  }

  isSaving.value = true

  try {
    const response = await api.post('/taxes/employee-pph21/calculate', {
      employee_name: payrollForm.value.employee_name,
      employee_nik: payrollForm.value.employee_nik,
      employee_position: payrollForm.value.employee_position,
      tax_period: payrollForm.value.tax_period,
      ptkp_status: payrollForm.value.ptkp_status,
      base_salary: numberValue(payrollForm.value.base_salary),
      allowance_amount: numberValue(payrollForm.value.allowance_amount),
    })

    payrollPreview.value = response.data.data

    if (payrollPreview.value.needs_final_reconciliation) {
      errorMessage.value = payrollPreview.value.message
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal menghitung PPh 21 pegawai.',
    )
  } finally {
    isSaving.value = false
  }
}

async function createPayrollDraft() {
  clearMessages()

  if (!payrollPreview.value || payrollPreview.value.needs_final_reconciliation) {
    errorMessage.value = 'Hitung PPh 21 terlebih dahulu sebelum menyimpan draft.'
    return
  }

  isSaving.value = true

  try {
    const response = await api.post('/taxes/employee-pph21', {
      ...payrollForm.value,
      base_salary: numberValue(payrollForm.value.base_salary),
      allowance_amount: numberValue(payrollForm.value.allowance_amount),
    })

    closePayrollModal()
    successMessage.value =
      response.data.message ||
      'Draft payroll dan PPh 21 pegawai berhasil dibuat.'

    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal membuat draft payroll.',
    )
  } finally {
    isSaving.value = false
  }
}

async function postPayroll() {
  clearMessages()

  if (
    !payrollPostForm.value.payroll_id ||
    !payrollPostForm.value.salary_expense_account_id ||
    !payrollPostForm.value.cash_account_id
  ) {
    errorMessage.value = 'Pilih akun beban gaji dan akun Kas/Bank.'
    return
  }

  const record = selectedPayrollPost.value
  const confirmed = window.confirm(
    `Posting payroll ${record?.employee_name || ''}?\n\nJurnal otomatis:\nDebit Beban Gaji = bruto\nKredit Kas/Bank = gaji bersih\nKredit Utang Pajak = PPh 21`,
  )

  if (!confirmed) return

  isSaving.value = true

  try {
    const response = await api.post(
      `/taxes/employee-pph21/${payrollPostForm.value.payroll_id}/post`,
      {
        payroll_date: payrollPostForm.value.payroll_date,
        salary_expense_account_id: Number(
          payrollPostForm.value.salary_expense_account_id,
        ),
        cash_account_id: Number(payrollPostForm.value.cash_account_id),
      },
    )

    closePostPayrollModal()
    successMessage.value =
      response.data.message || 'Payroll berhasil diposting.'

    await refreshAll()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal memposting payroll.')
  } finally {
    isSaving.value = false
  }
}

async function createBusinessTaxFromCalculation() {
  clearMessages()

  if (numberValue(calculationRate.value) <= 0) {
    errorMessage.value = 'Isi tarif pajak terlebih dahulu.'
    return
  }

  if (estimatedBusinessTax.value <= 0) {
    errorMessage.value =
      'Dasar perhitungan atau tarif menghasilkan nominal pajak Rp0.'
    return
  }

  isSaving.value = true

  try {
    const notes = [
      'Dibuat dari kalkulasi pajak FinStart.',
      `Dasar: ${calculationBasisLabel.value} ${formatCurrency(calculationBaseValue.value)}.`,
      `Tarif dipilih Finance: ${numberValue(calculationRate.value)}%.`,
      `Jurnal posted periode: ${formatPeriod(calculationPeriod.value)}.`,
    ].join(' ')

    const response = await api.post('/taxes', {
      tax_type: calculationTaxType.value,
      tax_period: calculationPeriod.value,
      amount: estimatedBusinessTax.value,
      due_date: calculationDueDate.value || null,
      notes,
    })

    successMessage.value =
      response.data.message || 'Draft kewajiban pajak berhasil dibuat.'

    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal membuat draft pajak dari kalkulasi.',
    )
  } finally {
    isSaving.value = false
  }
}

async function createManualTax() {
  clearMessages()

  if (!taxForm.value.tax_type || !taxForm.value.tax_period) {
    errorMessage.value = 'Jenis dan periode pajak wajib diisi.'
    return
  }

  if (numberValue(taxForm.value.amount) <= 0) {
    errorMessage.value = 'Nominal pajak harus lebih dari Rp0.'
    return
  }

  isSaving.value = true

  try {
    const response = await api.post('/taxes', {
      tax_type: taxForm.value.tax_type,
      tax_period: taxForm.value.tax_period,
      tax_number: taxForm.value.tax_number,
      amount: numberValue(taxForm.value.amount),
      due_date: taxForm.value.due_date || null,
      notes: taxForm.value.notes,
    })

    closeCreateTaxModal()
    successMessage.value =
      response.data.message || 'Draft kewajiban pajak berhasil dibuat.'

    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal membuat draft kewajiban pajak.',
    )
  } finally {
    isSaving.value = false
  }
}

async function issueTax() {
  clearMessages()

  if (!issueTaxForm.value.tax_id || !issueTaxForm.value.expense_account_id) {
    errorMessage.value = 'Pilih akun beban terlebih dahulu.'
    return
  }

  const record = selectedIssueTax.value
  const confirmed = window.confirm(
    `Terbitkan kewajiban ${record?.tax_type || 'pajak ini'}?\n\nJurnal otomatis:\nDebit Beban Pajak\nKredit Utang Pajak`,
  )

  if (!confirmed) return

  isSaving.value = true

  try {
    const response = await api.post(
      `/taxes/${issueTaxForm.value.tax_id}/issue`,
      {
        expense_account_id: Number(issueTaxForm.value.expense_account_id),
      },
    )

    closeIssueTaxModal()
    successMessage.value =
      response.data.message || 'Kewajiban pajak berhasil diterbitkan.'

    await refreshAll()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal menerbitkan kewajiban pajak.',
    )
  } finally {
    isSaving.value = false
  }
}

async function payTax() {
  clearMessages()

  if (!taxPaymentForm.value.tax_id || !taxPaymentForm.value.cash_account_id) {
    errorMessage.value = 'Pilih kewajiban pajak dan akun Kas/Bank.'
    return
  }

  if (!taxPaymentForm.value.tax_number.trim()) {
    errorMessage.value = 'NTPN atau nomor bukti setoran wajib diisi.'
    return
  }

  isSaving.value = true

  try {
    const selected = selectedTaxPayment.value
    const note = String(selected?.notes || '')
    const isAutomaticPph23 =
      selected?.tax_type === 'PPh 23' &&
      note.includes('Dibuat otomatis dari tagihan vendor')
    const isAutomaticPpn =
      selected?.tax_type === 'PPN' &&
      note.includes('Dibuat otomatis dari penutupan PPN Masa')

    const endpoint = isAutomaticPph23 || isAutomaticPpn
      ? `/tax-engine/tax-record/${taxPaymentForm.value.tax_id}/pay`
      : `/taxes/${taxPaymentForm.value.tax_id}/pay`

    const response = await api.post(endpoint, {
      payment_date: taxPaymentForm.value.payment_date,
      tax_number: taxPaymentForm.value.tax_number,
      cash_account_id: Number(taxPaymentForm.value.cash_account_id),
      notes: taxPaymentForm.value.notes,
    })

    closeTaxPaymentModal()
    successMessage.value =
      response.data.message || 'Setoran pajak berhasil dikonfirmasi.'

    await refreshAll()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengonfirmasi setoran pajak.',
    )
  } finally {
    isSaving.value = false
  }
}

async function closeVatPeriod() {
  clearMessages()

  if (vatIsClosed.value) {
    errorMessage.value = 'Masa PPN ini sudah ditutup.'
    return
  }

  if (
    numberValue(vatSummary.value.output_vat) <= 0 &&
    numberValue(vatSummary.value.input_vat) <= 0
  ) {
    errorMessage.value =
      'Belum ada PPN Keluaran atau PPN Masukan posted pada masa ini.'
    return
  }

  const confirmed = window.confirm(
    `Tutup Masa PPN ${formatPeriod(vatPeriod.value)}?\n\nPPN Keluaran: ${formatCurrency(vatSummary.value.output_vat)}\nPPN Masukan: ${formatCurrency(vatSummary.value.input_vat)}\nPosisi: ${vatPositionLabel.value} ${formatCurrency(vatPositionAmount.value)}\n\nSetelah ditutup, invoice/tagihan PPN baru tidak boleh dibuat pada masa ini.`,
  )

  if (!confirmed) return

  isVatClosing.value = true

  try {
    const response = await api.post('/tax-engine/vat/close', {
      period: vatPeriod.value,
      due_date: vatDueDate.value || null,
      notes: vatNotes.value,
    })

    successMessage.value =
      response.data.message || 'Masa PPN berhasil ditutup.'

    await refreshAll()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal menutup Masa PPN.',
    )
  } finally {
    isVatClosing.value = false
  }
}

async function deleteDraft(record) {
  clearMessages()

  if (
    !window.confirm(
      `Hapus draft ${record.tax_type} periode ${formatPeriod(record.tax_period)}?`,
    )
  ) {
    return
  }

  isSaving.value = true

  try {
    const response = await api.delete(`/taxes/${record.id}`)

    successMessage.value = response.data.message || 'Draft pajak dihapus.'
    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal menghapus draft pajak.',
    )
  } finally {
    isSaving.value = false
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function receiptShell(title, body) {
  return `<!doctype html>
  <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(title)}</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; background: #eef3f9; color: #183454; font-family: Arial, sans-serif; }
        .receipt { width: 760px; max-width: 100%; margin: 24px auto; padding: 30px; background: white; }
        .header { border-bottom: 2px solid #1e5f9a; padding-bottom: 16px; }
        .brand { color: #1e5f9a; font-size: 22px; font-weight: 800; letter-spacing: .04em; }
        .title { margin: 8px 0 0; font-size: 19px; }
        .muted { color: #6f8299; font-size: 12px; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; margin-top: 18px; }
        th, td { border-bottom: 1px solid #e3eaf2; padding: 10px 6px; text-align: left; font-size: 13px; }
        th { width: 42%; color: #6d8098; font-weight: 600; }
        .amount { color: #174f81; font-size: 20px; font-weight: 800; }
        .status { display: inline-block; border-radius: 999px; padding: 5px 9px; background: #edf5ff; color: #205a90; font-weight: 700; font-size: 11px; }
        .notice { margin-top: 22px; border-radius: 8px; padding: 12px; background: #fff8df; color: #7c6420; font-size: 11px; line-height: 1.5; }
        .footer { margin-top: 22px; color: #7a8da5; font-size: 10px; line-height: 1.45; }
        @media print { body { background: white; } .receipt { margin: 0; width: auto; } }
      </style>
    </head>
    <body>
      <article class="receipt">
        ${body}
      </article>
      <script>window.onload = () => window.print()<\/script>
    </body>
  </html>`
}

function printTaxReceipt(record) {
  const status = record.display_status || record.status
  const receipt = receiptShell(
    'Bukti Pajak Internal FinStart',
    `
      <header class="header">
        <div class="brand">FINSTART</div>
        <h1 class="title">Bukti Kewajiban / Setoran Pajak Internal</h1>
        <p class="muted">Dokumen dicetak: ${escapeHtml(formatDate(today))}</p>
      </header>

      <table>
        <tr><th>Jenis Pajak</th><td>${escapeHtml(record.tax_type)}</td></tr>
        <tr><th>Periode Pajak</th><td>${escapeHtml(formatPeriod(record.tax_period))}</td></tr>
        <tr><th>Nominal</th><td class="amount">${escapeHtml(formatCurrency(record.amount))}</td></tr>
        <tr><th>Status</th><td><span class="status">${escapeHtml(taxStatusLabel(status))}</span></td></tr>
        <tr><th>Jatuh Tempo</th><td>${escapeHtml(formatDate(record.due_date))}</td></tr>
        <tr><th>NTPN / Referensi</th><td>${escapeHtml(record.tax_number || '-')}</td></tr>
        <tr><th>Jurnal Kewajiban</th><td>${escapeHtml(record.obligation_voucher_number || '-')}</td></tr>
        <tr><th>Jurnal Setoran</th><td>${escapeHtml(record.payment_voucher_number || '-')}</td></tr>
        <tr><th>Keterangan</th><td>${escapeHtml(record.notes || '-')}</td></tr>
      </table>

      <p class="notice">
        Ini adalah bukti internal FinStart. Dokumen ini bukan bukti setor resmi
        DJP dan bukan pengganti formulir resmi perpajakan.
      </p>

      <p class="footer">Dicetak dari FinStart Financial Management System.</p>
    `,
  )

  const printWindow = window.open('', '_blank', 'width=850,height=900')

  if (!printWindow) {
    errorMessage.value = 'Browser memblokir jendela cetak. Izinkan pop-up lalu coba lagi.'
    return
  }

  printWindow.document.write(receipt)
  printWindow.document.close()
}

function printPayrollReceipt(record) {
  const status = record.display_tax_status || record.tax_status
  const receipt = receiptShell(
    'Slip Payroll PPh 21 Internal FinStart',
    `
      <header class="header">
        <div class="brand">FINSTART</div>
        <h1 class="title">Slip Payroll & Estimasi PPh 21 Internal</h1>
        <p class="muted">Periode payroll: ${escapeHtml(formatPeriod(record.tax_period))}</p>
      </header>

      <table>
        <tr><th>Nama Pegawai</th><td>${escapeHtml(record.employee_name)}</td></tr>
        <tr><th>NIK / NPWP Internal</th><td>${escapeHtml(record.employee_nik || '-')}</td></tr>
        <tr><th>Jabatan</th><td>${escapeHtml(record.employee_position || '-')}</td></tr>
        <tr><th>Status PTKP</th><td>${escapeHtml(record.ptkp_status)}</td></tr>
        <tr><th>Kategori TER</th><td>${escapeHtml(record.ter_category)}</td></tr>
        <tr><th>Gaji Pokok</th><td>${escapeHtml(formatCurrency(record.base_salary))}</td></tr>
        <tr><th>Tunjangan</th><td>${escapeHtml(formatCurrency(record.allowance_amount))}</td></tr>
        <tr><th>Penghasilan Bruto</th><td>${escapeHtml(formatCurrency(record.gross_income))}</td></tr>
        <tr><th>Tarif TER</th><td>${escapeHtml(formatRate(record.ter_rate))}</td></tr>
        <tr><th>PPh 21 Dipotong</th><td>${escapeHtml(formatCurrency(record.pph21_amount))}</td></tr>
        <tr><th>Take Home Pay</th><td class="amount">${escapeHtml(formatCurrency(record.take_home_pay))}</td></tr>
        <tr><th>Status Payroll</th><td><span class="status">${escapeHtml(record.status === 'posted' ? 'Diposting' : 'Draft')}</span></td></tr>
        <tr><th>Voucher Payroll</th><td>${escapeHtml(record.payroll_voucher_number || '-')}</td></tr>
        <tr><th>Status Setoran PPh 21</th><td>${escapeHtml(taxStatusLabel(status))}</td></tr>
        <tr><th>NTPN</th><td>${escapeHtml(record.tax_number || '-')}</td></tr>
      </table>

      <p class="notice">
        Slip ini adalah dokumen internal FinStart untuk rincian payroll dan
        estimasi/pemotongan PPh 21. Slip ini bukan formulir resmi 1721-A1
        dan tidak menggantikan bukti potong resmi dari sistem DJP/Coretax.
      </p>

      <p class="footer">Dicetak dari FinStart Financial Management System.</p>
    `,
  )

  const printWindow = window.open('', '_blank', 'width=850,height=1000')

  if (!printWindow) {
    errorMessage.value = 'Browser memblokir jendela cetak. Izinkan pop-up lalu coba lagi.'
    return
  }

  printWindow.document.write(receipt)
  printWindow.document.close()
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function exportTaxes() {
  const rows = [
    ['FINSTART - RINGKASAN PERPAJAKAN'],
    ['Jenis Pajak', 'Periode', 'Nominal', 'Jatuh Tempo', 'Status', 'NTPN', 'Keterangan'],
    ...taxes.value.map((record) => [
      record.tax_type,
      formatPeriod(record.tax_period),
      numberValue(record.amount),
      formatDate(record.due_date),
      taxStatusLabel(record.display_status || record.status),
      record.tax_number || '',
      record.notes || '',
    ]),
  ]

  const csv = rows.map((row) => row.map(csvCell).join(';')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `finstart-perpajakan-${calculationPeriod.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function printTaxes() {
  window.print()
}

watch([keyword, selectedStatus, activeTab], () => {
  currentPage.value = 1
})
watch(calculationPeriod, loadCalculation)
watch(vatPeriod, loadVatSummary)

onMounted(async () => {
  await Promise.all([loadData(), loadCalculation(), loadVatSummary()])
})
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">TAX COMPLIANCE</p>
        <h1>Perpajakan</h1>
        <p>
          Hitung estimasi pajak usaha dan PPh 21 pegawai, catat kewajiban,
          setor pajak, lalu cetak bukti internal.
        </p>
      </div>

      <div class="page-button-group">
        <button type="button" class="secondary-button" @click="exportTaxes">
          Export CSV
        </button>

        <button type="button" class="secondary-button" @click="printTaxes">
          Cetak Laporan
        </button>

        <button
          type="button"
          class="primary-button"
          :disabled="isSaving"
          @click="openCreateTaxModal"
        >
          + Koreksi / Kewajiban Manual
        </button>
      </div>
    </div>

    <article v-if="errorMessage" class="tax-message error-message">
      {{ errorMessage }}
    </article>

    <article v-if="successMessage" class="tax-message success-message">
      {{ successMessage }}
    </article>

    <article class="panel vat-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">PPN MASA</p>
          <h3>Rekonsiliasi PPN Keluaran dan PPN Masukan</h3>
          <p>
            PPN Keluaran bersumber dari Invoice yang diberi PPN. PPN Masukan
            bersumber dari Tagihan Vendor yang diberi PPN kreditabel.
          </p>
        </div>

        <button
          type="button"
          class="table-action"
          :disabled="isVatClosing"
          @click="loadVatSummary"
        >
          Perbarui PPN
        </button>
      </div>

      <div class="vat-toolbar">
        <label>
          Masa PPN
          <input v-model="vatPeriod" type="month" />
        </label>

        <label>
          Jatuh Tempo Setor <span class="optional-label">(opsional)</span>
          <input v-model="vatDueDate" type="date" :disabled="vatIsClosed" />
        </label>

        <label class="vat-note-input">
          Catatan Penutupan <span class="optional-label">(opsional)</span>
          <input
            v-model="vatNotes"
            type="text"
            :disabled="vatIsClosed"
            placeholder="Contoh: Rekonsiliasi faktur masa berjalan"
          />
        </label>
      </div>

      <div class="vat-summary-grid">
        <div>
          <span>PPN Keluaran</span>
          <strong>{{ formatCurrency(vatSummary.output_vat) }}</strong>
          <small>{{ vatSummary.output_count || 0 }} invoice PPN posted</small>
        </div>

        <div>
          <span>PPN Masukan Kreditabel</span>
          <strong>{{ formatCurrency(vatSummary.input_vat) }}</strong>
          <small>{{ vatSummary.input_count || 0 }} tagihan PPN posted</small>
        </div>

        <div>
          <span>{{ vatPositionLabel }}</span>
          <strong>{{ formatCurrency(vatPositionAmount) }}</strong>
          <small>
            {{ vatIsClosed ? 'Masa sudah ditutup' : 'Belum ditutup' }}
          </small>
        </div>

        <div class="vat-action-card">
          <button
            type="button"
            class="primary-button"
            :disabled="isVatClosing || vatIsClosed"
            @click="closeVatPeriod"
          >
            {{
              vatIsClosed
                ? 'Masa PPN Ditutup'
                : (isVatClosing ? 'Menutup Masa...' : 'Tutup Masa PPN')
            }}
          </button>
          <small>
            Tutup masa hanya setelah seluruh invoice dan tagihan pada periode tersebut selesai direview.
          </small>
        </div>
      </div>

      <p class="vat-note">
        Kurang bayar akan menjadi kewajiban PPN untuk disetor. Lebih bayar
        dicatat sebagai aset PPN Lebih Bayar; tidak dibuat sebagai utang pajak.
      </p>
    </article>

    <article class="panel calculation-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">SIMULASI PAJAK USAHA</p>
          <h3>Estimasi PPh Final / PPh Badan</h3>
          <p>
            Panel ini hanya untuk simulasi pajak berbasis pendapatan atau laba.
            PPN dan PPh 23 diproses otomatis dari Invoice serta Tagihan Vendor.
          </p>
        </div>

        <button type="button" class="table-action" @click="loadCalculation">
          Perbarui Dasar
        </button>
      </div>

      <div class="calculation-summary">
        <div>
          <span>Pendapatan Posted</span>
          <strong>{{ formatCurrency(calculation.revenue) }}</strong>
        </div>

        <div>
          <span>Beban Posted</span>
          <strong>{{ formatCurrency(calculation.expense) }}</strong>
        </div>

        <div>
          <span>Laba Bersih</span>
          <strong>{{ formatCurrency(calculation.net_profit) }}</strong>
        </div>

        <div>
          <span>Jurnal Posted</span>
          <strong>{{ calculation.posted_journal_count }}</strong>
        </div>
      </div>

      <div class="calculation-form">
        <label>
          Periode
          <input v-model="calculationPeriod" type="month" />
        </label>

        <label>
          Jenis Pajak
          <select v-model="calculationTaxType">
            <option>PPh Final</option>
            <option>PPh Badan</option>
            <option>Lainnya</option>
          </select>
        </label>

        <label>
          Dasar Perhitungan
          <select v-model="calculationBasis">
            <option value="revenue">Pendapatan</option>
            <option value="net_profit">Laba Bersih</option>
          </select>
        </label>

        <label>
          Tarif Pajak (%)
          <input
            v-model.number="calculationRate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="Isi tarif"
          />
        </label>

        <label>
          Jatuh Tempo <span class="optional-label">(opsional)</span>
          <input v-model="calculationDueDate" type="date" />
        </label>
      </div>

      <div class="calculation-result">
        <div>
          <span>Dasar {{ calculationBasisLabel }}</span>
          <strong>{{ formatCurrency(calculationBaseValue) }}</strong>
        </div>

        <div>
          <span>Tarif Dipilih</span>
          <strong>{{ numberValue(calculationRate) }}%</strong>
        </div>

        <div>
          <span>Estimasi {{ calculationTaxType }}</span>
          <strong>{{ formatCurrency(estimatedBusinessTax) }}</strong>
        </div>

        <button
          type="button"
          class="primary-button"
          :disabled="isSaving || estimatedBusinessTax <= 0"
          @click="createBusinessTaxFromCalculation"
        >
          Buat Draft dari Kalkulasi
        </button>
      </div>
    </article>

    <article class="panel payroll-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">PPh 21 PEGAWAI</p>
          <h3>Payroll, Potongan PPh 21, dan Slip Internal</h3>
          <p>
            Input gaji bruto dan PTKP. Sistem memakai TER bulanan untuk
            pegawai tetap pada masa Januari–November.
          </p>
        </div>

        <button
          type="button"
          class="primary-button"
          :disabled="isSaving"
          @click="openPayrollModal"
        >
          + Hitung Payroll PPh 21
        </button>
      </div>

      <div class="payroll-note">
        Saat payroll diposting, sistem membuat jurnal:
        <b>Debit Beban Gaji</b> sebesar bruto,
        <b>Kredit Kas/Bank</b> sebesar take home pay, dan
        <b>Kredit Utang Pajak</b> sebesar PPh 21.
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Pegawai</th>
              <th>Periode / PTKP</th>
              <th>Bruto</th>
              <th>TER</th>
              <th>PPh 21</th>
              <th>Take Home Pay</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="record in payrollTaxes" :key="record.id">
              <td>
                <strong>{{ record.employee_name }}</strong>
                <small class="table-subtext">
                  {{ record.employee_position || '-' }} ·
                  {{ record.employee_nik || 'NIK belum diisi' }}
                </small>
              </td>

              <td>
                <strong>{{ formatPeriod(record.tax_period) }}</strong>
                <small class="table-subtext">
                  {{ record.ptkp_status }} / Kategori {{ record.ter_category }}
                </small>
              </td>

              <td>{{ formatCurrency(record.gross_income) }}</td>
              <td>{{ formatRate(record.ter_rate) }}</td>
              <td>{{ formatCurrency(record.pph21_amount) }}</td>
              <td><strong>{{ formatCurrency(record.take_home_pay) }}</strong></td>

              <td>
                <span
                  class="status-badge"
                  :class="statusClass(record.status === 'posted' ? 'paid' : 'draft')"
                >
                  {{ record.status === 'posted' ? 'Payroll Diposting' : 'Draft Payroll' }}
                </span>
              </td>

              <td class="action-cell">
                <button
                  v-if="record.status === 'draft'"
                  type="button"
                  class="table-action"
                  :disabled="isSaving"
                  @click="openPostPayrollModal(record)"
                >
                  Post Gaji
                </button>

                <button
                  type="button"
                  class="table-action"
                  @click="printPayrollReceipt(record)"
                >
                  Cetak Slip
                </button>

                <span
                  v-if="record.status === 'posted' && record.pph21_amount > 0"
                  class="table-subtext"
                >
                  {{ taxStatusLabel(record.display_tax_status) }}
                </span>
              </td>
            </tr>

            <tr v-if="payrollTaxes.length === 0">
              <td colspan="8" class="empty-table">
                Belum ada data payroll PPh 21.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="payroll-disclaimer">
        Slip Payroll PPh 21 yang dicetak dari FinStart adalah dokumen internal.
        Formulir resmi 1721-A1 tetap diterbitkan melalui proses/sistem DJP yang berlaku.
      </p>
    </article>

    <div class="tax-metrics">
      <article class="tax-stat">
        <p>PPN Kurang Bayar</p>
        <h2>{{ formatCurrency(summary.ppn_due) }}</h2>
        <small>PPN yang belum disetor</small>
      </article>

      <article class="tax-stat">
        <p>PPh 21</p>
        <h2>{{ formatCurrency(summary.pph21_due) }}</h2>
        <small>Termasuk payroll PPh 21 yang belum disetor</small>
      </article>

      <article class="tax-stat">
        <p>PPh 23</p>
        <h2>{{ formatCurrency(summary.pph23_due) }}</h2>
        <small>Kewajiban PPh 23 belum disetor</small>
      </article>

      <article class="tax-stat">
        <p>Status Kepatuhan</p>
        <h2>{{ summary.compliance_status }}</h2>
        <small>{{ summary.overdue_count }} kewajiban melewati jatuh tempo</small>
      </article>
    </div>

    <article class="tax-highlight">
      <div>
        <span>Total Pajak Belum Dibayar</span>
        <strong>{{ formatCurrency(summary.total_unpaid) }}</strong>
      </div>

      <p>
        Draft belum memengaruhi saldo. Jurnal dibuat saat kewajiban pajak
        diterbitkan atau payroll diposting.
      </p>
    </article>

    <div class="module-toolbar">
      <div class="filter-group">
        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'unpaid' }"
          @click="activeTab = 'unpaid'"
        >
          Belum Dibayar
        </button>

        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'paid' }"
          @click="activeTab = 'paid'"
        >
          Riwayat Setoran
        </button>

        <select v-model="selectedStatus" class="filter-select">
          <option value="all">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="unpaid">Menunggu Pembayaran</option>
          <option value="overdue">Terlambat</option>
          <option value="paid">Sudah Disetor</option>
        </select>
      </div>

      <div class="filter-group">
        <input
          v-model="keyword"
          class="module-search"
          type="text"
          placeholder="Cari pajak, periode, pegawai, NTPN, atau status..."
        />

        <button
          type="button"
          class="table-action"
          :disabled="isLoading"
          @click="loadData"
        >
          {{ isLoading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Kewajiban dan Setoran Pajak</h3>
          <p>
            Cetak bukti internal setiap pajak. Untuk PPh 21 dari payroll,
            gunakan panel Payroll agar jurnal gaji dan potongan benar.
          </p>
        </div>

        <span class="table-count">{{ filteredTaxes.length }} data</span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Jenis Pajak</th>
              <th>Periode</th>
              <th>Keterangan</th>
              <th>Nominal</th>
              <th>Jatuh Tempo</th>
              <th>Status</th>
              <th>NTPN</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="record in paginatedTaxes" :key="record.id">
              <td>
                <span class="tax-type-badge">{{ record.tax_type }}</span>
                <small v-if="record.payroll_employee_name" class="table-subtext">
                  Pegawai: {{ record.payroll_employee_name }}
                </small>
              </td>

              <td>{{ formatPeriod(record.tax_period) }}</td>

              <td>
                <span>{{ record.notes || '-' }}</span>
                <small v-if="record.obligation_voucher_number" class="table-subtext">
                  Jurnal: {{ record.obligation_voucher_number }}
                </small>
              </td>

              <td><strong>{{ formatCurrency(record.amount) }}</strong></td>
              <td>{{ formatDate(record.due_date) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="statusClass(record.display_status || record.status)"
                >
                  {{ taxStatusLabel(record.display_status || record.status) }}
                </span>
              </td>

              <td>
                <span>{{ record.tax_number || 'Belum tersedia' }}</span>
                <small v-if="record.payment_voucher_number" class="table-subtext">
                  {{ record.payment_voucher_number }}
                </small>
              </td>

              <td class="action-cell">
                <button
                  type="button"
                  class="table-action"
                  @click="printTaxReceipt(record)"
                >
                  Cetak Struk
                </button>

                <button
                  v-if="record.status === 'draft' && !record.payroll_calculation_id"
                  type="button"
                  class="table-action"
                  :disabled="isSaving"
                  @click="openIssueTaxModal(record)"
                >
                  Terbitkan
                </button>

                <button
                  v-if="record.status === 'draft' && !record.payroll_calculation_id"
                  type="button"
                  class="table-action danger-action"
                  :disabled="isSaving"
                  @click="deleteDraft(record)"
                >
                  Hapus
                </button>

                <button
                  v-if="['unpaid', 'overdue'].includes(record.display_status || record.status)"
                  type="button"
                  class="table-action"
                  :disabled="isSaving"
                  @click="openTaxPaymentModal(record)"
                >
                  Setor Pajak
                </button>

                <span
                  v-if="record.status === 'draft' && record.payroll_calculation_id"
                  class="table-subtext"
                >
                  Post melalui Payroll
                </span>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredTaxes.length === 0">
              <td colspan="8" class="empty-table">
                Belum ada data pajak pada filter yang dipilih.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
          <div class="text-xs text-[#6B7A90]">
            Menampilkan {{ Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredTaxes.length) }} - {{ Math.min(currentPage * PAGE_SIZE, filteredTaxes.length) }} dari {{ filteredTaxes.length }} data
          </div>
          <div class="flex items-center gap-2">
            <button
              :disabled="currentPage <= 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
              class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg class="w-3 h-3 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              Prev
            </button>
            <button
              :disabled="currentPage >= Math.ceil(filteredTaxes.length / PAGE_SIZE)"
              @click="currentPage = currentPage + 1"
              class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <svg class="w-3 h-3 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </article>

    <!-- Modal: Pajak manual -->
    <div
      v-if="showCreateTaxModal"
      class="modal-backdrop"
      @click.self="closeCreateTaxModal"
    >
      <form class="modal-card" @submit.prevent="createManualTax">
        <div class="modal-header">
          <div>
            <p class="eyebrow">PERPAJAKAN</p>
            <h3>Koreksi / Kewajiban Pajak Manual</h3>
            <p class="modal-tax-note">
              Gunakan untuk PPh Final, PPh Badan, atau pajak lain yang tidak bersumber dari payroll, invoice, dan tagihan vendor.
            </p>
          </div>

          <button type="button" class="modal-close" @click="closeCreateTaxModal">×</button>
        </div>

        <div class="form-grid">
          <label>
            Jenis Pajak
            <select v-model="taxForm.tax_type" required>
              <option>PPh Final</option>
              <option>PPh Badan</option>
              <option>Lainnya</option>
            </select>
          </label>

          <label>
            Periode Pajak
            <input v-model="taxForm.tax_period" type="month" required />
          </label>

          <label>
            Nominal Pajak
            <input v-model.number="taxForm.amount" type="number" min="1" required />
          </label>

          <label>
            Jatuh Tempo <span class="optional-label">(opsional)</span>
            <input v-model="taxForm.due_date" type="date" />
          </label>

          <label class="full-width">
            Nomor Referensi <span class="optional-label">(opsional)</span>
            <input
              v-model="taxForm.tax_number"
              type="text"
              placeholder="Nomor e-Billing atau referensi internal"
            />
          </label>

          <label class="full-width">
            Keterangan <span class="optional-label">(opsional)</span>
            <input
              v-model="taxForm.notes"
              type="text"
              placeholder="Contoh: Koreksi pajak periode berjalan"
            />
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closeCreateTaxModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Draft Pajak' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal: hitung payroll PPh 21 -->
    <div
      v-if="showPayrollModal"
      class="modal-backdrop"
      @click.self="closePayrollModal"
    >
      <form class="modal-card payroll-modal" @submit.prevent="createPayrollDraft">
        <div class="modal-header">
          <div>
            <p class="eyebrow">PAYROLL PPh 21</p>
            <h3>Hitung Gaji dan PPh 21 Pegawai</h3>
          </div>

          <button type="button" class="modal-close" @click="closePayrollModal">×</button>
        </div>

        <div class="form-grid">
          <label>
            Nama Pegawai
            <input
              v-model="payrollForm.employee_name"
              type="text"
              placeholder="Nama pegawai"
              required
            />
          </label>

          <label>
            Jabatan <span class="optional-label">(opsional)</span>
            <input
              v-model="payrollForm.employee_position"
              type="text"
              placeholder="Contoh: Staff Finance"
            />
          </label>

          <label>
            NIK / NPWP <span class="optional-label">(opsional)</span>
            <input
              v-model="payrollForm.employee_nik"
              type="text"
              placeholder="Nomor identitas pegawai"
            />
          </label>

          <label>
            Periode Gaji
            <input v-model="payrollForm.tax_period" type="month" required />
          </label>

          <label>
            Status PTKP
            <select v-model="payrollForm.ptkp_status" required>
              <option value="TK/0">TK/0 — Kategori TER A</option>
              <option value="TK/1">TK/1 — Kategori TER A</option>
              <option value="K/0">K/0 — Kategori TER A</option>
              <option value="TK/2">TK/2 — Kategori TER B</option>
              <option value="TK/3">TK/3 — Kategori TER B</option>
              <option value="K/1">K/1 — Kategori TER B</option>
              <option value="K/2">K/2 — Kategori TER B</option>
              <option value="K/3">K/3 — Kategori TER C</option>
            </select>
          </label>

          <label>
            Gaji Pokok
            <input
              v-model.number="payrollForm.base_salary"
              type="number"
              min="0"
              required
            />
          </label>

          <label>
            Tunjangan
            <input
              v-model.number="payrollForm.allowance_amount"
              type="number"
              min="0"
            />
          </label>

          <label>
            Jatuh Tempo Setor PPh 21 <span class="optional-label">(opsional)</span>
            <input v-model="payrollForm.due_date" type="date" />
          </label>
        </div>

        <div class="payroll-calc-actions">
          <button
            type="button"
            class="secondary-button"
            :disabled="isSaving"
            @click="calculatePayrollPph21"
          >
            {{ isSaving ? 'Menghitung...' : 'Hitung PPh 21' }}
          </button>
        </div>

        <div v-if="payrollPreview" class="payroll-preview">
          <template v-if="!payrollPreview.needs_final_reconciliation">
            <div>
              <span>Penghasilan Bruto</span>
              <strong>{{ formatCurrency(payrollPreview.gross_income) }}</strong>
            </div>

            <div>
              <span>Kategori / TER</span>
              <strong>
                {{ payrollPreview.ter_category }} / {{ formatRate(payrollPreview.ter_rate) }}
              </strong>
            </div>

            <div>
              <span>PPh 21</span>
              <strong>{{ formatCurrency(payrollPreview.pph21_amount) }}</strong>
            </div>

            <div>
              <span>Take Home Pay</span>
              <strong>{{ formatCurrency(payrollPreview.take_home_pay) }}</strong>
            </div>
          </template>

          <p v-else class="payroll-final-period-warning">
            {{ payrollPreview.message }}
          </p>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closePayrollModal">
            Batal
          </button>

          <button
            type="submit"
            class="primary-button"
            :disabled="isSaving || !payrollPreview || payrollPreview.needs_final_reconciliation"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan Draft Payroll' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal: post payroll -->
    <div
      v-if="showPostPayrollModal"
      class="modal-backdrop"
      @click.self="closePostPayrollModal"
    >
      <form class="modal-card" @submit.prevent="postPayroll">
        <div class="modal-header">
          <div>
            <p class="eyebrow">POST PAYROLL</p>
            <h3>Catat Gaji dan PPh 21</h3>
          </div>

          <button type="button" class="modal-close" @click="closePostPayrollModal">×</button>
        </div>

        <div class="journal-preview">
          <p><span>Pegawai</span><strong>{{ selectedPayrollPost?.employee_name }}</strong></p>
          <p><span>Bruto</span><strong>{{ formatCurrency(selectedPayrollPost?.gross_income) }}</strong></p>
          <p><span>PPh 21</span><strong>{{ formatCurrency(selectedPayrollPost?.pph21_amount) }}</strong></p>
          <p><span>Take Home Pay</span><strong>{{ formatCurrency(selectedPayrollPost?.take_home_pay) }}</strong></p>
        </div>

        <div class="form-grid">
          <label>
            Akun Beban Gaji
            <select v-model="payrollPostForm.salary_expense_account_id" required>
              <option value="">Pilih akun beban</option>
              <option
                v-for="account in expenseAccounts"
                :key="account.id"
                :value="String(account.id)"
              >
                {{ account.code }} — {{ account.name }}
              </option>
            </select>
          </label>

          <label>
            Akun Pembayaran Gaji
            <select v-model="payrollPostForm.cash_account_id" required>
              <option value="">Pilih Kas/Bank</option>
              <option
                v-for="account in cashAccounts"
                :key="account.id"
                :value="String(account.id)"
              >
                {{ account.code }} — {{ account.name }}
              </option>
            </select>
          </label>

          <label class="full-width">
            Tanggal Payroll
            <input v-model="payrollPostForm.payroll_date" type="date" required />
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closePostPayrollModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Memposting...' : 'Post Payroll' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal: terbitkan pajak biasa -->
    <div
      v-if="showIssueTaxModal"
      class="modal-backdrop"
      @click.self="closeIssueTaxModal"
    >
      <form class="modal-card" @submit.prevent="issueTax">
        <div class="modal-header">
          <div>
            <p class="eyebrow">TERBITKAN KEWAJIBAN</p>
            <h3>Pilih Akun Beban</h3>
          </div>

          <button type="button" class="modal-close" @click="closeIssueTaxModal">×</button>
        </div>

        <p class="issue-description">
          Kewajiban <strong>{{ selectedIssueTax?.tax_type }}</strong> sebesar
          <strong>{{ formatCurrency(selectedIssueTax?.amount) }}</strong>
          akan membuat jurnal otomatis.
        </p>

        <div class="journal-preview">
          <p><span>Debit</span><strong>Akun Beban yang dipilih</strong></p>
          <p><span>Kredit</span><strong>2200 — Utang Pajak</strong></p>
        </div>

        <label class="single-form-label">
          Akun Beban
          <select v-model="issueTaxForm.expense_account_id" required>
            <option value="">Pilih akun beban</option>
            <option
              v-for="account in expenseAccounts"
              :key="account.id"
              :value="String(account.id)"
            >
              {{ account.code }} — {{ account.name }}
            </option>
          </select>
        </label>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closeIssueTaxModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menerbitkan...' : 'Terbitkan Kewajiban' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal: setor pajak -->
    <div
      v-if="showPayTaxModal"
      class="modal-backdrop"
      @click.self="closeTaxPaymentModal"
    >
      <form class="modal-card" @submit.prevent="payTax">
        <div class="modal-header">
          <div>
            <p class="eyebrow">SETOR PAJAK</p>
            <h3>Konfirmasi Setoran Pajak</h3>
          </div>

          <button type="button" class="modal-close" @click="closeTaxPaymentModal">×</button>
        </div>

        <div class="form-grid">
          <label class="full-width">
            Kewajiban Pajak
            <select v-model="taxPaymentForm.tax_id" required>
              <option value="">Pilih kewajiban pajak</option>
              <option
                v-for="record in payableTaxes"
                :key="record.id"
                :value="String(record.id)"
              >
                {{ record.tax_type }} — {{ formatPeriod(record.tax_period) }}
              </option>
            </select>
          </label>

          <label>
            Akun Pembayaran
            <select v-model="taxPaymentForm.cash_account_id" required>
              <option value="">Pilih Kas/Bank</option>
              <option
                v-for="account in cashAccounts"
                :key="account.id"
                :value="String(account.id)"
              >
                {{ account.code }} — {{ account.name }}
              </option>
            </select>
          </label>

          <label>
            Tanggal Setoran
            <input v-model="taxPaymentForm.payment_date" type="date" required />
          </label>

          <label class="full-width">
            NTPN / Nomor Bukti Setor
            <input
              v-model="taxPaymentForm.tax_number"
              type="text"
              placeholder="Contoh: 1234567890123456"
              required
            />
          </label>

          <label class="full-width">
            Catatan <span class="optional-label">(opsional)</span>
            <input
              v-model="taxPaymentForm.notes"
              type="text"
              placeholder="Keterangan setoran pajak"
            />
          </label>
        </div>

        <div v-if="selectedTaxPayment" class="payment-summary">
          <p>Jenis pajak: <strong>{{ selectedTaxPayment.tax_type }}</strong></p>
          <p>Nominal setoran: <strong>{{ formatCurrency(selectedTaxPayment.amount) }}</strong></p>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closeTaxPaymentModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Konfirmasi Setoran Pajak' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.tax-message { border-radius: 10px; padding: 12px 14px; font-size: 13px; }
.error-message { border: 1px solid #f3c7c7; background: #fff6f6; color: #a84343; }
.success-message { border: 1px solid #bfe8d0; background: #f1fff6; color: #23774b; }
.calculation-panel, .payroll-panel { margin-bottom: 18px; }
.calculation-summary, .payroll-preview { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.calculation-summary > div, .calculation-result > div, .payroll-preview > div { border: 1px solid #e3eaf3; border-radius: 10px; padding: 13px; background: #fbfdff; }
.calculation-summary span, .calculation-summary strong, .calculation-result span, .calculation-result strong, .payroll-preview span, .payroll-preview strong { display: block; }
.calculation-summary span, .calculation-result span, .payroll-preview span { color: #7e90a9; font-size: 11px; }
.calculation-summary strong, .calculation-result strong, .payroll-preview strong { margin-top: 7px; color: #153d67; font-size: 15px; }
.calculation-form { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.calculation-form label { display: grid; gap: 6px; color: #58708e; font-size: 11px; font-weight: 700; }
.calculation-form input, .calculation-form select { width: 100%; box-sizing: border-box; border: 1px solid #dbe5f0; border-radius: 8px; padding: 10px; background: white; color: #344f6d; outline: none; }
.calculation-result { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: stretch; gap: 12px; margin-top: 14px; }
.calculation-result .primary-button { display: grid; place-items: center; text-align: center; }
.payroll-note { margin: 15px 0; border-left: 3px solid #4b86bd; padding: 9px 12px; background: #f4f9ff; color: #52718e; font-size: 12px; line-height: 1.55; }
.payroll-disclaimer { margin: 15px 0 0; color: #8192a8; font-size: 11px; line-height: 1.5; }
.tax-highlight { display: flex; align-items: center; justify-content: space-between; gap: 22px; border: 1px solid #d9e8f5; border-radius: 11px; padding: 17px; background: #f4faff; }
.tax-highlight span, .tax-highlight strong { display: block; }
.tax-highlight span { color: #6d87a7; font-size: 12px; }
.tax-highlight strong { margin-top: 6px; color: #153d67; font-size: 20px; }
.tax-highlight p { max-width: 390px; margin: 0; color: #6983a1; font-size: 12px; line-height: 1.55; }
.tab-button { border: 1px solid #d9e3ef; border-radius: 8px; padding: 9px 12px; background: white; color: #5d728e; cursor: pointer; font-size: 12px; font-weight: 700; }
.tab-button.active { border-color: #1f5f9b; background: #1f5f9b; color: white; }
.tax-type-badge { display: inline-flex; border-radius: 999px; padding: 5px 9px; background: #edf5ff; color: #2c5f93; font-size: 11px; font-weight: 800; }
.action-cell { display: flex; flex-wrap: wrap; gap: 6px; }
.danger-action { border-color: #f2c7c7; color: #b34c4c; }
.optional-label { color: #8d9cb3; font-size: 10px; font-weight: 500; }
.payroll-modal { width: min(900px, calc(100vw - 32px)); }
.payroll-calc-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
.payroll-preview { margin-top: 16px; }
.payroll-final-period-warning { grid-column: 1 / -1; margin: 0; border-radius: 8px; padding: 12px; background: #fff7e7; color: #966e1e; font-size: 12px; line-height: 1.5; }
.issue-description { margin: 2px 0 14px; color: #5f7490; font-size: 13px; line-height: 1.55; }
.journal-preview { display: grid; gap: 7px; margin-bottom: 16px; border: 1px solid #dbe8f5; border-radius: 10px; padding: 13px; background: #f6fbff; }
.journal-preview p { display: flex; justify-content: space-between; gap: 12px; margin: 0; color: #57708e; font-size: 12px; }
.journal-preview span { font-weight: 800; }
.single-form-label { display: grid; gap: 7px; color: #526b89; font-size: 12px; font-weight: 700; }
.single-form-label select { border: 1px solid #dbe5f0; border-radius: 8px; padding: 10px 11px; background: white; color: #344f6d; outline: none; }
@media (max-width: 980px) {
  .calculation-summary, .calculation-result, .payroll-preview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .calculation-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 680px) {
  .calculation-summary, .calculation-result, .calculation-form, .payroll-preview { grid-template-columns: 1fr; }
  .tax-highlight { align-items: flex-start; flex-direction: column; }
  .tax-highlight p { max-width: none; }
}
@media print {
  .page-heading .page-button-group, .module-toolbar, .modal-backdrop { display: none !important; }
}

.vat-panel { margin-bottom: 18px; }
.vat-toolbar {
  display: grid;
  grid-template-columns: 180px 190px minmax(240px, 1fr);
  gap: 12px;
  margin-top: 14px;
}
.vat-toolbar label {
  display: grid;
  gap: 6px;
  color: #58708e;
  font-size: 11px;
  font-weight: 700;
}
.vat-toolbar input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dbe5f0;
  border-radius: 8px;
  padding: 10px;
  background: white;
  color: #344f6d;
  outline: none;
}
.vat-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.vat-summary-grid > div {
  border: 1px solid #e3eaf3;
  border-radius: 10px;
  padding: 13px;
  background: #fbfdff;
}
.vat-summary-grid span,
.vat-summary-grid strong,
.vat-summary-grid small { display: block; }
.vat-summary-grid span { color: #7e90a9; font-size: 11px; }
.vat-summary-grid strong { margin-top: 7px; color: #153d67; font-size: 15px; }
.vat-summary-grid small { margin-top: 6px; color: #8b9bad; font-size: 10px; line-height: 1.4; }
.vat-action-card { display: grid; align-content: space-between; gap: 10px; }
.vat-action-card .primary-button { min-height: 40px; }
.vat-note {
  margin: 14px 0 0;
  border-left: 3px solid #4b86bd;
  padding: 9px 12px;
  background: #f4f9ff;
  color: #52718e;
  font-size: 12px;
  line-height: 1.55;
}
.modal-tax-note {
  margin: 6px 0 0;
  color: #70849d;
  font-size: 11px;
  line-height: 1.45;
}
@media (max-width: 980px) {
  .vat-toolbar, .vat-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .vat-note-input { grid-column: 1 / -1; }
}
@media (max-width: 680px) {
  .vat-toolbar, .vat-summary-grid { grid-template-columns: 1fr; }
  .vat-note-input { grid-column: auto; }
}

</style>
