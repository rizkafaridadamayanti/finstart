<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const taxList = computed(() => financeStore.taxObligations)

const keyword = ref('')
const selectedStatus = ref('Semua')
const activeTab = ref('unpaid')
const showPaymentModal = ref(false)

const today = new Date().toISOString().slice(0, 10)

const paymentForm = ref({
  taxId: '',
  paymentDate: today,
  cashSource: 'Bank BCA',
  ntpn: '',
  notes: '',
})

const filteredTaxes = computed(() => {
  const search = keyword.value.toLowerCase()

  return taxList.value.filter((tax) => {
    const matchKeyword =
      tax.type.toLowerCase().includes(search) ||
      tax.period.toLowerCase().includes(search) ||
      tax.description.toLowerCase().includes(search) ||
      tax.status.toLowerCase().includes(search)

    const matchStatus =
      selectedStatus.value === 'Semua' ||
      tax.status === selectedStatus.value

    return matchKeyword && matchStatus
  })
})

const displayedTaxes = computed(() => {
  if (activeTab.value === 'unpaid') {
    return filteredTaxes.value.filter((tax) => tax.status !== 'Dibayar')
  }

  return filteredTaxes.value.filter((tax) => tax.status === 'Dibayar')
})

const totalUnpaid = computed(() => {
  return taxList.value
    .filter((tax) => tax.status !== 'Dibayar')
    .reduce((total, tax) => total + Number(tax.amount), 0)
})

const ppnUnderpayment = computed(() => {
  return taxList.value
    .filter((tax) => tax.type === 'PPN' && tax.status !== 'Dibayar')
    .reduce((total, tax) => total + Number(tax.amount), 0)
})

const pph21Payable = computed(() => {
  return taxList.value
    .filter((tax) => tax.type === 'PPh 21' && tax.status !== 'Dibayar')
    .reduce((total, tax) => total + Number(tax.amount), 0)
})

const pph23Payable = computed(() => {
  return taxList.value
    .filter((tax) => tax.type === 'PPh 23' && tax.status !== 'Dibayar')
    .reduce((total, tax) => total + Number(tax.amount), 0)
})

const overdueTaxes = computed(() => {
  return taxList.value.filter((tax) => {
    return tax.status !== 'Dibayar' && tax.dueDate < today
  })
})

const complianceStatus = computed(() => {
  return overdueTaxes.value.length === 0 ? 'Patuh' : 'Perlu Tindakan'
})

const selectedPaymentTax = computed(() => {
  return taxList.value.find(
    (tax) => tax.id === Number(paymentForm.value.taxId),
  )
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getStatusClass(status) {
  return {
    warning: status === 'Belum Dibayar',
    danger: status === 'Terlambat',
  }
}

function getDueStatus(tax) {
  if (tax.status === 'Dibayar') {
    return 'Dibayar'
  }

  if (tax.dueDate < today) {
    return 'Terlambat'
  }

  return 'Menunggu Pembayaran'
}

function getDueClass(tax) {
  return {
    warning: tax.status !== 'Dibayar' && tax.dueDate >= today,
    danger: tax.status !== 'Dibayar' && tax.dueDate < today,
  }
}

function openPaymentModal(tax = null) {
  const selectedTax =
    tax ||
    taxList.value.find((item) => item.status !== 'Dibayar')

  if (!selectedTax) {
    alert('Tidak ada kewajiban pajak yang perlu dibayar.')
    return
  }

  paymentForm.value = {
    taxId: selectedTax.id,
    paymentDate: today,
    cashSource: 'Bank BCA',
    ntpn: '',
    notes: '',
  }

  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
}

function savePayment() {
  const tax = selectedPaymentTax.value

  if (!tax) {
    alert('Pilih jenis pajak yang akan dibayar.')
    return
  }

  if (!paymentForm.value.ntpn.trim()) {
    alert('Nomor NTPN wajib diisi setelah pembayaran pajak dilakukan.')
    return
  }

  if (paymentForm.value.paymentDate < tax.dueDate.slice(0, 7) + '-01') {
    alert('Tanggal setor pajak tidak valid.')
    return
  }

  const result = financeStore.payTax({
    taxId: tax.id,
    paymentDate: paymentForm.value.paymentDate,
    ntpn: paymentForm.value.ntpn.trim(),
    cashAccountCode: paymentForm.value.cashSource === 'Kas' ? '1101' : '1102',
  })

  if (!result.ok) {
    alert(result.message)
    return
  }

  closePaymentModal()
  alert('Setoran pajak berhasil dicatat. Kas, jurnal, laporan, Dashboard, dan AI sudah diperbarui.')
}

function exportEFaktur() {
  alert('Prototype: data e-Faktur berhasil disiapkan untuk diekspor.')
}

function generateSptDraft() {
  alert('Prototype: draft SPT Masa berhasil dibuat berdasarkan data pajak saat ini.')
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">TAX COMPLIANCE</p>
        <h1>Perpajakan</h1>
        <p>
          Kelola PPN, PPh 21, PPh 23, status kepatuhan, dan pencatatan setoran pajak.
        </p>
      </div>

      <div class="page-button-group">
        <button class="secondary-button" @click="exportEFaktur">
          Export e-Faktur
        </button>

        <button class="secondary-button" @click="generateSptDraft">
          Draft SPT Bulanan
        </button>

        <button class="primary-button" @click="openPaymentModal()">
          Konfirmasi Setoran Pajak
        </button>
      </div>
    </div>

    <div class="tax-metrics">
      <article class="tax-stat">
        <p>PPN Kurang Bayar</p>
        <h2>{{ formatCurrency(ppnUnderpayment) }}</h2>
        <small>PPN yang belum disetor</small>
      </article>

      <article class="tax-stat">
        <p>PPh 21</p>
        <h2>{{ formatCurrency(pph21Payable) }}</h2>
        <small>Pajak penghasilan pegawai</small>
      </article>

      <article class="tax-stat">
        <p>PPh 23</p>
        <h2>{{ formatCurrency(pph23Payable) }}</h2>
        <small>Pajak atas jasa vendor</small>
      </article>

      <article class="tax-stat">
        <p>Status Kepatuhan</p>
        <h2>{{ complianceStatus }}</h2>
        <small>
          {{ overdueTaxes.length }} kewajiban melewati jatuh tempo
        </small>
      </article>
    </div>

    <article class="tax-total-card">
      <div>
        <p>Total Pajak Belum Dibayar</p>
        <h3>{{ formatCurrency(totalUnpaid) }}</h3>
      </div>

      <p>
        Pastikan seluruh kewajiban pajak dibayar dan NTPN dicatat sebelum
        pelaporan SPT Masa.
      </p>
    </article>

    <div class="module-toolbar">
      <div class="filter-group">
        <div class="tab-list">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'unpaid' }"
            @click="activeTab = 'unpaid'"
          >
            Belum Dibayar
          </button>

          <button
            class="tab-button"
            :class="{ active: activeTab === 'paid' }"
            @click="activeTab = 'paid'"
          >
            Riwayat Setoran
          </button>
        </div>

        <select v-model="selectedStatus" class="filter-select">
          <option>Semua</option>
          <option>Belum Dibayar</option>
          <option>Dibayar</option>
        </select>
      </div>

      <input
        v-model="keyword"
        class="module-search"
        type="text"
        placeholder="Cari jenis pajak, periode, atau status..."
      />
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>
            {{ activeTab === 'unpaid' ? 'Kewajiban Pajak' : 'Riwayat Setoran Pajak' }}
          </h3>
          <p>
            Monitor nilai pajak, periode, jatuh tempo, dan bukti setoran pajak.
          </p>
        </div>

        <span class="table-count">
          {{ displayedTaxes.length }} data
        </span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Jenis Pajak</th>
              <th>Periode</th>
              <th>Keterangan</th>
              <th>Nominal</th>
              <th>Jatuh Tempo</th>
              <th>Status</th>
              <th>NTPN</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="tax in displayedTaxes" :key="tax.id">
              <td>
                <span class="tax-type">{{ tax.type }}</span>
              </td>

              <td>
                <strong>{{ tax.period }}</strong>
                <small v-if="tax.paymentDate" class="table-subtext">
                  Dibayar {{ formatDate(tax.paymentDate) }}
                </small>
              </td>

              <td>{{ tax.description }}</td>

              <td>
                <strong>{{ formatCurrency(tax.amount) }}</strong>
              </td>

              <td>{{ formatDate(tax.dueDate) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="getDueClass(tax)"
                >
                  {{ getDueStatus(tax) }}
                </span>
              </td>

              <td>
                <span v-if="tax.ntpn">{{ tax.ntpn }}</span>
                <span v-else class="table-subtext">Belum tersedia</span>
              </td>

              <td>
                <button
                  v-if="tax.status !== 'Dibayar'"
                  class="table-action"
                  @click="openPaymentModal(tax)"
                >
                  Bayar Sekarang
                </button>

                <span v-else class="table-subtext">Selesai</span>
              </td>
            </tr>

            <tr v-if="displayedTaxes.length === 0">
              <td colspan="8" class="empty-table">
                Data pajak tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div
      v-if="showPaymentModal"
      class="modal-backdrop"
      @click.self="closePaymentModal"
    >
      <form class="modal-card" @submit.prevent="savePayment">
        <div class="modal-header">
          <div>
            <p class="eyebrow">KONFIRMASI SETORAN</p>
            <h3>Catat Pembayaran Pajak</h3>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="closePaymentModal"
          >
            ×
          </button>
        </div>

        <div class="form-grid">
          <label class="full-width">
            Kewajiban Pajak
            <select v-model.number="paymentForm.taxId" required>
              <option value="">Pilih pajak</option>

              <option
                v-for="tax in taxList.filter((item) => item.status !== 'Dibayar')"
                :key="tax.id"
                :value="tax.id"
              >
                {{ tax.type }} — {{ tax.period }}
              </option>
            </select>
          </label>

          <label>
            Tanggal Setor
            <input
              v-model="paymentForm.paymentDate"
              type="date"
              :max="today"
              required
            />
          </label>

          <label>
            Sumber Kas
            <select v-model="paymentForm.cashSource">
              <option>Bank BCA</option>
              <option>Kas</option>
            </select>
          </label>

          <label>
            Nomor NTPN
            <input
              v-model="paymentForm.ntpn"
              type="text"
              placeholder="Contoh: A1B2C3D4E5F6"
              required
            />
          </label>

          <label class="full-width">
            Catatan Setoran
            <input
              v-model="paymentForm.notes"
              type="text"
              placeholder="Contoh: Pembayaran melalui e-Billing"
            />
          </label>
        </div>

        <div v-if="selectedPaymentTax" class="payment-summary">
          <p>
            Jenis pajak:
            <strong>{{ selectedPaymentTax.type }}</strong>
          </p>
          <p>
            Periode:
            <strong>{{ selectedPaymentTax.period }}</strong>
          </p>
          <p>
            Nominal setor:
            <strong>{{ formatCurrency(selectedPaymentTax.amount) }}</strong>
          </p>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            @click="closePaymentModal"
          >
            Batal
          </button>

          <button type="submit" class="primary-button">
            Simpan Setoran
          </button>
        </div>
      </form>
    </div>
  </section>
</template>