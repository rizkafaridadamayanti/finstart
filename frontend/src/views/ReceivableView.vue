<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const clients = computed(() => financeStore.clients)
const projects = computed(() => financeStore.projects)
const invoiceList = computed(() => financeStore.receivables)

const keyword = ref('')
const selectedStatus = ref('Semua')
const showInvoiceModal = ref(false)
const showPaymentModal = ref(false)
const today = new Date().toISOString().slice(0, 10)

const invoiceForm = ref({ client: '', project: '', invoiceDate: today, dueDate: '', amount: 0, description: '' })
const paymentForm = ref({ invoiceId: '', paymentDate: today, cashSource: 'Bank BCA', amount: 0 })

const availableProjects = computed(() => {
  if (!invoiceForm.value.client) return projects.value
  return projects.value.filter((project) => project.client === invoiceForm.value.client)
})

function number(value) { return Number(value || 0) }
function getOutstanding(invoice) { return Math.max(number(invoice.total) - number(invoice.paidAmount), 0) }
function formatCurrency(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number(value)) }
function formatDate(date) { return date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`)) : '-' }

function getDisplayStatus(invoice) {
  if (invoice.status === 'Paid' || invoice.status === 'Draft') return invoice.status
  if (invoice.dueDate && invoice.dueDate < today && getOutstanding(invoice) > 0) return 'Overdue'
  return invoice.status
}

function getStatusClass(status) {
  return { warning: ['Draft', 'Sent', 'Partially Paid'].includes(status), danger: status === 'Overdue' }
}

const filteredInvoices = computed(() => {
  const search = keyword.value.toLowerCase()
  return invoiceList.value.filter((invoice) => {
    const status = getDisplayStatus(invoice)
    const matchKeyword = String(invoice.invoiceNumber || '').toLowerCase().includes(search) || String(invoice.client || '').toLowerCase().includes(search) || String(invoice.project || '').toLowerCase().includes(search) || status.toLowerCase().includes(search)
    const matchStatus = selectedStatus.value === 'Semua' || status === selectedStatus.value
    return matchKeyword && matchStatus
  })
})

const totalReceivable = computed(() => invoiceList.value.filter((invoice) => invoice.status !== 'Draft').reduce((total, invoice) => total + getOutstanding(invoice), 0))
const totalOverdue = computed(() => invoiceList.value.filter((invoice) => invoice.status !== 'Draft' && getDisplayStatus(invoice) === 'Overdue').reduce((total, invoice) => total + getOutstanding(invoice), 0))
const totalPaid = computed(() => invoiceList.value.reduce((total, invoice) => total + number(invoice.paidAmount), 0))

const selectedPaymentInvoice = computed(() => invoiceList.value.find((invoice) => invoice.id === Number(paymentForm.value.invoiceId)))

function getNewInvoiceNumber() { return `INV/${new Date().getFullYear()}/${String(invoiceList.value.length + 1).padStart(3, '0')}` }

function openInvoiceModal() {
  invoiceForm.value = { client: '', project: '', invoiceDate: today, dueDate: '', amount: 0, description: '' }
  showInvoiceModal.value = true
}
function closeInvoiceModal() { showInvoiceModal.value = false }
function closePaymentModal() { showPaymentModal.value = false }

function syncProjectClient() {
  const project = projects.value.find((item) => item.name === invoiceForm.value.project)
  if (project) invoiceForm.value.client = project.client
}

function addInvoice() {
  if (!invoiceForm.value.client || !invoiceForm.value.project || !invoiceForm.value.invoiceDate || !invoiceForm.value.dueDate || number(invoiceForm.value.amount) <= 0) {
    return alert('Lengkapi klien, proyek, tanggal, dan nominal invoice.')
  }
  if (invoiceForm.value.dueDate < invoiceForm.value.invoiceDate) return alert('Batas bayar tidak boleh lebih awal dari tanggal invoice.')

  financeStore.addInvoice({
    invoiceNumber: getNewInvoiceNumber(),
    client: invoiceForm.value.client,
    project: invoiceForm.value.project,
    invoiceDate: invoiceForm.value.invoiceDate,
    dueDate: invoiceForm.value.dueDate,
    total: number(invoiceForm.value.amount),
    paidAmount: 0,
    status: 'Draft',
    description: invoiceForm.value.description,
  })

  closeInvoiceModal()
  alert('Invoice disimpan sebagai Draft. Klik Terbitkan untuk memperbarui piutang, pendapatan, buku besar, laporan, dan AI.')
}

function issueInvoice(invoice) {
  const result = financeStore.issueInvoice(invoice.id)
  if (!result.ok) return alert(result.message)
  alert('Invoice berhasil diterbitkan dan diposting ke buku besar.')
}

function openPaymentModal(invoice = null) {
  const target = invoice || invoiceList.value.find((item) => ['Sent', 'Partially Paid', 'Overdue'].includes(getDisplayStatus(item)) && getOutstanding(item) > 0)
  if (!target) return alert('Tidak ada invoice yang dapat dilunasi. Terbitkan invoice Draft terlebih dahulu.')

  paymentForm.value = { invoiceId: target.id, paymentDate: today, cashSource: 'Bank BCA', amount: getOutstanding(target) }
  showPaymentModal.value = true
}

function savePayment() {
  const invoice = selectedPaymentInvoice.value
  if (!invoice) return alert('Pilih invoice yang akan dilunasi.')
  const amount = number(paymentForm.value.amount)
  if (amount <= 0 || amount > getOutstanding(invoice)) return alert('Nominal pembayaran tidak valid.')

  const result = financeStore.receiveInvoicePayment({
    invoiceId: invoice.id,
    amount,
    paymentDate: paymentForm.value.paymentDate,
    cashAccountCode: paymentForm.value.cashSource === 'Kas' ? '1101' : '1102',
  })

  if (!result.ok) return alert(result.message)
  closePaymentModal()
  alert('Pelunasan piutang berhasil dicatat dan seluruh data keuangan diperbarui.')
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div><p class="eyebrow">ACCOUNTS RECEIVABLE</p><h1>Piutang</h1><p>Kelola invoice, tagihan klien, sisa piutang, serta pelunasan yang langsung tersambung ke kas dan jurnal.</p></div>
      <div class="page-button-group"><button class="secondary-button" @click="openPaymentModal()">Catat Pelunasan Piutang</button><button class="primary-button" @click="openInvoiceModal">+ Buat Invoice Baru</button></div>
    </div>

    <div class="receivable-metrics">
      <article class="receivable-stat"><p>Total Piutang Berjalan</p><h2>{{ formatCurrency(totalReceivable) }}</h2><small>Nilai invoice yang belum lunas</small></article>
      <article class="receivable-stat"><p>Piutang Terlambat</p><h2>{{ formatCurrency(totalOverdue) }}</h2><small>Invoice melewati jatuh tempo</small></article>
      <article class="receivable-stat"><p>Total Pelunasan</p><h2>{{ formatCurrency(totalPaid) }}</h2><small>Pembayaran yang sudah diterima</small></article>
    </div>

    <div class="module-toolbar">
      <div class="filter-group"><input v-model="keyword" class="module-search" type="text" placeholder="Cari invoice, klien, proyek, atau status..." /><select v-model="selectedStatus" class="filter-select"><option>Semua</option><option>Draft</option><option>Sent</option><option>Partially Paid</option><option>Paid</option><option>Overdue</option></select></div>
      <span class="table-count">{{ filteredInvoices.length }} invoice</span>
    </div>

    <article class="panel">
      <div class="panel-header"><div><h3>Daftar Piutang</h3><p>Terbitkan invoice untuk mencatat piutang dan pendapatan. Pelunasan akan menambah kas serta mengurangi piutang.</p></div></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>No. Invoice</th><th>Klien & Proyek</th><th>Nominal</th><th>Dibayar</th><th>Sisa Piutang</th><th>Jatuh Tempo</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          <tr v-for="invoice in filteredInvoices" :key="invoice.id">
            <td><strong>{{ invoice.invoiceNumber }}</strong><small class="table-subtext">{{ formatDate(invoice.invoiceDate) }}</small></td>
            <td><strong>{{ invoice.client }}</strong><small class="table-subtext">{{ invoice.project }}</small></td>
            <td>{{ formatCurrency(invoice.total) }}</td><td>{{ formatCurrency(invoice.paidAmount) }}</td><td><strong>{{ formatCurrency(getOutstanding(invoice)) }}</strong></td><td>{{ formatDate(invoice.dueDate) }}</td>
            <td><span class="status-badge" :class="getStatusClass(getDisplayStatus(invoice))">{{ getDisplayStatus(invoice) }}</span></td>
            <td class="action-cell">
              <button v-if="invoice.status === 'Draft'" class="table-action" @click="issueInvoice(invoice)">Terbitkan</button>
              <button v-else-if="invoice.status !== 'Paid'" class="table-action" @click="openPaymentModal(invoice)">Lunasi</button>
              <span v-else class="table-subtext">Lunas</span>
            </td>
          </tr>
          <tr v-if="filteredInvoices.length === 0"><td colspan="8" class="empty-table">Invoice tidak ditemukan.</td></tr>
        </tbody>
      </table></div>
    </article>

    <div v-if="showInvoiceModal" class="modal-backdrop" @click.self="closeInvoiceModal">
      <form class="modal-card" @submit.prevent="addInvoice">
        <div class="modal-header"><div><p class="eyebrow">PIUTANG</p><h3>Buat Invoice Baru</h3></div><button type="button" class="modal-close" @click="closeInvoiceModal">×</button></div>
        <div class="form-grid">
          <label>Klien<select v-model="invoiceForm.client" required><option value="">Pilih klien</option><option v-for="client in clients" :key="client.id" :value="client.company">{{ client.company }}</option></select></label>
          <label>Proyek<select v-model="invoiceForm.project" required @change="syncProjectClient"><option value="">Pilih proyek</option><option v-for="project in availableProjects" :key="project.id" :value="project.name">{{ project.name }}</option></select></label>
          <label>Tanggal Invoice<input v-model="invoiceForm.invoiceDate" type="date" required /></label>
          <label>Jatuh Tempo<input v-model="invoiceForm.dueDate" type="date" required /></label>
          <label>Nominal Invoice<input v-model.number="invoiceForm.amount" type="number" min="0" required /></label>
          <label class="full-width">Keterangan<input v-model="invoiceForm.description" type="text" placeholder="Contoh: Termin pertama proyek" /></label>
        </div>
        <div class="modal-actions"><button type="button" class="secondary-button" @click="closeInvoiceModal">Batal</button><button type="submit" class="primary-button">Simpan Draft Invoice</button></div>
      </form>
    </div>

    <div v-if="showPaymentModal" class="modal-backdrop" @click.self="closePaymentModal">
      <form class="modal-card" @submit.prevent="savePayment">
        <div class="modal-header"><div><p class="eyebrow">PELUNASAN PIUTANG</p><h3>Catat Pembayaran Klien</h3></div><button type="button" class="modal-close" @click="closePaymentModal">×</button></div>
        <div class="form-grid">
          <label class="full-width">Invoice<select v-model.number="paymentForm.invoiceId" required><option value="">Pilih invoice</option><option v-for="invoice in invoiceList.filter((item) => item.status !== 'Draft' && item.status !== 'Paid' && getOutstanding(item) > 0)" :key="invoice.id" :value="invoice.id">{{ invoice.invoiceNumber }} — {{ invoice.client }}</option></select></label>
          <label>Sumber Kas<select v-model="paymentForm.cashSource"><option>Bank BCA</option><option>Kas</option></select></label>
          <label>Tanggal Bayar<input v-model="paymentForm.paymentDate" type="date" :max="today" required /></label>
          <label class="full-width">Nominal Dibayar<input v-model.number="paymentForm.amount" type="number" min="0" :max="selectedPaymentInvoice ? getOutstanding(selectedPaymentInvoice) : 0" required /></label>
        </div>
        <div v-if="selectedPaymentInvoice" class="payment-summary"><p>Klien: <strong>{{ selectedPaymentInvoice.client }}</strong></p><p>Sisa piutang: <strong>{{ formatCurrency(getOutstanding(selectedPaymentInvoice)) }}</strong></p></div>
        <div class="modal-actions"><button type="button" class="secondary-button" @click="closePaymentModal">Batal</button><button type="submit" class="primary-button">Simpan Pelunasan</button></div>
      </form>
    </div>
  </section>
</template>
