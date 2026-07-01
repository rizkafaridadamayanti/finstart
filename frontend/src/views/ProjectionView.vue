<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const accounts = computed(() => financeStore.accounts)
const targetList = computed(() => financeStore.projectionTargets)

const keyword = ref('')
const selectedType = ref('Semua')
const showModal = ref(false)

const months = [
  { value: '2026-01', label: 'Jan' },
  { value: '2026-02', label: 'Feb' },
  { value: '2026-03', label: 'Mar' },
  { value: '2026-04', label: 'Apr' },
  { value: '2026-05', label: 'Mei' },
  { value: '2026-06', label: 'Jun' },
  { value: '2026-07', label: 'Jul' },
  { value: '2026-08', label: 'Agu' },
  { value: '2026-09', label: 'Sep' },
  { value: '2026-10', label: 'Okt' },
  { value: '2026-11', label: 'Nov' },
  { value: '2026-12', label: 'Des' },
]

const form = ref({
  accountId: '',
  month: '2026-07',
  targetValue: 0,
  status: 'On Track',
  notes: '',
})

const availableAccounts = computed(() => {
  return accounts.value.filter(
    (account) =>
      account.type === 'Pendapatan' || account.type === 'Beban',
  )
})

const filteredTargets = computed(() => {
  const search = keyword.value.toLowerCase()

  return targetList.value.filter((target) => {
    const matchesKeyword =
      target.accountName.toLowerCase().includes(search) ||
      target.type.toLowerCase().includes(search) ||
      target.month.includes(search)

    const matchesType =
      selectedType.value === 'Semua' ||
      target.type === selectedType.value

    return matchesKeyword && matchesType
  })
})

const totalRevenue = computed(() => {
  return targetList.value
    .filter((target) => target.type === 'Pendapatan')
    .reduce((total, target) => total + Number(target.targetValue), 0)
})

const totalExpense = computed(() => {
  return targetList.value
    .filter((target) => target.type === 'Beban')
    .reduce((total, target) => total + Number(target.targetValue), 0)
})

const estimatedProfit = computed(() => {
  return totalRevenue.value - totalExpense.value
})

const planningStatus = computed(() => {
  if (totalRevenue.value === 0) return 'Belum Ada Target'

  const margin = estimatedProfit.value / totalRevenue.value

  if (margin >= 0.25) return 'Sehat'
  if (margin >= 0.1) return 'Perlu Dipantau'

  return 'Risiko'
})

const monthlyRoadmap = computed(() => {
  return months.map((month) => {
    const targets = targetList.value.filter(
      (target) => target.month === month.value,
    )

    const revenue = targets
      .filter((target) => target.type === 'Pendapatan')
      .reduce((total, target) => total + Number(target.targetValue), 0)

    const expense = targets
      .filter((target) => target.type === 'Beban')
      .reduce((total, target) => total + Number(target.targetValue), 0)

    return {
      ...month,
      revenue,
      expense,
      profit: revenue - expense,
    }
  })
})

const maxMonthlyValue = computed(() => {
  return Math.max(
    ...monthlyRoadmap.value.flatMap((item) => [
      item.revenue,
      item.expense,
      1,
    ]),
  )
})

const financialNotes = computed(() => {
  const notes = []

  if (estimatedProfit.value < 0) {
    notes.push('Target beban lebih besar dari target pendapatan. Perlu evaluasi ulang anggaran.')
  } else {
    notes.push('Target pendapatan masih lebih besar dari batas beban tahunan.')
  }

  if (totalExpense.value > totalRevenue.value * 0.8) {
    notes.push('Batas beban cukup tinggi. Pantau biaya operasional dan langganan digital.')
  } else {
    notes.push('Komposisi beban masih berada dalam batas yang cukup aman.')
  }

  notes.push('Target dapat ditambah atau diperbarui berdasarkan akun besar dan bulan proyeksi.')

  return notes
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMonth(month) {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${month}-01T00:00:00`))
}

function percent(value) {
  return `${Math.round((value / maxMonthlyValue.value) * 100)}%`
}

function openModal() {
  form.value = {
    accountId: '',
    month: '2026-07',
    targetValue: 0,
    status: 'On Track',
    notes: '',
  }

  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function addTarget() {
  const account = availableAccounts.value.find(
    (item) => item.id === Number(form.value.accountId),
  )

  if (!account || !form.value.month || Number(form.value.targetValue) <= 0) {
    alert('Pilih akun, bulan proyeksi, dan isi target nilai.')
    return
  }

  financeStore.addProjectionTarget({
    month: form.value.month,
    accountId: account.id,
    accountName: account.name,
    type: account.type,
    targetValue: Number(form.value.targetValue),
    status: form.value.status,
    notes: form.value.notes || '-',
  })

  closeModal()
}

function removeTarget(id) {
  financeStore.removeProjectionTarget(id)
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">BUSINESS PLANNING</p>
        <h1>Proyeksi Bisnis Tahunan</h1>
        <p>Kelola target pendapatan, batas beban, laba, dan roadmap profitabilitas.</p>
      </div>

      <button class="primary-button" @click="openModal">
        + Tambah Target Proyeksi
      </button>
    </div>

    <div class="projection-metrics">
      <article class="projection-stat">
        <p>Target Revenue Tahunan</p>
        <h2>{{ formatCurrency(totalRevenue) }}</h2>
        <small>Total target akun pendapatan</small>
      </article>

      <article class="projection-stat">
        <p>Batas Beban Tahunan</p>
        <h2>{{ formatCurrency(totalExpense) }}</h2>
        <small>Total target akun beban</small>
      </article>

      <article class="projection-stat">
        <p>Estimasi Laba</p>
        <h2>{{ formatCurrency(estimatedProfit) }}</h2>
        <small>Revenue dikurangi beban</small>
      </article>

      <article class="projection-stat">
        <p>Status Perencanaan</p>
        <h2>{{ planningStatus }}</h2>
        <small>Evaluasi berdasarkan target laba</small>
      </article>
    </div>

    <div class="projection-layout">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Roadmap Profitabilitas 12 Bulan</h3>
            <p>Perbandingan target pendapatan dan batas beban bulanan.</p>
          </div>
        </div>

        <div class="roadmap-legend">
          <span><i class="legend-revenue"></i> Target Pendapatan</span>
          <span><i class="legend-expense"></i> Batas Beban</span>
        </div>

        <div class="roadmap-chart">
          <div
            v-for="item in monthlyRoadmap"
            :key="item.value"
            class="roadmap-row"
          >
            <span class="roadmap-month">{{ item.label }}</span>

            <div class="roadmap-bars">
              <div class="roadmap-track">
                <span
                  class="roadmap-revenue"
                  :style="{ width: percent(item.revenue) }"
                ></span>
              </div>

              <div class="roadmap-track">
                <span
                  class="roadmap-expense"
                  :style="{ width: percent(item.expense) }"
                ></span>
              </div>
            </div>

            <strong>{{ formatCurrency(item.profit) }}</strong>
          </div>
        </div>
      </article>

      <article class="panel financial-notes">
        <p class="eyebrow">FINANCIAL LOGIC</p>
        <h3>Notes Finansial</h3>

        <ul>
          <li v-for="note in financialNotes" :key="note">
            {{ note }}
          </li>
        </ul>
      </article>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Detail Fluktuasi Bulanan</h3>
          <p>Ringkasan target pendapatan, beban, dan laba setiap bulan.</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Target Pendapatan</th>
              <th>Batas Beban</th>
              <th>Estimasi Laba</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in monthlyRoadmap" :key="item.value">
              <td><strong>{{ formatMonth(item.value) }}</strong></td>
              <td>{{ formatCurrency(item.revenue) }}</td>
              <td>{{ formatCurrency(item.expense) }}</td>
              <td><strong>{{ formatCurrency(item.profit) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div class="module-toolbar">
      <div class="filter-group">
        <input
          v-model="keyword"
          class="module-search"
          type="text"
          placeholder="Cari akun atau jenis target..."
        />

        <select v-model="selectedType" class="filter-select">
          <option>Semua</option>
          <option>Pendapatan</option>
          <option>Beban</option>
        </select>
      </div>

      <span class="table-count">{{ filteredTargets.length }} target akun</span>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Semua Target Akun</h3>
          <p>Daftar target berdasarkan akun besar dan periode proyeksi.</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Akun Besar</th>
              <th>Jenis</th>
              <th>Bulan Proyeksi</th>
              <th>Target Nilai</th>
              <th>Status</th>
              <th>Catatan</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="target in filteredTargets" :key="target.id">
              <td><strong>{{ target.accountName }}</strong></td>
              <td>
                <span class="account-type">{{ target.type }}</span>
              </td>
              <td>{{ formatMonth(target.month) }}</td>
              <td>{{ formatCurrency(target.targetValue) }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="{
                    warning: target.status === 'Butuh Review',
                    danger: target.status === 'Risiko',
                  }"
                >
                  {{ target.status }}
                </span>
              </td>
              <td>{{ target.notes }}</td>
              <td>
                <button class="table-action" @click="removeTarget(target.id)">
                  Hapus
                </button>
              </td>
            </tr>

            <tr v-if="filteredTargets.length === 0">
              <td colspan="7" class="empty-table">
                Target proyeksi tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <form class="modal-card" @submit.prevent="addTarget">
        <div class="modal-header">
          <div>
            <p class="eyebrow">TARGET PROYEKSI</p>
            <h3>Tambah Target Proyeksi</h3>
          </div>

          <button type="button" class="modal-close" @click="closeModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label class="full-width">
            Pilih Akun Besar
            <select v-model.number="form.accountId" required>
              <option value="">Pilih akun pendapatan atau beban</option>

              <option
                v-for="account in availableAccounts"
                :key="account.id"
                :value="account.id"
              >
                {{ account.code }} - {{ account.name }} ({{ account.type }})
              </option>
            </select>
          </label>

          <label>
            Bulan Proyeksi
            <input v-model="form.month" type="month" required />
          </label>

          <label>
            Target Nilai
            <input
              v-model.number="form.targetValue"
              type="number"
              min="0"
              placeholder="Contoh: 50000000"
              required
            />
          </label>

          <label>
            Status Perencanaan
            <select v-model="form.status">
              <option>On Track</option>
              <option>Butuh Review</option>
              <option>Risiko</option>
            </select>
          </label>

          <label class="full-width">
            Notes Finansial
            <input
              v-model="form.notes"
              type="text"
              placeholder="Contoh: Target dari termin kedua proyek ERP"
            />
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeModal">
            Batal
          </button>

          <button type="submit" class="primary-button">
            Simpan Target
          </button>
        </div>
      </form>
    </div>
  </section>
</template>