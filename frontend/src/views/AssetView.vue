<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const today = new Date().toISOString().slice(0, 10)
const currentPeriod = new Date().toISOString().slice(0, 7)

const assets = ref([])
const paymentAccounts = ref([])
const summary = ref({
  total_assets: 0,
  active_assets: 0,
  total_acquisition_cost: 0,
  total_accumulated_depreciation: 0,
  total_book_value: 0,
})
const policy = ref({
  method: 'Garis lurus',
  start: 'Penyusutan dimulai pada bulan setelah tanggal perolehan.',
})

const selectedStatus = ref('all')
const depreciationPeriod = ref(currentPeriod)
const isLoading = ref(false)
const isSaving = ref(false)
const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const currentPage = ref(1)
const PAGE_SIZE = 10

const showAssetModal = ref(false)
const showHistoryModal = ref(false)
const historyLoading = ref(false)
const selectedAsset = ref(null)
const depreciationHistory = ref([])

const assetForm = ref({
  asset_code: '',
  asset_name: '',
  category: 'Peralatan',
  acquisition_date: today,
  acquisition_cost: 0,
  useful_life_months: 36,
  residual_value: 0,
  payment_account_id: '',
  notes: '',
})

function numberValue(value) {
  return Number(value || 0)
}

function money(value) {
  return Math.round((numberValue(value) + Number.EPSILON) * 100) / 100
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue(value))
}

function formatDate(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${String(value).slice(0, 10)}T00:00:00`))
}

function formatPeriod(value) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return '-'
  const [year, month] = value.split('-').map(Number)

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function getDefaultPaymentAccount() {
  const bank = paymentAccounts.value.find((account) => account.code === '1120')
  return bank?.id || paymentAccounts.value[0]?.id || ''
}

function resetAssetForm() {
  assetForm.value = {
    asset_code: '',
    asset_name: '',
    category: 'Peralatan',
    acquisition_date: today,
    acquisition_cost: 0,
    useful_life_months: 36,
    residual_value: 0,
    payment_account_id: getDefaultPaymentAccount(),
    notes: '',
  }
}

const estimatedMonthlyDepreciation = computed(() => {
  const cost = money(assetForm.value.acquisition_cost)
  const residual = money(assetForm.value.residual_value)
  const usefulLife = Number(assetForm.value.useful_life_months || 0)

  if (cost <= 0 || residual < 0 || residual >= cost || usefulLife <= 0) return 0
  return money((cost - residual) / usefulLife)
})

async function loadAssets() {
  isLoading.value = true
  clearMessages()

  try {
    const response = await api.get('/assets', {
      params: { status: selectedStatus.value },
    })

    const data = response.data.data
    assets.value = data.assets || []
    paymentAccounts.value = data.payment_accounts || []
    summary.value = data.summary || summary.value
    policy.value = data.accounting_policy || policy.value

    if (!assetForm.value.payment_account_id) {
      assetForm.value.payment_account_id = getDefaultPaymentAccount()
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data aset. Pastikan backend berjalan.',
    )
  } finally {
    isLoading.value = false
  }
}

function openAssetModal() {
  clearMessages()
  resetAssetForm()
  showAssetModal.value = true
}

function closeAssetModal() {
  showAssetModal.value = false
  resetAssetForm()
}

async function saveAsset() {
  clearMessages()

  if (!assetForm.value.asset_name.trim()) {
    errorMessage.value = 'Nama aset wajib diisi.'
    return
  }

  if (numberValue(assetForm.value.acquisition_cost) <= 0) {
    errorMessage.value = 'Harga perolehan aset harus lebih dari 0.'
    return
  }

  if (Number(assetForm.value.useful_life_months) <= 0) {
    errorMessage.value = 'Masa manfaat harus lebih dari 0 bulan.'
    return
  }

  if (
    numberValue(assetForm.value.residual_value) < 0 ||
    numberValue(assetForm.value.residual_value) >=
      numberValue(assetForm.value.acquisition_cost)
  ) {
    errorMessage.value = 'Nilai residu harus lebih kecil dari harga perolehan.'
    return
  }

  isSaving.value = true

  try {
    const response = await api.post('/assets', {
      asset_code: assetForm.value.asset_code,
      asset_name: assetForm.value.asset_name,
      category: assetForm.value.category,
      acquisition_date: assetForm.value.acquisition_date,
      acquisition_cost: numberValue(assetForm.value.acquisition_cost),
      useful_life_months: Number(assetForm.value.useful_life_months),
      residual_value: numberValue(assetForm.value.residual_value),
      payment_account_id: Number(assetForm.value.payment_account_id),
      notes: assetForm.value.notes,
    })

    closeAssetModal()
    successMessage.value = `${response.data.message} Voucher: ${response.data.data.journal_voucher_number}`
    await loadAssets()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'Gagal menyimpan aset.')
  } finally {
    isSaving.value = false
  }
}

async function processDepreciation(asset = null) {
  clearMessages()

  const scope = asset
    ? `aset ${asset.asset_name}`
    : 'semua aset aktif yang memenuhi syarat'

  const confirmed = window.confirm(
    `Posting penyusutan ${scope} untuk ${formatPeriod(depreciationPeriod.value)}?\n\n` +
      'Jurnal: Debit Beban Penyusutan (5250), Kredit Akumulasi Penyusutan (1220).',
  )

  if (!confirmed) return

  isProcessing.value = true

  try {
    const response = asset
      ? await api.post(`/assets/${asset.id}/depreciate`, {
          depreciation_period: depreciationPeriod.value,
        })
      : await api.post('/assets/depreciate-batch', {
          depreciation_period: depreciationPeriod.value,
        })

    if (asset) {
      successMessage.value = `${response.data.message} Voucher: ${response.data.data.journal_voucher_number}`
    } else {
      const processed = response.data.data.processed?.length || 0
      const skipped = response.data.data.skipped?.length || 0
      successMessage.value = `${response.data.message} Diposting: ${processed} aset. Dilewati: ${skipped} aset.`
    }

    await loadAssets()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal memproses penyusutan aset.',
    )
  } finally {
    isProcessing.value = false
  }
}

async function openHistory(asset) {
  clearMessages()
  selectedAsset.value = asset
  depreciationHistory.value = []
  showHistoryModal.value = true
  historyLoading.value = true

  try {
    const response = await api.get(`/assets/${asset.id}/depreciations`)
    selectedAsset.value = response.data.data.asset
    depreciationHistory.value = response.data.data.depreciations || []
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil riwayat penyusutan.',
    )
  } finally {
    historyLoading.value = false
  }
}

function closeHistoryModal() {
  showHistoryModal.value = false
  selectedAsset.value = null
  depreciationHistory.value = []
}

function statusLabel(status) {
  return {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    disposed: 'Dilepas',
  }[status] || status
}

function statusClass(status) {
  return {
    active: status === 'active',
    inactive: status === 'inactive',
    disposed: status === 'disposed',
  }
}

const filteredAssets = computed(() => {
  return [...assets.value].sort((a, b) => {
    const dateA = a.acquisition_date ? new Date(a.acquisition_date) : (a.created_at ? new Date(a.created_at) : new Date(0))
    const dateB = b.acquisition_date ? new Date(b.acquisition_date) : (b.created_at ? new Date(b.created_at) : new Date(0))
    return dateB - dateA
  })
})

const paginatedAssets = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredAssets.value.slice(start, start + PAGE_SIZE)
})

watch(selectedStatus, () => {
  currentPage.value = 1
  loadAssets()
})

onMounted(loadAssets)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">FIXED ASSET MANAGEMENT</p>
        <h1>Manajemen Aset</h1>
        <p>
          Catat perolehan aset, posting jurnal otomatis, dan proses penyusutan
          garis lurus yang terhubung ke laporan keuangan.
        </p>
      </div>

      <button type="button" class="primary-button" @click="openAssetModal">
        + Tambah Aset
      </button>
    </div>

    <article v-if="errorMessage" class="asset-message error-message">
      {{ errorMessage }}
    </article>

    <article v-if="successMessage" class="asset-message success-message">
      {{ successMessage }}
    </article>

    <div class="asset-metrics">
      <article class="asset-stat">
        <p>Total Aset</p>
        <h2>{{ summary.total_assets || 0 }}</h2>
        <small>{{ summary.active_assets || 0 }} aset masih aktif</small>
      </article>

      <article class="asset-stat">
        <p>Harga Perolehan</p>
        <h2>{{ formatCurrency(summary.total_acquisition_cost) }}</h2>
        <small>Total pembelian aset tercatat</small>
      </article>

      <article class="asset-stat">
        <p>Akumulasi Penyusutan</p>
        <h2>{{ formatCurrency(summary.total_accumulated_depreciation) }}</h2>
        <small>Akumulasi dari penyusutan posted</small>
      </article>

      <article class="asset-stat">
        <p>Nilai Buku</p>
        <h2>{{ formatCurrency(summary.total_book_value) }}</h2>
        <small>Harga perolehan setelah penyusutan</small>
      </article>
    </div>

    <article class="panel depreciation-panel">
      <div>
        <p class="eyebrow">PENYUSUTAN BULANAN</p>
        <h3>Posting Penyusutan Aset Aktif</h3>
        <p>{{ policy.method }}. {{ policy.start }}</p>
      </div>

      <div class="depreciation-actions">
        <label>
          Periode
          <input v-model="depreciationPeriod" type="month" />
        </label>

        <button
          type="button"
          class="secondary-button"
          :disabled="isProcessing || assets.length === 0"
          @click="processDepreciation()"
        >
          {{ isProcessing ? 'Memproses...' : 'Posting Semua Aset' }}
        </button>
      </div>
    </article>

    <article class="accounting-flow">
      <div class="flow-item">
        <span>1</span>
        <div>
          <strong>Perolehan</strong>
          <p>Debit Peralatan (1210), kredit Kas, Bank, atau Utang Usaha.</p>
        </div>
      </div>
      <b>→</b>
      <div class="flow-item">
        <span>2</span>
        <div>
          <strong>Penyusutan</strong>
          <p>Debit Beban Penyusutan (5250), kredit Akumulasi Penyusutan (1220).</p>
        </div>
      </div>
      <b>→</b>
      <div class="flow-item">
        <span>3</span>
        <div>
          <strong>Laporan</strong>
          <p>Nilai buku, neraca, dan laba rugi membaca jurnal posted.</p>
        </div>
      </div>
    </article>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Aset Tetap</h3>
          <p>Realisasi aset dan nilai buku dihitung dari data database.</p>
        </div>

        <div class="table-tools">
          <select v-model="selectedStatus">
            <option value="all">Semua Status</option>
            <option value="active">Aset Aktif</option>
            <option value="inactive">Tidak Aktif</option>
            <option value="disposed">Aset Dilepas</option>
          </select>
          <button type="button" class="table-action" @click="loadAssets">
            {{ isLoading ? 'Memuat...' : 'Perbarui Data' }}
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Kode & Aset</th>
              <th>Perolehan</th>
              <th>Harga Perolehan</th>
              <th>Akum. Penyusutan</th>
              <th>Nilai Buku</th>
              <th>Susut / Bulan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in paginatedAssets" :key="asset.id">
              <td>
                <strong>{{ asset.asset_name }}</strong>
                <small class="table-subtext">
                  {{ asset.asset_code }} · {{ asset.category || 'Tanpa kategori' }}
                </small>
                <small v-if="asset.acquisition_voucher_number" class="table-subtext voucher-text">
                  Voucher: {{ asset.acquisition_voucher_number }}
                </small>
              </td>
              <td>
                {{ formatDate(asset.acquisition_date) }}
                <small class="table-subtext">{{ asset.useful_life_months }} bulan</small>
              </td>
              <td>{{ formatCurrency(asset.acquisition_cost) }}</td>
              <td>{{ formatCurrency(asset.accumulated_depreciation) }}</td>
              <td>
                <strong>{{ formatCurrency(asset.book_value) }}</strong>
                <small class="table-subtext">Residu: {{ formatCurrency(asset.residual_value) }}</small>
              </td>
              <td>
                {{ formatCurrency(asset.monthly_depreciation) }}
                <small v-if="asset.last_depreciation_period" class="table-subtext">
                  Terakhir: {{ formatPeriod(asset.last_depreciation_period) }}
                </small>
              </td>
              <td>
                <span class="asset-status" :class="statusClass(asset.status)">
                  {{ statusLabel(asset.status) }}
                </span>
              </td>
              <td class="action-cell">
                <button type="button" class="table-action" @click="openHistory(asset)">
                  Riwayat
                </button>
                <button
                  v-if="asset.status === 'active'"
                  type="button"
                  class="table-action emphasis-action"
                  :disabled="isProcessing"
                  @click="processDepreciation(asset)"
                >
                  Susutkan
                </button>
              </td>
            </tr>
            <tr v-if="!isLoading && assets.length === 0">
              <td colspan="8" class="empty-table">
                Belum ada aset. Tambahkan aset pertama untuk membuat jurnal perolehan otomatis.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
          <div class="text-xs text-[#6B7A90]">
            Menampilkan {{ Math.min((currentPage - 1) * PAGE_SIZE + 1, assets.length) }} - {{ Math.min(currentPage * PAGE_SIZE, assets.length) }} dari {{ assets.length }} data
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
              :disabled="currentPage >= Math.ceil(assets.length / PAGE_SIZE)"
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

    <div v-if="showAssetModal" class="modal-backdrop" @click.self="closeAssetModal">
      <form class="modal-card asset-modal" @submit.prevent="saveAsset">
        <div class="modal-header">
          <div>
            <p class="eyebrow">PEROLEHAN ASET</p>
            <h3>Tambah Aset dan Posting Jurnal</h3>
          </div>
          <button type="button" class="modal-close" @click="closeAssetModal">×</button>
        </div>

        <p class="modal-note">
          Penyimpanan aset akan otomatis membuat jurnal <b>Debit Peralatan (1210)</b>
          dan mengkredit akun sumber pembayaran.
        </p>

        <div class="form-grid">
          <label>
            Kode Aset <span class="optional-label">(opsional)</span>
            <input v-model="assetForm.asset_code" maxlength="50" placeholder="Otomatis bila kosong" />
          </label>
          <label>
            Kategori
            <input v-model="assetForm.category" maxlength="100" required />
          </label>
          <label class="full-width">
            Nama Aset
            <input v-model="assetForm.asset_name" maxlength="150" placeholder="Contoh: Laptop Operasional" required />
          </label>
          <label>
            Tanggal Perolehan
            <input v-model="assetForm.acquisition_date" type="date" required />
          </label>
          <label>
            Sumber Pembayaran
            <select v-model="assetForm.payment_account_id" required>
              <option disabled value="">Pilih sumber pembayaran</option>
              <option v-for="account in paymentAccounts" :key="account.id" :value="account.id">
                {{ account.code }} - {{ account.name }}
              </option>
            </select>
          </label>
          <label>
            Harga Perolehan
            <input v-model.number="assetForm.acquisition_cost" type="number" min="1" step="1" placeholder="15000000" required />
          </label>
          <label>
            Nilai Residu
            <input v-model.number="assetForm.residual_value" type="number" min="0" step="1" placeholder="1000000" required />
          </label>
          <label>
            Masa Manfaat (bulan)
            <input v-model.number="assetForm.useful_life_months" type="number" min="1" step="1" placeholder="36" required />
          </label>
          <div class="estimate-box">
            <span>Estimasi penyusutan/bulan</span>
            <strong>{{ formatCurrency(estimatedMonthlyDepreciation) }}</strong>
          </div>
          <label class="full-width">
            Catatan <span class="optional-label">(opsional)</span>
            <textarea v-model="assetForm.notes" rows="3" placeholder="Keterangan penggunaan aset"></textarea>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closeAssetModal">Batal</button>
          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Aset & Posting Jurnal' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="showHistoryModal" class="modal-backdrop" @click.self="closeHistoryModal">
      <div class="modal-card history-modal">
        <div class="modal-header">
          <div>
            <p class="eyebrow">RIWAYAT PENYUSUTAN</p>
            <h3>{{ selectedAsset?.asset_name || 'Aset' }}</h3>
            <p class="history-subtitle">{{ selectedAsset?.asset_code || '-' }}</p>
          </div>
          <button type="button" class="modal-close" @click="closeHistoryModal">×</button>
        </div>

        <p v-if="historyLoading" class="loading-history">Memuat riwayat penyusutan...</p>
        <div v-else class="table-wrapper history-table">
          <table>
            <thead>
              <tr>
                <th>Periode</th>
                <th>Tanggal</th>
                <th>Penyusutan</th>
                <th>Akumulasi</th>
                <th>Nilai Buku</th>
                <th>Voucher</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in depreciationHistory" :key="item.id">
                <td>{{ formatPeriod(item.depreciation_period) }}</td>
                <td>{{ formatDate(item.depreciation_date) }}</td>
                <td>{{ formatCurrency(item.depreciation_amount) }}</td>
                <td>{{ formatCurrency(item.accumulated_depreciation_after) }}</td>
                <td>{{ formatCurrency(item.book_value_after) }}</td>
                <td>{{ item.journal_voucher_number || '-' }}</td>
              </tr>
              <tr v-if="depreciationHistory.length === 0">
                <td colspan="6" class="empty-table">Belum ada jurnal penyusutan untuk aset ini.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeHistoryModal">Tutup</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.asset-message { border-radius: 10px; padding: 12px 14px; font-size: 13px; }
.error-message { border: 1px solid #f3c7c7; background: #fff6f6; color: #a84343; }
.success-message { border: 1px solid #bfe8d0; background: #f1fff6; color: #23774b; }
.asset-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.asset-stat { min-height: 112px; border: 1px solid #e1eaf4; border-radius: 11px; padding: 16px; background: white; }
.asset-stat p, .asset-stat small { margin: 0; color: #7187a1; font-size: 12px; line-height: 1.45; }
.asset-stat h2 { margin: 9px 0 6px; color: #173f68; font-size: 20px; }
.depreciation-panel { display: flex; align-items: center; justify-content: space-between; gap: 22px; margin-bottom: 16px; border-left: 4px solid #2d6fb0; }
.depreciation-panel h3 { margin: 4px 0 6px; color: #174f81; }
.depreciation-panel p { margin: 0; color: #70839d; font-size: 12px; line-height: 1.5; }
.depreciation-actions { display: flex; align-items: end; gap: 10px; flex-shrink: 0; }
.depreciation-actions label { display: grid; gap: 6px; color: #617692; font-size: 11px; font-weight: 800; }
.accounting-flow { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; gap: 14px; margin-bottom: 18px; border: 1px solid #e1eaf4; border-radius: 11px; padding: 16px; background: #fbfdff; }
.accounting-flow > b { color: #8da9c5; font-size: 20px; }
.flow-item { display: flex; align-items: flex-start; gap: 10px; }
.flow-item > span { display: grid; width: 25px; height: 25px; flex: 0 0 25px; place-items: center; border-radius: 50%; background: #e3f0ff; color: #1e6099; font-size: 12px; font-weight: 800; }
.flow-item strong { display: block; color: #274b70; font-size: 12px; }
.flow-item p { margin: 4px 0 0; color: #73859c; font-size: 11px; line-height: 1.5; }
.table-tools, .action-cell { display: flex; align-items: center; gap: 7px; }
.table-tools select { min-width: 145px; }
.table-subtext { display: block; margin-top: 3px; color: #8192a8; font-size: 10px; font-weight: 600; }
.voucher-text { color: #4a78a7; }
.asset-status { display: inline-flex; border-radius: 999px; padding: 5px 9px; font-size: 10px; font-weight: 800; }
.asset-status.active { background: #e6f8ef; color: #27734f; }
.asset-status.inactive { background: #edf1f5; color: #687c95; }
.asset-status.disposed { background: #fff1e6; color: #a0622a; }
.emphasis-action { border-color: #bdd9f5; background: #eff7ff; color: #23649f; }
.asset-modal { width: min(760px, calc(100vw - 32px)); }
.modal-note { margin: 0 0 16px; color: #637995; font-size: 12px; line-height: 1.6; }
.estimate-box { display: grid; align-content: center; gap: 5px; min-height: 72px; border: 1px solid #d9e8f6; border-radius: 8px; padding: 10px 12px; background: #f5faff; }
.estimate-box span { color: #66809c; font-size: 11px; font-weight: 700; }
.estimate-box strong { color: #1d5d97; font-size: 16px; }
.history-modal { width: min(920px, calc(100vw - 32px)); }
.history-subtitle { margin: 4px 0 0; color: #7690ab; font-size: 12px; font-weight: 700; }
.loading-history { padding: 30px 0; color: #6e829d; text-align: center; font-size: 13px; }
.history-table { max-height: 390px; }
@media (max-width: 1050px) { .asset-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .accounting-flow { grid-template-columns: 1fr; } .accounting-flow > b { display: none; } }
@media (max-width: 720px) { .asset-metrics { grid-template-columns: 1fr; } .depreciation-panel { align-items: flex-start; flex-direction: column; } .depreciation-actions, .table-tools { width: 100%; align-items: stretch; flex-direction: column; } .table-tools select, .depreciation-actions input { width: 100%; } }
@media print { .page-heading button, .depreciation-actions, .table-tools, .action-cell, .modal-backdrop { display: none !important; } }
</style>
