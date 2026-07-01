<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const subscriptionList = computed(() => financeStore.subscriptions)

const keyword = ref('')
const selectedCategory = ref('Semua')
const showModal = ref(false)

const form = ref({
  service: '',
  provider: '',
  category: 'Software',
  currency: 'IDR',
  cycle: 'Bulanan',
  fee: 0,
  nextBillingDate: '',
  status: 'Aktif',
  paymentStatus: 'Patuh',
})

const filteredSubscriptions = computed(() => {
  const search = keyword.value.toLowerCase()

  return subscriptionList.value.filter((subscription) => {
    const matchKeyword =
      subscription.service.toLowerCase().includes(search) ||
      subscription.provider.toLowerCase().includes(search) ||
      subscription.category.toLowerCase().includes(search)

    const matchCategory =
      selectedCategory.value === 'Semua' ||
      subscription.category === selectedCategory.value

    return matchKeyword && matchCategory
  })
})

const monthlyBurnRate = computed(() => {
  return subscriptionList.value
    .filter(
      (subscription) =>
        subscription.status === 'Aktif' &&
        subscription.currency === 'IDR',
    )
    .reduce((total, subscription) => {
      const monthlyCost =
        subscription.cycle === 'Tahunan'
          ? Number(subscription.fee) / 12
          : Number(subscription.fee)

      return total + monthlyCost
    }, 0)
})

const activeServices = computed(() => {
  return subscriptionList.value.filter(
    (subscription) => subscription.status === 'Aktif',
  ).length
})

const overdueServices = computed(() => {
  return subscriptionList.value.filter(
    (subscription) => subscription.paymentStatus === 'Terlambat',
  ).length
})

const complianceText = computed(() => {
  if (overdueServices.value === 0) {
    return 'Semua pembayaran patuh'
  }

  return `${overdueServices.value} layanan terlambat`
})

function formatCurrency(value, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getPaymentClass(status) {
  return {
    warning: status === 'Jatuh Tempo',
    danger: status === 'Terlambat',
  }
}

function openModal() {
  form.value = {
    service: '',
    provider: '',
    category: 'Software',
    currency: 'IDR',
    cycle: 'Bulanan',
    fee: 0,
    nextBillingDate: '',
    status: 'Aktif',
    paymentStatus: 'Patuh',
  }

  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function addSubscription() {
  if (
    !form.value.service.trim() ||
    !form.value.provider.trim() ||
    !form.value.nextBillingDate ||
    Number(form.value.fee) <= 0
  ) {
    alert('Lengkapi nama layanan, provider, biaya, dan tanggal tagihan.')
    return
  }

  financeStore.addSubscription({
    service: form.value.service,
    provider: form.value.provider,
    category: form.value.category,
    currency: form.value.currency,
    cycle: form.value.cycle,
    fee: Number(form.value.fee),
    nextBillingDate: form.value.nextBillingDate,
    status: form.value.status,
    paymentStatus: form.value.paymentStatus,
  })

  closeModal()
}

function renewSubscription(subscription) {
  const result = financeStore.renewSubscription(subscription.id)

  if (!result.ok) {
    alert('Langganan tidak ditemukan.')
    return
  }

  alert(`${subscription.service} berhasil diperpanjang. Beban, kas, jurnal, Dashboard, laporan, dan AI sudah diperbarui.`)
}

</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">DIGITAL SUBSCRIPTION</p>
        <h1>Langganan</h1>
        <p>
          Kelola layanan digital, biaya berulang, dan tanggal tagihan berikutnya.
        </p>
      </div>

      <button class="primary-button" @click="openModal">
        + Tambah Langganan
      </button>
    </div>

    <div class="subscription-metrics">
      <article class="subscription-stat">
        <p>Estimasi Burn Rate Digital</p>
        <h2>{{ formatCurrency(monthlyBurnRate) }}</h2>
        <small>Perkiraan biaya layanan per bulan</small>
      </article>

      <article class="subscription-stat">
        <p>Total Layanan Terdaftar</p>
        <h2>{{ activeServices }} Layanan</h2>
        <small>Layanan dengan status aktif</small>
      </article>

      <article class="subscription-stat">
        <p>Status Kepatuhan Bayar</p>
        <h2>{{ overdueServices === 0 ? 'Patuh' : 'Perlu Perhatian' }}</h2>
        <small>{{ complianceText }}</small>
      </article>
    </div>

    <div class="module-toolbar">
      <div class="filter-group">
        <input
          v-model="keyword"
          class="module-search"
          type="text"
          placeholder="Cari layanan, provider, atau kategori..."
        />

        <select v-model="selectedCategory" class="filter-select">
          <option>Semua</option>
          <option>Infrastruktur</option>
          <option>Software</option>
          <option>Marketing</option>
        </select>
      </div>

      <span class="table-count">
        {{ filteredSubscriptions.length }} layanan
      </span>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Langganan Digital</h3>
          <p>Monitor biaya, siklus, dan jadwal tagihan setiap layanan.</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Layanan</th>
              <th>Kategori</th>
              <th>Biaya</th>
              <th>Siklus</th>
              <th>Tgl. Tagihan</th>
              <th>Status Bayar</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="subscription in filteredSubscriptions"
              :key="subscription.id"
            >
              <td>
                <strong>{{ subscription.service }}</strong>
                <small class="table-subtext">
                  {{ subscription.provider }}
                </small>
              </td>

              <td>
                <span class="category-chip">
                  {{ subscription.category }}
                </span>
              </td>

              <td>
                {{ formatCurrency(subscription.fee, subscription.currency) }}
              </td>

              <td>{{ subscription.cycle }}</td>

              <td>{{ formatDate(subscription.nextBillingDate) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="getPaymentClass(subscription.paymentStatus)"
                >
                  {{ subscription.paymentStatus }}
                </span>
              </td>

              <td>
                <button
                  class="table-action"
                  @click="renewSubscription(subscription)"
                >
                  Perpanjang
                </button>
              </td>
            </tr>

            <tr v-if="filteredSubscriptions.length === 0">
              <td colspan="7" class="empty-table">
                Langganan tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <form class="modal-card" @submit.prevent="addSubscription">
        <div class="modal-header">
          <div>
            <p class="eyebrow">LANGGANAN DIGITAL</p>
            <h3>Tambah Langganan Baru</h3>
          </div>

          <button type="button" class="modal-close" @click="closeModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label>
            Nama Layanan
            <input
              v-model="form.service"
              type="text"
              placeholder="Contoh: Notion Plus"
              required
            />
          </label>

          <label>
            Provider
            <input
              v-model="form.provider"
              type="text"
              placeholder="Contoh: Notion"
              required
            />
          </label>

          <label>
            Kategori
            <select v-model="form.category">
              <option>Infrastruktur</option>
              <option>Software</option>
              <option>Marketing</option>
            </select>
          </label>

          <label>
            Mata Uang
            <select v-model="form.currency">
              <option>IDR</option>
              <option>USD</option>
            </select>
          </label>

          <label>
            Siklus Tagihan
            <select v-model="form.cycle">
              <option>Bulanan</option>
              <option>Tahunan</option>
            </select>
          </label>

          <label>
            Biaya Langganan
            <input
              v-model.number="form.fee"
              type="number"
              min="0"
              placeholder="0"
              required
            />
          </label>

          <label>
            Tanggal Tagihan Berikutnya
            <input
              v-model="form.nextBillingDate"
              type="date"
              required
            />
          </label>

          <label>
            Status Pembayaran
            <select v-model="form.paymentStatus">
              <option>Patuh</option>
              <option>Jatuh Tempo</option>
              <option>Terlambat</option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeModal">
            Batal
          </button>

          <button type="submit" class="primary-button">
            Simpan Langganan
          </button>
        </div>
      </form>
    </div>
  </section>
</template>