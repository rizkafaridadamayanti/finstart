<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const accounts = computed(() => financeStore.accounts)
const transactions = computed(() => financeStore.transactions)
const assets = computed(() => financeStore.assets)

const activeReport = ref('income')
const reportPeriod = ref('2026-06')

const periodLabel = computed(() => {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${reportPeriod.value}-01T00:00:00`))
})

const revenueAccounts = computed(() => {
  return accounts.value.filter((account) => account.type === 'Pendapatan')
})

const expenseAccounts = computed(() => {
  return accounts.value.filter((account) => account.type === 'Beban')
})

const assetAccounts = computed(() => {
  return accounts.value.filter((account) => account.type === 'Aset')
})

const liabilityAccounts = computed(() => {
  return accounts.value.filter((account) => account.type === 'Kewajiban')
})

const capitalAccounts = computed(() => {
  return accounts.value.filter((account) => account.type === 'Modal')
})

function sumAccounts(accountList) {
  return accountList.reduce((total, account) => {
    return total + Number(account.balance)
  }, 0)
}

const totalRevenue = computed(() => sumAccounts(revenueAccounts.value))
const totalExpense = computed(() => sumAccounts(expenseAccounts.value))
const netProfit = computed(() => totalRevenue.value - totalExpense.value)

const totalAssetBookValue = computed(() => {
  return assets.value.reduce((total, asset) => {
    const bookValue = Math.max(
      Number(asset.acquisitionCost || 0) - Number(asset.accumulatedDepreciation || 0),
      Number(asset.residualValue || 0),
    )
    return total + bookValue
  }, 0)
})

const totalAssets = computed(() => sumAccounts(assetAccounts.value) + totalAssetBookValue.value)
const totalLiabilities = computed(() => sumAccounts(liabilityAccounts.value))
const ownerCapital = computed(() => sumAccounts(capitalAccounts.value))

const retainedEarnings = computed(() => {
  return totalAssets.value - totalLiabilities.value - ownerCapital.value
})

const totalEquity = computed(() => {
  return ownerCapital.value + retainedEarnings.value
})

const cashAndBank = computed(() => {
  return accounts.value
    .filter((account) => account.code === '1101' || account.code === '1102')
    .reduce((total, account) => total + Number(account.balance), 0)
})

const cashAccountIds = computed(() => {
  return accounts.value
    .filter((account) => account.code === '1101' || account.code === '1102')
    .map((account) => account.id)
})

const approvedTransactions = computed(() => {
  return transactions.value.filter((transaction) => transaction.status === 'Approved')
})

const projectRevenue = computed(() => {
  return approvedTransactions.value.reduce((total, transaction) => {
    const cashDebit = (transaction.lines || [])
      .filter((line) => line.side === 'Debit' && cashAccountIds.value.includes(Number(line.accountId)))
      .reduce((lineTotal, line) => lineTotal + Number(line.amount || 0), 0)
    return total + cashDebit
  }, 0)
})

const operationalPayment = computed(() => {
  return approvedTransactions.value.reduce((total, transaction) => {
    const cashCredit = (transaction.lines || [])
      .filter((line) => line.side === 'Credit' && cashAccountIds.value.includes(Number(line.accountId)))
      .reduce((lineTotal, line) => lineTotal + Number(line.amount || 0), 0)
    return total + cashCredit
  }, 0)
})

const netOperatingCashflow = computed(() => {
  return projectRevenue.value - operationalPayment.value
})

const investingCashflow = computed(() => 0)
const financingCashflow = computed(() => 0)

const netCashIncrease = computed(() => {
  return netOperatingCashflow.value + investingCashflow.value + financingCashflow.value
})

const openingCash = computed(() => {
  return cashAndBank.value - netCashIncrease.value
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function getReportRows() {
  if (activeReport.value === 'income') {
    return [
      ['LAPORAN LABA RUGI', periodLabel.value],
      [],
      ['Keterangan', 'Nominal'],
      ...revenueAccounts.value.map((account) => [
        account.name,
        account.balance,
      ]),
      ['Total Pendapatan Operasional', totalRevenue.value],
      [],
      ...expenseAccounts.value.map((account) => [
        account.name,
        account.balance,
      ]),
      ['Total Beban Operasional', totalExpense.value],
      [],
      ['LABA BERSIH', netProfit.value],
    ]
  }

  if (activeReport.value === 'balance') {
    return [
      ['NERACA', periodLabel.value],
      [],
      ['ASET', 'Nominal'],
      ...assetAccounts.value.map((account) => [
        account.name,
        account.balance,
      ]),
      ['Aset Tetap (Nilai Buku)', totalAssetBookValue.value],
      ['Total Aset', totalAssets.value],
      [],
      ['KEWAJIBAN', 'Nominal'],
      ...liabilityAccounts.value.map((account) => [
        account.name,
        account.balance,
      ]),
      ['Total Kewajiban', totalLiabilities.value],
      [],
      ['EKUITAS', 'Nominal'],
      ['Modal Pemilik', ownerCapital.value],
      ['Saldo Laba / (Defisit) Berjalan', retainedEarnings.value],
      ['Total Ekuitas', totalEquity.value],
      ['Total Kewajiban dan Ekuitas', totalLiabilities.value + totalEquity.value],
    ]
  }

  return [
    ['LAPORAN ARUS KAS', periodLabel.value],
    [],
    ['Aktivitas Operasi', 'Nominal'],
    ['Penerimaan Pendapatan Proyek', projectRevenue.value],
    ['Pembayaran Operasional', -operationalPayment.value],
    ['Kas Bersih dari Operasi', netOperatingCashflow.value],
    [],
    ['Aktivitas Investasi', 'Nominal'],
    ['Pengadaan / Investasi Aset', investingCashflow.value],
    [],
    ['Aktivitas Pendanaan', 'Nominal'],
    ['Tambahan Modal / Pendanaan', financingCashflow.value],
    [],
    ['Kenaikan Bersih Kas', netCashIncrease.value],
    ['Saldo Kas Awal', openingCash.value],
    ['Saldo Kas Akhir', cashAndBank.value],
  ]
}

function escapeCsv(value) {
  const text = String(value ?? '')

  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

function exportReport() {
  const csvContent = getReportRows()
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n')

  const blob = new Blob([`\ufeff${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `laporan-finstart-${activeReport.value}-${reportPeriod.value}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

function printReport() {
  window.print()
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">FINANCIAL REPORTS</p>
        <h1>Laporan Keuangan</h1>
        <p>
          Pantau laporan laba rugi, neraca, dan arus kas perusahaan.
        </p>
      </div>

      <div class="page-button-group">
        <button class="secondary-button" @click="exportReport">
          Export Excel
        </button>

        <button class="primary-button" @click="printReport">
          Cetak / Simpan PDF
        </button>
      </div>
    </div>

    <div class="report-control-bar">
      <div class="report-tabs">
        <button
          class="report-tab"
          :class="{ active: activeReport === 'income' }"
          @click="activeReport = 'income'"
        >
          Laba Rugi
        </button>

        <button
          class="report-tab"
          :class="{ active: activeReport === 'balance' }"
          @click="activeReport = 'balance'"
        >
          Neraca
        </button>

        <button
          class="report-tab"
          :class="{ active: activeReport === 'cashflow' }"
          @click="activeReport = 'cashflow'"
        >
          Arus Kas
        </button>
      </div>

      <input
        v-model="reportPeriod"
        class="filter-select report-period"
        type="month"
      />
    </div>

    <div v-if="activeReport === 'income'" class="report-metrics">
      <article class="report-stat">
        <p>Pendapatan Operasional</p>
        <h2>{{ formatCurrency(totalRevenue) }}</h2>
        <small>Total akun pendapatan</small>
      </article>

      <article class="report-stat">
        <p>Beban Operasional</p>
        <h2>{{ formatCurrency(totalExpense) }}</h2>
        <small>Total akun beban</small>
      </article>

      <article class="report-stat">
        <p>Laba Bersih</p>
        <h2>{{ formatCurrency(netProfit) }}</h2>
        <small>Pendapatan dikurangi beban</small>
      </article>
    </div>

    <div v-else-if="activeReport === 'balance'" class="report-metrics">
      <article class="report-stat">
        <p>Total Aset</p>
        <h2>{{ formatCurrency(totalAssets) }}</h2>
        <small>Kas, bank, piutang, dan nilai buku aset</small>
      </article>

      <article class="report-stat">
        <p>Total Kewajiban</p>
        <h2>{{ formatCurrency(totalLiabilities) }}</h2>
        <small>Utang usaha perusahaan</small>
      </article>

      <article class="report-stat">
        <p>Total Ekuitas</p>
        <h2>{{ formatCurrency(totalEquity) }}</h2>
        <small>Modal dan saldo laba berjalan</small>
      </article>
    </div>

    <div v-else class="report-metrics">
      <article class="report-stat">
        <p>Kas dari Operasi</p>
        <h2>{{ formatCurrency(netOperatingCashflow) }}</h2>
        <small>Penerimaan dikurangi pembayaran operasi</small>
      </article>

      <article class="report-stat">
        <p>Kenaikan Bersih Kas</p>
        <h2>{{ formatCurrency(netCashIncrease) }}</h2>
        <small>Operasi, investasi, dan pendanaan</small>
      </article>

      <article class="report-stat">
        <p>Saldo Kas Akhir</p>
        <h2>{{ formatCurrency(cashAndBank) }}</h2>
        <small>Kas dan bank pada buku besar</small>
      </article>
    </div>

    <article v-if="activeReport === 'income'" class="panel report-paper">
      <div class="report-heading">
        <p class="eyebrow">INCOME STATEMENT</p>
        <h2>Laporan Laba Rugi</h2>
        <span>Periode {{ periodLabel }}</span>
      </div>

      <div class="report-section">
        <h3>Pendapatan Operasional</h3>

        <div
          v-for="account in revenueAccounts"
          :key="account.id"
          class="report-line"
        >
          <span>{{ account.name }}</span>
          <strong>{{ formatCurrency(account.balance) }}</strong>
        </div>

        <div class="report-line report-total">
          <span>Total Pendapatan Operasional</span>
          <strong>{{ formatCurrency(totalRevenue) }}</strong>
        </div>
      </div>

      <div class="report-section">
        <h3>Beban Operasional</h3>

        <div
          v-for="account in expenseAccounts"
          :key="account.id"
          class="report-line"
        >
          <span>{{ account.name }}</span>
          <strong>{{ formatCurrency(account.balance) }}</strong>
        </div>

        <div class="report-line report-total">
          <span>Total Beban Operasional</span>
          <strong>{{ formatCurrency(totalExpense) }}</strong>
        </div>
      </div>

      <div class="report-line report-final">
        <span>Laba Bersih Periode Berjalan</span>
        <strong>{{ formatCurrency(netProfit) }}</strong>
      </div>
    </article>

    <article v-else-if="activeReport === 'balance'" class="panel report-paper">
      <div class="report-heading">
        <p class="eyebrow">BALANCE SHEET</p>
        <h2>Neraca</h2>
        <span>Periode {{ periodLabel }}</span>
      </div>

      <div class="balance-sheet-grid">
        <section class="balance-column">
          <h3>Aset</h3>

          <div
            v-for="account in assetAccounts"
            :key="account.id"
            class="report-line"
          >
            <span>{{ account.name }}</span>
            <strong>{{ formatCurrency(account.balance) }}</strong>
          </div>

          <div class="report-line report-total">
            <span>Total Aset</span>
            <strong>{{ formatCurrency(totalAssets) }}</strong>
          </div>
        </section>

        <section class="balance-column">
          <h3>Kewajiban</h3>

          <div
            v-for="account in liabilityAccounts"
            :key="account.id"
            class="report-line"
          >
            <span>{{ account.name }}</span>
            <strong>{{ formatCurrency(account.balance) }}</strong>
          </div>

          <div class="report-line report-total">
            <span>Total Kewajiban</span>
            <strong>{{ formatCurrency(totalLiabilities) }}</strong>
          </div>

          <h3 class="equity-heading">Ekuitas</h3>

          <div class="report-line">
            <span>Modal Pemilik</span>
            <strong>{{ formatCurrency(ownerCapital) }}</strong>
          </div>

          <div class="report-line">
            <span>Saldo Laba / (Defisit) Berjalan</span>
            <strong>{{ formatCurrency(retainedEarnings) }}</strong>
          </div>

          <div class="report-line report-total">
            <span>Total Ekuitas</span>
            <strong>{{ formatCurrency(totalEquity) }}</strong>
          </div>

          <div class="report-line report-final">
            <span>Total Kewajiban dan Ekuitas</span>
            <strong>
              {{ formatCurrency(totalLiabilities + totalEquity) }}
            </strong>
          </div>
        </section>
      </div>
    </article>

    <article v-else class="panel report-paper">
      <div class="report-heading">
        <p class="eyebrow">CASH FLOW STATEMENT</p>
        <h2>Laporan Arus Kas</h2>
        <span>Periode {{ periodLabel }}</span>
      </div>

      <div class="report-section">
        <h3>Arus Kas dari Aktivitas Operasi</h3>

        <div class="report-line">
          <span>Penerimaan Pendapatan Proyek</span>
          <strong>{{ formatCurrency(projectRevenue) }}</strong>
        </div>

        <div class="report-line">
          <span>Pembayaran Operasional</span>
          <strong>- {{ formatCurrency(operationalPayment) }}</strong>
        </div>

        <div class="report-line report-total">
          <span>Kas Bersih dari Aktivitas Operasi</span>
          <strong>{{ formatCurrency(netOperatingCashflow) }}</strong>
        </div>
      </div>

      <div class="report-section">
        <h3>Arus Kas dari Aktivitas Investasi</h3>

        <div class="report-line">
          <span>Pengadaan / Investasi Aset</span>
          <strong>{{ formatCurrency(investingCashflow) }}</strong>
        </div>
      </div>

      <div class="report-section">
        <h3>Arus Kas dari Aktivitas Pendanaan</h3>

        <div class="report-line">
          <span>Tambahan Modal / Pendanaan</span>
          <strong>{{ formatCurrency(financingCashflow) }}</strong>
        </div>
      </div>

      <div class="report-line report-final">
        <span>Kenaikan Bersih Kas</span>
        <strong>{{ formatCurrency(netCashIncrease) }}</strong>
      </div>

      <div class="cash-balance-grid">
        <div>
          <span>Saldo Kas Awal</span>
          <strong>{{ formatCurrency(openingCash) }}</strong>
        </div>

        <div>
          <span>Saldo Kas Akhir</span>
          <strong>{{ formatCurrency(cashAndBank) }}</strong>
        </div>
      </div>
    </article>

    <article class="report-note-card">
      <strong>Catatan laporan</strong>
      <p>
        Nilai Dashboard dan laporan diperbarui dari data yang disimpan di localStorage. Jurnal Approved memengaruhi saldo akun dan arus kas.
      </p>
    </article>
  </section>
</template>