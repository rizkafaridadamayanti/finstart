<script setup>
import { computed } from 'vue'
import { useFinanceStore } from '../stores/financeStore'
import FinStartAssistant from '../components/dashboard/FinStartAssistant.vue'

const financeStore = useFinanceStore()

const today = new Date()
const todayText = today.toISOString().slice(0, 10)

const chartMonths = [
  { value: '2026-01', label: 'Jan' },
  { value: '2026-02', label: 'Feb' },
  { value: '2026-03', label: 'Mar' },
  { value: '2026-04', label: 'Apr' },
  { value: '2026-05', label: 'Mei' },
  { value: '2026-06', label: 'Jun' },
  { value: '2026-07', label: 'Jul' },
  { value: '2026-08', label: 'Agu' },
  { value: '2026-09', label: 'Sep' },
  { value: '2026-10', label: 'Okt' },
  { value: '2026-11', label: 'Nov' },
  { value: '2026-12', label: 'Des' },
]

function number(value) {
  return Number(value || 0)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number(value))
}

function formatCompactCurrency(value) {
  const compact = new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number(value))

  return `Rp ${compact}`
}

function formatDate(date) {
  if (!date) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getOutstanding(item) {
  return Math.max(number(item.total || item.amount) - number(item.paidAmount), 0)
}

const accounts = computed(() => financeStore.accounts)
const projects = computed(() => financeStore.projects)
const receivables = computed(() => financeStore.receivables)
const payables = computed(() => financeStore.payables)
const subscriptions = computed(() => financeStore.subscriptions)
const taxObligations = computed(() => financeStore.taxObligations)
const projectionTargets = computed(() => financeStore.projectionTargets)
const transactions = computed(() => financeStore.transactions)

const cashAndBank = computed(() => {
  return accounts.value
    .filter((account) => account.code === '1101' || account.code === '1102')
    .reduce((total, account) => total + number(account.balance), 0)
})

const totalRevenue = computed(() => {
  return accounts.value
    .filter((account) => account.type === 'Pendapatan')
    .reduce((total, account) => total + number(account.balance), 0)
})

const totalExpense = computed(() => {
  return accounts.value
    .filter((account) => account.type === 'Beban')
    .reduce((total, account) => total + number(account.balance), 0)
})

const netProfit = computed(() => totalRevenue.value - totalExpense.value)

const ongoingProjects = computed(() => {
  return projects.value.filter((project) => project.status === 'Ongoing').length
})

const activeClients = computed(() => {
  return new Set(
    projects.value
      .filter((project) => project.status !== 'Completed' && project.client)
      .map((project) => project.client),
  ).size
})

const totalReceivable = computed(() => {
  return receivables.value
    .filter((invoice) => invoice.status !== 'Draft')
    .reduce((total, invoice) => total + getOutstanding(invoice), 0)
})

const totalPayable = computed(() => {
  return payables.value
    .filter((bill) => bill.status !== 'Draft')
    .reduce((total, bill) => total + getOutstanding(bill), 0)
})

const approvedTransactions = computed(() => {
  return transactions.value.filter((transaction) => transaction.status === 'Approved')
})

const cashAccountIds = computed(() => {
  return accounts.value
    .filter((account) => account.code === '1101' || account.code === '1102')
    .map((account) => Number(account.id))
})

const cashReceipts = computed(() => {
  return approvedTransactions.value.reduce((total, transaction) => {
    const cashDebit = (transaction.lines || [])
      .filter((line) => line.side === 'Debit' && cashAccountIds.value.includes(Number(line.accountId)))
      .reduce((lineTotal, line) => lineTotal + number(line.amount), 0)

    return total + cashDebit
  }, 0)
})

const cashPayments = computed(() => {
  return approvedTransactions.value.reduce((total, transaction) => {
    const cashCredit = (transaction.lines || [])
      .filter((line) => line.side === 'Credit' && cashAccountIds.value.includes(Number(line.accountId)))
      .reduce((lineTotal, line) => lineTotal + number(line.amount), 0)

    return total + cashCredit
  }, 0)
})

const netCashflow = computed(() => cashReceipts.value - cashPayments.value)

const monthlySubscriptionBurn = computed(() => {
  return subscriptions.value
    .filter((subscription) => subscription.status === 'Aktif')
    .reduce((total, subscription) => {
      return total + (
        subscription.cycle === 'Tahunan'
          ? number(subscription.fee) / 12
          : number(subscription.fee)
      )
    }, 0)
})

const monthlyRoadmap = computed(() => {
  return chartMonths.map((month) => {
    const monthTargets = projectionTargets.value.filter((target) => target.month === month.value)

    const revenue = monthTargets
      .filter((target) => target.type === 'Pendapatan')
      .reduce((total, target) => total + number(target.targetValue), 0)

    const expense = monthTargets
      .filter((target) => target.type === 'Beban')
      .reduce((total, target) => total + number(target.targetValue), 0)

    return {
      ...month,
      revenue,
      expense,
      profit: revenue - expense,
    }
  })
})

const chartData = computed(() => monthlyRoadmap.value.slice(0, 6))

const roadmapMax = computed(() => {
  return Math.max(
    ...monthlyRoadmap.value.flatMap((item) => [item.revenue, item.expense, 1]),
  )
})

const chartMax = computed(() => {
  return Math.max(
    ...chartData.value.flatMap((item) => [item.revenue, item.expense, 1]),
  ) * 1.15
})

const chartWidth = 760
const chartHeight = 260
const chartPaddingX = 46
const chartPaddingY = 30

const revenueLinePoints = computed(() => {
  return chartData.value
    .map((item, index) => `${chartX(index)},${chartY(item.revenue)}`)
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

const projectDeadlines = computed(() => {
  return projects.value
    .filter((project) => project.status !== 'Completed')
    .map((project) => ({ ...project, daysLeft: getDaysUntil(project.endDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4)
})

const dashboardNotes = computed(() => {
  const overdueInvoices = receivables.value.filter((invoice) => {
    return invoice.status === 'Overdue' || (invoice.dueDate < todayText && invoice.status !== 'Paid' && invoice.status !== 'Draft')
  })
  const overdueBills = payables.value.filter((bill) => bill.dueDate < todayText && bill.status !== 'Paid')
  const overdueTaxes = taxObligations.value.filter((tax) => tax.dueDate < todayText && tax.status !== 'Dibayar')

  return [
    {
      label: 'Cashflow Bersih',
      value: formatCurrency(netCashflow.value),
      type: netCashflow.value >= 0 ? 'safe' : 'danger',
    },
    {
      label: 'Invoice Perlu Ditagih',
      value: `${overdueInvoices.length} invoice`,
      type: overdueInvoices.length ? 'danger' : 'safe',
    },
    {
      label: 'Utang Jatuh Tempo',
      value: `${overdueBills.length} tagihan`,
      type: overdueBills.length ? 'warning' : 'safe',
    },
    {
      label: 'Status Pajak',
      value: overdueTaxes.length ? 'Perlu Tindakan' : 'Patuh',
      type: overdueTaxes.length ? 'danger' : 'safe',
    },
    {
      label: 'Burn Rate Digital',
      value: formatCurrency(monthlySubscriptionBurn.value),
      type: 'warning',
    },
  ]
})

function getDaysUntil(date) {
  if (!date) return 999
  const targetDate = new Date(`${date}T00:00:00`)
  const currentDate = new Date(today)
  currentDate.setHours(0, 0, 0, 0)
  return Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24))
}

function getDeadlineLabel(days) {
  if (days < 0) return `Terlambat ${Math.abs(days)} hari`
  if (days === 0) return 'Berakhir hari ini'
  return `${days} hari lagi`
}

function getDeadlineClass(days) {
  return { danger: days < 0, warning: days >= 0 && days <= 7 }
}

function roadmapWidth(value) {
  if (value <= 0) return '0%'
  return `${Math.max((value / roadmapMax.value) * 100, 3)}%`
}

function chartX(index) {
  const totalPoint = Math.max(chartData.value.length - 1, 1)
  return chartPaddingX + (index * (chartWidth - chartPaddingX * 2)) / totalPoint
}

function chartY(value) {
  const usableHeight = chartHeight - chartPaddingY * 2
  return chartHeight - chartPaddingY - (number(value) / chartMax.value) * usableHeight
}

function chartGridY(position) {
  const usableHeight = chartHeight - chartPaddingY * 2
  return chartHeight - chartPaddingY - usableHeight * position
}
</script>

<template>
  <section class="dashboard-page">
    <div class="dashboard-heading">
      <div>
        <p class="eyebrow">FINANCIAL OVERVIEW</p>
        <h1>Health Check Bisnis</h1>
        <p>
          Monitor kondisi kas, laba, proyek, piutang, utang, serta roadmap
          bisnis perusahaan dalam satu dashboard.
        </p>
      </div>
      <span class="dashboard-live-indicator">● Data Tersinkron</span>
    </div>

    <div class="dashboard-kpi-grid">
      <article class="dashboard-kpi">
        <div class="dashboard-kpi-top"><span class="kpi-icon cash">Rp</span><span class="kpi-trend">Live</span></div>
        <p>Bank & Kas</p><h2>{{ formatCurrency(cashAndBank) }}</h2><small>Saldo kas dan rekening bank</small>
      </article>
      <article class="dashboard-kpi">
        <div class="dashboard-kpi-top"><span class="kpi-icon project">□</span><span class="kpi-trend">Live</span></div>
        <p>Proyek Berjalan</p><h2>{{ ongoingProjects }}</h2><small>Proyek berstatus Ongoing</small>
      </article>
      <article class="dashboard-kpi">
        <div class="dashboard-kpi-top"><span class="kpi-icon client">◌</span><span class="kpi-trend">Live</span></div>
        <p>Klien Aktif</p><h2>{{ activeClients }}</h2><small>Klien pada proyek aktif</small>
      </article>
      <article class="dashboard-kpi">
        <div class="dashboard-kpi-top"><span class="kpi-icon profit">↗</span><span class="kpi-trend">Live</span></div>
        <p>Net Profit</p><h2>{{ formatCurrency(netProfit) }}</h2><small>Pendapatan dikurangi beban</small>
      </article>
    </div>

    <div class="dashboard-top-grid">
      <article class="panel dashboard-panel cashflow-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">CASHFLOW PERFORMANCE</p>
            <h3>Pergerakan Target Arus Kas</h3>
            <p>Perbandingan target pendapatan dan batas beban dari roadmap bisnis.</p>
          </div>
        </div>

        <div class="cashflow-legend">
          <span><i class="legend-income"></i>Target Pendapatan</span>
          <span><i class="legend-expense"></i>Batas Beban</span>
        </div>

        <div class="cashflow-line-wrapper">
          <svg class="cashflow-line-chart" viewBox="0 0 760 260" preserveAspectRatio="none">
            <line x1="46" x2="714" :y1="chartGridY(0.25)" :y2="chartGridY(0.25)" class="chart-grid-line" />
            <line x1="46" x2="714" :y1="chartGridY(0.5)" :y2="chartGridY(0.5)" class="chart-grid-line" />
            <line x1="46" x2="714" :y1="chartGridY(0.75)" :y2="chartGridY(0.75)" class="chart-grid-line" />
            <line x1="46" x2="714" :y1="chartGridY(1)" :y2="chartGridY(1)" class="chart-grid-line" />
            <text x="4" :y="chartGridY(1) + 4" class="chart-axis-label">{{ formatCompactCurrency(chartMax) }}</text>
            <text x="4" :y="chartGridY(0.5) + 4" class="chart-axis-label">{{ formatCompactCurrency(chartMax * 0.5) }}</text>
            <text x="4" :y="chartGridY(0.05) + 4" class="chart-axis-label">Rp 0</text>
            <polygon :points="revenueAreaPoints" class="chart-income-area" />
            <polyline :points="revenueLinePoints" class="chart-income-line" />
            <polyline :points="expenseLinePoints" class="chart-expense-line" />
            <circle v-for="(item, index) in chartData" :key="`income-${item.value}`" :cx="chartX(index)" :cy="chartY(item.revenue)" r="4" class="chart-income-point" />
            <circle v-for="(item, index) in chartData" :key="`expense-${item.value}`" :cx="chartX(index)" :cy="chartY(item.expense)" r="4" class="chart-expense-point" />
          </svg>
          <div class="cashflow-labels"><span v-for="item in chartData" :key="item.value">{{ item.label }}</span></div>
        </div>

        <div class="cashflow-summary-grid">
          <div><span>Penerimaan Diposting</span><strong>{{ formatCurrency(cashReceipts) }}</strong></div>
          <div><span>Pembayaran Diposting</span><strong>{{ formatCurrency(cashPayments) }}</strong></div>
          <div><span>Arus Kas Bersih</span><strong>{{ formatCurrency(netCashflow) }}</strong></div>
        </div>
      </article>

      <FinStartAssistant />
    </div>

    <article class="panel dashboard-roadmap-panel">
      <div class="panel-header"><div><p class="eyebrow">BUSINESS ROADMAP</p><h3>Roadmap Profitabilitas Tahunan</h3><p>Target pendapatan dan batas beban yang sama dengan halaman Proyeksi Bisnis.</p></div></div>
      <div class="roadmap-legend"><span><i class="legend-revenue"></i>Target Pendapatan</span><span><i class="legend-expense"></i>Batas Beban</span><span><i class="legend-profit"></i>Estimasi Laba</span></div>
      <div class="dashboard-roadmap-chart">
        <div v-for="item in monthlyRoadmap" :key="item.value" class="dashboard-roadmap-row">
          <span class="roadmap-month">{{ item.label }}</span>
          <div class="roadmap-bars"><div class="roadmap-track"><span class="roadmap-revenue" :style="{ width: roadmapWidth(item.revenue) }"></span></div><div class="roadmap-track"><span class="roadmap-expense" :style="{ width: roadmapWidth(item.expense) }"></span></div></div>
          <strong class="roadmap-profit" :class="{ negative: item.profit < 0 }">{{ formatCurrency(item.profit) }}</strong>
        </div>
      </div>
    </article>

    <div class="dashboard-bottom-grid">
      <article class="panel dashboard-panel">
        <div class="panel-header"><div><p class="eyebrow">PROJECT MONITORING</p><h3>Deadline Proyek</h3><p>Prioritas berdasarkan tanggal akhir proyek.</p></div></div>
        <div class="deadline-list">
          <div v-for="project in projectDeadlines" :key="project.id" class="deadline-item">
            <div><strong>{{ project.name }}</strong><small>{{ project.client }} · Selesai {{ formatDate(project.endDate) }}</small></div>
            <span class="status-badge" :class="getDeadlineClass(project.daysLeft)">{{ getDeadlineLabel(project.daysLeft) }}</span>
          </div>
        </div>
      </article>

      <article class="panel dashboard-panel">
        <div class="panel-header"><div><p class="eyebrow">FINANCIAL PRIORITY</p><h3>Ringkasan Prioritas</h3><p>Indikator utama yang perlu dipantau oleh tim finance.</p></div></div>
        <div class="priority-list">
          <div v-for="item in dashboardNotes" :key="item.label" class="priority-item"><span class="priority-indicator" :class="item.type"></span><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div>
        </div>
      </article>
    </div>
  </section>
</template>
