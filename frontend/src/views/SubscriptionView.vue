<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const today = new Date().toISOString().slice(0, 10)

const subscriptions = ref([])
const summary = ref({
  active_count: 0,
  monthly_burn_rate: 0,
  due_count: 0,
  draft_bill_count: 0,
})

const keyword = ref('')
const selectedCategory = ref('Semua')
const selectedStatus = ref('all')

const showSubscriptionModal = ref(false)
const editingSubscriptionId = ref(null)

const isLoading = ref(false)
const isSaving = ref(false)
const isGenerating = ref(false)

const errorMessage = ref('')
const successMessage = ref('')
const currentPage = ref(1)
const PAGE_SIZE = 10

function emptyForm() {
  return {
    subscription_name: '',
    provider_name: '',
    category: 'Software',
    amount: 0,
    billing_cycle: 'monthly',
    start_date: today,
    renewal_date: today,
    payment_terms_days: 0,
    status: 'active',
    notes: '',
  }
}

const form = ref(emptyForm())

const categories = computed(() => {
  const values = new Set(
    subscriptions.value
      .map((subscription) => subscription.category)
      .filter(Boolean),
  )

  return ['Semua', ...Array.from(values).sort()]
})

const filteredSubscriptions = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  const filtered = subscriptions.value.filter((subscription) => {
    const matchesSearch =
      !search ||
      String(subscription.subscription_name || '').toLowerCase().includes(search) ||
      String(subscription.provider_name || '').toLowerCase().includes(search) ||
      String(subscription.category || '').toLowerCase().includes(search)

    const matchesCategory =
      selectedCategory.value === 'Semua' ||
      subscription.category === selectedCategory.value

    const matchesStatus =
      selectedStatus.value === 'all' ||
      subscription.status === selectedStatus.value

    return matchesSearch && matchesCategory && matchesStatus
  })

  return filtered.sort((a, b) => {
    const dateA = a.renewal_date ? new Date(a.renewal_date) : (a.created_at ? new Date(a.created_at) : new Date(0))
    const dateB = b.renewal_date ? new Date(b.renewal_date) : (b.created_at ? new Date(b.created_at) : new Date(0))
    return dateB - dateA
  })
})

const paginatedSubscriptions = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredSubscriptions.value.slice(start, start + PAGE_SIZE)
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

function cycleLabel(cycle) {
  const labels = {
    monthly: 'Bulanan',
    quarterly: 'Triwulanan',
    yearly: 'Tahunan',
  }

  return labels[cycle] || cycle || '-'
}

function subscriptionStatusLabel(status) {
  const labels = {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    cancelled: 'Dibatalkan',
  }

  return labels[status] || status || '-'
}

function billStatusLabel(status) {
  const labels = {
    draft: 'Draft',
    unpaid: 'Belum Lunas',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
    overdue: 'Terlambat',
    cancelled: 'Dibatalkan',
  }

  return labels[status] || '-'
}

function renewalStatusClass(subscription) {
  const key = subscription.renewal_status?.key

  return {
    danger: key === 'overdue',
    warning: key === 'due',
    muted:
      key === 'inactive' ||
      key === 'cancelled' ||
      key === 'missing_date',
  }
}

function billStatusClass(status) {
  return {
    draft: status === 'draft',
    paid: status === 'paid',
    warning: status === 'unpaid' || status === 'partial',
    danger: status === 'overdue',
    muted: status === 'cancelled' || !status,
  }
}

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

async function loadSubscriptions() {
  isLoading.value = true

  try {
    const response = await api.get('/subscriptions')
    subscriptions.value = response.data.data.subscriptions || []
    summary.value = response.data.data.summary || summary.value
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data langganan. Pastikan backend berjalan.',
    )
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  clearMessages()
  editingSubscriptionId.value = null
  form.value = emptyForm()
  showSubscriptionModal.value = true
}

function openEditModal(subscription) {
  clearMessages()
  editingSubscriptionId.value = subscription.id

  form.value = {
    subscription_name: subscription.subscription_name || '',
    provider_name: subscription.provider_name || '',
    category: subscription.category || 'Software',
    amount: Number(subscription.amount || 0),
    billing_cycle: subscription.billing_cycle || 'monthly',
    start_date: String(subscription.start_date || today).slice(0, 10),
    renewal_date: String(subscription.renewal_date || today).slice(0, 10),
    payment_terms_days: Number(subscription.payment_terms_days || 0),
    status: subscription.status || 'active',
    notes: subscription.notes || '',
  }

  showSubscriptionModal.value = true
}

function closeModal() {
  showSubscriptionModal.value = false
  editingSubscriptionId.value = null
  form.value = emptyForm()
}

async function saveSubscription() {
  clearMessages()

  if (!form.value.subscription_name.trim()) {
    errorMessage.value = 'Nama layanan wajib diisi.'
    return
  }

  if (!form.value.provider_name.trim()) {
    errorMessage.value = 'Provider wajib diisi.'
    return
  }

  if (Number(form.value.amount) <= 0) {
    errorMessage.value = 'Biaya langganan harus lebih dari 0.'
    return
  }

  isSaving.value = true

  const payload = {
    ...form.value,
    amount: Number(form.value.amount),
    payment_terms_days: Number(form.value.payment_terms_days || 0),
  }

  try {
    if (editingSubscriptionId.value) {
      await api.put(`/subscriptions/${editingSubscriptionId.value}`, payload)
      successMessage.value = 'Langganan berhasil diperbarui.'
    } else {
      await api.post('/subscriptions', payload)
      successMessage.value = 'Langganan berhasil disimpan.'
    }

    closeModal()
    await loadSubscriptions()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal menyimpan langganan.',
    )
  } finally {
    isSaving.value = false
  }
}

async function createDraftBill(subscription) {
  clearMessages()

  const confirmed = window.confirm(
    `Buat draft tagihan untuk ${subscription.subscription_name}?\n\n` +
      `Tanggal tagihan: ${formatDate(subscription.renewal_date)}\n` +
      `Nominal: ${formatCurrency(subscription.amount)}\n\n` +
      'Draft akan muncul di menu Utang. Jurnal belum dibuat sampai tagihan diterbitkan.',
  )

  if (!confirmed) return

  isGenerating.value = true

  try {
    const response = await api.post(
      `/subscriptions/${subscription.id}/create-bill`,
    )

    successMessage.value =
      `${response.data.message} ` +
      `Nomor draft: ${response.data.data.bill_number}. ` +
      `Tanggal tagihan berikutnya: ${formatDate(response.data.data.next_renewal_date)}.`

    await loadSubscriptions()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal membuat draft tagihan langganan.',
    )
  } finally {
    isGenerating.value = false
  }
}

async function generateDueBills() {
  clearMessages()

  const confirmed = window.confirm(
    'Buat draft tagihan untuk seluruh langganan aktif yang tanggal renewal-nya hari ini atau sudah lewat?\n\n' +
      'Draft akan masuk ke menu Utang dan belum membuat jurnal.',
  )

  if (!confirmed) return

  isGenerating.value = true

  try {
    const response = await api.post('/subscriptions/generate-due-bills')
    const createdCount = response.data.data.created?.length || 0
    const skippedCount = response.data.data.skipped?.length || 0

    successMessage.value =
      `${response.data.message} ` +
      `Dibuat: ${createdCount}. Dilewati: ${skippedCount}.`

    await loadSubscriptions()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal membuat draft tagihan jatuh tempo.',
    )
  } finally {
    isGenerating.value = false
  }
}

watch([keyword, selectedCategory, selectedStatus], () => {
  currentPage.value = 1
})

onMounted(loadSubscriptions)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">RECURRING OPERATING COST</p>
        <h1>Langganan</h1>
        <p>
          Kelola biaya layanan berulang dan buat draft tagihan yang akan
          diterbitkan melalui menu Utang.
        </p>
      </div>

      <div class="page-button-group">
        <button
          type="button"
          class="secondary-button"
          :disabled="isGenerating"
          @click="generateDueBills"
        >
          {{
            isGenerating
              ? 'Memproses...'
              : 'Buat Draft Jatuh Tempo'
          }}
        </button>

        <button type="button" class="primary-button" @click="openAddModal">
          + Tambah Langganan
        </button>
      </div>
    </div>

    <article v-if="errorMessage" class="subscription-message error-message">
      {{ errorMessage }}
    </article>

    <article v-if="successMessage" class="subscription-message success-message">
      {{ successMessage }}
    </article>

    <div class="subscription-metrics">
      <article class="subscription-stat">
        <p>Estimasi Burn Rate Bulanan</p>
        <h2>{{ formatCurrency(summary.monthly_burn_rate) }}</h2>
        <small>Akumulasi biaya setara per bulan dari langganan aktif</small>
      </article>

      <article class="subscription-stat">
        <p>Layanan Aktif</p>
        <h2>{{ summary.active_count || 0 }} Layanan</h2>
        <small>Langganan dengan status aktif</small>
      </article>

      <article class="subscription-stat">
        <p>Perlu Dibuatkan Tagihan</p>
        <h2>{{ summary.due_count || 0 }} Layanan</h2>
        <small>Renewal hari ini atau sudah lewat</small>
      </article>

      <article class="subscription-stat">
        <p>Draft Menunggu Penerbitan</p>
        <h2>{{ summary.draft_bill_count || 0 }} Draft</h2>
        <small>Terbitkan dari menu Utang untuk membuat jurnal</small>
      </article>
    </div>

    <article class="workflow-guide">
      <span class="workflow-step">1. Langganan aktif</span>
      <span class="workflow-arrow">→</span>
      <span class="workflow-step">2. Buat draft tagihan</span>
      <span class="workflow-arrow">→</span>
      <span class="workflow-step">3. Terbitkan di Utang</span>
      <span class="workflow-arrow">→</span>
      <span class="workflow-step">4. Bayar tagihan</span>
    </article>

    <article class="panel content-panel">
      <div class="subscription-toolbar">
        <div class="filter-group">
          <input
            v-model="keyword"
            class="module-search"
            type="text"
            placeholder="Cari layanan, provider, atau kategori..."
          />

          <select v-model="selectedCategory" class="filter-select">
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>

          <select v-model="selectedStatus" class="filter-select compact-filter">
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        <span class="table-count">
          {{ filteredSubscriptions.length }} layanan
        </span>
      </div>

      <div class="table-wrapper">
        <table class="subscription-table">
          <thead>
            <tr>
              <th>Layanan</th>
              <th>Kategori</th>
              <th>Biaya & Siklus</th>
              <th>Tagihan Berikutnya</th>
              <th>Status Tagihan</th>
              <th>Tagihan Terakhir</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="isLoading">
              <td colspan="7" class="empty-table">
                Memuat data langganan...
              </td>
            </tr>

            <tr
              v-else
              v-for="subscription in paginatedSubscriptions"
              :key="subscription.id"
            >
              <td>
                <strong>{{ subscription.subscription_name }}</strong>
                <small class="table-subtext">
                  {{ subscription.provider_name }}
                </small>
                <small class="table-subtext muted-text">
                  {{ subscriptionStatusLabel(subscription.status) }}
                </small>
              </td>

              <td>
                <span class="category-chip">
                  {{ subscription.category || 'Software' }}
                </span>
              </td>

              <td>
                <strong>{{ formatCurrency(subscription.amount) }}</strong>
                <small class="table-subtext">
                  {{ cycleLabel(subscription.billing_cycle) }} · Setara
                  {{ formatCurrency(subscription.monthly_equivalent) }}/bulan
                </small>
              </td>

              <td>
                <strong>{{ formatDate(subscription.renewal_date) }}</strong>
                <small
                  class="renewal-badge"
                  :class="renewalStatusClass(subscription)"
                >
                  {{ subscription.renewal_status?.label || '-' }}
                </small>
              </td>

              <td>
                <span
                  class="bill-status"
                  :class="billStatusClass(subscription.latest_bill_status)"
                >
                  {{
                    subscription.latest_bill_status
                      ? billStatusLabel(subscription.latest_bill_status)
                      : 'Belum Ada Draft'
                  }}
                </span>
              </td>

              <td>
                <strong>{{ subscription.latest_bill_number || '-' }}</strong>
                <small v-if="subscription.last_billed_date" class="table-subtext">
                  Dibuat: {{ formatDate(subscription.last_billed_date) }}
                </small>
              </td>

              <td class="action-cell">
                <button
                  type="button"
                  class="table-action emphasis-action"
                  :disabled="
                    isGenerating ||
                    subscription.status !== 'active'
                  "
                  @click="createDraftBill(subscription)"
                >
                  Buat Draft
                </button>

                <button
                  type="button"
                  class="table-action"
                  @click="openEditModal(subscription)"
                >
                  Ubah
                </button>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredSubscriptions.length === 0">
              <td colspan="7" class="empty-table">
                Belum ada langganan yang sesuai dengan filter.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
          <div class="text-xs text-[#6B7A90]">
            Menampilkan {{ Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredSubscriptions.length) }} - {{ Math.min(currentPage * PAGE_SIZE, filteredSubscriptions.length) }} dari {{ filteredSubscriptions.length }} data
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
              :disabled="currentPage >= Math.ceil(filteredSubscriptions.length / PAGE_SIZE)"
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
      v-if="showSubscriptionModal"
      class="modal-backdrop"
      @click.self="closeModal"
    >
      <form class="modal-card subscription-modal" @submit.prevent="saveSubscription">
        <div class="modal-header">
          <div>
            <p class="eyebrow">LANGGANAN OPERASIONAL</p>
            <h3>
              {{
                editingSubscriptionId
                  ? 'Ubah Langganan'
                  : 'Tambah Langganan Baru'
              }}
            </h3>
          </div>

          <button type="button" class="modal-close" @click="closeModal">
            ×
          </button>
        </div>

        <p class="modal-note">
          Menyimpan langganan tidak membuat jurnal. Jurnal baru terbentuk
          setelah draft tagihan diterbitkan dari menu Utang.
        </p>

        <div class="form-grid">
          <label>
            Nama Layanan
            <input
              v-model="form.subscription_name"
              type="text"
              maxlength="150"
              placeholder="Contoh: Google Workspace"
              required
            />
          </label>

          <label>
            Provider
            <input
              v-model="form.provider_name"
              type="text"
              maxlength="150"
              placeholder="Contoh: Google"
              required
            />
          </label>

          <label>
            Kategori
            <input
              v-model="form.category"
              type="text"
              maxlength="100"
              placeholder="Contoh: Software"
              required
            />
          </label>

          <label>
            Siklus Tagihan
            <select v-model="form.billing_cycle">
              <option value="monthly">Bulanan</option>
              <option value="quarterly">Triwulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </label>

          <label>
            Biaya per Siklus
            <input
              v-model.number="form.amount"
              type="number"
              min="1"
              step="1"
              placeholder="Contoh: 1000000"
              required
            />
          </label>

          <label>
            Status Langganan
            <select v-model="form.status">
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </label>

          <label>
            Tanggal Mulai
            <input v-model="form.start_date" type="date" required />
          </label>

          <label>
            Tanggal Tagihan Berikutnya
            <input v-model="form.renewal_date" type="date" required />
          </label>

          <label>
            Jatuh Tempo Draft (hari)
            <input
              v-model.number="form.payment_terms_days"
              type="number"
              min="0"
              max="365"
              step="1"
              required
            />
          </label>

          <label class="full-width">
            Catatan <span class="optional-label">(opsional)</span>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Contoh: Dibebankan ke akun Beban Internet dan Software saat tagihan diterbitkan."
            ></textarea>
          </label>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            :disabled="isSaving"
            @click="closeModal"
          >
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Langganan' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.subscription-message {
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

.subscription-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.subscription-stat {
  min-height: 116px;
  border: 1px solid #e1eaf4;
  border-radius: 11px;
  padding: 16px;
  background: white;
}

.subscription-stat p,
.subscription-stat small {
  margin: 0;
  color: #7187a1;
  font-size: 12px;
  line-height: 1.45;
}

.subscription-stat h2 {
  margin: 9px 0 6px;
  color: #173f68;
  font-size: 20px;
}

.workflow-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
  border: 1px solid #dceafa;
  border-radius: 10px;
  padding: 12px;
  background: #f8fbff;
}

.workflow-step {
  color: #4a6f93;
  font-size: 11px;
  font-weight: 800;
}

.workflow-arrow {
  color: #8ea9c5;
  font-size: 17px;
}

.content-panel {
  overflow: hidden;
  padding: 0;
}

.subscription-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 17px 18px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 9px;
}

.module-search {
  min-width: 285px;
}

.filter-select {
  min-width: 145px;
}

.compact-filter {
  min-width: 130px;
}

.subscription-table thead th {
  background: #eef6ff;
  color: #315a82;
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.subscription-table td {
  padding-top: 16px;
  padding-bottom: 16px;
  vertical-align: top;
}

.table-subtext {
  display: block;
  margin-top: 4px;
  color: #8293a8;
  font-size: 10px;
  line-height: 1.4;
}

.muted-text {
  color: #9baabc;
}

.category-chip,
.renewal-badge,
.bill-status {
  display: inline-flex;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 800;
}

.category-chip {
  background: #eef5fd;
  color: #4b78a3;
}

.renewal-badge {
  margin-top: 5px;
  background: #e7f6ed;
  color: #27734f;
}

.renewal-badge.warning {
  background: #fff3df;
  color: #9b6c28;
}

.renewal-badge.danger {
  background: #fff0f0;
  color: #b55252;
}

.renewal-badge.muted {
  background: #edf1f5;
  color: #718399;
}

.bill-status {
  background: #edf1f5;
  color: #74869b;
}

.bill-status.draft {
  background: #edf6ff;
  color: #28659b;
}

.bill-status.paid {
  background: #e6f8ef;
  color: #27734f;
}

.bill-status.warning {
  background: #fff3df;
  color: #9b6c28;
}

.bill-status.danger {
  background: #fff0f0;
  color: #b55252;
}

.bill-status.muted {
  background: #edf1f5;
  color: #74869b;
}

.action-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 145px;
}

.emphasis-action {
  border-color: #bdd9f5;
  background: #eff7ff;
  color: #23649f;
}

.subscription-modal {
  width: min(760px, calc(100vw - 32px));
}

.modal-note {
  margin: 0 0 16px;
  color: #637995;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1080px) {
  .subscription-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .subscription-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 700px) {
  .subscription-metrics {
    grid-template-columns: 1fr;
  }

  .workflow-guide {
    align-items: flex-start;
    flex-direction: column;
  }

  .workflow-arrow {
    display: none;
  }

  .filter-group {
    align-items: stretch;
    flex-direction: column;
  }

  .module-search,
  .filter-select {
    width: 100%;
    min-width: 0;
  }
}

@media print {
  .page-button-group,
  .subscription-toolbar,
  .action-cell,
  .modal-backdrop {
    display: none !important;
  }
}
</style>
