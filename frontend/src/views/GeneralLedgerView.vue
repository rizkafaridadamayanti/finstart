<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const today = new Date().toISOString().slice(0, 10)

const activeMode = ref('coa')

const accounts = ref([])
const journalTransactions = ref([])

const keyword = ref('')
const selectedType = ref('all')

const transactionSearch = ref('')
const transactionDate = ref('')
const currentPageAccounts = ref(1)
const currentPageJournals = ref(1)
const PAGE_SIZE = 10

const showAccountModal = ref(false)
const showJournalModal = ref(false)
const showJournalDetailModal = ref(false)

const isLoadingAccounts = ref(false)
const isLoadingTransactions = ref(false)
const isSavingAccount = ref(false)
const isSavingJournal = ref(false)
const isLoadingJournalDetail = ref(false)

const errorMessage = ref('')
const successMessage = ref('')
const journalDetail = ref(null)

const accountTypes = [
  { value: 'asset', label: 'Aset' },
  { value: 'liability', label: 'Kewajiban' },
  { value: 'equity', label: 'Modal' },
  { value: 'revenue', label: 'Pendapatan' },
  { value: 'expense', label: 'Beban' },
]

function emptyAccountForm() {
  return {
    id: null,
    code: '',
    name: '',
    type: 'asset',
    normal_balance: 'debit',
    opening_balance: 0,
    status: 'active',
    parent_id: '',
  }
}

function emptyJournalLine() {
  return {
    account_id: '',
    description: '',
    debit: 0,
    credit: 0,
  }
}

function emptyJournalForm() {
  const uniqueSuffix = String(Date.now()).slice(-6)

  return {
    voucher_number: `JV-${today.replaceAll('-', '')}-${uniqueSuffix}`,
    transaction_date: today,
    description: '',
    lines: [
      emptyJournalLine(),
      emptyJournalLine(),
    ],
  }
}

const accountForm = ref(emptyAccountForm())
const journalForm = ref(emptyJournalForm())

const filteredAccounts = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  const data = accounts.value.filter((account) => {
    const matchKeyword =
      !search ||
      String(account.code || '').toLowerCase().includes(search) ||
      String(account.name || '').toLowerCase().includes(search)

    const matchType =
      selectedType.value === 'all' ||
      account.type === selectedType.value

    return matchKeyword && matchType
  })

  // Sort by newest first using created_at or id if available
  return [...data].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : (a.id ? -a.id : 0)
    const dateB = b.created_at ? new Date(b.created_at) : (b.id ? -b.id : 0)
    return dateB - dateA
  })
})

const paginatedAccounts = computed(() => {
  const start = (currentPageAccounts.value - 1) * PAGE_SIZE
  return filteredAccounts.value.slice(start, start + PAGE_SIZE)
})

const activeAccounts = computed(() => {
  return accounts.value.filter((account) => account.status === 'active')
})

const filteredJournalTransactions = computed(() => {
  const search = transactionSearch.value.toLowerCase().trim()

  const filtered = journalTransactions.value.filter((transaction) => {
    const matchSearch =
      !search ||
      String(transaction.voucher_number || '').toLowerCase().includes(search) ||
      String(transaction.description || '').toLowerCase().includes(search)

    const matchDate =
      !transactionDate.value ||
      transaction.transaction_date === transactionDate.value

    return matchSearch && matchDate
  })

  // Sort by newest first using transaction_date or created_at or id
  return [...filtered].sort((a, b) => {
    const dateA = a.transaction_date ? new Date(a.transaction_date) : (a.created_at ? new Date(a.created_at) : (a.id ? -a.id : 0))
    const dateB = b.transaction_date ? new Date(b.transaction_date) : (b.created_at ? new Date(b.created_at) : (b.id ? -b.id : 0))
    return dateB - dateA
  })
})

const paginatedJournals = computed(() => {
  const start = (currentPageJournals.value - 1) * PAGE_SIZE
  return filteredJournalTransactions.value.slice(start, start + PAGE_SIZE)
})

const availableParents = computed(() => {
  return accounts.value.filter((account) => account.id !== accountForm.value.id)
})

const totalJournalDebit = computed(() => {
  return journalForm.value.lines.reduce(
    (total, line) => total + Number(line.debit || 0),
    0,
  )
})

const totalJournalCredit = computed(() => {
  return journalForm.value.lines.reduce(
    (total, line) => total + Number(line.credit || 0),
    0,
  )
})

const journalIsBalanced = computed(() => {
  return (
    totalJournalDebit.value > 0 &&
    Math.abs(totalJournalDebit.value - totalJournalCredit.value) <= 0.005
  )
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function typeLabel(type) {
  return accountTypes.find((item) => item.value === type)?.label || type || '-'
}

function statusLabel(status) {
  const labels = {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    draft: 'Draft',
    approved: 'Disetujui',
    posted: 'Posted',
    rejected: 'Ditolak',
  }

  return labels[status] || status || '-'
}

function normalBalanceLabel(balance) {
  return balance === 'credit' ? 'Kredit' : 'Debit'
}

function defaultNormalBalance(type) {
  return type === 'asset' || type === 'expense' ? 'debit' : 'credit'
}

function sourceLabel(sourceType) {
  const labels = {
    asset_acquisition: 'Perolehan Aset',
    asset_depreciation: 'Penyusutan Aset',
    invoice: 'Invoice',
    invoice_payment: 'Pembayaran Piutang',
    bill: 'Tagihan Vendor',
    bill_payment: 'Pembayaran Utang',
    tax_payment: 'Setoran Pajak',
    employee_payroll: 'Payroll Karyawan',
    manual: 'Jurnal Manual',
    opening_balance: 'Saldo Awal',
  }

  return labels[sourceType] || 'Transaksi Jurnal'
}

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function allocationsText(allocations) {
  return Array.isArray(allocations) ? allocations : []
}

async function loadAccounts() {
  isLoadingAccounts.value = true

  try {
    const response = await api.get('/accounts')
    accounts.value = response.data.data || []
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil Chart of Accounts. Pastikan backend berjalan.',
    )
  } finally {
    isLoadingAccounts.value = false
  }
}

async function loadJournalTransactions() {
  isLoadingTransactions.value = true

  try {
    const response = await api.get('/journal-transactions', {
      params: {
        search: transactionSearch.value || undefined,
        date: transactionDate.value || undefined,
      },
    })

    journalTransactions.value = response.data.data || []
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil transaksi jurnal.',
    )
  } finally {
    isLoadingTransactions.value = false
  }
}

async function refreshCurrentMode() {
  clearMessages()

  if (activeMode.value === 'coa') {
    await loadAccounts()
  } else {
    await loadJournalTransactions()
  }
}

function switchMode(mode) {
  activeMode.value = mode
  clearMessages()

  if (mode === 'journal' && journalTransactions.value.length === 0) {
    loadJournalTransactions()
  }
}

function openAddAccountModal() {
  clearMessages()
  accountForm.value = emptyAccountForm()
  showAccountModal.value = true
}

function openEditAccountModal(account) {
  clearMessages()

  accountForm.value = {
    id: account.id,
    code: account.code || '',
    name: account.name || '',
    type: account.type || 'asset',
    normal_balance: account.normal_balance || defaultNormalBalance(account.type),
    opening_balance: Number(account.opening_balance || 0),
    status: account.status || 'active',
    parent_id: account.parent_id ? String(account.parent_id) : '',
  }

  showAccountModal.value = true
}

function closeAccountModal() {
  showAccountModal.value = false
  accountForm.value = emptyAccountForm()
}

function onAccountTypeChange() {
  accountForm.value.normal_balance = defaultNormalBalance(accountForm.value.type)
}

function accountPayload(statusOverride = null) {
  return {
    code: accountForm.value.code.trim(),
    name: accountForm.value.name.trim(),
    type: accountForm.value.type,
    normal_balance: accountForm.value.normal_balance,
    opening_balance: Number(accountForm.value.opening_balance || 0),
    status: statusOverride || accountForm.value.status,
    parent_id: accountForm.value.parent_id
      ? Number(accountForm.value.parent_id)
      : null,
  }
}

async function saveAccount() {
  if (!accountForm.value.code.trim() || !accountForm.value.name.trim()) {
    errorMessage.value = 'Kode akun dan nama akun wajib diisi.'
    return
  }

  if (Number(accountForm.value.opening_balance) < 0) {
    errorMessage.value = 'Saldo awal tidak boleh bernilai negatif.'
    return
  }

  isSavingAccount.value = true
  clearMessages()

  try {
    if (accountForm.value.id) {
      await api.put(
        `/accounts/${accountForm.value.id}`,
        accountPayload(),
      )
      successMessage.value = 'Akun berhasil diperbarui.'
    } else {
      await api.post('/accounts', accountPayload())
      successMessage.value = 'Akun baru berhasil ditambahkan.'
    }

    await loadAccounts()
    closeAccountModal()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal menyimpan akun.')
  } finally {
    isSavingAccount.value = false
  }
}

async function toggleAccountStatus(account) {
  const nextStatus = account.status === 'active' ? 'inactive' : 'active'
  const confirmationText =
    nextStatus === 'inactive'
      ? `Nonaktifkan akun "${account.name}"?`
      : `Aktifkan akun "${account.name}"?`

  if (!window.confirm(confirmationText)) return

  clearMessages()

  try {
    await api.put(`/accounts/${account.id}`, {
      code: account.code,
      name: account.name,
      type: account.type,
      normal_balance: account.normal_balance,
      opening_balance: Number(account.opening_balance || 0),
      status: nextStatus,
      parent_id: account.parent_id || null,
    })

    successMessage.value = 'Status akun berhasil diperbarui.'
    await loadAccounts()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengubah status akun.',
    )
  }
}

async function deleteAccount(account) {
  if (!window.confirm(`Hapus akun "${account.code} - ${account.name}"?`)) return

  clearMessages()

  try {
    await api.delete(`/accounts/${account.id}`)
    successMessage.value = 'Akun berhasil dihapus.'
    await loadAccounts()

    if (accountForm.value.id === account.id) {
      closeAccountModal()
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Akun gagal dihapus karena sudah dipakai transaksi.',
    )
  }
}

function openJournalModal() {
  clearMessages()
  journalForm.value = emptyJournalForm()
  showJournalModal.value = true
}

function closeJournalModal() {
  showJournalModal.value = false
  journalForm.value = emptyJournalForm()
}

function addJournalLine() {
  journalForm.value.lines.push(emptyJournalLine())
}

function removeJournalLine(index) {
  if (journalForm.value.lines.length <= 2) {
    errorMessage.value = 'Jurnal minimal harus memiliki dua baris akun.'
    return
  }

  journalForm.value.lines.splice(index, 1)
}

function normalizeJournalLines() {
  return journalForm.value.lines.map((line) => ({
    account_id: Number(line.account_id),
    description: String(line.description || '').trim() || null,
    debit: Number(line.debit || 0),
    credit: Number(line.credit || 0),
  }))
}

async function saveJournal() {
  clearMessages()

  if (!journalForm.value.voucher_number.trim()) {
    errorMessage.value = 'Nomor voucher wajib diisi.'
    return
  }

  if (!journalForm.value.transaction_date) {
    errorMessage.value = 'Tanggal jurnal wajib diisi.'
    return
  }

  if (!journalForm.value.description.trim()) {
    errorMessage.value = 'Keterangan memo transaksi wajib diisi.'
    return
  }

  const lines = normalizeJournalLines()

  const invalidLine = lines.find(
    (line) =>
      !Number.isInteger(line.account_id) ||
      line.account_id <= 0 ||
      (line.debit <= 0 && line.credit <= 0) ||
      (line.debit > 0 && line.credit > 0),
  )

  if (invalidLine) {
    errorMessage.value =
      'Setiap baris jurnal harus memilih akun dan mengisi debit atau kredit.'
    return
  }

  if (!journalIsBalanced.value) {
    errorMessage.value =
      'Jurnal belum seimbang. Total debit harus sama dengan total kredit.'
    return
  }

  isSavingJournal.value = true

  try {
    const response = await api.post('/journals', {
      voucher_number: journalForm.value.voucher_number.trim(),
      transaction_date: journalForm.value.transaction_date,
      description: journalForm.value.description.trim(),
      source_type: 'manual',
      source_id: null,
      lines,
    })

    successMessage.value =
      response.data.message || 'Entri jurnal berhasil disimpan.'

    closeJournalModal()
    activeMode.value = 'journal'
    await loadJournalTransactions()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal menyimpan entri jurnal.',
    )
  } finally {
    isSavingJournal.value = false
  }
}

async function openJournalDetail(transaction) {
  clearMessages()
  showJournalDetailModal.value = true
  isLoadingJournalDetail.value = true
  journalDetail.value = null

  try {
    const response = await api.get(`/journals/${transaction.id}`)
    journalDetail.value = response.data.data
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil detail jurnal.',
    )
  } finally {
    isLoadingJournalDetail.value = false
  }
}

function closeJournalDetailModal() {
  showJournalDetailModal.value = false
  journalDetail.value = null
}

function resetTransactionFilter() {
  transactionSearch.value = ''
  transactionDate.value = ''
  loadJournalTransactions()
}

// Reset to page 1 when filters change
watch([keyword, selectedType], () => {
  currentPageAccounts.value = 1
})

watch([transactionSearch, transactionDate], () => {
  currentPageJournals.value = 1
})

onMounted(async () => {
  await loadAccounts()
})
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">GENERAL LEDGER & JOURNAL ENTRY</p>
        <h1>Buku Besar & Entri Jurnal</h1>
        <p>
          Kelola Chart of Accounts perusahaan serta lihat transaksi jurnal
          harian beserta alokasi debit dan kreditnya.
        </p>
      </div>

      <button
        v-if="activeMode === 'coa'"
        type="button"
        class="primary-button"
        @click="openAddAccountModal"
      >
        + Tambah Akun COA
      </button>

      <button
        v-else
        type="button"
        class="primary-button"
        @click="openJournalModal"
      >
        + Entri Jurnal Baru
      </button>
    </div>

    <div class="segmented-tabs">
      <button
        type="button"
        class="segmented-button"
        :class="{ active: activeMode === 'coa' }"
        @click="switchMode('coa')"
      >
        <span class="tab-icon">▣</span>
        Chart of Accounts
      </button>

      <button
        type="button"
        class="segmented-button"
        :class="{ active: activeMode === 'journal' }"
        @click="switchMode('journal')"
      >
        <span class="tab-icon">↔</span>
        Jurnal Transaksi
      </button>
    </div>

    <article v-if="errorMessage" class="notice-message error-message">
      {{ errorMessage }}
    </article>

    <article v-if="successMessage" class="notice-message success-message">
      {{ successMessage }}
    </article>

    <template v-if="activeMode === 'coa'">
      <article class="panel content-panel">
        <div class="coa-toolbar">
          <div class="filter-group">
            <input
              v-model="keyword"
              class="module-search"
              type="text"
              placeholder="Cari kode atau nama akun..."
            />

            <select v-model="selectedType" class="filter-select">
              <option value="all">Semua Klasifikasi</option>
              <option
                v-for="type in accountTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>

          <span class="table-count">
            Menampilkan {{ filteredAccounts.length }} akun
          </span>
        </div>

        <div class="table-wrapper">
          <table class="coa-table">
            <thead>
              <tr>
                <th>Kode Akun</th>
                <th>Nama Akun Buku Besar</th>
                <th>Tipe Klasifikasi</th>
                <th>Saldo Berjalan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="isLoadingAccounts">
                <td colspan="6" class="empty-table">
                  Memuat Chart of Accounts...
                </td>
              </tr>

              <tr
                v-else
                v-for="account in paginatedAccounts"
                :key="account.id"
              >
                <td>
                  <strong class="account-code">{{ account.code }}</strong>
                </td>

                <td>
                  <strong class="account-name">{{ account.name }}</strong>
                  <small v-if="account.parent_name" class="table-subtext">
                    Induk: {{ account.parent_code }} - {{ account.parent_name }}
                  </small>
                  <small v-else class="table-subtext">
                    Saldo normal: {{ normalBalanceLabel(account.normal_balance) }}
                  </small>
                </td>

                <td>
                  <span class="classification-badge">
                    {{ typeLabel(account.type) }}
                  </span>
                </td>

                <td>
                  <strong class="balance-value">
                    {{ formatCurrency(account.current_balance) }}
                  </strong>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="{ danger: account.status === 'inactive' }"
                  >
                    {{ statusLabel(account.status) }}
                  </span>
                </td>

                <td class="account-action-cell">
                  <button
                    type="button"
                    class="table-action"
                    @click="openEditAccountModal(account)"
                  >
                    Ubah
                  </button>

                  <button
                    type="button"
                    class="table-action"
                    @click="toggleAccountStatus(account)"
                  >
                    {{ account.status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}
                  </button>
                </td>
              </tr>

              <tr v-if="!isLoadingAccounts && filteredAccounts.length === 0">
                <td colspan="6" class="empty-table">
                  Data akun tidak ditemukan.
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Controls for COA -->
          <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
            <div class="text-xs text-[#6B7A90]">
              Menampilkan {{ Math.min((currentPageAccounts - 1) * PAGE_SIZE + 1, filteredAccounts.length) }} - {{ Math.min(currentPageAccounts * PAGE_SIZE, filteredAccounts.length) }} dari {{ filteredAccounts.length }} data
            </div>
            <div class="flex items-center gap-2">
              <button
                :disabled="currentPageAccounts <= 1"
                @click="currentPageAccounts = Math.max(1, currentPageAccounts - 1)"
                class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg class="w-3 h-3 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                Prev
              </button>
              <button
                :disabled="currentPageAccounts >= Math.ceil(filteredAccounts.length / PAGE_SIZE)"
                @click="currentPageAccounts = currentPageAccounts + 1"
                class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg class="w-3 h-3 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    </template>

    <template v-else>
      <article class="panel content-panel">
        <div class="journal-toolbar">
          <div class="filter-group">
            <input
              v-model="transactionSearch"
              class="module-search"
              type="text"
              placeholder="Cari keterangan memo atau voucher..."
              @keyup.enter="loadJournalTransactions"
            />

            <label class="date-filter">
              <span>Tanggal:</span>
              <input
                v-model="transactionDate"
                type="date"
                @change="loadJournalTransactions"
              />
            </label>
          </div>

          <div class="journal-toolbar-actions">
            <button
              type="button"
              class="table-action"
              @click="resetTransactionFilter"
            >
              Reset
            </button>

            <span class="table-count">
              {{ filteredJournalTransactions.length }} transaksi
            </span>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="journal-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Ref. Voucher</th>
                <th>Keterangan Memo Transaksi</th>
                <th>Alokasi Debit/Kredit</th>
                <th>Nominal</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="isLoadingTransactions">
                <td colspan="6" class="empty-table">
                  Memuat transaksi jurnal...
                </td>
              </tr>

              <tr
                v-else
                v-for="transaction in paginatedJournals"
                :key="transaction.id"
              >
                <td class="date-column">
                  {{ formatDate(transaction.transaction_date) }}
                </td>

                <td>
                  <strong class="voucher-code">
                    {{ transaction.voucher_number }}
                  </strong>
                  <small
                    class="journal-status"
                    :class="`status-${transaction.status}`"
                  >
                    {{ statusLabel(transaction.status) }}
                  </small>
                </td>

                <td class="memo-column">
                  <strong>
                    {{ transaction.description || 'Tanpa keterangan memo' }}
                  </strong>
                  <small class="table-subtext">
                    {{ sourceLabel(transaction.source_type) }}
                  </small>
                </td>

                <td class="allocation-column">
                  <span
                    v-for="allocation in allocationsText(transaction.debit_allocations)"
                    :key="`debit-${transaction.id}-${allocation}`"
                    class="allocation debit-allocation"
                  >
                    {{ allocation }}
                  </span>

                  <span
                    v-for="allocation in allocationsText(transaction.credit_allocations)"
                    :key="`credit-${transaction.id}-${allocation}`"
                    class="allocation credit-allocation"
                  >
                    {{ allocation }}
                  </span>
                </td>

                <td>
                  <strong class="nominal-value">
                    {{ formatCurrency(transaction.total_debit) }}
                  </strong>
                </td>

                <td>
                  <button
                    type="button"
                    class="detail-button"
                    @click="openJournalDetail(transaction)"
                  >
                    Detail
                  </button>
                </td>
              </tr>

              <tr
                v-if="!isLoadingTransactions && filteredJournalTransactions.length === 0"
              >
                <td colspan="6" class="empty-table">
                  Belum ada transaksi yang sesuai dengan filter.
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Controls for Journals -->
          <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
            <div class="text-xs text-[#6B7A90]">
              Menampilkan {{ Math.min((currentPageJournals - 1) * PAGE_SIZE + 1, filteredJournalTransactions.length) }} - {{ Math.min(currentPageJournals * PAGE_SIZE, filteredJournalTransactions.length) }} dari {{ filteredJournalTransactions.length }} data
            </div>
            <div class="flex items-center gap-2">
              <button
                :disabled="currentPageJournals <= 1"
                @click="currentPageJournals = Math.max(1, currentPageJournals - 1)"
                class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg class="w-3 h-3 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                Prev
              </button>
              <button
                :disabled="currentPageJournals >= Math.ceil(filteredJournalTransactions.length / PAGE_SIZE)"
                @click="currentPageJournals = currentPageJournals + 1"
                class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg class="w-3 h-3 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    </template>

    <div
      v-if="showAccountModal"
      class="modal-backdrop"
      @click.self="closeAccountModal"
    >
      <form class="modal-card account-modal" @submit.prevent="saveAccount">
        <div class="modal-header">
          <div>
            <p class="eyebrow">CHART OF ACCOUNTS</p>
            <h3>{{ accountForm.id ? 'Ubah Akun COA' : 'Tambah Akun COA' }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closeAccountModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label>
            Kode Akun
            <input
              v-model="accountForm.code"
              type="text"
              maxlength="30"
              placeholder="Contoh: 1110"
              required
            />
          </label>

          <label>
            Tipe Klasifikasi
            <select v-model="accountForm.type" @change="onAccountTypeChange">
              <option
                v-for="type in accountTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </label>

          <label class="full-width">
            Nama Akun
            <input
              v-model="accountForm.name"
              type="text"
              placeholder="Contoh: Bank Mandiri"
              required
            />
          </label>

          <label>
            Saldo Awal
            <input
              v-model.number="accountForm.opening_balance"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              required
            />
          </label>

          <label>
            Saldo Normal
            <select v-model="accountForm.normal_balance">
              <option value="debit">Debit</option>
              <option value="credit">Kredit</option>
            </select>
          </label>

          <label>
            Status Akun
            <select v-model="accountForm.status">
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </label>

          <label>
            Akun Induk <span class="optional-label">(opsional)</span>
            <select v-model="accountForm.parent_id">
              <option value="">Tidak ada akun induk</option>
              <option
                v-for="account in availableParents"
                :key="account.id"
                :value="String(account.id)"
              >
                {{ account.code }} - {{ account.name }}
              </option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button
            v-if="accountForm.id"
            type="button"
            class="secondary-button danger-button"
            @click="deleteAccount(accountForm)"
          >
            Hapus
          </button>

          <button
            type="button"
            class="secondary-button"
            @click="closeAccountModal"
          >
            Batal
          </button>

          <button
            type="submit"
            class="primary-button"
            :disabled="isSavingAccount"
          >
            {{ isSavingAccount ? 'Menyimpan...' : 'Simpan Akun' }}
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="showJournalModal"
      class="modal-backdrop"
      @click.self="closeJournalModal"
    >
      <form class="modal-card journal-modal" @submit.prevent="saveJournal">
        <div class="modal-header">
          <div>
            <p class="eyebrow">ENTRI JURNAL BARU</p>
            <h3>Catat Transaksi Jurnal</h3>
          </div>

          <button type="button" class="modal-close" @click="closeJournalModal">
            ×
          </button>
        </div>

        <p class="journal-form-note">
          Jurnal harus memiliki minimal dua akun dan total debit wajib sama
          dengan total kredit.
        </p>

        <div class="form-grid journal-head-grid">
          <label>
            Ref. Voucher
            <input
              v-model="journalForm.voucher_number"
              type="text"
              maxlength="50"
              required
            />
          </label>

          <label>
            Tanggal
            <input v-model="journalForm.transaction_date" type="date" required />
          </label>

          <label class="full-width">
            Keterangan Memo Transaksi
            <input
              v-model="journalForm.description"
              type="text"
              placeholder="Contoh: Pembelian perlengkapan operasional"
              required
            />
          </label>
        </div>

        <div class="journal-lines-wrapper">
          <div class="journal-lines-heading">
            <strong>Alokasi Debit dan Kredit</strong>
            <button type="button" class="table-action" @click="addJournalLine">
              + Tambah Baris
            </button>
          </div>

          <div class="journal-lines-table">
            <div class="journal-line-header">
              <span>Akun</span>
              <span>Keterangan</span>
              <span>Debit</span>
              <span>Kredit</span>
              <span></span>
            </div>

            <div
              v-for="(line, index) in journalForm.lines"
              :key="index"
              class="journal-line-row"
            >
              <select v-model="line.account_id" required>
                <option disabled value="">Pilih akun</option>
                <option
                  v-for="account in activeAccounts"
                  :key="account.id"
                  :value="account.id"
                >
                  {{ account.code }} - {{ account.name }}
                </option>
              </select>

              <input
                v-model="line.description"
                type="text"
                placeholder="Opsional"
              />

              <input
                v-model.number="line.debit"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
              />

              <input
                v-model.number="line.credit"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
              />

              <button
                type="button"
                class="remove-line-button"
                title="Hapus baris"
                @click="removeJournalLine(index)"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div class="journal-total-box">
          <span>
            Total Debit
            <strong>{{ formatCurrency(totalJournalDebit) }}</strong>
          </span>
          <span>
            Total Kredit
            <strong>{{ formatCurrency(totalJournalCredit) }}</strong>
          </span>
          <span
            class="balance-check"
            :class="{ balanced: journalIsBalanced }"
          >
            {{ journalIsBalanced ? 'Jurnal Seimbang' : 'Belum Seimbang' }}
          </span>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            :disabled="isSavingJournal"
            @click="closeJournalModal"
          >
            Batal
          </button>

          <button
            type="submit"
            class="primary-button"
            :disabled="isSavingJournal || !journalIsBalanced"
          >
            {{ isSavingJournal ? 'Menyimpan...' : 'Simpan Entri Jurnal' }}
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="showJournalDetailModal"
      class="modal-backdrop"
      @click.self="closeJournalDetailModal"
    >
      <div class="modal-card journal-detail-modal">
        <div class="modal-header">
          <div>
            <p class="eyebrow">DETAIL TRANSAKSI JURNAL</p>
            <h3>
              {{ journalDetail?.voucher_number || 'Memuat Detail Voucher...' }}
            </h3>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="closeJournalDetailModal"
          >
            ×
          </button>
        </div>

        <div v-if="isLoadingJournalDetail" class="detail-loading">
          Memuat detail jurnal...
        </div>

        <template v-else-if="journalDetail">
          <div class="journal-detail-meta">
            <div>
              <span>Tanggal</span>
              <strong>{{ formatDate(journalDetail.transaction_date) }}</strong>
            </div>
            <div>
              <span>Sumber</span>
              <strong>{{ sourceLabel(journalDetail.source_type) }}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{{ statusLabel(journalDetail.status) }}</strong>
            </div>
          </div>

          <p class="detail-description">
            {{ journalDetail.description || 'Tanpa keterangan memo.' }}
          </p>

          <div class="table-wrapper">
            <table class="detail-lines-table">
              <thead>
                <tr>
                  <th>Kode Akun</th>
                  <th>Nama Akun</th>
                  <th>Keterangan Baris</th>
                  <th>Debit</th>
                  <th>Kredit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in journalDetail.lines" :key="line.id">
                  <td><strong>{{ line.account_code }}</strong></td>
                  <td>{{ line.account_name }}</td>
                  <td>{{ line.description || '-' }}</td>
                  <td>{{ line.debit > 0 ? formatCurrency(line.debit) : '-' }}</td>
                  <td>{{ line.credit > 0 ? formatCurrency(line.credit) : '-' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="3">Total</th>
                  <th>{{ formatCurrency(journalDetail.total_debit) }}</th>
                  <th>{{ formatCurrency(journalDetail.total_credit) }}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </template>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            @click="closeJournalDetailModal"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.segmented-tabs {
  display: flex;
  width: fit-content;
  margin: -54px 164px 22px auto;
  border: 1px solid #dce7f2;
  border-radius: 12px;
  padding: 4px;
  background: #f7faff;
}

.segmented-button {
  border: 0;
  border-radius: 8px;
  padding: 11px 16px;
  background: transparent;
  color: #7388a0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}

.segmented-button.active {
  box-shadow: 0 2px 8px rgba(34, 75, 118, .12);
  background: #fff;
  color: #234c76;
}

.tab-icon {
  margin-right: 7px;
  font-size: 14px;
}

.notice-message {
  margin-bottom: 14px;
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

.content-panel {
  overflow: hidden;
  padding: 0;
}

.coa-toolbar,
.journal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 17px 18px;
}

.journal-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.module-search {
  min-width: 310px;
}

.filter-select {
  min-width: 165px;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #70849b;
  font-size: 11px;
  font-weight: 800;
}

.date-filter input {
  min-width: 150px;
}

.coa-table thead th,
.journal-table thead th,
.detail-lines-table thead th {
  background: #eef6ff;
  color: #315a82;
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.coa-table td,
.journal-table td {
  padding-top: 17px;
  padding-bottom: 17px;
}

.account-code,
.voucher-code {
  color: #284f76;
  font-size: 13px;
}

.account-name {
  color: #253f5b;
  font-size: 13px;
}

.table-subtext {
  display: block;
  margin-top: 4px;
  color: #8394a8;
  font-size: 10px;
  line-height: 1.4;
}

.classification-badge,
.status-badge,
.journal-status,
.source-badge {
  display: inline-flex;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 800;
}

.classification-badge {
  background: #eef5fd;
  color: #4b78a3;
}

.status-badge {
  background: #e6f8ef;
  color: #28714e;
}

.status-badge.danger {
  background: #fff0f0;
  color: #b55252;
}

.balance-value,
.nominal-value {
  color: #2c4d70;
  white-space: nowrap;
}

.account-action-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 160px;
}

.date-column {
  min-width: 105px;
  color: #415d79;
  white-space: nowrap;
}

.memo-column {
  min-width: 300px;
}

.memo-column > strong {
  color: #2d435d;
  line-height: 1.45;
}

.allocation-column {
  min-width: 260px;
}

.allocation {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.45;
}

.debit-allocation {
  color: #2c6da4;
}

.credit-allocation {
  color: #8492a3;
}

.journal-status {
  margin-top: 5px;
  background: #edf2f7;
  color: #6b7d90;
}

.status-posted {
  background: #e6f8ef;
  color: #28714e;
}

.status-approved {
  background: #edf6ff;
  color: #28659b;
}

.status-rejected {
  background: #fff0f0;
  color: #b55252;
}

.detail-button {
  border: 1px solid #cddfed;
  border-radius: 8px;
  padding: 7px 10px;
  background: #f7fbff;
  color: #28649a;
  cursor: pointer;
  font-size: 10px;
  font-weight: 800;
}

.account-modal {
  width: min(720px, calc(100vw - 32px));
}

.journal-modal {
  width: min(1080px, calc(100vw - 32px));
}

.journal-detail-modal {
  width: min(920px, calc(100vw - 32px));
}

.journal-form-note {
  margin: 0 0 16px;
  color: #70849d;
  font-size: 12px;
  line-height: 1.55;
}

.journal-head-grid {
  margin-bottom: 16px;
}

.journal-lines-wrapper {
  border: 1px solid #dfebf5;
  border-radius: 10px;
  padding: 12px;
  background: #fbfdff;
}

.journal-lines-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: #315573;
  font-size: 12px;
}

.journal-lines-table {
  overflow-x: auto;
}

.journal-line-header,
.journal-line-row {
  display: grid;
  grid-template-columns: minmax(200px, 1.35fr) minmax(160px, 1fr) minmax(110px, .7fr) minmax(110px, .7fr) 34px;
  gap: 8px;
  min-width: 700px;
}

.journal-line-header {
  margin-bottom: 7px;
  color: #6e829a;
  font-size: 10px;
  font-weight: 800;
}

.journal-line-row {
  margin-bottom: 8px;
}

.remove-line-button {
  border: 1px solid #f2d2d2;
  border-radius: 7px;
  background: #fff7f7;
  color: #bb5a5a;
  cursor: pointer;
  font-size: 17px;
  line-height: 1;
}

.journal-total-box {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 14px;
  border: 1px solid #dceaf6;
  border-radius: 9px;
  padding: 12px;
  background: #f5faff;
}

.journal-total-box span {
  display: grid;
  gap: 4px;
  color: #71869e;
  font-size: 10px;
  font-weight: 700;
}

.journal-total-box strong {
  color: #244f77;
  font-size: 13px;
}

.balance-check {
  color: #bc5c5c !important;
}

.balance-check.balanced {
  color: #27734f !important;
}

.danger-button {
  border-color: #f0c6c6;
  color: #b34f4f;
}

.detail-loading {
  padding: 36px 0;
  color: #73869f;
  text-align: center;
  font-size: 13px;
}

.journal-detail-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.journal-detail-meta > div {
  border: 1px solid #e1eaf3;
  border-radius: 8px;
  padding: 10px;
}

.journal-detail-meta span {
  display: block;
  margin-bottom: 5px;
  color: #7c8fa7;
  font-size: 10px;
  font-weight: 800;
}

.journal-detail-meta strong {
  color: #345674;
  font-size: 12px;
}

.detail-description {
  margin: 0 0 14px;
  border-left: 3px solid #91bde4;
  padding: 9px 11px;
  background: #f6fbff;
  color: #58728e;
  font-size: 12px;
  line-height: 1.55;
}

.detail-lines-table tfoot th {
  border-top: 1px solid #dce8f2;
  background: #f7fbff;
  color: #355875;
}

@media (max-width: 1000px) {
  .segmented-tabs {
    margin: 0 0 18px;
  }

  .coa-toolbar,
  .journal-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
    flex-wrap: wrap;
  }

  .module-search {
    flex: 1 1 260px;
  }
}

@media (max-width: 680px) {
  .segmented-tabs {
    width: 100%;
  }

  .segmented-button {
    flex: 1;
    padding: 10px 8px;
    font-size: 11px;
  }

  .filter-group,
  .journal-toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .module-search,
  .filter-select,
  .date-filter,
  .date-filter input {
    width: 100%;
    min-width: 0;
  }

  .journal-total-box,
  .journal-detail-meta {
    grid-template-columns: 1fr;
    flex-direction: column;
  }
}

@media print {
  .segmented-tabs,
  .page-heading button,
  .filter-group,
  .journal-toolbar-actions,
  .account-action-cell,
  .detail-button,
  .modal-backdrop {
    display: none !important;
  }
}
</style>
