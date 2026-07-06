<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  ArrowUpRight, BarChart3, CircleDollarSign, FilePlus2, FolderKanban,
  RefreshCcw, Search, SlidersHorizontal, TableProperties, WalletCards
} from 'lucide-vue-next'
import api from '../../services/api'
import MetricCard from './MetricCard.vue'
import StatusBadge from './StatusBadge.vue'
import { useToast } from '../../composables/useToast'

const props = defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  endpoint: { type: String, default: '' },
  addLabel: { type: String, default: 'Tambah Data' },
  tableTitle: { type: String, default: 'Data Operasional' },
  tableDescription: { type: String, default: '' },
  columns: { type: Array, default: () => [] },
  formFields: { type: Array, default: () => [] },
  amountKeys: { type: Array, default: () => ['amount', 'total', 'nominal', 'current_balance', 'contract_value'] },
  fallbackRows: { type: Array, default: () => [] },
  guides: { type: Array, default: () => [] },
})

const { show } = useToast()
const rows = ref([])
const loading = ref(false)
const errorMessage = ref('')
const keyword = ref('')
const statusFilter = ref('all')
const showForm = ref(false)
const saving = ref(false)
const form = reactive({})

function firstValue(row, names, fallback = '-') {
  for (const name of names) {
    if (row?.[name] !== undefined && row?.[name] !== null && row?.[name] !== '') return row[name]
  }
  return fallback
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0))
}

function formatValue(value, column) {
  if (column?.kind === 'currency') return formatCurrency(value)
  if (column?.kind === 'date') {
    const date = String(value || '').slice(0, 10)
    if (!date) return '-'
    const [year, month, day] = date.split('-')
    if (!year || !month || !day) return date
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(Number(year), Number(month) - 1, Number(day)))
  }
  return value ?? '-'
}

function statusFrom(row) {
  return firstValue(row, ['status', 'payment_status', 'project_status', 'state'], 'active')
}

const filteredRows = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesText = !term || Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term))
    const matchesStatus = statusFilter.value === 'all' || String(statusFrom(row)).toLowerCase() === statusFilter.value
    return matchesText && matchesStatus
  })
})

const totalAmount = computed(() => rows.value.reduce((sum, row) => {
  const value = firstValue(row, props.amountKeys, 0)
  return sum + (Number(value) || 0)
}, 0))

const statuses = computed(() => [...new Set(rows.value.map(statusFrom).filter(Boolean))])

function initForm() {
  for (const field of props.formFields) form[field.key] = field.default ?? ''
}

async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    if (!props.endpoint) {
      rows.value = props.fallbackRows
      return
    }

    const response = await api.get(props.endpoint)
    const data = response.data?.data
    if (Array.isArray(data)) rows.value = data
    else if (Array.isArray(data?.items)) rows.value = data.items
    else if (data && typeof data === 'object') {
      rows.value = Object.entries(data).map(([key, value]) => ({ label: key.replaceAll('_', ' '), value }))
    } else rows.value = []
  } catch (error) {
    rows.value = props.fallbackRows
    errorMessage.value = error.response?.data?.message || `Data belum dapat dimuat dari ${props.endpoint || 'sumber data'}.`
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!props.endpoint || props.formFields.length === 0) {
    show('Form visual ditampilkan. Endpoint operasional tidak diubah.', 'Mode UI')
    showForm.value = false
    return
  }

  saving.value = true
  try {
    await api.post(props.endpoint, { ...form })
    show('Data berhasil dikirim ke API.', 'Data tersimpan')
    showForm.value = false
    await loadData()
  } catch (error) {
    show(error.response?.data?.message || 'Gagal menyimpan data. Periksa kolom yang diisi.', 'Data belum tersimpan')
  } finally {
    saving.value = false
  }
}

watch(() => props.endpoint, () => loadData())
onMounted(() => {
  initForm()
  loadData()
})
</script>

<template>
  <section class="workspace-page">
    <header class="workspace-heading">
      <div>
        <p class="workspace-eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <div class="workspace-heading__actions">
        <button type="button" class="secondary-action" @click="loadData"><RefreshCcw :size="16" /> Refresh</button>
        <button type="button" class="primary-action" @click="showForm = true"><FilePlus2 :size="17" /> {{ addLabel }}</button>
      </div>
    </header>

    <section class="workspace-metrics">
      <MetricCard label="Total Data" :value="rows.length" helper="Data tercatat pada modul ini" :icon="TableProperties" tone="blue" trend="LIVE" />
      <MetricCard label="Nilai Terkelola" :value="formatCurrency(totalAmount)" helper="Akumulasi nilai operasional" :icon="WalletCards" tone="mint" trend="UPDATED" />
      <MetricCard label="Perlu Perhatian" :value="rows.filter((row) => ['overdue', 'unpaid', 'inactive'].includes(String(statusFrom(row)).toLowerCase())).length" helper="Status yang perlu ditinjau" :icon="BarChart3" tone="amber" trend="REVIEW" />
      <MetricCard label="Kinerja Modul" value="Terpantau" helper="Terhubung dengan workspace" :icon="ArrowUpRight" tone="violet" trend="HEALTHY" />
    </section>

    <section v-if="guides.length" class="workspace-guide-grid">
      <article v-for="guide in guides" :key="guide.title" class="workspace-guide">
        <span><component :is="guide.icon || FolderKanban" :size="18" /></span>
        <div><small>{{ guide.kicker || 'WORKFLOW' }}</small><h3>{{ guide.title }}</h3><p>{{ guide.text }}</p></div>
      </article>
    </section>

    <section class="workspace-table-card">
      <header class="workspace-table-card__header">
        <div>
          <p class="workspace-eyebrow">OPERATIONAL LIST</p>
          <h2>{{ tableTitle }}</h2>
          <p>{{ tableDescription || 'Pantau dan kelola data operasional dalam tampilan yang lebih ringkas.' }}</p>
        </div>
        <span class="workspace-table-card__count">{{ filteredRows.length }} data</span>
      </header>

      <div class="workspace-filter-bar">
        <label class="table-search"><Search :size="16" /><input v-model="keyword" type="search" placeholder="Cari data..." /></label>
        <label class="table-select"><SlidersHorizontal :size="16" /><select v-model="statusFilter"><option value="all">Semua status</option><option v-for="status in statuses" :key="status" :value="String(status).toLowerCase()">{{ String(status).replaceAll('_', ' ') }}</option></select></label>
        <button type="button" class="filter-refresh" @click="loadData"><RefreshCcw :size="15" /></button>
      </div>

      <p v-if="errorMessage" class="inline-api-notice">{{ errorMessage }}</p>

      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.label">{{ column.label }}</th>
              <th v-if="columns.length">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td :colspan="columns.length + 1" class="data-table__empty">Memuat data dari API...</td></tr>
            <tr v-else-if="filteredRows.length === 0"><td :colspan="columns.length + 1" class="data-table__empty">Belum ada data yang dapat ditampilkan.</td></tr>
            <tr v-for="(row, index) in filteredRows" :key="row.id || row.code || row.voucher_number || index">
              <td v-for="column in columns" :key="column.label">
                <template v-if="column.key === 'status'"><StatusBadge :value="statusFrom(row)" /></template>
                <template v-else>{{ formatValue(firstValue(row, column.keys || [column.key]), column) }}</template>
              </td>
              <td v-if="columns.length"><StatusBadge :value="statusFrom(row)" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Transition name="modal">
      <div v-if="showForm" class="modal-layer" @click.self="showForm = false">
        <form class="modal-card" @submit.prevent="save">
          <header>
            <div><p class="workspace-eyebrow">NEW RECORD</p><h2>{{ addLabel }}</h2><p>Gunakan formulir ini untuk memasukkan data operasional.</p></div>
            <button type="button" class="modal-close" @click="showForm = false">×</button>
          </header>
          <div class="modal-form-grid">
            <label v-for="field in formFields" :key="field.key" :class="{ 'modal-form-grid__full': field.type === 'textarea' }">
              <span>{{ field.label }}</span>
              <textarea v-if="field.type === 'textarea'" v-model="form[field.key]" :placeholder="field.placeholder || ''"></textarea>
              <select v-else-if="field.type === 'select'" v-model="form[field.key]"><option value="">Pilih {{ field.label }}</option><option v-for="option in field.options || []" :key="option.value || option" :value="option.value || option">{{ option.label || option }}</option></select>
              <input v-else v-model="form[field.key]" :type="field.type || 'text'" :placeholder="field.placeholder || ''" />
            </label>
          </div>
          <footer><button type="button" class="secondary-action" @click="showForm = false">Batal</button><button type="submit" class="primary-action" :disabled="saving">{{ saving ? 'Menyimpan...' : 'Simpan Data' }}</button></footer>
        </form>
      </div>
    </Transition>
  </section>
</template>
