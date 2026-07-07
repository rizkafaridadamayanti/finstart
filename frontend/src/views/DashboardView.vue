<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import FinStartAssistant from '../components/dashboard/FinStartAssistant.vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const summary = ref({
  cash_balance: 0,
  total_receivable: 0,
  total_payable: 0,
  total_revenue: 0,
  total_expense: 0,
  net_profit: 0,
  monthly_income: 0,
  monthly_expense: 0,
  active_projects: 0,
  overdue_invoices: 0,
  cashflow_series: [],
  recent_transactions: [],
})

const clients = ref([])
const projects = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const lastUpdatedAt = ref(null)

const chartWidth = 760
const chartHeight = 260
const chartPaddingX = 46
const chartPaddingY = 30

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
  return `Rp ${new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numberValue(value))}`
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

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

const activeClients = computed(() => {
  return clients.value.filter((client) => client.status === 'active').length
})

const ongoingProjects = computed(() => {
  return projects.value.filter((project) => project.status === 'ongoing')
})

const chartData = computed(() => {
  const series = summary.value.cashflow_series || []

  if (series.length) return series

  return [
    { month: '1', label: 'Jan', income: 0, expense: 0, net_cashflow: 0 },
    { month: '2', label: 'Feb', income: 0, expense: 0, net_cashflow: 0 },
    { month: '3', label: 'Mar', income: 0, expense: 0, net_cashflow: 0 },
    { month: '4', label: 'Apr', income: 0, expense: 0, net_cashflow: 0 },
    { month: '5', label: 'Mei', income: 0, expense: 0, net_cashflow: 0 },
    { month: '6', label: 'Jun', income: 0, expense: 0, net_cashflow: 0 },
  ]
})

const chartMax = computed(() => {
  return Math.max(
    ...chartData.value.flatMap((item) => [
      numberValue(item.income),
      numberValue(item.expense),
      1,
    ]),
  ) * 1.15
})

const revenueLinePoints = computed(() => {
  return chartData.value
    .map((item, index) => `${chartX(index)},${chartY(item.income)}`)
    .join(' ')
})

const expenseLinePoints = computed(() => {
  return chartData.value
    .map((item, index) => `${chartX(index)},${chartY(item.expense)}`)
    .join(' ')
})

const revenueAreaPoints = computed(() => {
  const firstX = chartX(0)
  const lastX = chartX(chartData.value.length - 1)
  const bottomY = chartHeight - chartPaddingY

  return `${firstX},${bottomY} ${revenueLinePoints.value} ${lastX},${bottomY}`
})

const currentMonthCashflow = computed(() => {
  return numberValue(chartData.value[chartData.value.length - 1]?.net_cashflow)
})

const financialHealth = computed(() => {
  let score = 100

  if (numberValue(summary.value.net_profit) < 0) score -= 25
  if (numberValue(summary.value.overdue_invoices) > 0) {
    score -= Math.min(numberValue(summary.value.overdue_invoices) * 8, 24)
  }

  if (
    numberValue(summary.value.total_payable) >
    numberValue(summary.value.cash_balance) * 0.7
  ) {
    score -= 12
  }

  if (numberValue(summary.value.cash_balance) <= 0) score -= 25

  return Math.max(score, 0)
})

const financialHealthLabel = computed(() => {
  if (financialHealth.value >= 85) return 'Stabil'
  if (financialHealth.value >= 70) return 'Cukup Sehat'
  if (financialHealth.value >= 50) return 'Perlu Dipantau'
  return 'Perlu Tindakan'
})

const projectDeadlines = computed(() => {
  return [...ongoingProjects.value]
    .map((project) => ({
      ...project,
      daysLeft: getDaysUntil(project.end_date),
    }))
    .sort((first, second) => first.daysLeft - second.daysLeft)
    .slice(0, 4)
})

const dashboardNotes = computed(() => {
  return [
    {
      label: 'Arus Kas Bersih',
      value: formatCurrency(currentMonthCashflow.value),
      type: currentMonthCashflow.value >= 0 ? 'safe' : 'danger',
    },
    {
      label: 'Piutang Berjalan',
      value: formatCurrency(summary.value.total_receivable),
      type: numberValue(summary.value.total_receivable) > 0 ? 'warning' : 'safe',
    },
    {
      label: 'Utang Berjalan',
      value: formatCurrency(summary.value.total_payable),
      type: numberValue(summary.value.total_payable) > 0 ? 'warning' : 'safe',
    },
    {
      label: 'Invoice Terlambat',
      value: `${numberValue(summary.value.overdue_invoices)} invoice`,
      type: numberValue(summary.value.overdue_invoices) > 0 ? 'danger' : 'safe',
    },
  ]
})

function chartX(index) {
  const totalPoint = Math.max(chartData.value.length - 1, 1)

  return chartPaddingX + (index * (chartWidth - chartPaddingX * 2)) / totalPoint
}

function chartY(value) {
  const usableHeight = chartHeight - chartPaddingY * 2

  return chartHeight - chartPaddingY - (numberValue(value) / chartMax.value) * usableHeight
}

function chartGridY(position) {
  const usableHeight = chartHeight - chartPaddingY * 2

  return chartHeight - chartPaddingY - usableHeight * position
}

function getDaysUntil(date) {
  if (!date) return 999

  const target = new Date(`${String(date).slice(0, 10)}T00:00:00`)
  const current = new Date()

  current.setHours(0, 0, 0, 0)

  return Math.ceil((target - current) / (1000 * 60 * 60 * 24))
}

function getDeadlineLabel(days) {
  if (days < 0) return `Terlambat ${Math.abs(days)} hari`
  if (days === 0) return 'Berakhir hari ini'
  if (days === 999) return 'Belum ada deadline'
  return `${days} hari lagi`
}

function getDeadlineClass(days) {
  return {
    danger: days < 0,
    warning: days >= 0 && days <= 7,
  }
}

async function loadDashboard() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [summaryResponse, clientsResponse, projectsResponse] = await Promise.all([
      api.get('/dashboard/summary'),
      api.get('/clients'),
      api.get('/projects'),
    ])

    summary.value = {
      ...summary.value,
      ...(summaryResponse.data.data || {}),
    }

    clients.value = clientsResponse.data.data || []
    projects.value = projectsResponse.data.data || []
    lastUpdatedAt.value = new Date()
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data Dashboard. Pastikan backend Node.js berjalan di http://localhost:4000.',
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section class="dashboard-page">
    <div class="dashboard-heading">
      <div>
        <p class="eyebrow">FINANCIAL OVERVIEW</p>
        <h1>Health Check Bisnis</h1>
        <p>
          Monitor kondisi kas, laba, proyek, piutang, utang, serta pergerakan
          cashflow dari jurnal yang sudah diposting.
        </p>
      </div>

      <div class="dashboard-heading-actions">
        <span class="dashboard-live-indicator">
          {{ lastUpdatedAt ? 'Data diperbarui' : 'Memuat data' }}
        </span>

        <button
          type="button"
          class="table-action"
          :disabled="isLoading"
          @click="loadDashboard"
        >
          {{ isLoading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <article v-if="errorMessage" class="panel">
      <div class="panel-header">
        <div>
          <h3>API Belum Terhubung</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <button type="button" class="table-action" @click="loadDashboard">
          Coba Lagi
        </button>
      </div>
    </article>

    <div class="dashboard-kpi-grid">
      <article class="dashboard-kpi">
        <div class="dashboard-kpi-top">
          <span class="kpi-icon cash">Rp</span>
          <span class="kpi-trend">Live</span>
        </div>
        <p>Bank & Kas</p>
        <h2>{{ formatCurrency(summary.cash_balance) }}</h2>
        <small>Saldo akun Kas dan Bank</small>
      </article>

      <article class="dashboard-kpi">
        <div class="dashboard-kpi-top">
          <span class="kpi-icon project">PR</span>
          <span class="kpi-trend">Live</span>
        </div>
        <p>Proyek Berjalan</p>
        <h2>{{ summary.active_projects }}</h2>
        <small>Proyek berstatus ongoing</small>
      </article>

      <article class="dashboard-kpi">
        <div class="dashboard-kpi-top">
          <span class="kpi-icon client">CL</span>
          <span class="kpi-trend">Live</span>
        </div>
        <p>Klien Aktif</p>
        <h2>{{ activeClients }}</h2>
        <small>Klien berstatus aktif</small>
      </article>

      <article class="dashboard-kpi">
        <div class="dashboard-kpi-top">
          <span class="kpi-icon profit">NP</span>
          <span class="kpi-trend">{{ financialHealthLabel }}</span>
        </div>
        <p>Net Profit</p>
        <h2>{{ formatCurrency(summary.net_profit) }}</h2>
        <small>Pendapatan dikurangi beban</small>
      </article>
    </div>

    <div class="dashboard-top-grid">
      <article class="panel dashboard-panel cashflow-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">CASHFLOW PERFORMANCE</p>
            <h3>Pergerakan Cashflow 6 Bulan</h3>
            <p>Perbandingan pendapatan dan beban dari jurnal yang sudah diposting.</p>
          </div>
        </div>

        <div class="cashflow-legend">
          <span><i class="legend-income"></i>Pendapatan</span>
          <span><i class="legend-expense"></i>Beban</span>
        </div>

        <div class="cashflow-line-wrapper">
          <svg
            class="cashflow-line-chart"
            viewBox="0 0 760 260"
            preserveAspectRatio="none"
          >
            <line x1="46" x2="714" :y1="chartGridY(0.25)" :y2="chartGridY(0.25)" class="chart-grid-line" />
            <line x1="46" x2="714" :y1="chartGridY(0.5)" :y2="chartGridY(0.5)" class="chart-grid-line" />
            <line x1="46" x2="714" :y1="chartGridY(0.75)" :y2="chartGridY(0.75)" class="chart-grid-line" />
            <line x1="46" x2="714" :y1="chartGridY(1)" :y2="chartGridY(1)" class="chart-grid-line" />

            <text x="4" :y="chartGridY(1) + 4" class="chart-axis-label">
              {{ formatCompactCurrency(chartMax) }}
            </text>
            <text x="4" :y="chartGridY(0.5) + 4" class="chart-axis-label">
              {{ formatCompactCurrency(chartMax * 0.5) }}
            </text>
            <text x="4" :y="chartGridY(0.05) + 4" class="chart-axis-label">
              Rp 0
            </text>

            <polygon :points="revenueAreaPoints" class="chart-income-area" />
            <polyline :points="revenueLinePoints" class="chart-income-line" />
            <polyline :points="expenseLinePoints" class="chart-expense-line" />

            <circle
              v-for="(item, index) in chartData"
              :key="`income-${item.month}`"
              :cx="chartX(index)"
              :cy="chartY(item.income)"
              r="4"
              class="chart-income-point"
            />

            <circle
              v-for="(item, index) in chartData"
              :key="`expense-${item.month}`"
              :cx="chartX(index)"
              :cy="chartY(item.expense)"
              r="4"
              class="chart-expense-point"
            />
          </svg>

          <div class="cashflow-labels">
            <span v-for="item in chartData" :key="item.month">
              {{ item.label }}
            </span>
          </div>
        </div>

        <div class="cashflow-summary-grid">
          <div>
            <span>Pendapatan Diposting</span>
            <strong>{{ formatCurrency(summary.monthly_income) }}</strong>
          </div>

          <div>
            <span>Beban Diposting</span>
            <strong>{{ formatCurrency(summary.monthly_expense) }}</strong>
          </div>

          <div>
            <span>Arus Kas Bersih</span>
            <strong>{{ formatCurrency(currentMonthCashflow) }}</strong>
          </div>
        </div>
      </article>

      <FinStartAssistant
        :summary="summary"
        :active-clients="activeClients"
        :ongoing-projects="ongoingProjects"
      />
    </div>

    <div class="dashboard-bottom-grid">
      <article class="panel dashboard-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">PROJECT MONITORING</p>
            <h3>Deadline Proyek</h3>
            <p>Prioritas berdasarkan tanggal akhir proyek ongoing.</p>
          </div>
        </div>

        <div class="deadline-list">
          <div
            v-for="project in projectDeadlines"
            :key="project.id"
            class="deadline-item"
          >
            <div>
              <strong>{{ project.project_name }}</strong>
              <small>
                {{ project.client_name || '-' }} · Selesai
                {{ formatDate(project.end_date) }}
              </small>
            </div>

            <span
              class="status-badge"
              :class="getDeadlineClass(project.daysLeft)"
            >
              {{ getDeadlineLabel(project.daysLeft) }}
            </span>
          </div>

          <div v-if="projectDeadlines.length === 0" class="empty-table">
            Belum ada proyek ongoing.
          </div>
        </div>
      </article>

      <article class="panel dashboard-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">FINANCIAL PRIORITY</p>
            <h3>Ringkasan Prioritas</h3>
            <p>Indikator utama yang perlu dipantau tim finance.</p>
          </div>
        </div>

        <div class="priority-list">
          <div
            v-for="item in dashboardNotes"
            :key="item.label"
            class="priority-item"
          >
            <span class="priority-indicator" :class="item.type"></span>
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard-heading-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dashboard-heading-actions .table-action:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 760px) {
  .dashboard-heading-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
