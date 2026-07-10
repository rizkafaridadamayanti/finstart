<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const bills = ref([])
const projects = ref([])
const accounts = ref([])

const summary = ref({
  total_payable: 0,
  total_overdue: 0,
  total_paid: 0,
  draft_count: 0,
  open_count: 0,
  overdue_count: 0,
  aging: {
    days_0_30: 0,
    days_31_60: 0,
    days_61_90: 0,
    days_over_90: 0,
  },
})

const keyword = ref('')
const selectedStatus = ref('all')
const isLoading = ref(false)
const currentPage = ref(1)
const PAGE_SIZE = 10
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const showBillModal = ref(false)
const showIssueModal = ref(false)
const showPaymentModal = ref(false)
const editingBillId = ref('')

const today = new Date().toISOString().slice(0, 10)

function numberValue(value) {
  return Number(value || 0)
}

function createBillForm() {
  return {
    vendor_name: '',
    project_id: '',
    bill_number: '',
    bill_date: today,
    due_date: '',
    notes: '',
    tax: {
      ppn_enabled: false,
      ppn_rate: 0,
      pph23_enabled: false,
      pph23_rate: 2,
      pph23_object: 'Jasa',
      vendor_has_npwp: true,
    },
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  }
}

function createIssueForm() {
  return {
    bill_id: '',
    expense_account_id: '',
  }
}

function createPaymentForm() {
  return {
    bill_id: '',
    payment_date: today,
    payment_method: 'Transfer Bank',
    amount: 0,
    reference_number: '',
    notes: '',
    cash_account_id: '',
  }
}

const billForm = ref(createBillForm())
const issueForm = ref(createIssueForm())
const paymentForm = ref(createPaymentForm())

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

const billTotal = computed(() => {
  return billForm.value.items.reduce((total, item) => {
    return total + numberValue(item.quantity) * numberValue(item.unit_price)
  }, 0)
})

const billPpnAmount = computed(() => {
  if (!billForm.value.tax.ppn_enabled) return 0

  return Math.round(
    (billTotal.value * numberValue(billForm.value.tax.ppn_rate)) / 100,
  )
})

const billPph23EffectiveRate = computed(() => {
  if (!billForm.value.tax.pph23_enabled) return 0

  const baseRate = numberValue(billForm.value.tax.pph23_rate)

  return billForm.value.tax.vendor_has_npwp ? baseRate : baseRate * 2
})

const billPph23Amount = computed(() => {
  if (!billForm.value.tax.pph23_enabled) return 0

  return Math.round(
    (billTotal.value * billPph23EffectiveRate.value) / 100,
  )
})

const billGrossTotal = computed(() => {
  return billTotal.value + billPpnAmount.value
})

const billVendorPayable = computed(() => {
  return billGrossTotal.value - billPph23Amount.value
})

const filteredBills = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  const filtered = bills.value.filter((bill) => {
    const status = String(bill.display_status || bill.status || '').toLowerCase()

    const matchesStatus =
      selectedStatus.value === 'all' || status === selectedStatus.value

    const matchesSearch =
      !search ||
      [
        bill.bill_number,
        bill.vendor_name,
        bill.project_name,
        status,
      ].some((value) => String(value || '').toLowerCase().includes(search))

    return matchesStatus && matchesSearch
  })

  return filtered.sort((a, b) => {
    const dateA = a.due_date ? new Date(a.due_date) : (a.bill_date ? new Date(a.bill_date) : (a.created_at ? new Date(a.created_at) : new Date(0)))
    const dateB = b.due_date ? new Date(b.due_date) : (b.bill_date ? new Date(b.bill_date) : (b.created_at ? new Date(b.created_at) : new Date(0)))
    return dateB - dateA
  })
})

const paginatedBills = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredBills.value.slice(start, start + PAGE_SIZE)
})

const selectedIssueBill = computed(() => {
  return bills.value.find((bill) => Number(bill.id) === Number(issueForm.value.bill_id))
})

const selectedPaymentBill = computed(() => {
  return bills.value.find((bill) => Number(bill.id) === Number(paymentForm.value.bill_id))
})

const paymentOutstanding = computed(() => {
  return numberValue(selectedPaymentBill.value?.outstanding_amount)
})

const openBills = computed(() => {
  return bills.value.filter((bill) => {
    const status = bill.display_status || bill.status

    return ['unpaid', 'partial', 'overdue'].includes(status) &&
      numberValue(bill.outstanding_amount) > 0
  })
})

const agingCards = computed(() => [
  { label: '0–30 Hari', value: summary.value.aging?.days_0_30 || 0 },
  { label: '31–60 Hari', value: summary.value.aging?.days_31_60 || 0 },
  { label: '61–90 Hari', value: summary.value.aging?.days_61_90 || 0 },
  { label: '> 90 Hari', value: summary.value.aging?.days_over_90 || 0 },
])

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue(value))
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

function statusLabel(status) {
  return {
    draft: 'Draft',
    unpaid: 'Belum Dibayar',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
    overdue: 'Terlambat',
    cancelled: 'Dibatalkan',
  }[status] || status || '-'
}

function statusClass(status) {
  return {
    warning: ['draft', 'partial'].includes(status),
    danger: status === 'overdue',
    success: status === 'paid',
  }
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

async function loadData() {
  isLoading.value = true
  clearMessages()

  try {
    const [billsResponse, summaryResponse, projectsResponse, accountsResponse] =
      await Promise.all([
        api.get('/bills'),
        api.get('/bills/summary'),
        api.get('/projects'),
        api.get('/accounts'),
      ])

    bills.value = billsResponse.data.data || []
    projects.value = projectsResponse.data.data || []
    accounts.value = accountsResponse.data.data || []

    summary.value = {
      ...summary.value,
      ...(summaryResponse.data.data || {}),
      aging: {
        ...summary.value.aging,
        ...(summaryResponse.data.data?.aging || {}),
      },
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data utang. Pastikan backend FinStart berjalan.',
    )
  } finally {
    isLoading.value = false
  }
}

function openBillModal() {
  clearMessages()
  billForm.value = createBillForm()
  editingBillId.value = ''
  showBillModal.value = true
}

async function openEditBillModal(bill) {
  clearMessages()

  if (bill.status !== 'draft') {
    errorMessage.value = 'Hanya tagihan draft yang dapat diubah. Tagihan yang sudah diterbitkan harus dibatalkan atau dikoreksi dengan jurnal.'
    return
  }

  isSaving.value = true

  try {
    const response = await api.get(`/bills/${bill.id}`)
    const detail = response.data.data || bill

    billForm.value = {
      vendor_name: detail.vendor_name || '',
      project_id: detail.project_id ? String(detail.project_id) : '',
      bill_number: detail.bill_number || '',
      bill_date: String(detail.bill_date || today).slice(0, 10),
      due_date: String(detail.due_date || '').slice(0, 10),
      notes: detail.notes || '',
      tax: {
        ppn_enabled: Boolean(detail.ppn_enabled),
        ppn_rate: numberValue(detail.ppn_rate),
        pph23_enabled: numberValue(detail.pph23_amount) > 0,
        pph23_rate: numberValue(detail.pph23_rate) || 2,
        pph23_object: detail.pph23_object || 'Jasa',
        vendor_has_npwp: detail.vendor_has_npwp !== false,
      },
      items: Array.isArray(detail.items) && detail.items.length
        ? detail.items.map((item) => ({
          description: item.description || '',
          quantity: numberValue(item.quantity || 1),
          unit_price: numberValue(item.unit_price),
        }))
        : createBillForm().items,
    }

    editingBillId.value = String(detail.id || bill.id)
    showBillModal.value = true
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal mengambil detail tagihan untuk diedit.')
  } finally {
    isSaving.value = false
  }
}

function closeBillModal() {
  showBillModal.value = false
  billForm.value = createBillForm()
  editingBillId.value = ''
}

function openIssueModal(bill) {
  clearMessages()

  const defaultExpense = expenseAccounts.value.find(
    (account) => String(account.code) === '5100',
  )

  issueForm.value = {
    bill_id: String(bill.id),
    expense_account_id: String(defaultExpense?.id || expenseAccounts.value[0]?.id || ''),
  }

  showIssueModal.value = true
}

function closeIssueModal() {
  showIssueModal.value = false
  issueForm.value = createIssueForm()
}

function openPaymentModal(bill = null) {
  clearMessages()

  const target = bill || openBills.value[0]

  if (!target) {
    errorMessage.value =
      'Belum ada tagihan aktif yang dapat dibayar. Terbitkan tagihan draft terlebih dahulu.'
    return
  }

  const bankAccount = cashAccounts.value.find(
    (account) => String(account.code) === '1120',
  )

  paymentForm.value = {
    ...createPaymentForm(),
    bill_id: String(target.id),
    amount: numberValue(target.outstanding_amount),
    cash_account_id: String(bankAccount?.id || cashAccounts.value[0]?.id || ''),
  }

  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
  paymentForm.value = createPaymentForm()
}

function addItem() {
  billForm.value.items.push({
    description: '',
    quantity: 1,
    unit_price: 0,
  })
}

function removeItem(index) {
  if (billForm.value.items.length > 1) {
    billForm.value.items.splice(index, 1)
  }
}

async function createBill() {
  clearMessages()

  if (!billForm.value.vendor_name.trim()) {
    errorMessage.value = 'Nama vendor wajib diisi.'
    return
  }

  if (!billForm.value.bill_date || !billForm.value.due_date) {
    errorMessage.value = 'Tanggal tagihan dan jatuh tempo wajib diisi.'
    return
  }

  if (billForm.value.due_date < billForm.value.bill_date) {
    errorMessage.value = 'Tanggal jatuh tempo tidak boleh lebih awal dari tanggal tagihan.'
    return
  }

  if (billTotal.value <= 0) {
    errorMessage.value = 'Total tagihan harus lebih dari Rp0.'
    return
  }

  isSaving.value = true

  try {
    const payload = {
      ...billForm.value,
      project_id: billForm.value.project_id
        ? Number(billForm.value.project_id)
        : null,
      items: billForm.value.items.map((item) => ({
        description: item.description,
        quantity: numberValue(item.quantity),
        unit_price: numberValue(item.unit_price),
      })),
      tax: {
        ppn_enabled: Boolean(billForm.value.tax.ppn_enabled),
        ppn_rate: numberValue(billForm.value.tax.ppn_rate),
        pph23_enabled: Boolean(billForm.value.tax.pph23_enabled),
        pph23_rate: numberValue(billForm.value.tax.pph23_rate),
        pph23_object: billForm.value.tax.pph23_object,
        vendor_has_npwp: Boolean(billForm.value.tax.vendor_has_npwp),
      },
    }

    const isEditing = Boolean(editingBillId.value)
    const response = isEditing
      ? await api.put(`/bills/${editingBillId.value}`, payload)
      : await api.post('/bills', payload)

    closeBillModal()
    successMessage.value =
      response.data.message ||
      (isEditing
        ? 'Tagihan draft berhasil diperbarui.'
        : 'Tagihan draft berhasil dibuat. Terbitkan untuk mencatat beban, utang vendor, PPN Masukan, dan/atau PPh 23.')

    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal membuat tagihan.')
  } finally {
    isSaving.value = false
  }
}

async function issueBill() {
  clearMessages()

  if (!issueForm.value.bill_id || !issueForm.value.expense_account_id) {
    errorMessage.value = 'Pilih akun beban sebelum menerbitkan tagihan.'
    return
  }

  const bill = selectedIssueBill.value
  const confirmed = window.confirm(
    `Terbitkan ${bill?.bill_number || 'tagihan ini'}?\n\nJurnal otomatis:\nDebit Beban (DPP)\nDebit PPN Masukan bila dipilih\nKredit Utang Vendor\nKredit Utang PPh 23 bila dipilih`,
  )

  if (!confirmed) return

  isSaving.value = true

  try {
    const response = await api.post(`/bills/${issueForm.value.bill_id}/issue`, {
      expense_account_id: Number(issueForm.value.expense_account_id),
    })

    closeIssueModal()
    successMessage.value =
      response.data.message ||
      'Tagihan berhasil diterbitkan dan jurnal otomatis diposting.'

    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal menerbitkan tagihan.')
  } finally {
    isSaving.value = false
  }
}

async function deleteDraft(bill) {
  clearMessages()

  if (!window.confirm(`Hapus draft ${bill.bill_number}?`)) return

  isSaving.value = true

  try {
    const response = await api.delete(`/bills/${bill.id}`)
    successMessage.value = response.data.message || 'Tagihan draft dihapus.'
    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal menghapus tagihan draft.')
  } finally {
    isSaving.value = false
  }
}

async function savePayment() {
  clearMessages()

  if (!paymentForm.value.bill_id || !paymentForm.value.cash_account_id) {
    errorMessage.value = 'Pilih tagihan dan akun Kas/Bank.'
    return
  }

  if (
    numberValue(paymentForm.value.amount) <= 0 ||
    numberValue(paymentForm.value.amount) > paymentOutstanding.value
  ) {
    errorMessage.value = 'Nominal pembayaran tidak valid.'
    return
  }

  isSaving.value = true

  try {
    const response = await api.post(
      `/bills/${paymentForm.value.bill_id}/payments`,
      {
        payment_date: paymentForm.value.payment_date,
        payment_method: paymentForm.value.payment_method,
        amount: numberValue(paymentForm.value.amount),
        reference_number: paymentForm.value.reference_number,
        notes: paymentForm.value.notes,
        cash_account_id: Number(paymentForm.value.cash_account_id),
      },
    )

    closePaymentModal()
    successMessage.value =
      response.data.message ||
      'Pembayaran utang berhasil dicatat dan jurnal otomatis diposting.'

    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal mencatat pembayaran utang.')
  } finally {
    isSaving.value = false
  }
}

watch([keyword, selectedStatus], () => {
  currentPage.value = 1
})

onMounted(loadData)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">ACCOUNTS PAYABLE</p>
        <h1>Utang</h1>
        <p>
          Kelola tagihan vendor, sisa utang, dan pembayaran yang tersambung ke
          jurnal, kas, dashboard, serta laporan keuangan.
        </p>
      </div>

      <div class="page-button-group">
        <button
          type="button"
          class="secondary-button"
          :disabled="isSaving"
          @click="openPaymentModal()"
        >
          Catat Pembayaran Utang
        </button>

        <button
          type="button"
          class="primary-button"
          :disabled="isSaving"
          @click="openBillModal"
        >
          + Buat Tagihan Baru
        </button>
      </div>
    </div>

    <article v-if="errorMessage" class="payable-message error-message">
      {{ errorMessage }}
    </article>

    <article v-if="successMessage" class="payable-message success-message">
      {{ successMessage }}
    </article>

    <div class="payable-metrics">
      <article class="payable-stat">
        <p>Total Utang Berjalan</p>
        <h2>{{ formatCurrency(summary.total_payable) }}</h2>
        <small>{{ summary.open_count }} tagihan belum lunas</small>
      </article>

      <article class="payable-stat">
        <p>Utang Terlambat</p>
        <h2>{{ formatCurrency(summary.total_overdue) }}</h2>
        <small>{{ summary.overdue_count }} tagihan melewati jatuh tempo</small>
      </article>

      <article class="payable-stat">
        <p>Total Pembayaran</p>
        <h2>{{ formatCurrency(summary.total_paid) }}</h2>
        <small>Pembayaran vendor yang sudah tercatat</small>
      </article>

      <article class="payable-stat">
        <p>Tagihan Draft</p>
        <h2>{{ summary.draft_count }}</h2>
        <small>Belum memengaruhi akun dan laporan</small>
      </article>
    </div>

    <article class="panel aging-panel">
      <div class="panel-header">
        <div>
          <h3>Aging Utang</h3>
          <p>Umur tagihan terbuka berdasarkan tanggal tagihan vendor.</p>
        </div>
      </div>

      <div class="aging-grid">
        <div v-for="item in agingCards" :key="item.label" class="aging-item">
          <span>{{ item.label }}</span>
          <strong>{{ formatCurrency(item.value) }}</strong>
        </div>
      </div>
    </article>

    <div class="module-toolbar">
      <div class="filter-group">
        <input
          v-model="keyword"
          class="module-search"
          type="text"
          placeholder="Cari tagihan, vendor, proyek, atau status..."
        />

        <select v-model="selectedStatus" class="filter-select">
          <option value="all">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="unpaid">Belum Dibayar</option>
          <option value="partial">Dibayar Sebagian</option>
          <option value="paid">Lunas</option>
          <option value="overdue">Terlambat</option>
        </select>

        <button
          type="button"
          class="table-action"
          :disabled="isLoading"
          @click="loadData"
        >
          {{ isLoading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>

      <span class="table-count">{{ filteredBills.length }} tagihan</span>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Tagihan Vendor</h3>
          <p>
            Terbitkan tagihan untuk mencatat Beban, Utang Vendor, PPN Masukan,
            dan PPh 23 bila dipilih. Pembayaran vendor hanya sebesar nilai setelah potongan PPh 23.
          </p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No. Tagihan</th>
              <th>Vendor & Proyek</th>
              <th>Nominal</th>
              <th>Dibayar</th>
              <th>Sisa Utang</th>
              <th>Jatuh Tempo</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="bill in paginatedBills" :key="bill.id">
              <td>
                <strong>{{ bill.bill_number }}</strong>
                <small class="table-subtext">{{ formatDate(bill.bill_date) }}</small>
              </td>

              <td>
                <strong>{{ bill.vendor_name }}</strong>
                <small class="table-subtext">{{ bill.project_name || 'Tanpa proyek' }}</small>
              </td>

              <td>
                <strong>{{ formatCurrency(bill.total_amount) }}</strong>
                <small
                  v-if="numberValue(bill.ppn_amount) > 0 || numberValue(bill.pph23_amount) > 0"
                  class="table-subtext"
                >
                  DPP {{ formatCurrency(bill.dpp_amount) }} ·
                  PPN {{ formatCurrency(bill.ppn_amount) }} ·
                  PPh 23 {{ formatCurrency(bill.pph23_amount) }}
                </small>
              </td>
              <td>{{ formatCurrency(bill.paid_amount) }}</td>
              <td>
                <strong>{{ formatCurrency(bill.outstanding_amount) }}</strong>
                <small v-if="numberValue(bill.pph23_amount) > 0" class="table-subtext">
                  Nilai vendor setelah PPh 23
                </small>
              </td>
              <td>{{ formatDate(bill.due_date) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="statusClass(bill.display_status || bill.status)"
                >
                  {{ statusLabel(bill.display_status || bill.status) }}
                </span>
              </td>

              <td class="action-cell">
                <button
                  v-if="bill.status === 'draft'"
                  type="button"
                  class="table-action"
                  :disabled="isSaving"
                  @click="openEditBillModal(bill)"
                >
                  Edit
                </button>

                <button
                  v-if="bill.status === 'draft'"
                  type="button"
                  class="table-action"
                  :disabled="isSaving"
                  @click="openIssueModal(bill)"
                >
                  Terbitkan
                </button>

                <button
                  v-if="bill.status === 'draft'"
                  type="button"
                  class="table-action danger-action"
                  :disabled="isSaving"
                  @click="deleteDraft(bill)"
                >
                  Hapus
                </button>

                <button
                  v-if="['unpaid', 'partial', 'overdue'].includes(bill.display_status || bill.status)"
                  type="button"
                  class="table-action"
                  :disabled="isSaving"
                  @click="openPaymentModal(bill)"
                >
                  Catat Bayar
                </button>

                <span v-if="bill.status === 'paid'" class="table-subtext">
                  Lunas
                </span>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredBills.length === 0">
              <td colspan="8" class="empty-table">
                Belum ada tagihan. Buat tagihan baru untuk mulai mencatat utang.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
          <div class="text-xs text-[#6B7A90]">
            Menampilkan {{ Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredBills.length) }} - {{ Math.min(currentPage * PAGE_SIZE, filteredBills.length) }} dari {{ filteredBills.length }} data
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
              :disabled="currentPage >= Math.ceil(filteredBills.length / PAGE_SIZE)"
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

    <div v-if="showBillModal" class="modal-backdrop" @click.self="closeBillModal">
      <form class="modal-card bill-modal" @submit.prevent="createBill">
        <div class="modal-header">
          <div>
            <p class="eyebrow">UTANG</p>
            <h3>{{ editingBillId ? 'Edit Draft Tagihan' : 'Buat Tagihan Vendor' }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closeBillModal">×</button>
        </div>

        <div class="form-grid">
          <label>
            Nama Vendor
            <input
              v-model="billForm.vendor_name"
              type="text"
              placeholder="Contoh: CV Mitra Teknologi"
              required
            />
          </label>

          <label>
            Proyek <span class="optional-label">(opsional)</span>
            <select v-model="billForm.project_id">
              <option value="">Tanpa proyek</option>
              <option
                v-for="project in projects"
                :key="project.id"
                :value="String(project.id)"
              >
                {{ project.project_name }}
              </option>
            </select>
          </label>

          <label>
            Nomor Tagihan <span class="optional-label">(otomatis bila kosong)</span>
            <input
              v-model="billForm.bill_number"
              type="text"
              placeholder="Contoh: BIL/202607/001"
            />
          </label>

          <label>
            Tanggal Tagihan
            <input v-model="billForm.bill_date" type="date" required />
          </label>

          <label>
            Jatuh Tempo
            <input
              v-model="billForm.due_date"
              type="date"
              :min="billForm.bill_date"
              required
            />
          </label>

          <label class="full-width">
            Catatan <span class="optional-label">(opsional)</span>
            <input
              v-model="billForm.notes"
              type="text"
              placeholder="Contoh: Langganan server bulan Juli"
            />
          </label>
        </div>

        <section class="bill-item-section">
          <div class="bill-item-heading">
            <div>
              <h4>Item Tagihan</h4>
              <p>Minimal satu item wajib diisi.</p>
            </div>

            <button type="button" class="secondary-button" @click="addItem">
              + Tambah Item
            </button>
          </div>

          <div
            v-for="(item, index) in billForm.items"
            :key="index"
            class="bill-item-row"
          >
            <label class="item-description">
              Deskripsi
              <input
                v-model="item.description"
                type="text"
                placeholder="Contoh: Langganan server bulan Juli"
                required
              />
            </label>

            <label>
              Qty
              <input v-model.number="item.quantity" type="number" min="1" required />
            </label>

            <label>
              Harga Satuan
              <input v-model.number="item.unit_price" type="number" min="1" required />
            </label>

            <div class="item-total">
              <span>Total</span>
              <strong>{{ formatCurrency(numberValue(item.quantity) * numberValue(item.unit_price)) }}</strong>
            </div>

            <button
              type="button"
              class="remove-item-button"
              :disabled="billForm.items.length === 1"
              @click="removeItem(index)"
            >
              ×
            </button>
          </div>

          <section class="tax-option-section">
            <div class="tax-option-heading">
              <div>
                <h4>PPN Masukan</h4>
                <p>Aktifkan hanya bila tagihan vendor mempunyai PPN yang dapat dikreditkan.</p>
              </div>

              <label class="switch-label">
                <input v-model="billForm.tax.ppn_enabled" type="checkbox" />
                Kreditkan PPN
              </label>
            </div>

            <div v-if="billForm.tax.ppn_enabled" class="tax-option-form">
              <label>
                Tarif PPN (%)
                <input
                  v-model.number="billForm.tax.ppn_rate"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  placeholder="Isi tarif yang berlaku"
                  required
                />
              </label>

              <p>PPN Masukan dicatat terpisah dari beban dan akan diperhitungkan saat penutupan Masa PPN.</p>
            </div>
          </section>

          <section class="tax-option-section pph23-section">
            <div class="tax-option-heading">
              <div>
                <h4>PPh 23 Vendor</h4>
                <p>Gunakan untuk tagihan jasa atau objek PPh 23 yang dipotong oleh perusahaan.</p>
              </div>

              <label class="switch-label">
                <input v-model="billForm.tax.pph23_enabled" type="checkbox" />
                Potong PPh 23
              </label>
            </div>

            <div v-if="billForm.tax.pph23_enabled" class="tax-option-grid">
              <label>
                Objek PPh 23
                <select v-model="billForm.tax.pph23_object">
                  <option value="Jasa">Jasa</option>
                  <option value="Sewa selain tanah/bangunan">Sewa selain tanah/bangunan</option>
                  <option value="Royalti">Royalti</option>
                  <option value="Bunga">Bunga</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </label>

              <label>
                Tarif Dasar (%)
                <input
                  v-model.number="billForm.tax.pph23_rate"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  required
                />
              </label>

              <label class="switch-label npwp-label">
                <input v-model="billForm.tax.vendor_has_npwp" type="checkbox" />
                Vendor memiliki NPWP
              </label>

              <div class="tax-effective-rate">
                <span>Tarif Efektif</span>
                <strong>{{ billPph23EffectiveRate }}%</strong>
                <small v-if="!billForm.tax.vendor_has_npwp">
                  Tarif efektif menjadi dua kali tarif dasar.
                </small>
              </div>
            </div>
          </section>

          <div class="bill-grand-total bill-tax-total">
            <div>
              <span>DPP</span>
              <strong>{{ formatCurrency(billTotal) }}</strong>
            </div>

            <div>
              <span>PPN Masukan</span>
              <strong>{{ formatCurrency(billPpnAmount) }}</strong>
            </div>

            <div>
              <span>PPh 23 Dipotong</span>
              <strong>{{ formatCurrency(billPph23Amount) }}</strong>
            </div>

            <div>
              <span>Total Tagihan</span>
              <strong>{{ formatCurrency(billGrossTotal) }}</strong>
            </div>

            <div>
              <span>Dibayar ke Vendor</span>
              <strong>{{ formatCurrency(billVendorPayable) }}</strong>
            </div>
          </div>
        </section>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closeBillModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : (editingBillId ? 'Perbarui Draft Tagihan' : 'Simpan Draft Tagihan') }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="showIssueModal" class="modal-backdrop" @click.self="closeIssueModal">
      <form class="modal-card" @submit.prevent="issueBill">
        <div class="modal-header">
          <div>
            <p class="eyebrow">TERBITKAN TAGIHAN</p>
            <h3>Pilih Akun Beban</h3>
          </div>

          <button type="button" class="modal-close" @click="closeIssueModal">×</button>
        </div>

        <p class="issue-description">
          Tagihan <strong>{{ selectedIssueBill?.bill_number }}</strong> sebesar
          <strong>{{ formatCurrency(selectedIssueBill?.total_amount) }}</strong>
          akan membuat jurnal otomatis.
        </p>

        <div class="journal-preview">
          <p><span>Debit</span><strong>Akun Beban sebesar DPP</strong></p>
          <p v-if="numberValue(selectedIssueBill?.ppn_amount) > 0">
            <span>Debit</span><strong>1145 — PPN Masukan</strong>
          </p>
          <p><span>Kredit</span><strong>2100 — Utang Vendor</strong></p>
          <p v-if="numberValue(selectedIssueBill?.pph23_amount) > 0">
            <span>Kredit</span><strong>2211 — Utang PPh 23</strong>
          </p>
        </div>

        <label class="single-form-label">
          Akun Beban
          <select v-model="issueForm.expense_account_id" required>
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
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closeIssueModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menerbitkan...' : 'Terbitkan Tagihan' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="showPaymentModal" class="modal-backdrop" @click.self="closePaymentModal">
      <form class="modal-card" @submit.prevent="savePayment">
        <div class="modal-header">
          <div>
            <p class="eyebrow">PEMBAYARAN UTANG</p>
            <h3>Catat Pembayaran Vendor</h3>
          </div>

          <button type="button" class="modal-close" @click="closePaymentModal">×</button>
        </div>

        <div class="form-grid">
          <label class="full-width">
            Tagihan Vendor
            <select v-model="paymentForm.bill_id" required>
              <option value="">Pilih tagihan</option>
              <option
                v-for="bill in openBills"
                :key="bill.id"
                :value="String(bill.id)"
              >
                {{ bill.bill_number }} — {{ bill.vendor_name }}
              </option>
            </select>
          </label>

          <label>
            Akun Pembayaran
            <select v-model="paymentForm.cash_account_id" required>
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
            Metode Pembayaran
            <select v-model="paymentForm.payment_method">
              <option>Transfer Bank</option>
              <option>Tunai</option>
              <option>Virtual Account</option>
              <option>QRIS</option>
            </select>
          </label>

          <label>
            Tanggal Pembayaran
            <input v-model="paymentForm.payment_date" type="date" required />
          </label>

          <label>
            Nominal Dibayar
            <input
              v-model.number="paymentForm.amount"
              type="number"
              min="1"
              :max="paymentOutstanding"
              required
            />
          </label>

          <label class="full-width">
            Nomor Referensi <span class="optional-label">(opsional)</span>
            <input
              v-model="paymentForm.reference_number"
              type="text"
              placeholder="Contoh: TRF-20260702-002"
            />
          </label>

          <label class="full-width">
            Catatan <span class="optional-label">(opsional)</span>
            <input
              v-model="paymentForm.notes"
              type="text"
              placeholder="Keterangan pembayaran vendor"
            />
          </label>
        </div>

        <div v-if="selectedPaymentBill" class="payment-summary">
          <p>Vendor: <strong>{{ selectedPaymentBill.vendor_name }}</strong></p>
          <p>Sisa utang: <strong>{{ formatCurrency(paymentOutstanding) }}</strong></p>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closePaymentModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Pembayaran' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.payable-message { border-radius: 10px; padding: 12px 14px; font-size: 13px; }
.error-message { border: 1px solid #f3c7c7; background: #fff6f6; color: #a84343; }
.success-message { border: 1px solid #bfe8d0; background: #f1fff6; color: #23774b; }
.aging-panel { margin-top: 18px; }
.aging-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.aging-item { border: 1px solid #e4eaf3; border-radius: 10px; padding: 13px; background: #fbfdff; }
.aging-item span, .aging-item strong { display: block; }
.aging-item span { color: #8092ab; font-size: 11px; }
.aging-item strong { margin-top: 7px; color: #163b63; font-size: 14px; }
.action-cell { display: flex; flex-wrap: wrap; gap: 6px; }
.danger-action { border-color: #f2c7c7; color: #b34c4c; }
.bill-modal { width: min(960px, calc(100vw - 32px)); }
.optional-label { color: #8d9cb3; font-size: 10px; font-weight: 500; }
.bill-item-section { margin-top: 18px; border-top: 1px solid #e6edf5; padding-top: 16px; }
.bill-item-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 12px; }
.bill-item-heading h4 { margin: 0; color: #183d66; font-size: 14px; }
.bill-item-heading p { margin: 4px 0 0; color: #8293ab; font-size: 11px; }
.bill-item-row { display: grid; grid-template-columns: minmax(180px, 1.8fr) 76px minmax(130px, 1fr) minmax(130px, 1fr) 30px; align-items: end; gap: 10px; margin-top: 10px; border-radius: 10px; padding: 11px; background: #f7faff; }
.bill-item-row label { display: grid; gap: 6px; color: #58708e; font-size: 11px; font-weight: 700; }
.bill-item-row input { width: 100%; box-sizing: border-box; border: 1px solid #dbe5f0; border-radius: 7px; padding: 9px 10px; outline: none; }
.item-total { padding-bottom: 9px; }
.item-total span, .item-total strong { display: block; }
.item-total span { color: #8797ad; font-size: 10px; }
.item-total strong { margin-top: 5px; color: #163b63; font-size: 12px; }
.remove-item-button { width: 30px; height: 30px; border: 1px solid #f0c8c8; border-radius: 7px; background: #fff7f7; color: #bd5656; cursor: pointer; font-size: 18px; }
.remove-item-button:disabled { cursor: not-allowed; opacity: .45; }
.bill-grand-total { display: flex; justify-content: space-between; margin-top: 12px; border-radius: 8px; padding: 13px; background: #eaf5ff; color: #16416c; }
.bill-grand-total strong { font-size: 15px; }
.issue-description { margin: 2px 0 14px; color: #5f7490; font-size: 13px; line-height: 1.55; }
.journal-preview { display: grid; gap: 7px; margin-bottom: 16px; border: 1px solid #dbe8f5; border-radius: 10px; padding: 13px; background: #f6fbff; }
.journal-preview p { display: flex; justify-content: space-between; gap: 12px; margin: 0; color: #57708e; font-size: 12px; }
.journal-preview span { font-weight: 800; }
.single-form-label { display: grid; gap: 7px; color: #526b89; font-size: 12px; font-weight: 700; }
.single-form-label select { border: 1px solid #dbe5f0; border-radius: 8px; padding: 10px 11px; background: white; color: #344f6d; outline: none; }
@media (max-width: 860px) {
  .aging-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bill-item-row { grid-template-columns: 1fr 1fr; }
  .bill-item-row .item-description { grid-column: 1 / -1; }
  .item-total { padding-bottom: 0; }
  .remove-item-button { justify-self: end; }
}
@media (max-width: 560px) {
  .aging-grid { grid-template-columns: 1fr; }
  .bill-item-heading { align-items: flex-start; flex-direction: column; }
  .bill-item-row { grid-template-columns: 1fr; }
  .bill-item-row .item-description { grid-column: auto; }
}

.tax-option-section {
  margin-top: 14px;
  border: 1px solid #d9e7f4;
  border-radius: 10px;
  padding: 14px;
  background: #f7fbff;
}
.tax-option-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.tax-option-heading h4 { margin: 0; color: #1f4f80; font-size: 13px; }
.tax-option-heading p { margin: 5px 0 0; color: #7388a0; font-size: 11px; line-height: 1.45; }
.switch-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #285a8d;
  font-size: 12px;
  font-weight: 800;
}
.tax-option-form {
  display: flex;
  align-items: end;
  gap: 16px;
  margin-top: 13px;
}
.tax-option-form label,
.tax-option-grid label {
  display: grid;
  gap: 6px;
  color: #5b718e;
  font-size: 11px;
  font-weight: 700;
}
.tax-option-form input,
.tax-option-grid input,
.tax-option-grid select {
  border: 1px solid #d7e3ef;
  border-radius: 8px;
  padding: 9px 10px;
  background: white;
  color: #314e6d;
}
.tax-option-form p { margin: 0; color: #6f849d; font-size: 11px; line-height: 1.5; }
.tax-option-grid {
  display: grid;
  grid-template-columns: 1.2fr .75fr 1fr 1fr;
  gap: 12px;
  align-items: end;
  margin-top: 13px;
}
.npwp-label { padding-bottom: 9px; }
.tax-effective-rate {
  border-radius: 8px;
  padding: 9px 10px;
  background: #edf6ff;
  color: #305e8e;
}
.tax-effective-rate span,
.tax-effective-rate strong,
.tax-effective-rate small { display: block; }
.tax-effective-rate span { font-size: 10px; font-weight: 700; }
.tax-effective-rate strong { margin-top: 3px; font-size: 15px; }
.tax-effective-rate small { margin-top: 3px; font-size: 9px; line-height: 1.35; }
.bill-tax-total {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}
.bill-tax-total > div { display: grid; gap: 5px; }
.bill-tax-total span { color: #768aa3; font-size: 10px; font-weight: 700; }
@media (max-width: 900px) {
  .tax-option-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bill-tax-total { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 680px) {
  .tax-option-heading, .tax-option-form { align-items: flex-start; flex-direction: column; }
  .tax-option-grid, .bill-tax-total { grid-template-columns: 1fr; }
}

</style>
