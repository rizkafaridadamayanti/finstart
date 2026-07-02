<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

/*
  Halaman Buku Besar FinStart
  Terhubung ke API:
  GET    /api/accounts
  POST   /api/accounts
  PUT    /api/accounts/:id
  DELETE /api/accounts/:id
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const accounts = ref([])
const keyword = ref('')
const selectedType = ref('all')

const showModal = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')

const accountTypes = [
  { value: 'asset', label: 'Aset' },
  { value: 'liability', label: 'Kewajiban' },
  { value: 'equity', label: 'Modal' },
  { value: 'revenue', label: 'Pendapatan' },
  { value: 'expense', label: 'Beban' },
]

function emptyForm() {
  return {
    id: null,
    code: '',
    name: '',
    type: 'asset',
    normal_balance: 'debit',
    opening_balance: 0,
    status: 'active',
    parent_id: '',
  }
}

const form = ref(emptyForm())

const filteredAccounts = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  return accounts.value.filter((account) => {
    const matchKeyword =
      !search ||
      String(account.code || '').toLowerCase().includes(search) ||
      String(account.name || '').toLowerCase().includes(search)

    const matchType =
      selectedType.value === 'all' ||
      account.type === selectedType.value

    return matchKeyword && matchType
  })
})

const availableParents = computed(() => {
  return accounts.value.filter((account) => account.id !== form.value.id)
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function typeLabel(type) {
  return accountTypes.find((item) => item.value === type)?.label || type || '-'
}

function statusLabel(status) {
  return status === 'inactive' ? 'Tidak Aktif' : 'Aktif'
}

function normalBalanceLabel(balance) {
  return balance === 'credit' ? 'Kredit' : 'Debit'
}

function defaultNormalBalance(type) {
  return type === 'asset' || type === 'expense' ? 'debit' : 'credit'
}

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

async function loadAccounts() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/accounts')
    accounts.value = response.data.data || []
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data akun. Pastikan backend Node.js berjalan di http://localhost:4000.',
    )
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  form.value = emptyForm()
  showModal.value = true
}

function openEditModal(account) {
  form.value = {
    id: account.id,
    code: account.code || '',
    name: account.name || '',
    type: account.type || 'asset',
    normal_balance: account.normal_balance || defaultNormalBalance(account.type),
    opening_balance: Number(account.opening_balance || 0),
    status: account.status || 'active',
    parent_id: account.parent_id ? String(account.parent_id) : '',
  }

  showModal.value = true
}

function closeModal() {
  showModal.value = false
  form.value = emptyForm()
}

function onTypeChange() {
  form.value.normal_balance = defaultNormalBalance(form.value.type)
}

function accountPayload(statusOverride = null) {
  return {
    code: form.value.code.trim(),
    name: form.value.name.trim(),
    type: form.value.type,
    normal_balance: form.value.normal_balance,
    opening_balance: Number(form.value.opening_balance || 0),
    status: statusOverride || form.value.status,
    parent_id: form.value.parent_id ? Number(form.value.parent_id) : null,
  }
}

async function saveAccount() {
  if (!form.value.code.trim() || !form.value.name.trim()) {
    alert('Kode akun dan nama akun wajib diisi.')
    return
  }

  if (Number(form.value.opening_balance) < 0) {
    alert('Saldo awal tidak boleh bernilai negatif.')
    return
  }

  isSaving.value = true

  try {
    if (form.value.id) {
      await api.put(`/accounts/${form.value.id}`, accountPayload())
      alert('Akun berhasil diperbarui.')
    } else {
      await api.post('/accounts', accountPayload())
      alert('Akun baru berhasil ditambahkan.')
    }

    await loadAccounts()
    closeModal()
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal menyimpan akun.'))
  } finally {
    isSaving.value = false
  }
}

async function toggleAccountStatus(account) {
  const nextStatus = account.status === 'active' ? 'inactive' : 'active'
  const confirmationText =
    nextStatus === 'inactive'
      ? `Nonaktifkan akun "${account.name}"?`
      : `Aktifkan akun "${account.name}"?`

  if (!confirm(confirmationText)) return

  try {
    await api.put(`/accounts/${account.id}`, {
      code: account.code,
      name: account.name,
      type: account.type,
      normal_balance: account.normal_balance,
      opening_balance: Number(account.opening_balance || 0),
      status: nextStatus,
      parent_id: account.parent_id || null,
    })

    await loadAccounts()
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal mengubah status akun.'))
  }
}

async function deleteAccount(account) {
  if (!confirm(`Hapus akun "${account.code} - ${account.name}"?`)) return

  try {
    await api.delete(`/accounts/${account.id}`)
    await loadAccounts()

    if (form.value.id === account.id) {
      closeModal()
    }

    alert('Akun berhasil dihapus.')
  } catch (error) {
    alert(getErrorMessage(error, 'Akun gagal dihapus karena sudah dipakai data lain.'))
  }
}

onMounted(loadAccounts)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">CHART OF ACCOUNTS</p>
        <h1>Buku Besar</h1>
        <p>Kelola kode akun, tipe akun, saldo awal, dan status akun perusahaan.</p>
      </div>

      <button type="button" class="primary-button" @click="openAddModal">
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
          <option value="all">Semua</option>
          <option
            v-for="type in accountTypes"
            :key="type.value"
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>
      </div>

      <span class="table-count">{{ filteredAccounts.length }} akun</span>
    </div>

    <article v-if="errorMessage" class="panel">
      <div class="panel-header">
        <div>
          <h3>API Belum Terhubung</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <button type="button" class="table-action" @click="loadAccounts">
          Coba Lagi
        </button>
      </div>
    </article>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Akun</h3>
          <p>Saldo saat ini akan berubah dari jurnal yang sudah diposting.</p>
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
            <tr v-if="isLoading">
              <td colspan="6" class="empty-table">
                Memuat data akun...
              </td>
            </tr>

            <tr v-else v-for="account in filteredAccounts" :key="account.id">
              <td>
                <strong>{{ account.code }}</strong>
              </td>

              <td>
                <strong>{{ account.name }}</strong>
                <small v-if="account.parent_name" class="table-subtext">
                  Induk: {{ account.parent_code }} - {{ account.parent_name }}
                </small>
                <small v-else class="table-subtext">
                  Normal: {{ normalBalanceLabel(account.normal_balance) }}
                </small>
              </td>

              <td>
                <span class="account-type">{{ typeLabel(account.type) }}</span>
              </td>

              <td>{{ formatCurrency(account.current_balance) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="{ danger: account.status === 'inactive' }"
                >
                  {{ statusLabel(account.status) }}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  class="table-action"
                  @click="openEditModal(account)"
                >
                  Ubah
                </button>

                <button
                  type="button"
                  class="table-action"
                  @click="toggleAccountStatus(account)"
                >
                  {{ account.status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredAccounts.length === 0">
              <td colspan="6" class="empty-table">
                Data akun tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <form class="modal-card" @submit.prevent="saveAccount">
        <div class="modal-header">
          <div>
            <p class="eyebrow">BUKU BESAR</p>
            <h3>{{ form.id ? 'Ubah Akun' : 'Tambah Akun Baru' }}</h3>
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
              maxlength="30"
              placeholder="Contoh: 1110"
              required
            />
          </label>

          <label>
            Tipe Akun
            <select v-model="form.type" @change="onTypeChange">
              <option
                v-for="type in accountTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
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
              v-model.number="form.opening_balance"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              required
            />
          </label>

          <label>
            Normal Balance
            <select v-model="form.normal_balance">
              <option value="debit">Debit</option>
              <option value="credit">Kredit</option>
            </select>
          </label>

          <label>
            Status Akun
            <select v-model="form.status">
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </label>

          <label>
            Akun Induk <small>(opsional)</small>
            <select v-model="form.parent_id">
              <option value="">Tidak ada akun induk</option>
              <option
                v-for="account in availableParents"
                :key="account.id"
                :value="String(account.id)"
              >
                {{ account.code }} - {{ account.name }}
              </option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button
            v-if="form.id"
            type="button"
            class="secondary-button"
            @click="deleteAccount(form)"
          >
            Hapus
          </button>

          <button type="button" class="secondary-button" @click="closeModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Akun' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
