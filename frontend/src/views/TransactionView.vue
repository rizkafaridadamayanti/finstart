<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

/*
  Halaman Transaksi FinStart
  API yang digunakan:
  GET    /api/accounts
  GET    /api/journals
  GET    /api/journals/:id
  POST   /api/journals
  POST   /api/journals/:id/approve
  POST   /api/journals/:id/post
  DELETE /api/journals/:id
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const accounts = ref([])
const journals = ref([])

const keyword = ref('')
const showJournalModal = ref(false)
const showDetailModal = ref(false)

const isLoading = ref(false)
const isSaving = ref(false)
const currentPage = ref(1)
const PAGE_SIZE = 10
const pendingAction = ref('')
const errorMessage = ref('')

const selectedTemplate = ref('Jurnal Umum')
const selectedJournal = ref(null)

const today = new Date().toISOString().slice(0, 10)

function emptyLine() {
  return {
    account_id: '',
    amount: 0,
  }
}

function emptyForm() {
  return {
    transaction_date: today,
    voucher_number: '',
    description: '',
    debit_lines: [emptyLine()],
    credit_lines: [emptyLine()],
  }
}

const form = ref(emptyForm())

const activeAccounts = computed(() => {
  return accounts.value.filter((account) => account.status === 'active')
})

const filteredJournals = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  let filtered
  if (!search) {
    filtered = journals.value
  } else {
    filtered = journals.value.filter((journal) => {
      return [
        journal.voucher_number,
        journal.description,
        journal.status,
        journal.transaction_date,
      ].some((value) => String(value || '').toLowerCase().includes(search))
    })
  }

  return filtered.sort((a, b) => {
    const dateA = a.transaction_date ? new Date(a.transaction_date) : (a.created_at ? new Date(a.created_at) : new Date(0))
    const dateB = b.transaction_date ? new Date(b.transaction_date) : (b.created_at ? new Date(b.created_at) : new Date(0))
    return dateB - dateA
  })
})

const paginatedJournals = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredJournals.value.slice(start, start + PAGE_SIZE)
})

const debitTotal = computed(() => {
  return form.value.debit_lines.reduce((total, line) => {
    return total + Number(line.amount || 0)
  }, 0)
})

const creditTotal = computed(() => {
  return form.value.credit_lines.reduce((total, line) => {
    return total + Number(line.amount || 0)
  }, 0)
})

const isBalanced = computed(() => {
  return (
    debitTotal.value > 0 &&
    creditTotal.value > 0 &&
    Math.abs(debitTotal.value - creditTotal.value) < 0.01
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

  const dateText = String(value).slice(0, 10)
  const [year, month, day] = dateText.split('-')

  if (!year || !month || !day) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(Number(year), Number(month) - 1, Number(day)))
}

function statusLabel(status) {
  const labels = {
    draft: 'Draft',
    approved: 'Disetujui',
    posted: 'Diposting',
    rejected: 'Ditolak',
  }

  return labels[status] || status || '-'
}

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function getNewVoucher() {
  const [year, month, day] = today.split('-')
  const sequence = String(journals.value.length + 1).padStart(3, '0')

  return `JV-${year}${month}${day}-${sequence}`
}

function findAccountIdByCode(code) {
  return activeAccounts.value.find((account) => account.code === code)?.id || ''
}

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [accountResponse, journalResponse] = await Promise.all([
      api.get('/accounts'),
      api.get('/journals'),
    ])

    accounts.value = accountResponse.data.data || []
    journals.value = journalResponse.data.data || []
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data. Pastikan backend Node.js berjalan di http://localhost:4000.',
    )
  } finally {
    isLoading.value = false
  }
}

function openJournalModal() {
  selectedTemplate.value = 'Jurnal Umum'

  form.value = {
    transaction_date: today,
    voucher_number: getNewVoucher(),
    description: '',
    debit_lines: [emptyLine()],
    credit_lines: [emptyLine()],
  }

  showJournalModal.value = true
}

function closeJournalModal() {
  showJournalModal.value = false
  form.value = emptyForm()
}

function applyTemplate() {
  const cashAccount = findAccountIdByCode('1110')
  const bankAccount = findAccountIdByCode('1120') || cashAccount
  const revenueAccount = findAccountIdByCode('4100')
  const salaryExpenseAccount = findAccountIdByCode('5100')
  const operatingExpenseAccount = findAccountIdByCode('5200')
  const ownerCapitalAccount = findAccountIdByCode('3100')

  if (selectedTemplate.value === 'Setoran Modal') {
    form.value.description = 'Setoran modal awal perusahaan'
    form.value.debit_lines = [{ account_id: cashAccount, amount: 0 }]
    form.value.credit_lines = [{ account_id: ownerCapitalAccount, amount: 0 }]
    return
  }

  if (selectedTemplate.value === 'Pendapatan') {
    form.value.description = 'Penerimaan pendapatan jasa'
    form.value.debit_lines = [{ account_id: bankAccount, amount: 0 }]
    form.value.credit_lines = [{ account_id: revenueAccount, amount: 0 }]
    return
  }

  if (selectedTemplate.value === 'Bayar Gaji') {
    form.value.description = 'Pembayaran gaji pegawai'
    form.value.debit_lines = [{ account_id: salaryExpenseAccount, amount: 0 }]
    form.value.credit_lines = [{ account_id: bankAccount, amount: 0 }]
    return
  }

  if (selectedTemplate.value === 'Beban Operasional') {
    form.value.description = 'Pembayaran beban operasional'
    form.value.debit_lines = [{ account_id: operatingExpenseAccount, amount: 0 }]
    form.value.credit_lines = [{ account_id: bankAccount, amount: 0 }]
    return
  }

  form.value.description = ''
  form.value.debit_lines = [emptyLine()]
  form.value.credit_lines = [emptyLine()]
}

function addDebitLine() {
  form.value.debit_lines.push(emptyLine())
}

function addCreditLine() {
  form.value.credit_lines.push(emptyLine())
}

function removeDebitLine(index) {
  if (form.value.debit_lines.length > 1) {
    form.value.debit_lines.splice(index, 1)
  }
}

function removeCreditLine(index) {
  if (form.value.credit_lines.length > 1) {
    form.value.credit_lines.splice(index, 1)
  }
}

function buildJournalLines() {
  const debitLines = form.value.debit_lines.map((line) => ({
    account_id: Number(line.account_id),
    debit: Number(line.amount || 0),
    credit: 0,
  }))

  const creditLines = form.value.credit_lines.map((line) => ({
    account_id: Number(line.account_id),
    debit: 0,
    credit: Number(line.amount || 0),
  }))

  return [...debitLines, ...creditLines]
}

function hasInvalidLine(lines) {
  return lines.some((line) => {
    return !Number.isInteger(line.account_id) || line.account_id <= 0
  })
}

async function saveJournal() {
  const journalLines = buildJournalLines()

  if (!form.value.voucher_number.trim()) {
    alert('Nomor voucher wajib diisi.')
    return
  }

  if (!form.value.description.trim()) {
    alert('Keterangan jurnal wajib diisi.')
    return
  }

  if (hasInvalidLine(journalLines)) {
    alert('Pilih akun pada setiap baris debit dan kredit.')
    return
  }

  if (!isBalanced.value) {
    alert('Total debit harus sama dengan total kredit.')
    return
  }

  isSaving.value = true

  try {
    await api.post('/journals', {
      voucher_number: form.value.voucher_number.trim(),
      transaction_date: form.value.transaction_date,
      description: form.value.description.trim(),
      lines: journalLines,
    })

    await loadData()
    closeJournalModal()

    alert('Jurnal berhasil dibuat sebagai Draft. Setujui lalu posting agar saldo akun berubah.')
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal membuat jurnal.'))
  } finally {
    isSaving.value = false
  }
}

async function openJournalDetail(journal) {
  pendingAction.value = `detail-${journal.id}`

  try {
    const response = await api.get(`/journals/${journal.id}`)
    selectedJournal.value = response.data.data
    showDetailModal.value = true
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal mengambil detail jurnal.'))
  } finally {
    pendingAction.value = ''
  }
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedJournal.value = null
}

async function approveJournal(journal) {
  if (!confirm(`Setujui jurnal ${journal.voucher_number}?`)) return

  pendingAction.value = `approve-${journal.id}`

  try {
    const response = await api.post(`/journals/${journal.id}/approve`, {})
    selectedJournal.value = response.data.data

    await loadData()
    alert('Jurnal berhasil disetujui.')
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal menyetujui jurnal.'))
  } finally {
    pendingAction.value = ''
  }
}

async function postJournal(journal) {
  if (!confirm(`Posting jurnal ${journal.voucher_number}? Saldo akun akan diperbarui.`)) {
    return
  }

  pendingAction.value = `post-${journal.id}`

  try {
    const response = await api.post(`/journals/${journal.id}/post`, {})
    selectedJournal.value = response.data.data

    await loadData()
    alert('Jurnal berhasil diposting dan saldo akun sudah diperbarui.')
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal memposting jurnal.'))
  } finally {
    pendingAction.value = ''
  }
}

async function deleteJournal(journal) {
  if (!confirm(`Hapus jurnal draft ${journal.voucher_number}?`)) return

  pendingAction.value = `delete-${journal.id}`

  try {
    await api.delete(`/journals/${journal.id}`)
    closeDetailModal()

    await loadData()
    alert('Jurnal draft berhasil dihapus.')
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal menghapus jurnal.'))
  } finally {
    pendingAction.value = ''
  }
}

watch(keyword, () => {
  currentPage.value = 1
})

onMounted(loadData)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">PENCATATAN KEUANGAN</p>
        <h1>Transaksi</h1>
        <p>Catat jurnal debit-kredit, setujui, lalu posting agar saldo akun diperbarui.</p>
      </div>

      <button type="button" class="primary-button" @click="openJournalModal">
        + Entri Jurnal Baru
      </button>
    </div>

    <div class="module-toolbar">
      <input
        v-model="keyword"
        class="module-search"
        type="text"
        placeholder="Cari voucher, keterangan, atau status..."
      />

      <span class="table-count">{{ filteredJournals.length }} transaksi</span>
    </div>

    <article v-if="errorMessage" class="panel">
      <div class="panel-header">
        <div>
          <h3>API Belum Terhubung</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <button type="button" class="table-action" @click="loadData">
          Coba Lagi
        </button>
      </div>
    </article>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Riwayat Transaksi</h3>
          <p>Saldo akun hanya berubah saat jurnal berstatus Diposting.</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Ref. Voucher</th>
              <th>Keterangan</th>
              <th>Nominal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="empty-table">
                Memuat data jurnal...
              </td>
            </tr>

            <tr v-else v-for="journal in paginatedJournals" :key="journal.id">
              <td>{{ formatDate(journal.transaction_date) }}</td>

              <td>
                <strong>{{ journal.voucher_number }}</strong>
              </td>

              <td>{{ journal.description || '-' }}</td>

              <td>{{ formatCurrency(journal.total_debit) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="{
                    warning: journal.status === 'draft',
                    danger: journal.status === 'rejected',
                  }"
                >
                  {{ statusLabel(journal.status) }}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  class="table-action"
                  :disabled="pendingAction === `detail-${journal.id}`"
                  @click="openJournalDetail(journal)"
                >
                  Detail
                </button>

                <button
                  v-if="journal.status === 'draft'"
                  type="button"
                  class="table-action"
                  :disabled="pendingAction === `approve-${journal.id}`"
                  @click="approveJournal(journal)"
                >
                  Setujui
                </button>

                <button
                  v-if="journal.status === 'approved'"
                  type="button"
                  class="table-action"
                  :disabled="pendingAction === `post-${journal.id}`"
                  @click="postJournal(journal)"
                >
                  Posting
                </button>

                <span
                  v-if="journal.status === 'posted'"
                  class="table-subtext"
                >
                  Saldo diperbarui
                </span>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredJournals.length === 0">
              <td colspan="6" class="empty-table">
                Belum ada transaksi jurnal.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
          <div class="text-xs text-[#6B7A90]">
            Menampilkan {{ Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredJournals.length) }} - {{ Math.min(currentPage * PAGE_SIZE, filteredJournals.length) }} dari {{ filteredJournals.length }} data
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
              :disabled="currentPage >= Math.ceil(filteredJournals.length / PAGE_SIZE)"
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

    <!-- Modal input jurnal baru -->
    <div
      v-if="showJournalModal"
      class="modal-backdrop"
      @click.self="closeJournalModal"
    >
      <form class="modal-card transaction-modal" @submit.prevent="saveJournal">
        <div class="modal-header">
          <div>
            <p class="eyebrow">ENTRI JURNAL</p>
            <h3>Jurnal Transaksi Baru</h3>
          </div>

          <button type="button" class="modal-close" @click="closeJournalModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label class="full-width">
            Template Jurnal Cepat
            <select v-model="selectedTemplate" @change="applyTemplate">
              <option value="Jurnal Umum">Jurnal Umum</option>
              <option value="Setoran Modal">Setoran Modal</option>
              <option value="Pendapatan">Pendapatan</option>
              <option value="Bayar Gaji">Bayar Gaji</option>
              <option value="Beban Operasional">Beban Operasional</option>
            </select>
          </label>

          <label>
            Tanggal Transaksi
            <input
              v-model="form.transaction_date"
              type="date"
              required
            />
          </label>

          <label>
            Nomor Voucher
            <input
              v-model="form.voucher_number"
              type="text"
              placeholder="Contoh: JV-20260702-001"
              required
            />
          </label>

          <label class="full-width">
            Keterangan Jurnal
            <input
              v-model="form.description"
              type="text"
              placeholder="Contoh: Penerimaan pembayaran jasa dari klien"
              required
            />
          </label>
        </div>

        <section class="journal-section">
          <div class="journal-heading">
            <div>
              <h4>Entri Debit</h4>
              <p>Pilih akun yang menerima nilai debit.</p>
            </div>

            <strong>{{ formatCurrency(debitTotal) }}</strong>
          </div>

          <div
            v-for="(line, index) in form.debit_lines"
            :key="`debit-${index}`"
            class="journal-line"
          >
            <select v-model="line.account_id">
              <option value="">Pilih akun debit</option>

              <option
                v-for="account in activeAccounts"
                :key="account.id"
                :value="account.id"
              >
                {{ account.code }} - {{ account.name }}
              </option>
            </select>

            <input
              v-model.number="line.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Nominal"
            />

            <button
              type="button"
              class="remove-line"
              title="Hapus baris debit"
              @click="removeDebitLine(index)"
            >
              ×
            </button>
          </div>

          <button
            type="button"
            class="add-line-button"
            @click="addDebitLine"
          >
            + Tambah Baris Debit
          </button>
        </section>

        <section class="journal-section">
          <div class="journal-heading">
            <div>
              <h4>Entri Kredit</h4>
              <p>Pilih akun yang menerima nilai kredit.</p>
            </div>

            <strong>{{ formatCurrency(creditTotal) }}</strong>
          </div>

          <div
            v-for="(line, index) in form.credit_lines"
            :key="`credit-${index}`"
            class="journal-line"
          >
            <select v-model="line.account_id">
              <option value="">Pilih akun kredit</option>

              <option
                v-for="account in activeAccounts"
                :key="account.id"
                :value="account.id"
              >
                {{ account.code }} - {{ account.name }}
              </option>
            </select>

            <input
              v-model.number="line.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Nominal"
            />

            <button
              type="button"
              class="remove-line"
              title="Hapus baris kredit"
              @click="removeCreditLine(index)"
            >
              ×
            </button>
          </div>

          <button
            type="button"
            class="add-line-button"
            @click="addCreditLine"
          >
            + Tambah Baris Kredit
          </button>
        </section>

        <div
          class="journal-total"
          :class="{ balanced: isBalanced, unbalanced: !isBalanced }"
        >
          <div>
            <span>Total Debit</span>
            <strong>{{ formatCurrency(debitTotal) }}</strong>
          </div>

          <div>
            <span>Total Kredit</span>
            <strong>{{ formatCurrency(creditTotal) }}</strong>
          </div>

          <p v-if="isBalanced">
            ✓ Debit dan kredit sudah seimbang.
          </p>

          <p v-else>
            Debit dan kredit harus memiliki nominal yang sama.
          </p>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            @click="closeJournalModal"
          >
            Batal
          </button>

          <button
            type="submit"
            class="primary-button"
            :disabled="isSaving || !isBalanced"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan sebagai Draft' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal detail jurnal -->
    <div
      v-if="showDetailModal && selectedJournal"
      class="modal-backdrop"
      @click.self="closeDetailModal"
    >
      <section class="modal-card transaction-modal">
        <div class="modal-header">
          <div>
            <p class="eyebrow">DETAIL JURNAL</p>
            <h3>{{ selectedJournal.voucher_number }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closeDetailModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label>
            Tanggal Transaksi
            <input :value="formatDate(selectedJournal.transaction_date)" disabled />
          </label>

          <label>
            Status
            <input :value="statusLabel(selectedJournal.status)" disabled />
          </label>

          <label class="full-width">
            Keterangan
            <input :value="selectedJournal.description || '-'" disabled />
          </label>
        </div>

        <section class="journal-section">
          <div class="journal-heading">
            <div>
              <h4>Rincian Debit dan Kredit</h4>
              <p>Data baris jurnal yang tersimpan di database.</p>
            </div>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Akun</th>
                  <th>Keterangan</th>
                  <th>Debit</th>
                  <th>Kredit</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="line in selectedJournal.lines"
                  :key="line.id"
                >
                  <td>
                    <strong>{{ line.account_code }}</strong>
                    <small class="table-subtext">{{ line.account_name }}</small>
                  </td>

                  <td>{{ line.description || '-' }}</td>
                  <td>{{ formatCurrency(line.debit) }}</td>
                  <td>{{ formatCurrency(line.credit) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="journal-total balanced">
          <div>
            <span>Total Debit</span>
            <strong>{{ formatCurrency(selectedJournal.total_debit) }}</strong>
          </div>

          <div>
            <span>Total Kredit</span>
            <strong>{{ formatCurrency(selectedJournal.total_credit) }}</strong>
          </div>

          <p>Jurnal seimbang.</p>
        </div>

        <div class="modal-actions">
          <button
            v-if="selectedJournal.status === 'draft'"
            type="button"
            class="secondary-button"
            :disabled="pendingAction === `delete-${selectedJournal.id}`"
            @click="deleteJournal(selectedJournal)"
          >
            Hapus Draft
          </button>

          <button
            v-if="selectedJournal.status === 'draft'"
            type="button"
            class="secondary-button"
            :disabled="pendingAction === `approve-${selectedJournal.id}`"
            @click="approveJournal(selectedJournal)"
          >
            {{ pendingAction === `approve-${selectedJournal.id}` ? 'Menyetujui...' : 'Setujui Jurnal' }}
          </button>

          <button
            v-if="selectedJournal.status === 'approved'"
            type="button"
            class="primary-button"
            :disabled="pendingAction === `post-${selectedJournal.id}`"
            @click="postJournal(selectedJournal)"
          >
            {{ pendingAction === `post-${selectedJournal.id}` ? 'Memposting...' : 'Posting Jurnal' }}
          </button>

          <button
            v-if="selectedJournal.status === 'posted'"
            type="button"
            class="secondary-button"
            @click="closeDetailModal"
          >
            Jurnal Sudah Diposting
          </button>
        </div>
      </section>
    </div>
  </section>
</template>
