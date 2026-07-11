<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '../services/api'

const activeTab = ref('income')
const selectedPeriod = ref(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
const isLoading = ref(false)
const errorMessage = ref('')

const report = ref({
  period: '',
  period_label: '',
  income_statement: { revenue_items: [], expense_items: [], total_revenue: 0, total_expense: 0, net_profit: 0 },
  balance_sheet: { assets: [], liabilities: [], equity: [], total_assets: 0, total_liabilities: 0, total_equity: 0, total_liabilities_and_equity: 0, balance_difference: 0 },
  cash_flow: { operating_items: [], investing_items: [], financing_items: [], operating_cash_flow: 0, investing_cash_flow: 0, financing_cash_flow: 0, net_cash_increase: 0, beginning_cash: 0, ending_cash: 0 },
})

const income = computed(() => report.value.income_statement)
const balance = computed(() => report.value.balance_sheet)
const cashflow = computed(() => report.value.cash_flow)

function n(value) {
  return Number(value || 0)
}

function money(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n(value))
}

function nonZero(items, property) {
  return (items || []).filter((item) => n(item[property]) !== 0)
}

const revenueItems = computed(() => nonZero(income.value.revenue_items, 'amount'))
const expenseItems = computed(() => nonZero(income.value.expense_items, 'amount'))
const assetItems = computed(() => nonZero(balance.value.assets, 'balance'))
const liabilityItems = computed(() => nonZero(balance.value.liabilities, 'balance'))
const equityItems = computed(() => nonZero(balance.value.equity, 'balance'))

async function loadReports() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/reports', {
      params: { period: selectedPeriod.value },
    })

    report.value = {
      ...report.value,
      ...(response.data.data || {}),
    }
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      'Gagal mengambil laporan. Pastikan backend FinStart berjalan.'
  } finally {
    isLoading.value = false
  }
}

function exportCsv() {
  let rows = [
    ['FINSTART - LAPORAN KEUANGAN'],
    [`Periode: ${report.value.period_label || selectedPeriod.value}`],
    [],
  ]

  if (activeTab.value === 'income') {
    rows.push(['LAPORAN LABA RUGI'], ['Kode', 'Akun', 'Nilai'])
    revenueItems.value.forEach((item) => rows.push([item.code, item.name, item.amount]))
    rows.push(['', 'Total Pendapatan', income.value.total_revenue], [])
    expenseItems.value.forEach((item) => rows.push([item.code, item.name, item.amount]))
    rows.push(['', 'Total Beban', income.value.total_expense], ['', 'Laba Bersih', income.value.net_profit])
  }

  if (activeTab.value === 'balance') {
    rows.push(['NERACA'], ['Kode', 'Aset', 'Nilai'])
    assetItems.value.forEach((item) => rows.push([item.code, item.name, item.balance]))
    rows.push(['', 'Total Aset', balance.value.total_assets], [], ['Kode', 'Kewajiban dan Ekuitas', 'Nilai'])
    liabilityItems.value.forEach((item) => rows.push([item.code, item.name, item.balance]))
    equityItems.value.forEach((item) => rows.push([item.code, item.name, item.balance]))
    rows.push(['', 'Total Kewajiban dan Ekuitas', balance.value.total_liabilities_and_equity])
  }

  if (activeTab.value === 'cashflow') {
    rows.push(['LAPORAN ARUS KAS'], ['Kategori', 'Referensi', 'Keterangan', 'Nilai'])
    ;[
      ['Operasi', cashflow.value.operating_items],
      ['Investasi', cashflow.value.investing_items],
      ['Pendanaan', cashflow.value.financing_items],
    ].forEach(([category, items]) => {
      items.forEach((item) => rows.push([category, item.voucher_number, item.description, item.amount]))
    })
    rows.push(
      ['', '', 'Arus Kas Operasi', cashflow.value.operating_cash_flow],
      ['', '', 'Arus Kas Investasi', cashflow.value.investing_cash_flow],
      ['', '', 'Arus Kas Pendanaan', cashflow.value.financing_cash_flow],
      ['', '', 'Kenaikan Kas Bersih', cashflow.value.net_cash_increase],
      ['', '', 'Saldo Kas Akhir', cashflow.value.ending_cash],
    )
  }

  const csv = rows
    .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `finstart-${activeTab.value}-${selectedPeriod.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function printReport() {
  window.print()
}

watch(selectedPeriod, loadReports)
onMounted(loadReports)
</script>

<template>
  <section class="reports-page">
    <div class="report-heading no-print">
      <div>
        <p class="eyebrow">FINANCIAL REPORTS</p>
        <h1>Laporan Keuangan</h1>
        <p>Pantau laporan laba rugi, neraca, dan arus kas perusahaan.</p>
      </div>

      <div class="report-actions">
        <button class="secondary-button" type="button" @click="exportCsv">Export Excel</button>
        <button class="primary-button" type="button" @click="printReport">Cetak / Simpan PDF</button>
      </div>
    </div>

    <div class="report-toolbar no-print">
      <div class="report-tabs">
        <button :class="{ active: activeTab === 'income' }" type="button" @click="activeTab = 'income'">Laba Rugi</button>
        <button :class="{ active: activeTab === 'balance' }" type="button" @click="activeTab = 'balance'">Neraca</button>
        <button :class="{ active: activeTab === 'cashflow' }" type="button" @click="activeTab = 'cashflow'">Arus Kas</button>
      </div>

      <label class="period-input">
        <span>Periode</span>
        <input v-model="selectedPeriod" type="month" />
      </label>
    </div>

    <div v-if="errorMessage" class="report-alert no-print">
      <div>
        <strong>Data laporan belum dapat dimuat.</strong>
        <p>{{ errorMessage }}</p>
      </div>
      <button class="secondary-button" type="button" @click="loadReports">Coba Lagi</button>
    </div>

    <div v-if="isLoading" class="report-loading">Memuat laporan keuangan...</div>

    <template v-else>
      <div v-if="activeTab === 'income'" class="summary-grid">
        <article class="summary-card"><span>Pendapatan Operasional</span><strong>{{ money(income.total_revenue) }}</strong><small>Total akun pendapatan</small></article>
        <article class="summary-card"><span>Beban Operasional</span><strong>{{ money(income.total_expense) }}</strong><small>Total akun beban</small></article>
        <article class="summary-card"><span>Laba Bersih</span><strong>{{ money(income.net_profit) }}</strong><small>Pendapatan dikurangi beban</small></article>
      </div>

      <div v-if="activeTab === 'balance'" class="summary-grid">
        <article class="summary-card"><span>Total Aset</span><strong>{{ money(balance.total_assets) }}</strong><small>Saldo seluruh akun aset</small></article>
        <article class="summary-card"><span>Total Kewajiban</span><strong>{{ money(balance.total_liabilities) }}</strong><small>Saldo seluruh akun kewajiban</small></article>
        <article class="summary-card"><span>Total Ekuitas</span><strong>{{ money(balance.total_equity) }}</strong><small>Modal dan laba berjalan</small></article>
      </div>

      <div v-if="activeTab === 'cashflow'" class="summary-grid">
        <article class="summary-card"><span>Arus Kas Operasi</span><strong>{{ money(cashflow.operating_cash_flow) }}</strong><small>Dari pendapatan dan beban</small></article>
        <article class="summary-card"><span>Arus Kas Pendanaan</span><strong>{{ money(cashflow.financing_cash_flow) }}</strong><small>Dari modal, utang, dan ekuitas</small></article>
        <article class="summary-card"><span>Saldo Kas Akhir</span><strong>{{ money(cashflow.ending_cash) }}</strong><small>Kas dan bank akhir periode</small></article>
      </div>

      <article v-if="activeTab === 'income'" class="statement-card">
        <header class="statement-title">
          <p>INCOME STATEMENT</p><h2>Laporan Laba Rugi</h2><span>Periode {{ report.period_label || selectedPeriod }}</span>
        </header>

        <section class="statement-section">
          <h3>Pendapatan Operasional</h3>
          <div v-for="item in revenueItems" :key="item.id" class="statement-row"><span>{{ item.name }}</span><strong>{{ money(item.amount) }}</strong></div>
          <p v-if="!revenueItems.length" class="empty-row">Belum ada pendapatan dari jurnal posted pada periode ini.</p>
          <div class="statement-row subtotal"><span>Total Pendapatan Operasional</span><strong>{{ money(income.total_revenue) }}</strong></div>
        </section>

        <section class="statement-section">
          <h3>Beban Operasional</h3>
          <div v-for="item in expenseItems" :key="item.id" class="statement-row"><span>{{ item.name }}</span><strong>{{ money(item.amount) }}</strong></div>
          <p v-if="!expenseItems.length" class="empty-row">Belum ada beban dari jurnal posted pada periode ini.</p>
          <div class="statement-row subtotal"><span>Total Beban Operasional</span><strong>{{ money(income.total_expense) }}</strong></div>
        </section>

        <footer class="statement-total"><span>Laba Bersih Periode Berjalan</span><strong>{{ money(income.net_profit) }}</strong></footer>
      </article>

      <article v-if="activeTab === 'balance'" class="statement-card">
        <header class="statement-title">
          <p>BALANCE SHEET</p><h2>Neraca</h2><span>Posisi per {{ report.period_label || selectedPeriod }}</span>
        </header>

        <div class="balance-columns">
          <section class="statement-section">
            <h3>Aset</h3>
            <div v-for="item in assetItems" :key="item.id" class="statement-row"><span>{{ item.name }}</span><strong>{{ money(item.balance) }}</strong></div>
            <p v-if="!assetItems.length" class="empty-row">Belum ada saldo aset.</p>
            <div class="statement-row subtotal"><span>Total Aset</span><strong>{{ money(balance.total_assets) }}</strong></div>
          </section>

          <section class="statement-section">
            <h3>Kewajiban</h3>
            <div v-for="item in liabilityItems" :key="item.id" class="statement-row"><span>{{ item.name }}</span><strong>{{ money(item.balance) }}</strong></div>
            <p v-if="!liabilityItems.length" class="empty-row">Belum ada saldo kewajiban.</p>
            <div class="statement-row subtotal"><span>Total Kewajiban</span><strong>{{ money(balance.total_liabilities) }}</strong></div>

            <h3 class="section-gap">Ekuitas</h3>
            <div v-for="item in equityItems" :key="item.id" class="statement-row"><span>{{ item.name }}</span><strong>{{ money(item.balance) }}</strong></div>
            <div class="statement-row subtotal"><span>Total Ekuitas</span><strong>{{ money(balance.total_equity) }}</strong></div>
          </section>
        </div>

        <footer class="statement-total" :class="{ unbalanced: n(balance.balance_difference) !== 0 }"><span>Selisih Neraca</span><strong>{{ money(balance.balance_difference) }}</strong></footer>
      </article>

      <article v-if="activeTab === 'cashflow'" class="statement-card">
        <header class="statement-title">
          <p>CASH FLOW STATEMENT</p><h2>Laporan Arus Kas</h2><span>Periode {{ report.period_label || selectedPeriod }}</span>
        </header>

        <section class="statement-section">
          <h3>Arus Kas dari Aktivitas Operasi</h3>
          <div v-for="item in cashflow.operating_items" :key="`o-${item.id}`" class="statement-row"><span>{{ item.description }} <small>({{ item.voucher_number }})</small></span><strong>{{ money(item.amount) }}</strong></div>
          <p v-if="!cashflow.operating_items.length" class="empty-row">Belum ada arus kas operasi pada periode ini.</p>
          <div class="statement-row subtotal"><span>Kas Bersih dari Aktivitas Operasi</span><strong>{{ money(cashflow.operating_cash_flow) }}</strong></div>
        </section>

        <section class="statement-section">
          <h3>Arus Kas dari Aktivitas Investasi</h3>
          <div v-for="item in cashflow.investing_items" :key="`i-${item.id}`" class="statement-row"><span>{{ item.description }} <small>({{ item.voucher_number }})</small></span><strong>{{ money(item.amount) }}</strong></div>
          <p v-if="!cashflow.investing_items.length" class="empty-row">Belum ada arus kas investasi pada periode ini.</p>
          <div class="statement-row subtotal"><span>Kas Bersih dari Aktivitas Investasi</span><strong>{{ money(cashflow.investing_cash_flow) }}</strong></div>
        </section>

        <section class="statement-section">
          <h3>Arus Kas dari Aktivitas Pendanaan</h3>
          <div v-for="item in cashflow.financing_items" :key="`f-${item.id}`" class="statement-row"><span>{{ item.description }} <small>({{ item.voucher_number }})</small></span><strong>{{ money(item.amount) }}</strong></div>
          <p v-if="!cashflow.financing_items.length" class="empty-row">Belum ada arus kas pendanaan pada periode ini.</p>
          <div class="statement-row subtotal"><span>Kas Bersih dari Aktivitas Pendanaan</span><strong>{{ money(cashflow.financing_cash_flow) }}</strong></div>
        </section>

        <footer class="cashflow-total">
          <div><span>Saldo Kas Awal</span><strong>{{ money(cashflow.beginning_cash) }}</strong></div>
          <div><span>Kenaikan Kas Bersih</span><strong>{{ money(cashflow.net_cash_increase) }}</strong></div>
          <div><span>Saldo Kas Akhir</span><strong>{{ money(cashflow.ending_cash) }}</strong></div>
        </footer>
      </article>

      <article class="report-note">
        <strong>Catatan laporan</strong>
        <p>Seluruh angka diperbarui dari jurnal berstatus <b>posted</b> di database FinStart. Jurnal draft atau approved belum memengaruhi saldo dan laporan.</p>
      </article>
    </template>
  </section>
</template>

<style scoped>
.reports-page{display:grid;gap:18px;padding-bottom:28px}.report-heading,.report-actions,.report-toolbar,.report-tabs,.period-input,.summary-grid,.balance-columns,.cashflow-total{display:flex}.report-heading,.report-toolbar{align-items:center;justify-content:space-between;gap:18px}.report-heading h1{margin:4px 0 7px;color:#10294a;font-size:27px}.report-heading>div>p:last-child{margin:0;color:#7485a3;font-size:14px}.report-actions{gap:10px}.primary-button,.secondary-button,.report-tabs button{border-radius:8px;padding:10px 14px;font-size:12px;font-weight:700;cursor:pointer}.primary-button{border:1px solid #1e5f9a;background:#1e5f9a;color:#fff}.secondary-button{border:1px solid #d8e1ef;background:#fff;color:#39536f}.report-tabs{gap:7px}.report-tabs button{border:1px solid #dce5f0;background:#fff;color:#657895}.report-tabs button.active{border-color:#1e5f9a;background:#1e5f9a;color:#fff}.period-input{align-items:center;gap:9px;border:1px solid #dce5f0;border-radius:8px;padding:8px 11px;background:#fff;color:#7688a5;font-size:11px;font-weight:700}.period-input input{border:0;outline:0;color:#314c6d;font:inherit}.report-alert,.report-note{border:1px solid #d8e4f2;border-radius:10px;padding:14px 16px;background:#f7fbff;color:#406080}.report-alert{display:flex;align-items:center;justify-content:space-between;gap:16px;border-color:#f3c5c5;background:#fff7f7;color:#954444}.report-alert p,.report-note p{margin:5px 0 0;font-size:12px;line-height:1.55}.report-loading{border-radius:14px;padding:45px;background:#fff;color:#6b7f9c;text-align:center}.summary-grid{gap:14px}.summary-card{min-width:0;flex:1;border:1px solid #e3eaf3;border-radius:12px;padding:17px;background:#fff;box-shadow:0 4px 13px rgba(30,67,110,.04)}.summary-card span,.summary-card small{display:block;color:#8091aa;font-size:11px}.summary-card strong{display:block;margin:9px 0;color:#112e50;font-size:18px}.statement-card{border:1px solid #e1e9f2;border-radius:13px;padding:23px;background:#fff;box-shadow:0 4px 13px rgba(30,67,110,.04)}.statement-title{border-bottom:1px solid #e6edf5;padding-bottom:16px;text-align:center}.statement-title p{margin:0 0 6px;color:#4071aa;font-size:10px;font-weight:800;letter-spacing:.09em}.statement-title h2{margin:0;color:#102d50;font-size:21px}.statement-title span{display:block;margin-top:7px;color:#7e8fa9;font-size:12px}.statement-section{padding-top:20px}.statement-section h3{margin:0 0 12px;color:#164574;font-size:13px}.statement-row{display:flex;justify-content:space-between;gap:15px;padding:9px 2px;color:#60738f;font-size:12px}.statement-row strong{color:#153555;white-space:nowrap}.statement-row small{color:#899bb4}.statement-row.subtotal{margin-top:5px;border-top:1px solid #e5edf5;padding-top:13px;color:#315a84;font-weight:800}.empty-row{margin:0;padding:8px 0;color:#95a3b7;font-size:12px;font-style:italic}.statement-total{display:flex;justify-content:space-between;gap:15px;margin-top:22px;border-radius:8px;padding:14px;background:#edf7ff;color:#17436e;font-size:13px;font-weight:800}.statement-total.unbalanced{background:#fff1f1;color:#a44d4d}.balance-columns{gap:35px}.balance-columns>section{min-width:0;flex:1}.section-gap{margin-top:26px!important}.cashflow-total{gap:12px;margin-top:22px}.cashflow-total>div{flex:1;border-radius:9px;padding:13px;background:#edf7ff}.cashflow-total span,.cashflow-total strong{display:block}.cashflow-total span{color:#7191b1;font-size:11px}.cashflow-total strong{margin-top:7px;color:#16416a;font-size:13px}.report-note{font-size:12px}@media(max-width:880px){.report-heading,.report-toolbar,.balance-columns{align-items:stretch;flex-direction:column}.report-actions{justify-content:flex-start}.summary-grid,.cashflow-total{flex-direction:column}.summary-card,.cashflow-total>div{width:auto}}@media print{.no-print{display:none!important}.reports-page{padding:0}.statement-card{border:0;box-shadow:none}}
</style>
