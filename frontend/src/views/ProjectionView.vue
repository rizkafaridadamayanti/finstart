<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const currentYear = new Date().getFullYear()

const selectedYear = ref(currentYear)
const projectionData = ref({
  year: currentYear,
  current_month: null,
  months: [],
  summary: {
    revenue_target: 0,
    expense_target: 0,
    profit_target: 0,
    revenue_actual: 0,
    expense_actual: 0,
    profit_actual: 0,
    forecast_revenue: 0,
    forecast_expense: 0,
    forecast_profit: 0,
    months_with_actual: 0,
    months_with_target: 0,
    planning_status: {
      label: 'Belum Disusun',
      key: 'empty',
    },
  },
})

const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const showTargetModal = ref(false)
const targetForm = ref({
  projection_year: currentYear,
  projection_month: new Date().getMonth() + 1,
  revenue_target: 0,
  expense_target: 0,
  notes: '',
})

const currentPageProjections = ref(1)
const PAGE_SIZE = 10

const monthOptions = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
]

function numberValue(value) {
  return Number(value || 0)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue(value))
}

function formatCompactCurrency(value) {
  const amount = numberValue(value)

  if (Math.abs(amount) >= 1000000000) {
    return `Rp${(amount / 1000000000).toFixed(1)} M`
  }

  if (Math.abs(amount) >= 1000000) {
    return `Rp${(amount / 1000000).toFixed(1)} jt`
  }

  if (Math.abs(amount) >= 1000) {
    return `Rp${(amount / 1000).toFixed(0)} rb`
  }

  return `Rp${amount.toLocaleString('id-ID')}`
}

function formatPercent(value) {
  return `${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(numberValue(value))}%`
}

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

async function loadProjections() {
  isLoading.value = true
  clearMessages()

  try {
    const response = await api.get('/projections', {
      params: {
        year: selectedYear.value,
      },
    })

    projectionData.value = response.data.data
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data proyeksi. Pastikan backend FinStart berjalan.',
    )
  } finally {
    isLoading.value = false
  }
}

function emptyTargetForm() {
  return {
    projection_year: Number(selectedYear.value),
    projection_month: projectionData.value.current_month || 1,
    revenue_target: 0,
    expense_target: 0,
    notes: '',
  }
}

function openTargetModal(row = null) {
  clearMessages()

  if (row) {
    targetForm.value = {
      projection_year: Number(selectedYear.value),
      projection_month: Number(row.month),
      revenue_target: numberValue(row.revenue_target),
      expense_target: numberValue(row.expense_target),
      notes: row.notes || '',
    }
  } else {
    targetForm.value = emptyTargetForm()
  }

  showTargetModal.value = true
}

function closeTargetModal() {
  showTargetModal.value = false
  targetForm.value = emptyTargetForm()
}

async function saveTarget() {
  clearMessages()

  if (numberValue(targetForm.value.revenue_target) < 0) {
    errorMessage.value = 'Target pendapatan tidak boleh bernilai negatif.'
    return
  }

  if (numberValue(targetForm.value.expense_target) < 0) {
    errorMessage.value = 'Target beban tidak boleh bernilai negatif.'
    return
  }

  isSaving.value = true

  try {
    const response = await api.post('/projections', {
      projection_year: Number(targetForm.value.projection_year),
      projection_month: Number(targetForm.value.projection_month),
      revenue_target: numberValue(targetForm.value.revenue_target),
      expense_target: numberValue(targetForm.value.expense_target),
      notes: targetForm.value.notes,
    })

    closeTargetModal()
    successMessage.value =
      response.data.message || 'Target proyeksi berhasil disimpan.'

    await loadProjections()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal menyimpan target proyeksi.',
    )
  } finally {
    isSaving.value = false
  }
}

async function deleteTarget(row) {
  clearMessages()

  if (!row.has_target) return

  const confirmed = window.confirm(
    `Hapus target ${row.label} ${selectedYear.value}?\n\nData realisasi jurnal tidak akan dihapus.`,
  )

  if (!confirmed) return

  isSaving.value = true

  try {
    const response = await api.delete(
      `/projections/${selectedYear.value}/${row.month}`,
    )

    successMessage.value =
      response.data.message || 'Target proyeksi berhasil dihapus.'

    await loadProjections()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal menghapus target proyeksi.',
    )
  } finally {
    isSaving.value = false
  }
}

const months = computed(() => projectionData.value.months || [])
const summary = computed(() => projectionData.value.summary || {})

// Sort months by newest first (descending order)
const sortedMonths = computed(() => {
  return [...months.value].sort((a, b) => b.month - a.month)
})

const paginatedMonths = computed(() => {
  const start = (currentPageProjections.value - 1) * PAGE_SIZE
  return sortedMonths.value.slice(start, start + PAGE_SIZE)
})

// Reset page when year changes
watch(selectedYear, () => {
  currentPageProjections.value = 1
})

const chartWidth = 1100
const chartHeight = 310
const padding = {
  left: 56,
  right: 32,
  top: 26,
  bottom: 52,
}

const chartMax = computed(() => {
  const values = months.value.flatMap((row) => [
    numberValue(row.revenue_target),
    numberValue(row.expense_target),
    numberValue(row.revenue_actual),
    numberValue(row.expense_actual),
  ])

  return Math.max(...values, 1)
})

function xPoint(index) {
  const usableWidth = chartWidth - padding.left - padding.right

  return padding.left + (index * usableWidth) / Math.max(months.value.length - 1, 1)
}

function yPoint(value) {
  const usableHeight = chartHeight - padding.top - padding.bottom
  const normalized = numberValue(value) / chartMax.value

  return padding.top + (1 - normalized) * usableHeight
}

function linePoints(key) {
  return months.value
    .map((row, index) => `${xPoint(index)},${yPoint(row[key])}`)
    .join(' ')
}

function gridLineY(index) {
  const usableHeight = chartHeight - padding.top - padding.bottom

  return padding.top + (index * usableHeight) / 4
}

function gridLabel(index) {
  const value = chartMax.value - (index * chartMax.value) / 4

  return formatCompactCurrency(value)
}

function statusClass(status) {
  return {
    good: status?.key === 'good',
    watch: status?.key === 'watch',
    target: status?.key === 'target',
    empty: status?.key === 'empty',
  }
}

function statusLabel(row) {
  return row.status?.label || '-'
}

/*
  Persentase asli dipakai untuk informasi angka.
  Lebar bar dibatasi 100% agar tampilan tidak keluar dari panel.
*/
const revenueAchievementPercent = computed(() => {
  const target = numberValue(summary.value.revenue_target)
  const actual = numberValue(summary.value.revenue_actual)

  return target > 0 ? (actual / target) * 100 : 0
})

const expenseUsagePercent = computed(() => {
  const limit = numberValue(summary.value.expense_target)
  const actual = numberValue(summary.value.expense_actual)

  return limit > 0 ? (actual / limit) * 100 : 0
})

const revenueProgressWidth = computed(() => {
  return Math.min(revenueAchievementPercent.value, 100)
})

const expenseProgressWidth = computed(() => {
  return Math.min(expenseUsagePercent.value, 100)
})

const revenueDifference = computed(() => {
  return numberValue(summary.value.revenue_actual) -
    numberValue(summary.value.revenue_target)
})

const expenseDifference = computed(() => {
  return numberValue(summary.value.expense_actual) -
    numberValue(summary.value.expense_target)
})

const forecastMessage = computed(() => {
  const targetProfit = numberValue(summary.value.profit_target)
  const forecastProfit = numberValue(summary.value.forecast_profit)

  if (numberValue(summary.value.months_with_target) === 0) {
    return 'Belum ada target bulanan. Tambahkan target untuk membuat forecast akhir tahun.'
  }

  if (forecastProfit >= targetProfit) {
    return 'Forecast laba berada pada atau di atas target tahunan.'
  }

  return 'Forecast laba masih di bawah target. Tinjau pendapatan atau batas beban bulan berikutnya.'
})

watch(selectedYear, loadProjections)

onMounted(loadProjections)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">BUSINESS PLANNING</p>
        <h1>Proyeksi Bisnis</h1>
        <p>
          Bandingkan target dengan realisasi jurnal posted dan pantau forecast
          pendapatan, beban, serta laba hingga akhir tahun.
        </p>
      </div>

      <div class="page-button-group">
        <select v-model.number="selectedYear" class="year-select">
          <option
            v-for="year in [currentYear - 1, currentYear, currentYear + 1]"
            :key="year"
            :value="year"
          >
            {{ year }}
          </option>
        </select>

        <button
          type="button"
          class="primary-button"
          :disabled="isSaving"
          @click="openTargetModal()"
        >
          + Tambah Target Proyeksi
        </button>
      </div>
    </div>

    <article v-if="errorMessage" class="projection-message error-message">
      {{ errorMessage }}
    </article>

    <article v-if="successMessage" class="projection-message success-message">
      {{ successMessage }}
    </article>

    <div class="projection-metrics">
      <article class="projection-stat">
        <p>Target Pendapatan Tahunan</p>
        <h2>{{ formatCurrency(summary.revenue_target) }}</h2>
        <small>{{ summary.months_with_target || 0 }} bulan memiliki target</small>
      </article>

      <article class="projection-stat">
        <p>Realisasi Pendapatan</p>
        <h2>{{ formatCurrency(summary.revenue_actual) }}</h2>
        <small>{{ summary.months_with_actual || 0 }} bulan memiliki jurnal posted</small>
      </article>

      <article class="projection-stat">
        <p>Forecast Laba Akhir Tahun</p>
        <h2>{{ formatCurrency(summary.forecast_profit) }}</h2>
        <small>Realisasi bulan berjalan + target bulan berikutnya</small>
      </article>

      <article class="projection-stat">
        <p>Status Perencanaan</p>
        <h2>{{ summary.planning_status?.label || 'Belum Disusun' }}</h2>
        <small>{{ forecastMessage }}</small>
      </article>
    </div>

    <article class="panel roadmap-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">ROADMAP 12 BULAN</p>
          <h3>Grafik Target dan Realisasi Bulanan</h3>
          <p>
            Garis penuh menunjukkan realisasi dari jurnal posted; garis putus-putus
            menunjukkan target yang disusun Finance.
          </p>
        </div>

        <button
          type="button"
          class="table-action"
          :disabled="isLoading"
          @click="loadProjections"
        >
          {{ isLoading ? 'Memuat...' : 'Perbarui Grafik' }}
        </button>
      </div>

      <div class="chart-legend">
        <span class="legend-item target-revenue"><i></i> Target Pendapatan</span>
        <span class="legend-item actual-revenue"><i></i> Realisasi Pendapatan</span>
        <span class="legend-item target-expense"><i></i> Target Beban</span>
        <span class="legend-item actual-expense"><i></i> Realisasi Beban</span>
      </div>

      <div class="chart-wrapper">
        <svg
          class="projection-chart"
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
          role="img"
          aria-label="Grafik target dan realisasi pendapatan serta beban"
        >
          <g v-for="index in 5" :key="`grid-${index}`">
            <line
              :x1="padding.left"
              :x2="chartWidth - padding.right"
              :y1="gridLineY(index - 1)"
              :y2="gridLineY(index - 1)"
              class="chart-grid-line"
            />
            <text
              :x="padding.left - 10"
              :y="gridLineY(index - 1) + 4"
              text-anchor="end"
              class="chart-axis-label"
            >
              {{ gridLabel(index - 1) }}
            </text>
          </g>

          <polyline
            :points="linePoints('revenue_target')"
            class="chart-line chart-target-revenue"
          />
          <polyline
            :points="linePoints('revenue_actual')"
            class="chart-line chart-actual-revenue"
          />
          <polyline
            :points="linePoints('expense_target')"
            class="chart-line chart-target-expense"
          />
          <polyline
            :points="linePoints('expense_actual')"
            class="chart-line chart-actual-expense"
          />

          <g v-for="(row, index) in months" :key="row.month">
            <circle
              :cx="xPoint(index)"
              :cy="yPoint(row.revenue_actual)"
              r="4"
              class="chart-point point-revenue"
            />
            <circle
              :cx="xPoint(index)"
              :cy="yPoint(row.expense_actual)"
              r="4"
              class="chart-point point-expense"
            />
            <text
              :x="xPoint(index)"
              :y="chartHeight - 18"
              text-anchor="middle"
              class="chart-month-label"
            >
              {{ row.short_label }}
            </text>
          </g>
        </svg>
      </div>

      <div class="chart-note">
        <strong>Catatan Forecast:</strong> {{ forecastMessage }}
      </div>
    </article>

    <div class="progress-panel-grid">
      <article class="panel progress-panel">
        <div class="panel-header compact">
          <div>
            <h3>Pencapaian Pendapatan</h3>
            <p>Realisasi dibanding target tahunan.</p>
          </div>
          <strong>{{ formatPercent(revenueAchievementPercent) }}</strong>
        </div>

        <div class="progress-track">
          <span
            class="progress-fill revenue-fill"
            :style="{ width: `${revenueProgressWidth}%` }"
          ></span>
        </div>

        <div class="progress-meta">
          <span>Realisasi: {{ formatCurrency(summary.revenue_actual) }}</span>
          <span>Target: {{ formatCurrency(summary.revenue_target) }}</span>
        </div>

        <p
          v-if="revenueDifference > 0"
          class="progress-insight positive-insight"
        >
          Di atas target: {{ formatCurrency(revenueDifference) }}
        </p>

        <p
          v-else-if="revenueDifference < 0"
          class="progress-insight"
        >
          Belum mencapai target: {{ formatCurrency(Math.abs(revenueDifference)) }}
        </p>

        <p v-else class="progress-insight positive-insight">
          Realisasi tepat sesuai target.
        </p>
      </article>

      <article class="panel progress-panel">
        <div class="panel-header compact">
          <div>
            <h3>Pengendalian Beban</h3>
            <p>Realisasi dibanding batas beban tahunan.</p>
          </div>
          <strong>{{ formatPercent(expenseUsagePercent) }}</strong>
        </div>

        <div class="progress-track">
          <span
            class="progress-fill expense-fill"
            :class="{ 'over-limit-fill': expenseUsagePercent > 100 }"
            :style="{ width: `${expenseProgressWidth}%` }"
          ></span>
        </div>

        <div class="progress-meta">
          <span>Realisasi: {{ formatCurrency(summary.expense_actual) }}</span>
          <span>Batas: {{ formatCurrency(summary.expense_target) }}</span>
        </div>

        <p
          v-if="expenseDifference > 0"
          class="progress-insight negative-insight"
        >
          Melebihi batas: {{ formatCurrency(expenseDifference) }}
        </p>

        <p
          v-else-if="expenseDifference < 0"
          class="progress-insight positive-insight"
        >
          Sisa batas beban: {{ formatCurrency(Math.abs(expenseDifference)) }}
        </p>

        <p v-else class="progress-insight">
          Realisasi tepat sebesar batas beban.
        </p>
      </article>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Rincian Target, Realisasi, dan Forecast Bulanan</h3>
          <p>
            Realisasi hanya berasal dari jurnal posted. Target dapat diperbarui
            tanpa mengubah data transaksi.
          </p>
        </div>

        <span class="table-count">{{ months.length }} bulan</span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Target Pendapatan</th>
              <th>Realisasi Pendapatan</th>
              <th>Target Beban</th>
              <th>Realisasi Beban</th>
              <th>Target Laba</th>
              <th>Realisasi Laba</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in paginatedMonths" :key="row.month">
              <td>
                <strong>{{ row.label }} {{ selectedYear }}</strong>
                <small v-if="row.notes" class="table-subtext">
                  {{ row.notes }}
                </small>
              </td>

              <td>{{ formatCurrency(row.revenue_target) }}</td>
              <td>{{ formatCurrency(row.revenue_actual) }}</td>
              <td>{{ formatCurrency(row.expense_target) }}</td>
              <td>{{ formatCurrency(row.expense_actual) }}</td>
              <td><strong>{{ formatCurrency(row.profit_target) }}</strong></td>

              <td>
                <strong :class="{ 'negative-value': row.profit_actual < 0 }">
                  {{ formatCurrency(row.profit_actual) }}
                </strong>
              </td>

              <td>
                <span
                  class="projection-status"
                  :class="statusClass(row.status)"
                >
                  {{ statusLabel(row) }}
                </span>
              </td>

              <td class="action-cell">
                <button
                  type="button"
                  class="table-action"
                  :disabled="isSaving"
                  @click="openTargetModal(row)"
                >
                  {{ row.has_target ? 'Ubah' : 'Atur Target' }}
                </button>

                <button
                  v-if="row.has_target"
                  type="button"
                  class="table-action danger-action"
                  :disabled="isSaving"
                  @click="deleteTarget(row)"
                >
                  Hapus
                </button>
              </td>
            </tr>

            <tr v-if="!isLoading && months.length === 0">
              <td colspan="9" class="empty-table">
                Data proyeksi belum dapat dimuat.
              </td>
            </tr>
          </tbody>

          <!-- Pagination Controls for Projections -->
          <tfoot>
            <tr>
              <td colspan="9">
                <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
                  <div class="text-xs text-[#6B7A90]">
                    Menampilkan {{ Math.min((currentPageProjections - 1) * PAGE_SIZE + 1, months.length) }} - {{ Math.min(currentPageProjections * PAGE_SIZE, months.length) }} dari {{ months.length }} data
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      :disabled="currentPageProjections <= 1"
                      @click="currentPageProjections = Math.max(1, currentPageProjections - 1)"
                      class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <svg class="w-3 h-3 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      Prev
                    </button>
                    <button
                      :disabled="currentPageProjections >= Math.ceil(months.length / PAGE_SIZE)"
                      @click="currentPageProjections = currentPageProjections + 1"
                      class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                      <svg class="w-3 h-3 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </article>

    <div
      v-if="showTargetModal"
      class="modal-backdrop"
      @click.self="closeTargetModal"
    >
      <form class="modal-card target-modal" @submit.prevent="saveTarget">
        <div class="modal-header">
          <div>
            <p class="eyebrow">TARGET PROYEKSI</p>
            <h3>Atur Target Bulanan</h3>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="closeTargetModal"
          >
            ×
          </button>
        </div>

        <p class="target-modal-note">
          Target hanya dipakai untuk perencanaan dan grafik. Data realisasi
          tetap dihitung otomatis dari jurnal posted.
        </p>

        <div class="form-grid">
          <label>
            Tahun
            <input
              v-model.number="targetForm.projection_year"
              type="number"
              min="2000"
              max="2100"
              required
            />
          </label>

          <label>
            Bulan
            <select v-model.number="targetForm.projection_month" required>
              <option
                v-for="month in monthOptions"
                :key="month.value"
                :value="month.value"
              >
                {{ month.label }}
              </option>
            </select>
          </label>

          <label>
            Target Pendapatan
            <input
              v-model.number="targetForm.revenue_target"
              type="number"
              min="0"
              placeholder="Contoh: 50000000"
              required
            />
          </label>

          <label>
            Batas Beban
            <input
              v-model.number="targetForm.expense_target"
              type="number"
              min="0"
              placeholder="Contoh: 25000000"
              required
            />
          </label>

          <label class="full-width">
            Catatan Target <span class="optional-label">(opsional)</span>
            <textarea
              v-model="targetForm.notes"
              rows="3"
              placeholder="Contoh: Fokus akuisisi proyek baru dan kontrol biaya vendor."
            ></textarea>
          </label>
        </div>

        <div class="target-profit-preview">
          <span>Estimasi Laba Target</span>
          <strong>
            {{
              formatCurrency(
                numberValue(targetForm.revenue_target) -
                  numberValue(targetForm.expense_target),
              )
            }}
          </strong>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            :disabled="isSaving"
            @click="closeTargetModal"
          >
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Target' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.projection-message {
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

.year-select {
  min-width: 100px;
  border: 1px solid #dbe5f0;
  border-radius: 8px;
  padding: 10px 12px;
  background: white;
  color: #405a78;
  font-size: 12px;
  font-weight: 700;
}

.projection-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.projection-stat {
  min-height: 116px;
  border: 1px solid #e1eaf4;
  border-radius: 11px;
  padding: 16px;
  background: white;
}

.projection-stat p,
.projection-stat small {
  margin: 0;
  color: #7187a1;
  font-size: 12px;
  line-height: 1.45;
}

.projection-stat h2 {
  margin: 9px 0 6px;
  color: #173f68;
  font-size: 20px;
}

.roadmap-panel {
  margin-bottom: 18px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 2px 0 14px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #617691;
  font-size: 11px;
  font-weight: 700;
}

.legend-item i {
  display: inline-block;
  width: 22px;
  height: 3px;
  border-radius: 999px;
}

.target-revenue i {
  border-top: 3px dashed #2d6fb0;
}

.actual-revenue i {
  background: #2b8d63;
}

.target-expense i {
  border-top: 3px dashed #d09032;
}

.actual-expense i {
  background: #ce5c66;
}

.chart-wrapper {
  overflow-x: auto;
  padding-bottom: 4px;
}

.projection-chart {
  display: block;
  min-width: 760px;
  width: 100%;
  max-height: 360px;
}

.chart-grid-line {
  stroke: #e5edf5;
  stroke-width: 1;
}

.chart-axis-label,
.chart-month-label {
  fill: #7b8fa7;
  font-size: 11px;
}

.chart-line {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-target-revenue {
  stroke: #2d6fb0;
  stroke-dasharray: 10 8;
}

.chart-actual-revenue {
  stroke: #2b8d63;
}

.chart-target-expense {
  stroke: #d09032;
  stroke-dasharray: 10 8;
}

.chart-actual-expense {
  stroke: #ce5c66;
}

.chart-point {
  stroke: white;
  stroke-width: 2;
}

.point-revenue {
  fill: #2b8d63;
}

.point-expense {
  fill: #ce5c66;
}

.chart-note {
  margin-top: 12px;
  border-left: 3px solid #2d6fb0;
  padding: 10px 12px;
  background: #f5faff;
  color: #58718e;
  font-size: 12px;
  line-height: 1.55;
}

.progress-panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.progress-panel {
  min-height: 178px;
}

.panel-header.compact {
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-header.compact h3 {
  margin-bottom: 4px;
}

.panel-header.compact strong {
  color: #1d5d97;
  font-size: 18px;
}

.progress-track {
  overflow: hidden;
  height: 11px;
  border-radius: 999px;
  background: #edf2f7;
}

.progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width .25s ease;
}

.revenue-fill {
  background: #2b8d63;
}

.expense-fill {
  background: #d09032;
}

.over-limit-fill {
  background: #ce5c66;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-top: 11px;
  color: #71839b;
  font-size: 11px;
}

.progress-insight {
  margin: 9px 0 0;
  color: #70839d;
  font-size: 11px;
  font-weight: 700;
}

.positive-insight {
  color: #27734f;
}

.negative-insight {
  color: #ba4f58;
}

.projection-status {
  display: inline-flex;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 800;
}

.projection-status.good {
  background: #e6f8ef;
  color: #27734f;
}

.projection-status.watch {
  background: #fff2d9;
  color: #97651c;
}

.projection-status.target {
  background: #edf5ff;
  color: #2a5f92;
}

.projection-status.empty {
  background: #eef1f5;
  color: #73839a;
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

.negative-value {
  color: #bd5252;
}

.target-modal {
  width: min(720px, calc(100vw - 32px));
}

.target-modal-note {
  margin: 0 0 16px;
  color: #637995;
  font-size: 12px;
  line-height: 1.55;
}

.target-modal textarea {
  resize: vertical;
}

.target-profit-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  border: 1px solid #dce9f6;
  border-radius: 10px;
  padding: 13px;
  background: #f5faff;
}

.target-profit-preview span {
  color: #5c7490;
  font-size: 12px;
}

.target-profit-preview strong {
  color: #174f81;
  font-size: 18px;
}

@media (max-width: 1050px) {
  .projection-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .projection-metrics,
  .progress-panel-grid {
    grid-template-columns: 1fr;
  }

  .progress-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
}

@media print {
  .page-heading .page-button-group,
  .table-action,
  .modal-backdrop {
    display: none !important;
  }
}
</style>
