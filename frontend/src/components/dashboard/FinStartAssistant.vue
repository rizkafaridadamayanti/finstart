<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useFinanceStore } from '../../stores/financeStore'

const financeStore = useFinanceStore()

const question = ref('')
const isAnalyzing = ref(false)
const chatEnd = ref(null)
const STORAGE_KEY = 'finstartAssistantChatV3'

const todayText = new Date().toISOString().slice(0, 10)

const messages = ref([])

const quickQuestions = [
  'Analisis kondisi keuangan FinStart',
  'Berapa saldo kas perusahaan?',
  'Piutang mana yang perlu ditagih?',
  'Apakah ada utang yang perlu dibayar?',
  'Bagaimana roadmap bisnis tahun ini?',
]

function defaultMessage() {
  return {
    id: Date.now(),
    role: 'assistant',
    text: 'Halo, saya AI FinStart Assistant. Saya membaca data FinStart yang tersimpan saat ini. Tanyakan kas, laba, jurnal, proyek, piutang, utang, pajak, langganan, SDM, aset, laporan, atau roadmap bisnis.',
  }
}

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

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword))
}

function getOutstanding(item) {
  return Math.max(
    number(item.total || item.amount) - number(item.paidAmount),
    0,
  )
}

const accounts = computed(() => financeStore.accounts)
const clients = computed(() => financeStore.clients)
const projects = computed(() => financeStore.projects)
const receivables = computed(() => financeStore.receivables)
const payables = computed(() => financeStore.payables)
const subscriptions = computed(() => financeStore.subscriptions)
const taxObligations = computed(() => financeStore.taxObligations)
const employees = computed(() => financeStore.employees)
const assets = computed(() => financeStore.assets)
const projectionTargets = computed(() => financeStore.projectionTargets)
const transactions = computed(() => financeStore.transactions)

const cashAndBank = computed(() => {
  return accounts.value
    .filter((account) => account.code === '1101' || account.code === '1102')
    .reduce((total, account) => total + number(account.balance), 0)
})

const cashAccountIds = computed(() => {
  return accounts.value
    .filter((account) => account.code === '1101' || account.code === '1102')
    .map((account) => Number(account.id))
})

const approvedTransactions = computed(() => {
  return transactions.value.filter((transaction) => transaction.status === 'Approved')
})

const cashReceipts = computed(() => {
  return approvedTransactions.value.reduce((total, transaction) => {
    const receipt = (transaction.lines || [])
      .filter((line) => line.side === 'Debit' && cashAccountIds.value.includes(Number(line.accountId)))
      .reduce((lineTotal, line) => lineTotal + number(line.amount), 0)

    return total + receipt
  }, 0)
})

const cashPayments = computed(() => {
  return approvedTransactions.value.reduce((total, transaction) => {
    const payment = (transaction.lines || [])
      .filter((line) => line.side === 'Credit' && cashAccountIds.value.includes(Number(line.accountId)))
      .reduce((lineTotal, line) => lineTotal + number(line.amount), 0)

    return total + payment
  }, 0)
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

const totalReceivable = computed(() => {
  return receivables.value
    .filter((invoice) => invoice.status !== 'Draft')
    .reduce((total, invoice) => total + getOutstanding(invoice), 0)
})

const overdueInvoices = computed(() => {
  return receivables.value.filter((invoice) => {
    const overdueByDate = invoice.dueDate && invoice.dueDate < todayText
    return invoice.status === 'Overdue' || (overdueByDate && invoice.status !== 'Paid' && invoice.status !== 'Draft')
  })
})

const totalPayable = computed(() => {
  return payables.value
    .filter((bill) => bill.status !== 'Draft')
    .reduce((total, bill) => total + getOutstanding(bill), 0)
})

const overdueBills = computed(() => {
  return payables.value.filter((bill) => {
    return bill.status !== 'Paid' && bill.status !== 'Draft' && bill.dueDate < todayText
  })
})

const unpaidTaxes = computed(() => {
  return taxObligations.value.filter((tax) => tax.status !== 'Dibayar')
})

const overdueTaxes = computed(() => {
  return taxObligations.value.filter((tax) => tax.status !== 'Dibayar' && tax.dueDate < todayText)
})

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

const lateSubscriptions = computed(() => {
  return subscriptions.value.filter((subscription) => {
    return subscription.paymentStatus === 'Terlambat' || subscription.paymentStatus === 'Jatuh Tempo'
  })
})

const ongoingProjects = computed(() => {
  return projects.value.filter((project) => project.status === 'Ongoing')
})

const annualTargetRevenue = computed(() => {
  return projectionTargets.value
    .filter((target) => target.type === 'Pendapatan')
    .reduce((total, target) => total + number(target.targetValue), 0)
})

const annualTargetExpense = computed(() => {
  return projectionTargets.value
    .filter((target) => target.type === 'Beban')
    .reduce((total, target) => total + number(target.targetValue), 0)
})

const estimatedProjectionProfit = computed(() => {
  return annualTargetRevenue.value - annualTargetExpense.value
})

const activeEmployees = computed(() => employees.value.filter((employee) => employee.active))
const bpjsPending = computed(() => activeEmployees.value.filter((employee) => employee.bpjsStatus !== 'Terdaftar'))

const totalAssetBookValue = computed(() => {
  return assets.value.reduce((total, asset) => {
    const bookValue = Math.max(
      number(asset.acquisitionCost) - number(asset.accumulatedDepreciation),
      number(asset.residualValue),
    )
    return total + bookValue
  }, 0)
})

const assetsInMaintenance = computed(() => {
  return assets.value.filter((asset) => asset.status === 'Dalam Perawatan')
})

const estimatedMonthlyCost = computed(() => {
  return Math.max(totalExpense.value / 12 + monthlySubscriptionBurn.value, 1)
})

const cashRunway = computed(() => {
  return Math.max(Math.floor(cashAndBank.value / estimatedMonthlyCost.value), 0)
})

const healthScore = computed(() => {
  let score = 96
  score -= overdueInvoices.value.length * 10
  score -= overdueBills.value.length * 8
  score -= overdueTaxes.value.length * 14
  score -= lateSubscriptions.value.length * 4
  if (netProfit.value < 0) score -= 10
  if (totalPayable.value > cashAndBank.value * 0.7) score -= 6
  return Math.max(Math.min(score, 100), 0)
})

const healthLabel = computed(() => {
  if (healthScore.value >= 85) return 'Stabil'
  if (healthScore.value >= 70) return 'Cukup Sehat'
  if (healthScore.value >= 55) return 'Perlu Dipantau'
  return 'Perlu Tindakan'
})

function buildOverallAnalysis() {
  return `Ringkasan kondisi FinStart saat ini:

• Kas dan bank: ${formatCurrency(cashAndBank.value)}
• Pendapatan: ${formatCurrency(totalRevenue.value)}
• Beban: ${formatCurrency(totalExpense.value)}
• Laba bersih: ${formatCurrency(netProfit.value)}
• Piutang berjalan: ${formatCurrency(totalReceivable.value)}
• Utang berjalan: ${formatCurrency(totalPayable.value)}
• Proyek ongoing: ${ongoingProjects.value.length} proyek
• Klien terdaftar: ${clients.value.length} klien
• Runway kas: sekitar ${cashRunway.value} bulan
• Financial health: ${healthScore.value}/100 (${healthLabel.value})

Prioritas: ${getPriorityText()}`
}

function getPriorityText() {
  if (overdueInvoices.value.length > 0) {
    return `segera follow-up ${overdueInvoices.value.length} invoice yang overdue agar arus kas tidak tertahan.`
  }
  if (overdueTaxes.value.length > 0) {
    return `selesaikan ${overdueTaxes.value.length} kewajiban pajak yang sudah melewati jatuh tempo.`
  }
  if (overdueBills.value.length > 0) {
    return `atur pembayaran ${overdueBills.value.length} tagihan vendor yang overdue.`
  }
  return 'pantau cashflow dan realisasi target bisnis setiap bulan.'
}

function buildCashAnalysis() {
  return `Analisis kas dan arus kas:

• Saldo kas dan bank: ${formatCurrency(cashAndBank.value)}
• Penerimaan kas dari jurnal diposting: ${formatCurrency(cashReceipts.value)}
• Pengeluaran kas dari jurnal diposting: ${formatCurrency(cashPayments.value)}
• Arus kas bersih: ${formatCurrency(cashReceipts.value - cashPayments.value)}
• Burn rate langganan digital: ${formatCurrency(monthlySubscriptionBurn.value)} per bulan
• Estimasi runway kas: ${cashRunway.value} bulan

${cashAndBank.value >= totalPayable.value ? 'Kas masih dapat menutup total utang berjalan, tetapi jadwal pembayaran tetap perlu dikendalikan.' : 'Kas lebih rendah dari total utang berjalan. Prioritaskan penagihan piutang dan pengaturan pembayaran vendor.'}`
}

function buildProfitAnalysis() {
  return `Analisis profitabilitas:

• Pendapatan tercatat: ${formatCurrency(totalRevenue.value)}
• Beban tercatat: ${formatCurrency(totalExpense.value)}
• Net profit: ${formatCurrency(netProfit.value)}
• Target revenue tahunan: ${formatCurrency(annualTargetRevenue.value)}
• Batas beban tahunan: ${formatCurrency(annualTargetExpense.value)}
• Estimasi laba roadmap: ${formatCurrency(estimatedProjectionProfit.value)}

${netProfit.value >= 0 ? 'Laba saat ini positif. Jaga margin dengan mengendalikan biaya berulang dan mempercepat pembayaran invoice.' : 'Laba masih negatif. Evaluasi beban dan tingkatkan realisasi pendapatan dari proyek aktif.'}`
}

function buildReceivableAnalysis() {
  const overdueText = overdueInvoices.value.length
    ? overdueInvoices.value.map((invoice) => `${invoice.invoiceNumber} (${invoice.client})`).join(', ')
    : 'Tidak ada invoice overdue'

  return `Analisis piutang:

• Total piutang berjalan: ${formatCurrency(totalReceivable.value)}
• Invoice overdue: ${overdueInvoices.value.length}
• Prioritas penagihan: ${overdueText}

Saran: terbitkan invoice yang masih Draft, follow-up invoice overdue, dan catat pelunasan segera agar saldo kas Dashboard ikut diperbarui.`
}

function buildPayableAnalysis() {
  const overdueText = overdueBills.value.length
    ? overdueBills.value.map((bill) => `${bill.billNumber} (${bill.vendor})`).join(', ')
    : 'Tidak ada tagihan overdue'

  return `Analisis utang:

• Total utang berjalan: ${formatCurrency(totalPayable.value)}
• Tagihan vendor overdue: ${overdueBills.value.length}
• Prioritas pembayaran: ${overdueText}

Saran: setujui tagihan Draft sebelum dibayar, lalu gunakan menu pembayaran agar utang, kas, jurnal, laporan, dan AI diperbarui bersamaan.`
}

function buildTaxAnalysis() {
  return `Analisis pajak:

• Kewajiban pajak belum dibayar: ${unpaidTaxes.value.length}
• Pajak overdue: ${overdueTaxes.value.length}
• Status kepatuhan: ${overdueTaxes.value.length === 0 ? 'Patuh' : 'Perlu tindakan segera'}

Saran: catat pembayaran pajak beserta NTPN. Setelah disimpan, saldo kas, jurnal, laporan, dan insight AI akan ikut diperbarui.`
}

function buildSubscriptionAnalysis() {
  return `Analisis langganan digital:

• Total layanan aktif: ${subscriptions.value.filter((item) => item.status === 'Aktif').length}
• Burn rate digital: ${formatCurrency(monthlySubscriptionBurn.value)} per bulan
• Layanan jatuh tempo atau terlambat: ${lateSubscriptions.value.length}

Saran: perpanjang layanan penting tepat waktu dan evaluasi langganan dengan biaya tinggi yang jarang digunakan.`
}

function buildProjectAnalysis() {
  const list = ongoingProjects.value.length
    ? ongoingProjects.value.map((project) => `${project.name} — ${project.client}`).join(', ')
    : 'Belum ada proyek berstatus Ongoing'

  return `Analisis CRM dan proyek:

• Proyek ongoing: ${ongoingProjects.value.length}
• Klien terdaftar: ${clients.value.length}
• Daftar proyek ongoing: ${list}

Saran: proyek aktif perlu dipantau terhadap nilai kontrak, deadline, dan invoice agar target revenue roadmap tercapai.`
}

function buildProjectionAnalysis() {
  return `Analisis roadmap bisnis:

• Target revenue tahunan: ${formatCurrency(annualTargetRevenue.value)}
• Batas beban tahunan: ${formatCurrency(annualTargetExpense.value)}
• Estimasi laba tahunan: ${formatCurrency(estimatedProjectionProfit.value)}

${estimatedProjectionProfit.value >= 0 ? 'Roadmap memiliki proyeksi laba positif. Pantau realisasi pendapatan bulanan agar tetap sesuai target.' : 'Roadmap menunjukkan risiko laba negatif. Kurangi batas beban atau tingkatkan target revenue.'}`
}

function buildAccountingAnalysis() {
  const draftCount = transactions.value.filter((transaction) => transaction.status === 'Draft').length
  return `Analisis buku besar dan jurnal:

• Jumlah akun COA: ${accounts.value.length} akun
• Jumlah transaksi jurnal: ${transactions.value.length} jurnal
• Jurnal Draft yang belum diposting: ${draftCount}
• Pendapatan pada buku besar: ${formatCurrency(totalRevenue.value)}
• Beban pada buku besar: ${formatCurrency(totalExpense.value)}

Saran: posting jurnal Draft yang sudah diverifikasi. Hanya jurnal Approved yang akan mengubah saldo akun, Dashboard, laporan, dan jawaban AI.`
}

function buildHrAnalysis() {
  return `Analisis SDM:

• Pegawai aktif: ${activeEmployees.value.length}
• Pegawai BPJS belum lengkap: ${bpjsPending.value.length}

Saran: lengkapi status BPJS dan catat payroll dari halaman SDM agar beban serta kas perusahaan tercermin pada laporan.`
}

function buildAssetAnalysis() {
  return `Analisis aset:

• Jumlah aset tercatat: ${assets.value.length}
• Nilai buku aset: ${formatCurrency(totalAssetBookValue.value)}
• Aset dalam perawatan: ${assetsInMaintenance.value.length}

Saran: lakukan penyusutan rutin untuk aset aktif dan pantau aset dalam perawatan agar tidak menghambat operasional proyek.`
}

function buildReportAnalysis() {
  return `Analisis laporan keuangan:

• Laba bersih saat ini: ${formatCurrency(netProfit.value)}
• Kas dan bank: ${formatCurrency(cashAndBank.value)}
• Piutang: ${formatCurrency(totalReceivable.value)}
• Utang: ${formatCurrency(totalPayable.value)}

Gunakan menu Laporan untuk melihat Laba Rugi, Neraca, dan Arus Kas. Nilai laporan bersumber dari buku besar yang diperbarui oleh jurnal Approved.`
}

function createAnswer(userQuestion) {
  const text = userQuestion.toLowerCase().trim()

  if (hasAny(text, ['ringkasan', 'kondisi keuangan', 'kondisi bisnis', 'analisis finstart', 'semua sistem', 'health check'])) {
    return buildOverallAnalysis()
  }

  const answers = []

  if (hasAny(text, ['kas', 'bank', 'cashflow', 'arus kas', 'runway', 'saldo', 'likuiditas'])) answers.push(buildCashAnalysis())
  if (hasAny(text, ['laba', 'profit', 'pendapatan', 'revenue', 'beban', 'biaya', 'margin'])) answers.push(buildProfitAnalysis())
  if (hasAny(text, ['piutang', 'invoice', 'tagihan klien', 'pelunasan'])) answers.push(buildReceivableAnalysis())
  if (hasAny(text, ['utang', 'vendor', 'tagihan vendor', 'pembayaran'])) answers.push(buildPayableAnalysis())
  if (hasAny(text, ['pajak', 'ppn', 'pph', 'ntpn', 'spt', 'e-faktur'])) answers.push(buildTaxAnalysis())
  if (hasAny(text, ['langganan', 'subscription', 'saas', 'google', 'figma', 'aws', 'burn rate'])) answers.push(buildSubscriptionAnalysis())
  if (hasAny(text, ['proyek', 'project', 'crm', 'klien', 'client', 'tender', 'deadline'])) answers.push(buildProjectAnalysis())
  if (hasAny(text, ['proyeksi', 'roadmap', 'forecast', 'target', 'anggaran'])) answers.push(buildProjectionAnalysis())
  if (hasAny(text, ['jurnal', 'transaksi', 'akun', 'coa', 'buku besar', 'debit', 'kredit'])) answers.push(buildAccountingAnalysis())
  if (hasAny(text, ['pegawai', 'sdm', 'bpjs', 'gaji', 'payroll', 'karyawan'])) answers.push(buildHrAnalysis())
  if (hasAny(text, ['aset', 'penyusutan', 'depresiasi', 'nilai buku'])) answers.push(buildAssetAnalysis())
  if (hasAny(text, ['laporan', 'neraca', 'laba rugi', 'arus kas laporan'])) answers.push(buildReportAnalysis())

  if (answers.length) return answers.join('\n\n')

  return `${buildOverallAnalysis()}\n\nSaya juga dapat menjawab pertanyaan khusus tentang kas, laba, invoice, utang, pajak, langganan, proyek, jurnal, SDM, aset, laporan, serta roadmap.`
}

async function scrollToEnd() {
  await nextTick()
  chatEnd.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

function saveChat() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value.slice(-30)))
}

function askQuestion(customQuestion = '') {
  const text = (customQuestion || question.value).trim()
  if (!text || isAnalyzing.value) return

  messages.value.push({ id: Date.now(), role: 'user', text })
  question.value = ''
  isAnalyzing.value = true
  scrollToEnd()

  window.setTimeout(() => {
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      text: createAnswer(text),
    })
    isAnalyzing.value = false
    scrollToEnd()
  }, 450)
}

function resetChat() {
  messages.value = [defaultMessage()]
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    messages.value = Array.isArray(saved) && saved.length ? saved : [defaultMessage()]
  } catch {
    messages.value = [defaultMessage()]
  }
})

watch(messages, saveChat, { deep: true })
</script>

<template>
  <aside class="finstart-ai-panel">
    <div class="finstart-ai-header">
      <div class="finstart-ai-title">
        <span class="finstart-ai-icon">✦</span>
        <div>
          <p>AI FINSTART ASSISTANT</p>
          <small>Analisis data seluruh modul FinStart</small>
        </div>
      </div>

      <button type="button" class="reset-chat-button" @click="resetChat">
        Reset
      </button>
    </div>

    <div class="financial-health-card">
      <div class="health-score-ring" :style="{ '--score': `${healthScore * 3.6}deg` }">
        <div>
          <strong>{{ healthScore }}</strong>
          <span>/100</span>
        </div>
      </div>

      <div>
        <span>Financial Health</span>
        <h3>{{ healthLabel }}</h3>
        <p>Dinilai dari kas, laba, piutang, utang, pajak, dan langganan.</p>
      </div>
    </div>

    <div class="quick-question-list">
      <button
        v-for="item in quickQuestions"
        :key="item"
        type="button"
        class="quick-question"
        @click="askQuestion(item)"
      >
        {{ item }}
      </button>
    </div>

    <div class="ai-chat-window">
      <article
        v-for="message in messages"
        :key="message.id"
        class="chat-message"
        :class="message.role"
      >
        <span class="message-label">
          {{ message.role === 'assistant' ? 'AI FinStart' : 'Anda' }}
        </span>
        <p>{{ message.text }}</p>
      </article>

      <article v-if="isAnalyzing" class="chat-message assistant typing-message">
        <span class="message-label">AI FinStart</span>
        <p>Memeriksa data FinStart terbaru...</p>
      </article>

      <div ref="chatEnd"></div>
    </div>

    <form class="ai-question-form" @submit.prevent="askQuestion()">
      <input
        v-model="question"
        type="text"
        placeholder="Tanyakan kondisi FinStart..."
        :disabled="isAnalyzing"
      />
      <button type="submit" :disabled="isAnalyzing || !question.trim()">
        Kirim
      </button>
    </form>

    <p class="ai-scope-note">
      AI ini adalah assistant rule-based yang membaca data live dari modul FinStart dan localStorage proyek.
    </p>
  </aside>
</template>

<style scoped>
.finstart-ai-panel { display: grid; gap: 14px; min-width: 0; border-radius: 18px; padding: 20px; background: #0f1930; box-shadow: 0 10px 24px rgba(15, 25, 48, 0.18); color: white; }
.finstart-ai-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.finstart-ai-title { display: flex; align-items: center; gap: 10px; }
.finstart-ai-icon { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 9px; background: rgba(104, 96, 255, 0.2); color: #8d86ff; font-size: 17px; }
.finstart-ai-title p { margin: 0; color: white; font-size: 13px; font-weight: 800; }
.finstart-ai-title small { display: block; margin-top: 3px; color: #97a8c4; font-size: 10px; }
.reset-chat-button { border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 7px; padding: 6px 8px; background: transparent; color: #b5c2d8; font-size: 10px; font-weight: 700; }
.reset-chat-button:hover { background: rgba(255, 255, 255, 0.08); }
.financial-health-card { display: flex; align-items: center; gap: 14px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 13px; padding: 14px; background: rgba(255, 255, 255, 0.05); }
.health-score-ring { display: grid; width: 70px; height: 70px; flex-shrink: 0; place-items: center; border-radius: 50%; background: radial-gradient(circle, #16223c 61%, transparent 62%), conic-gradient(#756eff var(--score), rgba(255, 255, 255, 0.12) 0); }
.health-score-ring div { display: grid; text-align: center; }
.health-score-ring strong { color: white; font-size: 19px; }
.health-score-ring span { color: #9db0ce; font-size: 9px; }
.financial-health-card > div:last-child > span { color: #94a4c2; font-size: 11px; }
.financial-health-card h3 { margin: 4px 0; color: white; font-size: 17px; }
.financial-health-card p { margin: 0; color: #9caec9; font-size: 10px; line-height: 1.5; }
.quick-question-list { display: flex; flex-wrap: wrap; gap: 7px; }
.quick-question { border: 1px solid rgba(137, 130, 255, 0.36); border-radius: 999px; padding: 6px 8px; background: rgba(110, 101, 255, 0.1); color: #c4c1ff; font-size: 10px; line-height: 1.3; text-align: left; }
.quick-question:hover { background: rgba(110, 101, 255, 0.22); }
.ai-chat-window { display: grid; align-content: start; gap: 10px; min-height: 290px; max-height: 380px; overflow-y: auto; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 13px; padding: 12px; background: rgba(255, 255, 255, 0.04); }
.chat-message { max-width: 94%; border-radius: 10px; padding: 10px; }
.chat-message.assistant { justify-self: start; background: rgba(255, 255, 255, 0.07); }
.chat-message.user { justify-self: end; background: rgba(98, 92, 240, 0.35); }
.message-label { display: block; margin-bottom: 5px; color: #aebbd0; font-size: 9px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
.chat-message.user .message-label { color: #e1e0ff; }
.chat-message p { margin: 0; color: #edf2ff; font-size: 11px; line-height: 1.55; white-space: pre-line; }
.typing-message p { color: #c9d4e8; font-style: italic; }
.ai-question-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.ai-question-form input { width: 100%; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 10px; outline: 0; background: rgba(255, 255, 255, 0.08); color: white; font-size: 11px; }
.ai-question-form input::placeholder { color: #8fa0ba; }
.ai-question-form input:focus { border-color: #817bff; box-shadow: 0 0 0 3px rgba(129, 123, 255, 0.16); }
.ai-question-form button { border: 0; border-radius: 8px; padding: 0 12px; background: #625cf0; color: white; font-size: 11px; font-weight: 800; }
.ai-question-form button:hover { background: #514ae6; }
.ai-question-form button:disabled { cursor: not-allowed; opacity: 0.5; }
.ai-scope-note { margin: 0; color: #8292ad; font-size: 9px; line-height: 1.45; }
@media (max-width: 760px) { .ai-chat-window { max-height: 330px; } }
</style>
