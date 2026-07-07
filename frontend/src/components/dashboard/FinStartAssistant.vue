<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
  activeClients: {
    type: Number,
    default: 0,
  },
  ongoingProjects: {
    type: Array,
    default: () => [],
  },
})

const question = ref('')
const isAnalyzing = ref(false)
const chatEnd = ref(null)
const showActivityPanel = ref(false)
const STORAGE_KEY = 'finstartAssistantLiveV1'

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

const healthScore = computed(() => {
  let score = 100

  if (numberValue(props.summary.net_profit) < 0) score -= 25
  if (numberValue(props.summary.overdue_invoices) > 0) {
    score -= Math.min(numberValue(props.summary.overdue_invoices) * 8, 24)
  }

  if (
    numberValue(props.summary.total_payable) >
    numberValue(props.summary.cash_balance) * 0.7
  ) {
    score -= 12
  }

  if (numberValue(props.summary.cash_balance) <= 0) score -= 25

  return Math.max(score, 0)
})

const healthLabel = computed(() => {
  if (healthScore.value >= 85) return 'Stabil'
  if (healthScore.value >= 70) return 'Cukup Sehat'
  if (healthScore.value >= 50) return 'Perlu Dipantau'
  return 'Perlu Tindakan'
})

const currentMonthCashflow = computed(() => {
  const series = props.summary.cashflow_series || []
  return numberValue(series[series.length - 1]?.net_cashflow)
})

const quickQuestions = [
  'Analisis kondisi keuangan FinStart',
  'Berapa saldo kas perusahaan?',
  'Bagaimana laba perusahaan?',
  'Apakah ada piutang atau utang yang perlu dipantau?',
  'Bagaimana status proyek yang berjalan?',
]

const activityItems = [
  { label: 'Kas', detail: 'Saldo & arus kas' },
  { label: 'Laba', detail: 'Pendapatan & beban' },
  { label: 'Proyek', detail: 'Klien & milestone' },
]

function defaultMessage() {
  return {
    id: Date.now(),
    role: 'assistant',
    text: 'Halo, saya AI FinStart Assistant.',
  }
}

const messages = ref([defaultMessage()])

function buildOverallAnalysis() {
  const priority =
    numberValue(props.summary.overdue_invoices) > 0
      ? `Prioritaskan penagihan ${props.summary.overdue_invoices} invoice yang sudah terlambat.`
      : numberValue(props.summary.total_payable) > numberValue(props.summary.cash_balance) * 0.7
        ? 'Utang relatif tinggi dibanding kas. Atur jadwal pembayaran vendor dengan lebih ketat.'
        : 'Kondisi saat ini stabil. Pertahankan disiplin posting jurnal dan pemantauan arus kas.'

  return `Ringkasan kondisi keuangan FinStart:

• Kas dan bank: ${formatCurrency(props.summary.cash_balance)}
• Pendapatan tercatat: ${formatCurrency(props.summary.total_revenue)}
• Beban tercatat: ${formatCurrency(props.summary.total_expense)}
• Laba bersih: ${formatCurrency(props.summary.net_profit)}
• Piutang berjalan: ${formatCurrency(props.summary.total_receivable)}
• Utang berjalan: ${formatCurrency(props.summary.total_payable)}
• Proyek ongoing: ${props.ongoingProjects.length} proyek
• Klien aktif: ${props.activeClients} klien
• Financial health: ${healthScore.value}/100 (${healthLabel.value})

${priority}`
}

function buildCashAnalysis() {
  return `Analisis kas dan arus kas:

• Saldo kas dan bank: ${formatCurrency(props.summary.cash_balance)}
• Arus kas bersih bulan ini: ${formatCurrency(currentMonthCashflow.value)}
• Piutang berjalan: ${formatCurrency(props.summary.total_receivable)}
• Utang berjalan: ${formatCurrency(props.summary.total_payable)}

${numberValue(props.summary.cash_balance) >= numberValue(props.summary.total_payable)
  ? 'Kas saat ini masih dapat menutup utang berjalan. Tetap pantau pengeluaran dan penagihan piutang.'
  : 'Kas lebih kecil dari utang berjalan. Prioritaskan penagihan piutang dan pengaturan pembayaran.'}`
}

function buildProfitAnalysis() {
  return `Analisis profitabilitas:

• Pendapatan: ${formatCurrency(props.summary.total_revenue)}
• Beban: ${formatCurrency(props.summary.total_expense)}
• Laba bersih: ${formatCurrency(props.summary.net_profit)}
• Pendapatan bulan ini: ${formatCurrency(props.summary.monthly_income)}
• Beban bulan ini: ${formatCurrency(props.summary.monthly_expense)}

${numberValue(props.summary.net_profit) >= 0
  ? 'Laba saat ini positif. Jaga margin dengan mencatat semua beban dan mempercepat penerimaan pendapatan.'
  : 'Laba saat ini negatif. Evaluasi beban dan tingkatkan realisasi pendapatan dari proyek aktif.'}`
}

function buildReceivablePayableAnalysis() {
  return `Analisis piutang dan utang:

• Piutang berjalan: ${formatCurrency(props.summary.total_receivable)}
• Invoice terlambat: ${props.summary.overdue_invoices || 0}
• Utang berjalan: ${formatCurrency(props.summary.total_payable)}

${numberValue(props.summary.overdue_invoices) > 0
  ? 'Ada invoice yang terlambat. Lakukan follow-up agar arus kas tidak tertahan.'
  : 'Belum ada invoice terlambat berdasarkan data yang tersedia.'}`
}

function buildProjectAnalysis() {
  const projects = props.ongoingProjects.length
    ? props.ongoingProjects
      .map((project) => `${project.project_name} (${project.client_name || '-'})`)
      .join(', ')
    : 'Belum ada proyek ongoing'

  return `Analisis proyek:

• Proyek ongoing: ${props.ongoingProjects.length}
• Klien aktif: ${props.activeClients}
• Daftar proyek: ${projects}

Saran: pantau deadline proyek, nilai kontrak, dan penerbitan invoice agar pendapatan tercatat tepat waktu.`
}

function createAnswer(rawQuestion) {
  const text = rawQuestion.toLowerCase()

  if (/(kas|bank|arus kas|cashflow)/.test(text)) {
    return buildCashAnalysis()
  }

  if (/(laba|profit|pendapatan|beban)/.test(text)) {
    return buildProfitAnalysis()
  }

  if (/(piutang|invoice|utang|tagihan)/.test(text)) {
    return buildReceivablePayableAnalysis()
  }

  if (/(proyek|project|klien|client|crm)/.test(text)) {
    return buildProjectAnalysis()
  }

  return buildOverallAnalysis()
}

async function scrollToEnd() {
  await nextTick()
  chatEnd.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  })
}

function saveChat() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(messages.value.slice(-20)),
  )
}

function askQuestion(customQuestion = '') {
  const text = (customQuestion || question.value).trim()

  if (!text || isAnalyzing.value) return

  messages.value.push({
    id: Date.now(),
    role: 'user',
    text,
  })

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
  }, 350)
}

function resetChat() {
  messages.value = [defaultMessage()]
}

function toggleActivityPanel() {
  showActivityPanel.value = !showActivityPanel.value
}

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
  if (Array.isArray(saved) && saved.length > 0) {
    messages.value = saved
  }
} catch {
  messages.value = [defaultMessage()]
}

watch(messages, saveChat, { deep: true })
</script>

<template>
  <aside class="finstart-ai-panel">
    <div class="finstart-ai-header">
      <div class="finstart-ai-title">
        <span class="finstart-ai-icon">✦</span>

        <div>
          <p>AI FINSTART ASSISTANT</p>
          <small>Analisis ringkasan keuangan live</small>
        </div>
      </div>

      <div class="ai-header-actions">
        <button type="button" class="activity-toggle-button" @click="toggleActivityPanel">
          {{ showActivityPanel ? 'Sembunyikan' : 'Aktivitas' }}
        </button>

        <button type="button" class="reset-chat-button" @click="resetChat">
          Reset
        </button>
      </div>
    </div>

    <div class="financial-health-card">
      <div
        class="health-score-ring"
        :style="{ '--score': `${healthScore * 3.6}deg` }"
      >
        <div>
          <strong>{{ healthScore }}</strong>
          <span>/100</span>
        </div>
      </div>

      <div>
        <span>Financial Health</span>
        <h3>{{ healthLabel }}</h3>
        <p>Dinilai dari kas, laba, piutang, utang, dan jurnal posted.</p>
      </div>
    </div>

    <div v-if="showActivityPanel" class="activity-panel">
      <div v-for="item in activityItems" :key="item.label" class="activity-chip">
        <strong>{{ item.label }}</strong>
        <span>{{ item.detail }}</span>
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
        class="ai-message"
        :class="message.role"
      >
        <strong>{{ message.role === 'assistant' ? 'AI FINSTART' : 'Kamu' }}</strong>
        <p>{{ message.text }}</p>
      </article>

      <div ref="chatEnd"></div>
    </div>

    <form class="ai-input-row" @submit.prevent="askQuestion()">
      <input
        v-model="question"
        type="text"
        placeholder="Tanya kondisi keuangan..."
      />

      <button type="submit" :disabled="isAnalyzing">
        {{ isAnalyzing ? '...' : 'Kirim' }}
      </button>
    </form>

    <!-- footer note removed per user request to remove unused AI remnants -->
  </aside>
</template>

<style scoped>
.finstart-ai-panel {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 100%;
  border-radius: 18px;
  padding: 20px;
  background: #101a31;
  box-shadow: 0 10px 24px rgba(15, 25, 48, 0.18);
  color: white;
}

.finstart-ai-header,
.finstart-ai-title,
.financial-health-card,
.ai-input-row,
.ai-header-actions {
  display: flex;
  align-items: center;
}

.finstart-ai-header {
  justify-content: space-between;
  gap: 12px;
}

.finstart-ai-title {
  gap: 10px;
}

.finstart-ai-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
  background: rgba(104, 96, 255, 0.2);
  color: #8d86ff;
  font-size: 17px;
}

.finstart-ai-title p {
  margin: 0;
  color: white;
  font-size: 13px;
  font-weight: 800;
}

.finstart-ai-title small {
  display: block;
  margin-top: 3px;
  color: #97a8c4;
  font-size: 10px;
}

.ai-header-actions {
  gap: 8px;
}

.activity-toggle-button,
.reset-chat-button {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 7px;
  padding: 5px 8px;
  background: transparent;
  color: #bdc9db;
  cursor: pointer;
  font-size: 10px;
}

.activity-toggle-button {
  background: rgba(109, 102, 244, 0.16);
  color: #d9d7ff;
}

.financial-health-card {
  gap: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
}

.health-score-ring {
  display: grid;
  width: 68px;
  height: 68px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background:
    radial-gradient(circle, #16223c 61%, transparent 62%),
    conic-gradient(#756eff var(--score), rgba(255, 255, 255, 0.1) 0);
}

.health-score-ring div {
  display: grid;
  text-align: center;
}

.health-score-ring strong {
  color: white;
  font-size: 18px;
}

.health-score-ring span {
  color: #9db0ce;
  font-size: 9px;
}

.financial-health-card > div:last-child > span {
  color: #94a4c2;
  font-size: 10px;
}

.financial-health-card h3 {
  margin: 4px 0;
  font-size: 17px;
}

.financial-health-card p {
  margin: 0;
  color: #9caec9;
  font-size: 10px;
  line-height: 1.45;
}

.activity-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.activity-chip {
  flex: 1 1 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 8px 9px;
  background: rgba(255, 255, 255, 0.05);
}

.activity-chip strong {
  display: block;
  color: white;
  font-size: 10px;
}

.activity-chip span {
  color: #9db0ce;
  font-size: 9px;
}

.quick-question-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.quick-question {
  border: 1px solid rgba(132, 124, 255, 0.42);
  border-radius: 999px;
  padding: 6px 8px;
  background: rgba(112, 104, 255, 0.08);
  color: #cbc8ff;
  cursor: pointer;
  font-size: 10px;
  line-height: 1.2;
  text-align: left;
}

.ai-chat-window {
  display: grid;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-gutter: stable;
}

.ai-chat-window::-webkit-scrollbar {
  width: 6px;
}

.ai-chat-window::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
}

.ai-chat-window::-webkit-scrollbar-thumb {
  background: rgba(157, 176, 206, 0.5);
  border-radius: 999px;
}

.ai-message {
  border-radius: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.06);
}

.ai-message.user {
  background: rgba(115, 107, 255, 0.18);
}

.ai-message strong {
  display: block;
  margin-bottom: 5px;
  color: #b7c9e8;
  font-size: 10px;
}

.ai-message p {
  margin: 0;
  color: #e5edf9;
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-line;
}

.ai-input-row {
  gap: 8px;
}

.ai-input-row input {
  min-width: 0;
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  padding: 9px 10px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
  outline: none;
  font-size: 11px;
}

.ai-input-row input::placeholder {
  color: #8192af;
}

.ai-input-row button {
  border: 0;
  border-radius: 8px;
  padding: 9px 10px;
  background: #6d66f4;
  color: white;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
}

.ai-input-row button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.ai-footer-note {
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 11px;
  color: #8192af;
  font-size: 9px;
  line-height: 1.5;
}
</style>
