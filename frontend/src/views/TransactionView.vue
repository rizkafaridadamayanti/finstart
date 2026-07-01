<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const transactionList = computed(() => financeStore.transactions)
const accounts = computed(() => financeStore.accounts.filter((account) => account.status === 'Aktif'))

const keyword = ref('')
const showModal = ref(false)
const selectedTemplate = ref('Jurnal Umum')
const today = new Date().toISOString().slice(0, 10)

const form = ref({
  date: today,
  voucher: '',
  memo: '',
  debitLines: [{ accountId: '', amount: 0 }],
  creditLines: [{ accountId: '', amount: 0 }],
})

const filteredTransactions = computed(() => {
  const search = keyword.value.toLowerCase()
  return transactionList.value.filter((transaction) => {
    return String(transaction.ref || '').toLowerCase().includes(search) ||
      String(transaction.memo || '').toLowerCase().includes(search) ||
      String(transaction.status || '').toLowerCase().includes(search)
  })
})

const debitTotal = computed(() => form.value.debitLines.reduce((total, line) => total + Number(line.amount || 0), 0))
const creditTotal = computed(() => form.value.creditLines.reduce((total, line) => total + Number(line.amount || 0), 0))
const isBalanced = computed(() => debitTotal.value > 0 && debitTotal.value === creditTotal.value)

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0))
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

function getNewVoucher() {
  return `JRN/${new Date().getFullYear()}/${String(transactionList.value.length + 1).padStart(3, '0')}`
}

function openModal() {
  selectedTemplate.value = 'Jurnal Umum'
  form.value = {
    date: today,
    voucher: getNewVoucher(),
    memo: '',
    debitLines: [{ accountId: '', amount: 0 }],
    creditLines: [{ accountId: '', amount: 0 }],
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function applyTemplate() {
  const bankAccount = accounts.value.find((account) => account.code === '1102')
  const expenseAccount = accounts.value.find((account) => account.code === '5101')
  const revenueAccount = accounts.value.find((account) => account.code === '4101')

  if (selectedTemplate.value === 'Pendapatan') {
    form.value.memo = 'Penerimaan pendapatan jasa'
    form.value.debitLines = [{ accountId: bankAccount?.id || '', amount: 0 }]
    form.value.creditLines = [{ accountId: revenueAccount?.id || '', amount: 0 }]
  } else if (selectedTemplate.value === 'Bayar Gaji') {
    form.value.memo = 'Pembayaran gaji pegawai'
    form.value.debitLines = [{ accountId: expenseAccount?.id || '', amount: 0 }]
    form.value.creditLines = [{ accountId: bankAccount?.id || '', amount: 0 }]
  } else if (selectedTemplate.value === 'Langganan') {
    form.value.memo = 'Pembayaran langganan digital'
    form.value.debitLines = [{ accountId: expenseAccount?.id || '', amount: 0 }]
    form.value.creditLines = [{ accountId: bankAccount?.id || '', amount: 0 }]
  } else {
    form.value.memo = ''
    form.value.debitLines = [{ accountId: '', amount: 0 }]
    form.value.creditLines = [{ accountId: '', amount: 0 }]
  }
}

function addDebitLine() { form.value.debitLines.push({ accountId: '', amount: 0 }) }
function addCreditLine() { form.value.creditLines.push({ accountId: '', amount: 0 }) }
function removeDebitLine(index) { if (form.value.debitLines.length > 1) form.value.debitLines.splice(index, 1) }
function removeCreditLine(index) { if (form.value.creditLines.length > 1) form.value.creditLines.splice(index, 1) }

function saveTransaction() {
  const hasEmptyDebit = form.value.debitLines.some((line) => !line.accountId || Number(line.amount) <= 0)
  const hasEmptyCredit = form.value.creditLines.some((line) => !line.accountId || Number(line.amount) <= 0)

  if (!form.value.memo.trim()) return alert('Keterangan memo wajib diisi.')
  if (hasEmptyDebit || hasEmptyCredit) return alert('Pilih akun dan isi nominal pada setiap baris debit serta kredit.')
  if (!isBalanced.value) return alert('Total debit harus sama dengan total kredit.')

  const lines = [
    ...form.value.debitLines.map((line) => ({ accountId: Number(line.accountId), side: 'Debit', amount: Number(line.amount) })),
    ...form.value.creditLines.map((line) => ({ accountId: Number(line.accountId), side: 'Credit', amount: Number(line.amount) })),
  ]

  financeStore.addTransaction({
    date: form.value.date,
    ref: form.value.voucher,
    memo: form.value.memo,
    amount: debitTotal.value,
    status: 'Draft',
    lines,
  })

  closeModal()
  alert('Jurnal disimpan sebagai Draft. Klik Posting agar saldo akun, Dashboard, laporan, dan AI diperbarui.')
}

function postTransaction(transaction) {
  const result = financeStore.postTransaction(transaction.id)
  if (!result.ok) return alert(result.message)
  alert('Jurnal berhasil diposting ke buku besar.')
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">PENCATATAN KEUANGAN</p>
        <h1>Transaksi</h1>
        <p>Catat jurnal debit-kredit, simpan Draft, lalu posting untuk memperbarui buku besar dan laporan.</p>
      </div>
      <button class="primary-button" @click="openModal">+ Entri Jurnal Baru</button>
    </div>

    <div class="module-toolbar">
      <input v-model="keyword" class="module-search" type="text" placeholder="Cari voucher, memo, atau status..." />
      <span class="table-count">{{ filteredTransactions.length }} transaksi</span>
    </div>

    <article class="panel">
      <div class="panel-header"><div><h3>Riwayat Transaksi</h3><p>Hanya jurnal Approved yang akan memperbarui saldo pada Buku Besar, Dashboard, laporan, dan AI.</p></div></div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Tanggal</th><th>Ref. Voucher</th><th>Keterangan Memo</th><th>Nominal</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            <tr v-for="transaction in filteredTransactions" :key="transaction.id">
              <td>{{ formatDate(transaction.date) }}</td>
              <td><strong>{{ transaction.ref }}</strong></td>
              <td>{{ transaction.memo }}</td>
              <td>{{ formatCurrency(transaction.amount) }}</td>
              <td><span class="status-badge" :class="{ warning: transaction.status === 'Draft' }">{{ transaction.status }}</span></td>
              <td>
                <button v-if="transaction.status === 'Draft'" class="table-action" @click="postTransaction(transaction)">Posting</button>
                <span v-else class="table-subtext">Diposting</span>
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0"><td colspan="6" class="empty-table">Transaksi tidak ditemukan.</td></tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <form class="modal-card transaction-modal" @submit.prevent="saveTransaction">
        <div class="modal-header"><div><p class="eyebrow">ENTRI JURNAL</p><h3>Jurnal Transaksi Baru</h3></div><button type="button" class="modal-close" @click="closeModal">×</button></div>
        <div class="form-grid">
          <label class="full-width">Template Jurnal Cepat<select v-model="selectedTemplate" @change="applyTemplate"><option>Jurnal Umum</option><option>Pendapatan</option><option>Bayar Gaji</option><option>Langganan</option></select></label>
          <label>Tanggal Transaksi<input v-model="form.date" type="date" :max="today" required /></label>
          <label>Nomor Voucher<input v-model="form.voucher" type="text" readonly /></label>
          <label class="full-width">Keterangan Memo<input v-model="form.memo" type="text" placeholder="Contoh: Penerimaan pembayaran dari klien" required /></label>
        </div>

        <section class="journal-section">
          <div class="journal-heading"><div><h4>Entri Debit</h4><p>Pilih akun yang menerima nilai debit.</p></div><strong>{{ formatCurrency(debitTotal) }}</strong></div>
          <div v-for="(line, index) in form.debitLines" :key="`debit-${index}`" class="journal-line">
            <select v-model="line.accountId"><option value="">Pilih akun debit</option><option v-for="account in accounts" :key="account.id" :value="account.id">{{ account.code }} - {{ account.name }}</option></select>
            <input v-model.number="line.amount" type="number" min="0" placeholder="Nominal" />
            <button type="button" class="remove-line" @click="removeDebitLine(index)">×</button>
          </div>
          <button type="button" class="add-line-button" @click="addDebitLine">+ Tambah Baris Debit</button>
        </section>

        <section class="journal-section">
          <div class="journal-heading"><div><h4>Entri Kredit</h4><p>Pilih akun yang menerima nilai kredit.</p></div><strong>{{ formatCurrency(creditTotal) }}</strong></div>
          <div v-for="(line, index) in form.creditLines" :key="`credit-${index}`" class="journal-line">
            <select v-model="line.accountId"><option value="">Pilih akun kredit</option><option v-for="account in accounts" :key="account.id" :value="account.id">{{ account.code }} - {{ account.name }}</option></select>
            <input v-model.number="line.amount" type="number" min="0" placeholder="Nominal" />
            <button type="button" class="remove-line" @click="removeCreditLine(index)">×</button>
          </div>
          <button type="button" class="add-line-button" @click="addCreditLine">+ Tambah Baris Kredit</button>
        </section>

        <div class="journal-total" :class="{ balanced: isBalanced, unbalanced: !isBalanced }"><div><span>Total Debit</span><strong>{{ formatCurrency(debitTotal) }}</strong></div><div><span>Total Kredit</span><strong>{{ formatCurrency(creditTotal) }}</strong></div><p v-if="isBalanced">✓ Debit dan kredit sudah seimbang.</p><p v-else>Debit dan kredit harus memiliki nominal yang sama.</p></div>
        <div class="modal-actions"><button type="button" class="secondary-button" @click="closeModal">Batal</button><button type="submit" class="primary-button">Simpan sebagai Draft</button></div>
      </form>
    </div>
  </section>
</template>
