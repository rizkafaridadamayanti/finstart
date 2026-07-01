<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const accountList = computed(() => financeStore.accounts)
const keyword = ref('')
const selectedType = ref('Semua')
const showModal = ref(false)

const form = ref({
  code: '',
  name: '',
  type: 'Aset',
  balance: 0,
  status: 'Aktif',
})

const filteredAccounts = computed(() => {
  const search = keyword.value.toLowerCase()

  return accountList.value.filter((account) => {
    const matchKeyword =
      account.code.toLowerCase().includes(search) ||
      account.name.toLowerCase().includes(search)

    const matchType =
      selectedType.value === 'Semua' ||
      account.type === selectedType.value

    return matchKeyword && matchType
  })
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function openAddModal() {
  form.value = {
    code: '',
    name: '',
    type: 'Aset',
    balance: 0,
    status: 'Aktif',
  }

  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function addAccount() {
  const isDuplicate = accountList.value.some(
    (account) => account.code === form.value.code,
  )

  if (isDuplicate) {
    alert('Kode akun sudah digunakan. Gunakan kode akun lain.')
    return
  }

  financeStore.addAccount({
    code: form.value.code,
    name: form.value.name,
    type: form.value.type,
    balance: Number(form.value.balance),
    status: form.value.status,
  })

  closeModal()
}

function toggleAccountStatus(account) {
  financeStore.toggleAccountStatus(account.id)
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">CHART OF ACCOUNTS</p>
        <h1>Buku Besar</h1>
        <p>Kelola kode akun, tipe akun, saldo awal, dan status akun perusahaan.</p>
      </div>

      <button class="primary-button" @click="openAddModal">
        + Tambah Akun
      </button>
    </div>

    <div class="module-toolbar">
      <div class="filter-group">
        <input
          v-model="keyword"
          class="module-search"
          type="text"
          placeholder="Cari kode atau nama akun..."
        />

        <select v-model="selectedType" class="filter-select">
          <option>Semua</option>
          <option>Aset</option>
          <option>Kewajiban</option>
          <option>Modal</option>
          <option>Pendapatan</option>
          <option>Beban</option>
        </select>
      </div>

      <span class="table-count">{{ filteredAccounts.length }} akun</span>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Akun</h3>
          <p>Saldo akan diperbarui dari jurnal yang sudah diposting di halaman Transaksi.</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Akun</th>
              <th>Tipe Akun</th>
              <th>Saldo Saat Ini</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="account in filteredAccounts" :key="account.id">
              <td>
                <strong>{{ account.code }}</strong>
              </td>

              <td>{{ account.name }}</td>

              <td>
                <span class="account-type">{{ account.type }}</span>
              </td>

              <td>{{ formatCurrency(account.balance) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="{ danger: account.status === 'Tidak Aktif' }"
                >
                  {{ account.status }}
                </span>
              </td>

              <td>
                <button
                  class="table-action"
                  @click="toggleAccountStatus(account)"
                >
                  {{ account.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>
              </td>
            </tr>

            <tr v-if="filteredAccounts.length === 0">
              <td colspan="6" class="empty-table">
                Data akun tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <form class="modal-card" @submit.prevent="addAccount">
        <div class="modal-header">
          <div>
            <p class="eyebrow">BUKU BESAR</p>
            <h3>Tambah Akun Baru</h3>
          </div>

          <button type="button" class="modal-close" @click="closeModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label>
            Kode Akun
            <input
              v-model="form.code"
              type="text"
              maxlength="4"
              placeholder="Contoh: 1103"
              required
            />
          </label>

          <label>
            Tipe Akun
            <select v-model="form.type">
              <option>Aset</option>
              <option>Kewajiban</option>
              <option>Modal</option>
              <option>Pendapatan</option>
              <option>Beban</option>
            </select>
          </label>

          <label class="full-width">
            Nama Akun
            <input
              v-model="form.name"
              type="text"
              placeholder="Contoh: Bank Mandiri"
              required
            />
          </label>

          <label>
            Saldo Awal
            <input
              v-model.number="form.balance"
              type="number"
              min="0"
              placeholder="0"
              required
            />
          </label>

          <label>
            Status Akun
            <select v-model="form.status">
              <option>Aktif</option>
              <option>Tidak Aktif</option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeModal">
            Batal
          </button>

          <button type="submit" class="primary-button">
            Simpan Akun
          </button>
        </div>
      </form>
    </div>
  </section>
</template>