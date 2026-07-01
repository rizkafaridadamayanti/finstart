<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const assetList = computed(() => financeStore.assets)

const keyword = ref('')
const selectedCategory = ref('Semua')
const showModal = ref(false)

const assetForm = ref({
  assetCode: '',
  name: '',
  category: 'Teknologi',
  acquisitionDate: '',
  acquisitionCost: 0,
  usefulLifeMonths: 48,
  residualValue: 0,
  status: 'Aktif',
})

const filteredAssets = computed(() => {
  const search = keyword.value.toLowerCase()

  return assetList.value.filter((asset) => {
    const matchesKeyword =
      asset.assetCode.toLowerCase().includes(search) ||
      asset.name.toLowerCase().includes(search) ||
      asset.category.toLowerCase().includes(search)

    const matchesCategory =
      selectedCategory.value === 'Semua' ||
      asset.category === selectedCategory.value

    return matchesKeyword && matchesCategory
  })
})

const totalAcquisitionCost = computed(() => {
  return assetList.value.reduce((total, asset) => {
    return total + Number(asset.acquisitionCost)
  }, 0)
})

const totalAccumulatedDepreciation = computed(() => {
  return assetList.value.reduce((total, asset) => {
    return total + Number(asset.accumulatedDepreciation)
  }, 0)
})

const totalBookValue = computed(() => {
  return assetList.value.reduce((total, asset) => {
    return total + getBookValue(asset)
  }, 0)
})

const activeAssets = computed(() => {
  return assetList.value.filter(
    (asset) => asset.status === 'Aktif',
  ).length
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

function getBookValue(asset) {
  return Math.max(
    Number(asset.acquisitionCost) - Number(asset.accumulatedDepreciation),
    Number(asset.residualValue),
  )
}

function getMonthlyDepreciation(asset) {
  const depreciableValue =
    Number(asset.acquisitionCost) - Number(asset.residualValue)

  return depreciableValue / Number(asset.usefulLifeMonths)
}

function getDepreciationProgress(asset) {
  const depreciableValue =
    Number(asset.acquisitionCost) - Number(asset.residualValue)

  if (depreciableValue <= 0) {
    return 0
  }

  return Math.min(
    (Number(asset.accumulatedDepreciation) / depreciableValue) * 100,
    100,
  )
}

function getNewAssetCode() {
  const number = String(assetList.value.length + 1).padStart(3, '0')
  return `AST-${number}`
}

function openModal() {
  assetForm.value = {
    assetCode: getNewAssetCode(),
    name: '',
    category: 'Teknologi',
    acquisitionDate: '',
    acquisitionCost: 0,
    usefulLifeMonths: 48,
    residualValue: 0,
    status: 'Aktif',
  }

  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function addAsset() {
  if (
    !assetForm.value.name.trim() ||
    !assetForm.value.acquisitionDate ||
    Number(assetForm.value.acquisitionCost) <= 0 ||
    Number(assetForm.value.usefulLifeMonths) <= 0
  ) {
    alert('Lengkapi nama aset, tanggal perolehan, biaya, dan umur manfaat.')
    return
  }

  if (Number(assetForm.value.residualValue) >= Number(assetForm.value.acquisitionCost)) {
    alert('Nilai residu harus lebih kecil dari biaya perolehan aset.')
    return
  }

  financeStore.addAsset({
    assetCode: assetForm.value.assetCode,
    name: assetForm.value.name,
    category: assetForm.value.category,
    acquisitionDate: assetForm.value.acquisitionDate,
    acquisitionCost: Number(assetForm.value.acquisitionCost),
    usefulLifeMonths: Number(assetForm.value.usefulLifeMonths),
    residualValue: Number(assetForm.value.residualValue),
    accumulatedDepreciation: 0,
    monthsDepreciated: 0,
    status: assetForm.value.status,
  })

  closeModal()
  alert('Aset baru berhasil ditambahkan. Nilai buku aset pada Laporan Neraca dan analisis AI sudah diperbarui.')
}

function recordDepreciation(asset) {
  const result = financeStore.recordDepreciation(asset.id)

  if (!result.ok) {
    alert(result.message)
    return
  }

  alert(`Penyusutan bulan ini sebesar ${formatCurrency(result.amount)} berhasil dicatat. Nilai buku aset dan analisis AI sudah diperbarui.`)
}

function toggleAssetStatus(asset) {
  if (asset.status === 'Disusutkan Penuh') {
    alert('Aset yang sudah disusutkan penuh tidak dapat diaktifkan kembali.')
    return
  }

  financeStore.toggleAssetStatus(asset.id)
}

</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">ASSET MANAGEMENT</p>
        <h1>Aset</h1>
        <p>
          Kelola aset perusahaan, biaya perolehan, umur manfaat, dan penyusutan.
        </p>
      </div>

      <button class="primary-button" @click="openModal">
        + Tambah Aset
      </button>
    </div>

    <div class="asset-metrics">
      <article class="asset-stat">
        <p>Total Biaya Perolehan</p>
        <h2>{{ formatCurrency(totalAcquisitionCost) }}</h2>
        <small>Nilai seluruh aset yang tercatat</small>
      </article>

      <article class="asset-stat">
        <p>Akumulasi Penyusutan</p>
        <h2>{{ formatCurrency(totalAccumulatedDepreciation) }}</h2>
        <small>Total penyusutan yang telah dibukukan</small>
      </article>

      <article class="asset-stat">
        <p>Nilai Buku Aset</p>
        <h2>{{ formatCurrency(totalBookValue) }}</h2>
        <small>Nilai aset setelah dikurangi penyusutan</small>
      </article>

      <article class="asset-stat">
        <p>Aset Aktif</p>
        <h2>{{ activeAssets }} Aset</h2>
        <small>Aset yang masih digunakan perusahaan</small>
      </article>
    </div>

    <div class="module-toolbar">
      <div class="filter-group">
        <input
          v-model="keyword"
          class="module-search"
          type="text"
          placeholder="Cari kode, nama, atau kategori aset..."
        />

        <select v-model="selectedCategory" class="filter-select">
          <option>Semua</option>
          <option>Teknologi</option>
          <option>Infrastruktur</option>
          <option>Peralatan Operasional</option>
          <option>Furniture</option>
        </select>
      </div>

      <span class="table-count">
        {{ filteredAssets.length }} aset
      </span>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Aset Perusahaan</h3>
          <p>
            Monitoring informasi aset, biaya perolehan, penyusutan, dan nilai buku.
          </p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Aset / Teknologi</th>
              <th>Tanggal Perolehan</th>
              <th>Biaya Perolehan</th>
              <th>Akumulasi Penyusutan</th>
              <th>Nilai Buku</th>
              <th>Umur Manfaat</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="asset in filteredAssets" :key="asset.id">
              <td>
                <strong>{{ asset.name }}</strong>
                <small class="table-subtext">
                  {{ asset.assetCode }} · {{ asset.category }}
                </small>

                <div class="depreciation-progress">
                  <span
                    :style="{ width: `${getDepreciationProgress(asset)}%` }"
                  ></span>
                </div>
              </td>

              <td>{{ formatDate(asset.acquisitionDate) }}</td>

              <td>{{ formatCurrency(asset.acquisitionCost) }}</td>

              <td>
                {{ formatCurrency(asset.accumulatedDepreciation) }}
              </td>

              <td>
                <strong>{{ formatCurrency(getBookValue(asset)) }}</strong>
              </td>

              <td>
                {{ asset.monthsDepreciated }}/{{ asset.usefulLifeMonths }} bulan
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="{
                    warning: asset.status === 'Dalam Perawatan',
                    danger: asset.status === 'Disusutkan Penuh',
                  }"
                >
                  {{ asset.status }}
                </span>
              </td>

              <td>
                <div class="inline-actions">
                  <button
                    v-if="asset.status === 'Aktif'"
                    class="table-action"
                    @click="recordDepreciation(asset)"
                  >
                    Susutkan
                  </button>

                  <button
                    v-if="asset.status !== 'Disusutkan Penuh'"
                    class="table-action"
                    @click="toggleAssetStatus(asset)"
                  >
                    {{ asset.status === 'Aktif' ? 'Perawatan' : 'Aktifkan' }}
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredAssets.length === 0">
              <td colspan="8" class="empty-table">
                Data aset tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <form class="modal-card" @submit.prevent="addAsset">
        <div class="modal-header">
          <div>
            <p class="eyebrow">DATA ASET</p>
            <h3>Tambah Aset Baru</h3>
          </div>

          <button type="button" class="modal-close" @click="closeModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label>
            Kode Aset
            <input v-model="assetForm.assetCode" type="text" readonly />
          </label>

          <label>
            Nama Aset
            <input
              v-model="assetForm.name"
              type="text"
              placeholder="Contoh: Laptop Lenovo ThinkPad"
              required
            />
          </label>

          <label>
            Kategori Aset
            <select v-model="assetForm.category">
              <option>Teknologi</option>
              <option>Infrastruktur</option>
              <option>Peralatan Operasional</option>
              <option>Furniture</option>
            </select>
          </label>

          <label>
            Tanggal Perolehan
            <input
              v-model="assetForm.acquisitionDate"
              type="date"
              required
            />
          </label>

          <label>
            Biaya Perolehan
            <input
              v-model.number="assetForm.acquisitionCost"
              type="number"
              min="0"
              placeholder="Contoh: 15000000"
              required
            />
          </label>

          <label>
            Umur Manfaat (bulan)
            <input
              v-model.number="assetForm.usefulLifeMonths"
              type="number"
              min="1"
              placeholder="Contoh: 48"
              required
            />
          </label>

          <label>
            Nilai Residu
            <input
              v-model.number="assetForm.residualValue"
              type="number"
              min="0"
              placeholder="Contoh: 1500000"
              required
            />
          </label>

          <label>
            Status Aset
            <select v-model="assetForm.status">
              <option>Aktif</option>
              <option>Dalam Perawatan</option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeModal">
            Batal
          </button>

          <button type="submit" class="primary-button">
            Simpan Aset
          </button>
        </div>
      </form>
    </div>
  </section>
</template>