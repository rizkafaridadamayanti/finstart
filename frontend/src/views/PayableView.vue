<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const projects = computed(() => financeStore.projects)
const vendors = computed(() => financeStore.vendors)
const payableList = computed(() => financeStore.payables)

const keyword = ref('')
const selectedStatus = ref('Semua')
const showBillModal = ref(false)
const showPaymentModal = ref(false)
const today = new Date().toISOString().slice(0, 10)

const billForm = ref({ vendor: '', project: '', billNumber: '', billDate: today, dueDate: '', amount: 0, description: '' })
const paymentForm = ref({ billId: '', cashSource: 'Bank BCA', paymentRef: '', paymentDate: today, amount: 0, notes: '' })

function number(value) { return Number(value || 0) }
function getOutstanding(bill) { return Math.max(number(bill.amount) - number(bill.paidAmount), 0) }
function formatCurrency(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number(value)) }
function formatDate(date) { return date ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`)) : '-' }

function getAgingStatus(bill) {
  if (bill.status === 'Paid') return 'Paid'
  if (bill.dueDate < today) return 'Overdue'
  const diff = Math.ceil((new Date(`${bill.dueDate}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000)
  return diff <= 7 ? 'Upcoming' : 'Current'
}

function getAgingClass(status) { return { warning: status === 'Upcoming', danger: status === 'Overdue' } }

const filteredPayables = computed(() => {
  const search = keyword.value.toLowerCase()
  return payableList.value.filter((bill) => {
    const matchKeyword = String(bill.billNumber || '').toLowerCase().includes(search) || String(bill.vendor || '').toLowerCase().includes(search) || String(bill.project || '').toLowerCase().includes(search) || String(bill.status || '').toLowerCase().includes(search)
    const matchStatus = selectedStatus.value === 'Semua' || bill.status === selectedStatus.value
    return matchKeyword && matchStatus
  })
})

const postedPayables = computed(() => payableList.value.filter((bill) => bill.status !== 'Draft'))
const totalPayable = computed(() => postedPayables.value.reduce((total, bill) => total + getOutstanding(bill), 0))
const currentPayable = computed(() => postedPayables.value.filter((bill) => getAgingStatus(bill) === 'Current').reduce((total, bill) => total + getOutstanding(bill), 0))
const upcomingPayable = computed(() => postedPayables.value.filter((bill) => getAgingStatus(bill) === 'Upcoming').reduce((total, bill) => total + getOutstanding(bill), 0))
const overduePayable = computed(() => postedPayables.value.filter((bill) => getAgingStatus(bill) === 'Overdue').reduce((total, bill) => total + getOutstanding(bill), 0))
const selectedPaymentBill = computed(() => payableList.value.find((bill) => bill.id === Number(paymentForm.value.billId)))

function getNewBillNumber() { return `BILL/${new Date().getFullYear()}/${String(payableList.value.length + 1).padStart(3, '0')}` }
function getNewPaymentReference() { return `PAY/${new Date().getFullYear()}/${String(payableList.value.length + 1).padStart(3, '0')}` }

function openBillModal() {
  billForm.value = { vendor: '', project: '', billNumber: getNewBillNumber(), billDate: today, dueDate: '', amount: 0, description: '' }
  showBillModal.value = true
}
function closeBillModal() { showBillModal.value = false }
function closePaymentModal() { showPaymentModal.value = false }

function addBill() {
  if (!billForm.value.vendor || !billForm.value.project || !billForm.value.billNumber || !billForm.value.billDate || !billForm.value.dueDate || number(billForm.value.amount) <= 0) return alert('Lengkapi vendor, proyek, nomor tagihan, tanggal, dan nominal utang.')
  if (billForm.value.dueDate < billForm.value.billDate) return alert('Batas bayar tidak boleh lebih awal dari tanggal tagihan.')

  financeStore.addPayable({
    billNumber: billForm.value.billNumber,
    vendor: billForm.value.vendor,
    project: billForm.value.project,
    billDate: billForm.value.billDate,
    dueDate: billForm.value.dueDate,
    amount: number(billForm.value.amount),
    paidAmount: 0,
    description: billForm.value.description,
    status: 'Draft',
  })
  closeBillModal()
  alert('Tagihan disimpan sebagai Draft. Setujui tagihan untuk mencatat utang dan beban pada buku besar.')
}

function approveBill(bill) {
  const result = financeStore.approvePayable(bill.id)
  if (!result.ok) return alert(result.message)
  alert('Tagihan berhasil disetujui dan diposting ke buku besar.')
}

function openPaymentModal(bill = null) {
  const selected = bill || payableList.value.find((item) => item.status !== 'Draft' && item.status !== 'Paid' && getOutstanding(item) > 0)
  if (!selected) return alert('Tidak ada tagihan yang dapat dibayar. Setujui tagihan Draft terlebih dahulu.')

  paymentForm.value = { billId: selected.id, cashSource: 'Bank BCA', paymentRef: getNewPaymentReference(), paymentDate: today, amount: getOutstanding(selected), notes: '' }
  showPaymentModal.value = true
}

function savePayment() {
  const bill = selectedPaymentBill.value
  if (!bill) return alert('Pilih tagihan yang akan dibayar.')
  const amount = number(paymentForm.value.amount)
  if (amount <= 0 || amount > getOutstanding(bill)) return alert('Nominal pembayaran tidak valid.')
  if (paymentForm.value.paymentDate < bill.billDate) return alert('Tanggal pembayaran tidak boleh lebih awal dari tanggal tagihan.')

  const result = financeStore.payBill({
    billId: bill.id,
    amount,
    paymentDate: paymentForm.value.paymentDate,
    paymentRef: paymentForm.value.paymentRef,
    cashAccountCode: paymentForm.value.cashSource === 'Kas' ? '1101' : '1102',
  })

  if (!result.ok) return alert(result.message)
  closePaymentModal()
  alert('Pembayaran utang berhasil dicatat dan seluruh data keuangan diperbarui.')
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div><p class="eyebrow">ACCOUNTS PAYABLE</p><h1>Utang</h1><p>Kelola tagihan vendor, umur utang, persetujuan, serta pembayaran yang tersambung ke kas dan jurnal.</p></div>
      <div class="page-button-group"><button class="secondary-button" @click="openPaymentModal()">Catat Pembayaran</button><button class="primary-button" @click="openBillModal">+ Input Tagihan Baru</button></div>
    </div>

    <div class="payable-metrics">
      <article class="payable-stat"><p>Total Utang Usaha</p><h2>{{ formatCurrency(totalPayable) }}</h2><small>Total tagihan yang belum dibayarkan</small></article>
      <article class="payable-stat"><p>Utang Jatuh Tempo</p><h2>{{ formatCurrency(upcomingPayable) }}</h2><small>Tagihan jatuh tempo dalam tujuh hari</small></article>
      <article class="payable-stat"><p>Utang Terlambat</p><h2>{{ formatCurrency(overduePayable) }}</h2><small>Tagihan melewati batas bayar</small></article>
    </div>

    <section class="aging-grid">
      <article class="aging-card"><p>Current</p><h3>{{ formatCurrency(currentPayable) }}</h3><small>Belum mendekati jatuh tempo</small></article>
      <article class="aging-card"><p>Upcoming</p><h3>{{ formatCurrency(upcomingPayable) }}</h3><small>Jatuh tempo maksimal tujuh hari</small></article>
      <article class="aging-card"><p>Overdue</p><h3>{{ formatCurrency(overduePayable) }}</h3><small>Melewati batas pembayaran</small></article>
    </section>

    <div class="module-toolbar">
      <div class="filter-group"><input v-model="keyword" class="module-search" type="text" placeholder="Cari referensi, vendor, proyek, atau status..." /><select v-model="selectedStatus" class="filter-select"><option>Semua</option><option>Draft</option><option>Approved</option><option>Partially Paid</option><option>Paid</option></select></div>
      <span class="table-count">{{ filteredPayables.length }} tagihan</span>
    </div>

    <article class="panel">
      <div class="panel-header"><div><h3>Histori Transaksi Utang</h3><p>Setujui tagihan untuk mencatat beban dan utang. Pembayaran akan mengurangi utang serta kas.</p></div></div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Referensi</th><th>Vendor / Keterangan</th><th>Tgl. Tagihan</th><th>Nominal Utang</th><th>Dibayar</th><th>Sisa Utang</th><th>Aging</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          <tr v-for="bill in filteredPayables" :key="bill.id">
            <td><strong>{{ bill.billNumber }}</strong><small class="table-subtext">Jatuh tempo {{ formatDate(bill.dueDate) }}</small></td>
            <td><strong>{{ bill.vendor }}</strong><small class="table-subtext">{{ bill.description || '-' }}</small></td>
            <td>{{ formatDate(bill.billDate) }}</td><td>{{ formatCurrency(bill.amount) }}</td><td>{{ formatCurrency(bill.paidAmount) }}</td><td><strong>{{ formatCurrency(getOutstanding(bill)) }}</strong></td>
            <td><span class="status-badge" :class="getAgingClass(getAgingStatus(bill))">{{ getAgingStatus(bill) }}</span></td>
            <td><span class="status-badge" :class="{ warning: bill.status === 'Draft' || bill.status === 'Partially Paid' }">{{ bill.status }}</span></td>
            <td class="action-cell"><button v-if="bill.status === 'Draft'" class="table-action" @click="approveBill(bill)">Setujui</button><button v-else-if="bill.status !== 'Paid'" class="table-action" @click="openPaymentModal(bill)">Bayar</button><span v-else class="table-subtext">Lunas</span></td>
          </tr>
          <tr v-if="filteredPayables.length === 0"><td colspan="9" class="empty-table">Tagihan utang tidak ditemukan.</td></tr>
        </tbody>
      </table></div>
    </article>

    <div v-if="showBillModal" class="modal-backdrop" @click.self="closeBillModal">
      <form class="modal-card" @submit.prevent="addBill">
        <div class="modal-header"><div><p class="eyebrow">INPUT TAGIHAN</p><h3>Tagihan Utang Baru</h3></div><button type="button" class="modal-close" @click="closeBillModal">×</button></div>
        <div class="form-grid">
          <label>Vendor<select v-model="billForm.vendor" required><option value="">Pilih vendor</option><option v-for="vendor in vendors" :key="vendor.id" :value="vendor.name">{{ vendor.name }}</option></select></label>
          <label>Alokasi Proyek<select v-model="billForm.project" required><option value="">Pilih proyek</option><option v-for="project in projects" :key="project.id" :value="project.name">{{ project.name }}</option></select></label>
          <label>Nomor Invoice Vendor<input v-model="billForm.billNumber" type="text" required /></label>
          <label>Tanggal Tagihan<input v-model="billForm.billDate" type="date" required /></label>
          <label>Batas Pembayaran<input v-model="billForm.dueDate" type="date" required /></label>
          <label>Nominal Utang<input v-model.number="billForm.amount" type="number" min="0" required /></label>
          <label class="full-width">Keterangan Tagihan<input v-model="billForm.description" type="text" placeholder="Contoh: Tagihan layanan cloud hosting bulan Juli" /></label>
        </div>
        <div class="modal-actions"><button type="button" class="secondary-button" @click="closeBillModal">Batal</button><button type="submit" class="primary-button">Simpan Draft Tagihan</button></div>
      </form>
    </div>

    <div v-if="showPaymentModal" class="modal-backdrop" @click.self="closePaymentModal">
      <form class="modal-card" @submit.prevent="savePayment">
        <div class="modal-header"><div><p class="eyebrow">PEMBAYARAN UTANG</p><h3>Catat Pembayaran Vendor</h3></div><button type="button" class="modal-close" @click="closePaymentModal">×</button></div>
        <div class="form-grid">
          <label class="full-width">Vendor / Tagihan<select v-model.number="paymentForm.billId" required><option value="">Pilih tagihan</option><option v-for="bill in payableList.filter((item) => item.status !== 'Draft' && item.status !== 'Paid' && getOutstanding(item) > 0)" :key="bill.id" :value="bill.id">{{ bill.billNumber }} — {{ bill.vendor }}</option></select></label>
          <label>Sumber Kas<select v-model="paymentForm.cashSource"><option>Bank BCA</option><option>Kas</option></select></label>
          <label>Nomor Bukti Bayar<input v-model="paymentForm.paymentRef" type="text" required /></label>
          <label>Tanggal Bayar<input v-model="paymentForm.paymentDate" type="date" :max="today" required /></label>
          <label>Jumlah Dibayar<input v-model.number="paymentForm.amount" type="number" min="0" :max="selectedPaymentBill ? getOutstanding(selectedPaymentBill) : 0" required /></label>
          <label class="full-width">Catatan Tambahan<input v-model="paymentForm.notes" type="text" placeholder="Contoh: Pembayaran melalui transfer bank" /></label>
        </div>
        <div v-if="selectedPaymentBill" class="payment-summary"><p>Vendor: <strong>{{ selectedPaymentBill.vendor }}</strong></p><p>Nomor tagihan: <strong>{{ selectedPaymentBill.billNumber }}</strong></p><p>Sisa utang: <strong>{{ formatCurrency(getOutstanding(selectedPaymentBill)) }}</strong></p></div>
        <div class="modal-actions"><button type="button" class="secondary-button" @click="closePaymentModal">Batal</button><button type="submit" class="primary-button">Simpan Pembayaran</button></div>
      </form>
    </div>
  </section>
</template>
