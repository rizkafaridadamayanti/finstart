<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

/*
  PIUTANG FINSTART
  Endpoint yang digunakan:
  GET    /api/invoices
  GET    /api/invoices/summary
  POST   /api/invoices
  POST   /api/invoices/:id/issue
  POST   /api/invoices/:id/payments
  DELETE /api/invoices/:id
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const clients = ref([])
const projects = ref([])
const accounts = ref([])
const invoices = ref([])

const summary = ref({
  total_receivable: 0,
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

const showInvoiceModal = ref(false)
const showPaymentModal = ref(false)

const today = new Date().toISOString().slice(0, 10)

function numberValue(value) {
  return Number(value || 0)
}

function emptyInvoiceForm() {
  return {
    client_id: '',
    project_id: '',
    invoice_number: '',
    issue_date: today,
    due_date: '',
    notes: '',
    tax: {
      ppn_enabled: false,
      ppn_rate: 0,
    },
    items: [
      {
        description: '',
        quantity: 1,
        unit_price: 0,
      },
    ],
  }
}

function emptyPaymentForm() {
  return {
    invoice_id: '',
    payment_date: today,
    payment_method: 'Transfer Bank',
    amount: 0,
    reference_number: '',
    notes: '',
    cash_account_id: '',
  }
}

const invoiceForm = ref(emptyInvoiceForm())
const paymentForm = ref(emptyPaymentForm())

const availableProjects = computed(() => {
  if (!invoiceForm.value.client_id) return projects.value

  return projects.value.filter((project) => {
    return Number(project.client_id) === Number(invoiceForm.value.client_id)
  })
})

const cashAccounts = computed(() => {
  return accounts.value.filter((account) => {
    const isAsset = account.type === 'asset'
    const isReceivable = String(account.code) === '1130'
    const isCashOrBank =
      ['1110', '1120'].includes(String(account.code)) ||
      /(kas|bank)/i.test(String(account.name || ''))

    return isAsset && !isReceivable && isCashOrBank
  })
})

const filteredInvoices = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  const filtered = invoices.value.filter((invoice) => {
    const invoiceStatus = String(
      invoice.display_status || invoice.status || '',
    ).toLowerCase()

    const matchesStatus =
      selectedStatus.value === 'all' || invoiceStatus === selectedStatus.value

    const matchesKeyword =
      !search ||
      [
        invoice.invoice_number,
        invoice.client_name,
        invoice.project_name,
        invoiceStatus,
      ].some((value) => String(value || '').toLowerCase().includes(search))

    return matchesStatus && matchesKeyword
  })

  return filtered.sort((a, b) => {
    const dateA = a.due_date ? new Date(a.due_date) : (a.issue_date ? new Date(a.issue_date) : (a.created_at ? new Date(a.created_at) : new Date(0)))
    const dateB = b.due_date ? new Date(b.due_date) : (b.issue_date ? new Date(b.issue_date) : (b.created_at ? new Date(b.created_at) : new Date(0)))
    return dateB - dateA
  })
})

const paginatedInvoices = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredInvoices.value.slice(start, start + PAGE_SIZE)
})

const invoiceTotal = computed(() => {
  return invoiceForm.value.items.reduce((total, item) => {
    return total + numberValue(item.quantity) * numberValue(item.unit_price)
  }, 0)
})

const invoicePpnAmount = computed(() => {
  if (!invoiceForm.value.tax.ppn_enabled) return 0

  return Math.round(
    (invoiceTotal.value * numberValue(invoiceForm.value.tax.ppn_rate)) / 100,
  )
})

const invoiceGrandTotal = computed(() => {
  return invoiceTotal.value + invoicePpnAmount.value
})

const selectedPaymentInvoice = computed(() => {
  return invoices.value.find((invoice) => {
    return Number(invoice.id) === Number(paymentForm.value.invoice_id)
  })
})

const paymentOutstanding = computed(() => {
  return numberValue(selectedPaymentInvoice.value?.outstanding_amount)
})

const agingCards = computed(() => {
  return [
    {
      label: '0–30 Hari',
      value: summary.value.aging?.days_0_30 || 0,
    },
    {
      label: '31–60 Hari',
      value: summary.value.aging?.days_31_60 || 0,
    },
    {
      label: '61–90 Hari',
      value: summary.value.aging?.days_61_90 || 0,
    },
    {
      label: '> 90 Hari',
      value: summary.value.aging?.days_over_90 || 0,
    },
  ]
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue(value))
}

function formatDate(value) {
  if (!value) return '-'

  const text = String(value).slice(0, 10)
  const [year, month, day] = text.split('-')

  if (!year || !month || !day) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(Number(year), Number(month) - 1, Number(day)))
}

function invoiceStatusLabel(status) {
  const labels = {
    draft: 'Draft',
    unpaid: 'Belum Dibayar',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
    overdue: 'Terlambat',
    cancelled: 'Dibatalkan',
  }

  return labels[status] || status || '-'
}

function statusClass(status) {
  return {
    warning: ['draft', 'partial'].includes(status),
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
      invoiceResponse,
      summaryResponse,
      clientResponse,
      projectResponse,
      accountResponse,
    ] = await Promise.all([
      api.get('/invoices'),
      api.get('/invoices/summary'),
      api.get('/clients'),
      api.get('/projects'),
      api.get('/accounts'),
    ])

    invoices.value = invoiceResponse.data.data || []
    summary.value = {
      ...summary.value,
      ...(summaryResponse.data.data || {}),
      aging: {
        ...summary.value.aging,
        ...(summaryResponse.data.data?.aging || {}),
      },
    }

    clients.value = clientResponse.data.data || []
    projects.value = projectResponse.data.data || []
    accounts.value = accountResponse.data.data || []
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data piutang. Pastikan backend Node.js berjalan.',
    )
  } finally {
    isLoading.value = false
  }
}

function openInvoiceModal() {
  clearMessages()

  if (clients.value.length === 0) {
    errorMessage.value = 'Tambahkan data klien terlebih dahulu melalui menu CRM & Proyek.'
    return
  }

  invoiceForm.value = emptyInvoiceForm()
  showInvoiceModal.value = true
}

function closeInvoiceModal() {
  showInvoiceModal.value = false
  invoiceForm.value = emptyInvoiceForm()
}

function openPaymentModal(invoice = null) {
  clearMessages()

  const target =
    invoice ||
    invoices.value.find((item) => {
      const status = item.display_status || item.status

      return ['unpaid', 'partial', 'overdue'].includes(status) &&
        numberValue(item.outstanding_amount) > 0
    })

  if (!target) {
    errorMessage.value =
      'Belum ada invoice aktif yang dapat menerima pembayaran. Terbitkan invoice draft terlebih dahulu.'
    return
  }

  const bankAccount = cashAccounts.value.find(
    (account) => String(account.code) === '1120',
  )

  paymentForm.value = {
    ...emptyPaymentForm(),
    invoice_id: target.id,
    amount: numberValue(target.outstanding_amount),
    cash_account_id: bankAccount?.id || cashAccounts.value[0]?.id || '',
  }

  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
  paymentForm.value = emptyPaymentForm()
}

function syncProjectClient() {
  const selectedProject = projects.value.find((project) => {
    return Number(project.id) === Number(invoiceForm.value.project_id)
  })

  if (selectedProject) {
    invoiceForm.value.client_id = String(selectedProject.client_id)
  }
}

function syncClientProject() {
  const selectedProject = projects.value.find((project) => {
    return Number(project.id) === Number(invoiceForm.value.project_id)
  })

  if (
    selectedProject &&
    Number(selectedProject.client_id) !== Number(invoiceForm.value.client_id)
  ) {
    invoiceForm.value.project_id = ''
  }
}

function addItem() {
  invoiceForm.value.items.push({
    description: '',
    quantity: 1,
    unit_price: 0,
  })
}

function removeItem(index) {
  if (invoiceForm.value.items.length === 1) return

  invoiceForm.value.items.splice(index, 1)
}

async function createInvoice() {
  clearMessages()

  if (!invoiceForm.value.client_id) {
    errorMessage.value = 'Pilih klien untuk invoice.'
    return
  }

  if (!invoiceForm.value.issue_date || !invoiceForm.value.due_date) {
    errorMessage.value = 'Tanggal invoice dan jatuh tempo wajib diisi.'
    return
  }

  if (invoiceForm.value.due_date < invoiceForm.value.issue_date) {
    errorMessage.value = 'Tanggal jatuh tempo tidak boleh lebih awal dari tanggal invoice.'
    return
  }

  if (invoiceTotal.value <= 0) {
    errorMessage.value = 'Total invoice harus lebih dari Rp0.'
    return
  }

  isSaving.value = true

  try {
    const response = await api.post('/invoices', {
      ...invoiceForm.value,
      client_id: Number(invoiceForm.value.client_id),
      project_id: invoiceForm.value.project_id
        ? Number(invoiceForm.value.project_id)
        : null,
      items: invoiceForm.value.items.map((item) => ({
        description: item.description,
        quantity: numberValue(item.quantity),
        unit_price: numberValue(item.unit_price),
      })),
      tax: {
        ppn_enabled: Boolean(invoiceForm.value.tax.ppn_enabled),
        ppn_rate: numberValue(invoiceForm.value.tax.ppn_rate),
      },
    })

    closeInvoiceModal()
    successMessage.value =
      response.data.message ||
      'Invoice draft berhasil dibuat. Terbitkan untuk mencatat piutang, pendapatan, dan PPN Keluaran bila dipilih.'

    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal membuat invoice.')
  } finally {
    isSaving.value = false
  }
}

async function issueInvoice(invoice) {
  clearMessages()

  const confirmed = window.confirm(
    `Terbitkan ${invoice.invoice_number}?\n\nSistem akan membuat jurnal otomatis:\nDebit Piutang Usaha (total tagihan)\nKredit Pendapatan (DPP)\nKredit PPN Keluaran bila invoice dikenakan PPN`,
  )

  if (!confirmed) return

  isSaving.value = true

  try {
    const response = await api.post(`/invoices/${invoice.id}/issue`)

    successMessage.value =
      response.data.message ||
      'Invoice berhasil diterbitkan dan jurnal piutang otomatis diposting.'

    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal menerbitkan invoice.')
  } finally {
    isSaving.value = false
  }
}

async function deleteDraft(invoice) {
  clearMessages()

  const confirmed = window.confirm(
    `Hapus draft ${invoice.invoice_number}?`,
  )

  if (!confirmed) return

  isSaving.value = true

  try {
    const response = await api.delete(`/invoices/${invoice.id}`)

    successMessage.value = response.data.message || 'Invoice draft dihapus.'
    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal menghapus invoice draft.')
  } finally {
    isSaving.value = false
  }
}

async function savePayment() {
  clearMessages()

  if (!paymentForm.value.invoice_id) {
    errorMessage.value = 'Pilih invoice yang akan dibayar.'
    return
  }

  if (!paymentForm.value.cash_account_id) {
    errorMessage.value =
      'Akun Kas atau Bank belum tersedia. Pastikan COA 1110 Kas atau 1120 Bank aktif.'
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
      `/invoices/${paymentForm.value.invoice_id}/payments`,
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
      'Pembayaran berhasil dicatat dan jurnal otomatis diposting.'

    await loadData()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal mencatat pembayaran.')
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
        <p class="eyebrow">ACCOUNTS RECEIVABLE</p>
        <h1>Piutang</h1>
        <p>
          Kelola invoice, tagihan klien, sisa piutang, serta pelunasan yang
          langsung tersambung ke kas, jurnal, dashboard, dan laporan.
        </p>
      </div>

      <div class="page-button-group">
        <button
          type="button"
          class="secondary-button"
          :disabled="isSaving"
          @click="openPaymentModal()"
        >
          Catat Pelunasan Piutang
        </button>

        <button
          type="button"
          class="primary-button"
          :disabled="isSaving"
          @click="openInvoiceModal"
        >
          + Buat Invoice Baru
        </button>
      </div>
    </div>

    <article v-if="errorMessage" class="receivable-message error-message">
      {{ errorMessage }}
    </article>

    <article v-if="successMessage" class="receivable-message success-message">
      {{ successMessage }}
    </article>

    <div class="receivable-metrics">
      <article class="receivable-stat">
        <p>Total Piutang Berjalan</p>
        <h2>{{ formatCurrency(summary.total_receivable) }}</h2>
        <small>{{ summary.open_count }} invoice belum lunas</small>
      </article>

      <article class="receivable-stat">
        <p>Piutang Terlambat</p>
        <h2>{{ formatCurrency(summary.total_overdue) }}</h2>
        <small>{{ summary.overdue_count }} invoice melewati jatuh tempo</small>
      </article>

      <article class="receivable-stat">
        <p>Total Pelunasan</p>
        <h2>{{ formatCurrency(summary.total_paid) }}</h2>
        <small>Pembayaran yang sudah diterima</small>
      </article>

      <article class="receivable-stat">
        <p>Invoice Draft</p>
        <h2>{{ summary.draft_count }}</h2>
        <small>Belum memengaruhi akun dan laporan</small>
      </article>
    </div>

    <article class="panel aging-panel">
      <div class="panel-header">
        <div>
          <h3>Aging Piutang</h3>
          <p>Umur piutang terbuka berdasarkan tanggal invoice.</p>
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
          placeholder="Cari nomor invoice, klien, proyek, atau status..."
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

      <span class="table-count">{{ filteredInvoices.length }} invoice</span>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Piutang</h3>
          <p>
            Terbitkan invoice untuk mencatat Piutang, Pendapatan, dan PPN Keluaran
            bila dipilih. Pembayaran akan menambah Kas/Bank serta mengurangi Piutang Usaha.
          </p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>Klien & Proyek</th>
              <th>Nominal</th>
              <th>Dibayar</th>
              <th>Sisa Piutang</th>
              <th>Jatuh Tempo</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="invoice in paginatedInvoices" :key="invoice.id">
              <td>
                <strong>{{ invoice.invoice_number }}</strong>
                <small class="table-subtext">
                  {{ formatDate(invoice.issue_date) }}
                </small>
              </td>

              <td>
                <strong>{{ invoice.client_name }}</strong>
                <small class="table-subtext">
                  {{ invoice.project_name || 'Tanpa proyek' }}
                </small>
              </td>

              <td>
                <strong>{{ formatCurrency(invoice.total_amount) }}</strong>
                <small v-if="numberValue(invoice.ppn_amount) > 0" class="table-subtext">
                  DPP {{ formatCurrency(invoice.dpp_amount) }} ·
                  PPN {{ formatCurrency(invoice.ppn_amount) }}
                </small>
              </td>
              <td>{{ formatCurrency(invoice.paid_amount) }}</td>

              <td>
                <strong>{{ formatCurrency(invoice.outstanding_amount) }}</strong>
              </td>

              <td>{{ formatDate(invoice.due_date) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="statusClass(invoice.display_status || invoice.status)"
                >
                  {{ invoiceStatusLabel(invoice.display_status || invoice.status) }}
                </span>
              </td>

              <td class="action-cell">
                <button
                  v-if="invoice.status === 'draft'"
                  type="button"
                  class="table-action"
                  :disabled="isSaving"
                  @click="issueInvoice(invoice)"
                >
                  Terbitkan
                </button>

                <button
                  v-if="invoice.status === 'draft'"
                  type="button"
                  class="table-action danger-action"
                  :disabled="isSaving"
                  @click="deleteDraft(invoice)"
                >
                  Hapus
                </button>

                <button
                  v-if="['unpaid', 'partial', 'overdue'].includes(invoice.display_status || invoice.status)"
                  type="button"
                  class="table-action"
                  :disabled="isSaving"
                  @click="openPaymentModal(invoice)"
                >
                  Catat Bayar
                </button>

                <span
                  v-if="invoice.status === 'paid'"
                  class="table-subtext"
                >
                  Lunas
                </span>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredInvoices.length === 0">
              <td colspan="8" class="empty-table">
                Belum ada invoice. Buat invoice baru untuk mulai mencatat piutang.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
          <div class="text-xs text-[#6B7A90]">
            Menampilkan {{ Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredInvoices.length) }} - {{ Math.min(currentPage * PAGE_SIZE, filteredInvoices.length) }} dari {{ filteredInvoices.length }} data
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
              :disabled="currentPage >= Math.ceil(filteredInvoices.length / PAGE_SIZE)"
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

    <div
      v-if="showInvoiceModal"
      class="modal-backdrop"
      @click.self="closeInvoiceModal"
    >
      <form class="modal-card invoice-modal" @submit.prevent="createInvoice">
        <div class="modal-header">
          <div>
            <p class="eyebrow">PIUTANG</p>
            <h3>Buat Invoice Baru</h3>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="closeInvoiceModal"
          >
            ×
          </button>
        </div>

        <div class="form-grid">
          <label>
            Klien
            <select
              v-model="invoiceForm.client_id"
              required
              @change="syncClientProject"
            >
              <option value="">Pilih klien</option>
              <option
                v-for="client in clients"
                :key="client.id"
                :value="String(client.id)"
              >
                {{ client.company_name }}
              </option>
            </select>
          </label>

          <label>
            Proyek <span class="optional-label">(opsional)</span>
            <select
              v-model="invoiceForm.project_id"
              @change="syncProjectClient"
            >
              <option value="">Tanpa proyek</option>
              <option
                v-for="project in availableProjects"
                :key="project.id"
                :value="String(project.id)"
              >
                {{ project.project_name }}
              </option>
            </select>
          </label>

          <label>
            Nomor Invoice <span class="optional-label">(otomatis bila kosong)</span>
            <input
              v-model="invoiceForm.invoice_number"
              type="text"
              placeholder="Contoh: INV/202607/001"
            />
          </label>

          <label>
            Tanggal Invoice
            <input v-model="invoiceForm.issue_date" type="date" required />
          </label>

          <label>
            Jatuh Tempo
            <input
              v-model="invoiceForm.due_date"
              type="date"
              :min="invoiceForm.issue_date"
              required
            />
          </label>

          <label class="full-width">
            Catatan <span class="optional-label">(opsional)</span>
            <input
              v-model="invoiceForm.notes"
              type="text"
              placeholder="Contoh: Termin pertama proyek"
            />
          </label>
        </div>

        <section class="invoice-item-section">
          <div class="invoice-item-heading">
            <div>
              <h4>Item Invoice</h4>
              <p>Minimal satu item wajib diisi.</p>
            </div>

            <button type="button" class="secondary-button" @click="addItem">
              + Tambah Item
            </button>
          </div>

          <div
            v-for="(item, index) in invoiceForm.items"
            :key="index"
            class="invoice-item-row"
          >
            <label class="item-description">
              Deskripsi
              <input
                v-model="item.description"
                type="text"
                placeholder="Contoh: Jasa desain dashboard"
                required
              />
            </label>

            <label>
              Qty
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                step="1"
                required
              />
            </label>

            <label>
              Harga Satuan
              <input
                v-model.number="item.unit_price"
                type="number"
                min="1"
                required
              />
            </label>

            <div class="item-total">
              <span>Total</span>
              <strong>
                {{ formatCurrency(numberValue(item.quantity) * numberValue(item.unit_price)) }}
              </strong>
            </div>

            <button
              type="button"
              class="remove-item-button"
              :disabled="invoiceForm.items.length === 1"
              @click="removeItem(index)"
            >
              ×
            </button>
          </div>

          <section class="tax-option-section">
            <div class="tax-option-heading">
              <div>
                <h4>PPN Keluaran</h4>
                <p>Aktifkan hanya untuk invoice yang memang dikenakan PPN.</p>
              </div>

              <label class="switch-label">
                <input v-model="invoiceForm.tax.ppn_enabled" type="checkbox" />
                Kenakan PPN
              </label>
            </div>

            <div v-if="invoiceForm.tax.ppn_enabled" class="tax-option-form">
              <label>
                Tarif PPN (%)
                <input
                  v-model.number="invoiceForm.tax.ppn_rate"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  placeholder="Isi tarif yang berlaku"
                  required
                />
              </label>

              <p>
                PPN dihitung dari DPP. Nilai bruto invoice menjadi DPP ditambah PPN.
              </p>
            </div>
          </section>

          <div class="invoice-grand-total invoice-tax-total">
            <div>
              <span>DPP</span>
              <strong>{{ formatCurrency(invoiceTotal) }}</strong>
            </div>

            <div>
              <span>PPN Keluaran</span>
              <strong>{{ formatCurrency(invoicePpnAmount) }}</strong>
            </div>

            <div>
              <span>Total Invoice</span>
              <strong>{{ formatCurrency(invoiceGrandTotal) }}</strong>
            </div>
          </div>
        </section>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            :disabled="isSaving"
            @click="closeInvoiceModal"
          >
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Draft Invoice' }}
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="showPaymentModal"
      class="modal-backdrop"
      @click.self="closePaymentModal"
    >
      <form class="modal-card" @submit.prevent="savePayment">
        <div class="modal-header">
          <div>
            <p class="eyebrow">PELUNASAN PIUTANG</p>
            <h3>Catat Pembayaran Klien</h3>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="closePaymentModal"
          >
            ×
          </button>
        </div>

        <div class="form-grid">
          <label class="full-width">
            Invoice
            <select v-model="paymentForm.invoice_id" required>
              <option value="">Pilih invoice</option>
              <option
                v-for="invoice in invoices.filter((item) => ['unpaid', 'partial', 'overdue'].includes(item.display_status || item.status) && numberValue(item.outstanding_amount) > 0)"
                :key="invoice.id"
                :value="String(invoice.id)"
              >
                {{ invoice.invoice_number }} — {{ invoice.client_name }}
              </option>
            </select>
          </label>

          <label>
            Akun Penerimaan
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
            <input
              v-model="paymentForm.payment_date"
              type="date"
              required
            />
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
              placeholder="Contoh: TRF-20260702-001"
            />
          </label>

          <label class="full-width">
            Catatan <span class="optional-label">(opsional)</span>
            <input
              v-model="paymentForm.notes"
              type="text"
              placeholder="Keterangan pembayaran"
            />
          </label>
        </div>

        <div v-if="selectedPaymentInvoice" class="payment-summary">
          <p>
            Klien:
            <strong>{{ selectedPaymentInvoice.client_name }}</strong>
          </p>
          <p>
            Sisa piutang:
            <strong>{{ formatCurrency(paymentOutstanding) }}</strong>
          </p>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            :disabled="isSaving"
            @click="closePaymentModal"
          >
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Pelunasan' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.receivable-message {
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
}

.error-message {
  border: 1px solid #f3c7c7;
  background: #fff6f6;
  color: #a84343;
}

.success-message {
  border: 1px solid #bfe8d0;
  background: #f1fff6;
  color: #23774b;
}

.aging-panel {
  margin-top: 18px;
}

.aging-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.aging-item {
  border: 1px solid #e4eaf3;
  border-radius: 10px;
  padding: 13px;
  background: #fbfdff;
}

.aging-item span,
.aging-item strong {
  display: block;
}

.aging-item span {
  color: #8092ab;
  font-size: 11px;
}

.aging-item strong {
  margin-top: 7px;
  color: #163b63;
  font-size: 14px;
}

.action-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.danger-action {
  border-color: #f2c7c7;
  color: #b34c4c;
}

.invoice-modal {
  width: min(960px, calc(100vw - 32px));
}

.optional-label {
  color: #8d9cb3;
  font-size: 10px;
  font-weight: 500;
}

.invoice-item-section {
  margin-top: 18px;
  border-top: 1px solid #e6edf5;
  padding-top: 16px;
}

.invoice-item-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.invoice-item-heading h4 {
  margin: 0;
  color: #183d66;
  font-size: 14px;
}

.invoice-item-heading p {
  margin: 4px 0 0;
  color: #8293ab;
  font-size: 11px;
}

.invoice-item-row {
  display: grid;
  grid-template-columns: minmax(180px, 1.8fr) 76px minmax(130px, 1fr) minmax(130px, 1fr) 30px;
  align-items: end;
  gap: 10px;
  margin-top: 10px;
  border-radius: 10px;
  padding: 11px;
  background: #f7faff;
}

.invoice-item-row label {
  display: grid;
  gap: 6px;
  color: #58708e;
  font-size: 11px;
  font-weight: 700;
}

.invoice-item-row input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dbe5f0;
  border-radius: 7px;
  padding: 9px 10px;
  outline: none;
}

.item-total {
  padding-bottom: 9px;
}

.item-total span,
.item-total strong {
  display: block;
}

.item-total span {
  color: #8797ad;
  font-size: 10px;
}

.item-total strong {
  margin-top: 5px;
  color: #163b63;
  font-size: 12px;
}

.remove-item-button {
  width: 30px;
  height: 30px;
  border: 1px solid #f0c8c8;
  border-radius: 7px;
  background: #fff7f7;
  color: #bd5656;
  cursor: pointer;
  font-size: 18px;
}

.remove-item-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.invoice-grand-total {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  border-radius: 8px;
  padding: 13px;
  background: #eaf5ff;
  color: #16416c;
}

.invoice-grand-total strong {
  font-size: 15px;
}

@media (max-width: 860px) {
  .aging-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .invoice-item-row {
    grid-template-columns: 1fr 1fr;
  }

  .invoice-item-row .item-description {
    grid-column: 1 / -1;
  }

  .item-total {
    padding-bottom: 0;
  }

  .remove-item-button {
    justify-self: end;
  }
}

@media (max-width: 560px) {
  .aging-grid {
    grid-template-columns: 1fr;
  }

  .invoice-item-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .invoice-item-row {
    grid-template-columns: 1fr;
  }

  .invoice-item-row .item-description {
    grid-column: auto;
  }
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
  white-space: nowrap;
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
.tax-option-form label {
  display: grid;
  gap: 6px;
  min-width: 190px;
  color: #5b718e;
  font-size: 11px;
  font-weight: 700;
}
.tax-option-form input {
  border: 1px solid #d7e3ef;
  border-radius: 8px;
  padding: 9px 10px;
  background: white;
  color: #314e6d;
}
.tax-option-form p { margin: 0; color: #6f849d; font-size: 11px; line-height: 1.5; }
.invoice-tax-total {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.invoice-tax-total > div { display: grid; gap: 5px; }
.invoice-tax-total span { color: #768aa3; font-size: 11px; font-weight: 700; }
@media (max-width: 680px) {
  .tax-option-heading, .tax-option-form { align-items: flex-start; flex-direction: column; }
  .invoice-tax-total { grid-template-columns: 1fr; }
}

</style>
