<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

/*
  FRONTEND CRM & PROJECT FINSTART
  API yang digunakan:
  http://localhost:4000/api/clients
  http://localhost:4000/api/projects
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

const clients = ref([])
const projectList = ref([])

const keyword = ref('')
const activeTab = ref('projects')

const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')

const currentPageProjects = ref(1)
const currentPageClients = ref(1)
const PAGE_SIZE = 10

const showProjectModal = ref(false)
const showClientModal = ref(false)
const showProjectDetailModal = ref(false)
const showClientDetailModal = ref(false)

const selectedProject = ref(null)
const selectedClient = ref(null)

function emptyProjectForm() {
  return {
    id: null,
    project_name: '',
    client_id: '',
    project_code: '',
    contract_value: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    description: '',
  }
}

function emptyClientForm() {
  return {
    id: null,
    company_name: '',
    pic_name: '',
    email: '',
    phone: '',
    industry: '',
    category: '',
    location: '',
    address: '',
    status: 'active',
  }
}

const projectForm = ref(emptyProjectForm())
const clientForm = ref(emptyClientForm())

const filteredProjects = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  const filtered = projectList.value.filter((project) => {
    return [
      project.project_name,
      project.project_code,
      project.client_name,
      project.client_pic_name,
      project.status,
    ].some((value) => String(value || '').toLowerCase().includes(search))
  })

  // Sort by newest first using created_at or id
  return [...filtered].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : (a.id ? -a.id : 0)
    const dateB = b.created_at ? new Date(b.created_at) : (b.id ? -b.id : 0)
    return dateB - dateA
  })
})

const paginatedProjects = computed(() => {
  const start = (currentPageProjects.value - 1) * PAGE_SIZE
  return filteredProjects.value.slice(start, start + PAGE_SIZE)
})

const filteredClients = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  const filtered = clients.value.filter((client) => {
    return [
      client.company_name,
      client.pic_name,
      client.industry,
      client.category,
      client.location,
      client.status,
    ].some((value) => String(value || '').toLowerCase().includes(search))
  })

  // Sort by newest first using created_at or id
  return [...filtered].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : (a.id ? -a.id : 0)
    const dateB = b.created_at ? new Date(b.created_at) : (b.id ? -b.id : 0)
    return dateB - dateA
  })
})

const paginatedClients = computed(() => {
  const start = (currentPageClients.value - 1) * PAGE_SIZE
  return filteredClients.value.slice(start, start + PAGE_SIZE)
})

// Reset page when keyword or active tab changes
watch([keyword, activeTab], () => {
  currentPageProjects.value = 1
  currentPageClients.value = 1
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return '-'

  const dateText = String(value).slice(0, 10)
  const [year, month, day] = dateText.split('-')

  if (!year || !month || !day) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(Number(year), Number(month) - 1, Number(day)))
}

function clientStatusLabel(status) {
  return status === 'inactive' ? 'Tidak Aktif' : 'Aktif'
}

function projectStatusLabel(status) {
  const labels = {
    planning: 'Planning',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return labels[status] || status || '-'
}

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [clientResponse, projectResponse] = await Promise.all([
      api.get('/clients'),
      api.get('/projects'),
    ])

    clients.value = clientResponse.data.data || []
    projectList.value = projectResponse.data.data || []
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Gagal mengambil data. Pastikan backend Node.js berjalan di http://localhost:4000.',
    )
  } finally {
    isLoading.value = false
  }
}

function openNewClientModal() {
  clientForm.value = emptyClientForm()
  showClientModal.value = true
}

function openEditClientModal(client) {
  clientForm.value = {
    id: client.id,
    company_name: client.company_name || '',
    pic_name: client.pic_name || '',
    email: client.email || '',
    phone: client.phone || '',
    industry: client.industry || '',
    category: client.category || '',
    location: client.location || '',
    address: client.address || '',
    status: client.status || 'active',
  }

  showClientModal.value = true
}

function closeClientModal() {
  showClientModal.value = false
  clientForm.value = emptyClientForm()
}

function openNewProjectModal() {
  if (clients.value.length === 0) {
    activeTab.value = 'clients'
    alert('Tambahkan data klien terlebih dahulu sebelum membuat proyek.')
    return
  }

  projectForm.value = emptyProjectForm()
  showProjectModal.value = true
}

function openEditProjectModal(project) {
  projectForm.value = {
    id: project.id,
    project_name: project.project_name || '',
    client_id: String(project.client_id || ''),
    project_code: project.project_code || '',
    contract_value: Number(project.contract_value || 0),
    status: project.status || 'planning',
    start_date: String(project.start_date || '').slice(0, 10),
    end_date: String(project.end_date || '').slice(0, 10),
    description: project.description || '',
  }

  showProjectModal.value = true
}

function closeProjectModal() {
  showProjectModal.value = false
  projectForm.value = emptyProjectForm()
}

function openProjectDetail(project) {
  selectedProject.value = project
  showProjectDetailModal.value = true
}

function openClientDetail(client) {
  selectedClient.value = client
  showClientDetailModal.value = true
}

function closeProjectDetailModal() {
  showProjectDetailModal.value = false
  selectedProject.value = null
}

function closeClientDetailModal() {
  showClientDetailModal.value = false
  selectedClient.value = null
}

async function saveClient() {
  if (
    !clientForm.value.company_name.trim() ||
    !clientForm.value.pic_name.trim()
  ) {
    alert('Nama perusahaan dan nama PIC wajib diisi.')
    return
  }

  isSaving.value = true

  const payload = {
    company_name: clientForm.value.company_name.trim(),
    pic_name: clientForm.value.pic_name.trim(),
    email: clientForm.value.email.trim(),
    phone: clientForm.value.phone.trim(),
    industry: clientForm.value.industry.trim(),
    category: clientForm.value.category.trim(),
    location: clientForm.value.location.trim(),
    address: clientForm.value.address.trim(),
    status: clientForm.value.status,
  }

  try {
    if (clientForm.value.id) {
      await api.put(`/clients/${clientForm.value.id}`, payload)
      alert('Data klien berhasil diperbarui.')
    } else {
      await api.post('/clients', payload)
      alert('Klien baru berhasil ditambahkan.')
    }

    await loadData()
    closeClientModal()
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal menyimpan data klien.'))
  } finally {
    isSaving.value = false
  }
}

async function saveProject() {
  if (
    !projectForm.value.project_name.trim() ||
    !projectForm.value.client_id ||
    !projectForm.value.project_code.trim() ||
    !projectForm.value.start_date ||
    !projectForm.value.end_date ||
    Number(projectForm.value.contract_value) <= 0
  ) {
    alert('Lengkapi nama proyek, klien, kode proyek, nilai kontrak, dan periode proyek.')
    return
  }

  if (projectForm.value.end_date < projectForm.value.start_date) {
    alert('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.')
    return
  }

  isSaving.value = true

  const payload = {
    client_id: Number(projectForm.value.client_id),
    project_name: projectForm.value.project_name.trim(),
    project_code: projectForm.value.project_code.trim().toUpperCase(),
    contract_value: Number(projectForm.value.contract_value),
    status: projectForm.value.status,
    start_date: projectForm.value.start_date,
    end_date: projectForm.value.end_date,
    description: projectForm.value.description.trim(),
  }

  try {
    if (projectForm.value.id) {
      await api.put(`/projects/${projectForm.value.id}`, payload)
      alert('Data proyek berhasil diperbarui.')
    } else {
      await api.post('/projects', payload)
      alert('Proyek baru berhasil ditambahkan.')
    }

    await loadData()
    closeProjectModal()
    activeTab.value = 'projects'
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal menyimpan proyek.'))
  } finally {
    isSaving.value = false
  }
}

async function deleteClient(client) {
  const isConfirmed = confirm(
    `Hapus klien "${client.company_name}"? Data yang sudah terhubung dengan proyek tidak dapat dihapus.`,
  )

  if (!isConfirmed) return

  try {
    await api.delete(`/clients/${client.id}`)
    await loadData()
    closeClientDetailModal()
    alert('Klien berhasil dihapus.')
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal menghapus klien.'))
  }
}

async function deleteProject(project) {
  const isConfirmed = confirm(`Hapus proyek "${project.project_name}"?`)

  if (!isConfirmed) return

  try {
    await api.delete(`/projects/${project.id}`)
    await loadData()
    closeProjectDetailModal()
    alert('Proyek berhasil dihapus.')
  } catch (error) {
    alert(getErrorMessage(error, 'Gagal menghapus proyek.'))
  }
}

onMounted(loadData)
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">CRM & PORTOFOLIO</p>
        <h1>CRM & Proyek</h1>
        <p>Kelola data klien, proyek berjalan, nilai kontrak, dan PIC perusahaan.</p>
      </div>

      <button
        v-if="activeTab === 'projects'"
        type="button"
        class="primary-button"
        @click="openNewProjectModal"
      >
        + Inisiasi Proyek Baru
      </button>

      <button
        v-else
        type="button"
        class="primary-button"
        @click="openNewClientModal"
      >
        + Tambah Klien
      </button>
    </div>

    <div class="module-toolbar">
      <div class="tab-list">
        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'projects' }"
          @click="activeTab = 'projects'"
        >
          Proyek
        </button>

        <button
          type="button"
          class="tab-button"
          :class="{ active: activeTab === 'clients' }"
          @click="activeTab = 'clients'"
        >
          Klien
        </button>
      </div>

      <input
        v-model="keyword"
        class="module-search"
        type="text"
        :placeholder="
          activeTab === 'projects'
            ? 'Cari proyek, kode, klien, atau status...'
            : 'Cari perusahaan, PIC, bidang, atau lokasi...'
        "
      />
    </div>

    <article v-if="errorMessage" class="panel">
      <div class="panel-header">
        <div>
          <h3>API Belum Terhubung</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <button type="button" class="table-action" @click="loadData">
          Coba Lagi
        </button>
      </div>
    </article>

    <article v-if="activeTab === 'projects'" class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Proyek</h3>
          <p>Menampilkan portofolio dan proyek dari database FinStart.</p>
        </div>

        <span class="table-count">{{ filteredProjects.length }} proyek</span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Info Proyek</th>
              <th>Klien & PIC</th>
              <th>Nilai Kontrak</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="empty-table">Memuat data proyek...</td>
            </tr>

            <tr v-else v-for="project in paginatedProjects" :key="project.id">
              <td>
                <strong>{{ project.project_name }}</strong>
                <small class="table-subtext">
                  {{ project.project_code }} ·
                  {{ formatDate(project.start_date) }} s.d.
                  {{ formatDate(project.end_date) }}
                </small>
              </td>

              <td>
                <strong>{{ project.client_name }}</strong>
                <small class="table-subtext">
                  PIC: {{ project.client_pic_name || '-' }}
                </small>
              </td>

              <td>{{ formatCurrency(project.contract_value) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="{
                    warning: project.status === 'planning',
                    danger: project.status === 'cancelled',
                  }"
                >
                  {{ projectStatusLabel(project.status) }}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  class="table-action"
                  @click="openProjectDetail(project)"
                >
                  Detail
                </button>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredProjects.length === 0">
              <td colspan="5" class="empty-table">
                Proyek belum tersedia.
              </td>
            </tr>
          </tbody>

          <!-- Pagination Controls for Projects -->
          <tfoot>
            <tr>
              <td colspan="5">
                <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
                  <div class="text-xs text-[#6B7A90]">
                    Menampilkan {{ Math.min((currentPageProjects - 1) * PAGE_SIZE + 1, filteredProjects.length) }} - {{ Math.min(currentPageProjects * PAGE_SIZE, filteredProjects.length) }} dari {{ filteredProjects.length }} data
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      :disabled="currentPageProjects <= 1"
                      @click="currentPageProjects = Math.max(1, currentPageProjects - 1)"
                      class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <svg class="w-3 h-3 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      Prev
                    </button>
                    <button
                      :disabled="currentPageProjects >= Math.ceil(filteredProjects.length / PAGE_SIZE)"
                      @click="currentPageProjects = currentPageProjects + 1"
                      class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                      <svg class="w-3 h-3 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </article>

    <article v-else class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Klien</h3>
          <p>Data perusahaan klien dan PIC dari database FinStart.</p>
        </div>

        <span class="table-count">{{ filteredClients.length }} klien</span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Perusahaan & PIC</th>
              <th>Bidang & Kategori</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="empty-table">Memuat data klien...</td>
            </tr>

            <tr v-else v-for="client in paginatedClients" :key="client.id">
              <td>
                <strong>{{ client.company_name }}</strong>
                <small class="table-subtext">
                  PIC: {{ client.pic_name }}
                </small>
              </td>

              <td>
                <strong>{{ client.industry || '-' }}</strong>
                <small class="table-subtext">{{ client.category || '-' }}</small>
              </td>

              <td>{{ client.location || '-' }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="{ warning: client.status === 'inactive' }"
                >
                  {{ clientStatusLabel(client.status) }}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  class="table-action"
                  @click="openClientDetail(client)"
                >
                  Detail
                </button>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredClients.length === 0">
              <td colspan="5" class="empty-table">
                Klien belum tersedia.
              </td>
            </tr>
          </tbody>

          <!-- Pagination Controls for Clients -->
          <tfoot>
            <tr>
              <td colspan="5">
                <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
                  <div class="text-xs text-[#6B7A90]">
                    Menampilkan {{ Math.min((currentPageClients - 1) * PAGE_SIZE + 1, filteredClients.length) }} - {{ Math.min(currentPageClients * PAGE_SIZE, filteredClients.length) }} dari {{ filteredClients.length }} data
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      :disabled="currentPageClients <= 1"
                      @click="currentPageClients = Math.max(1, currentPageClients - 1)"
                      class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <svg class="w-3 h-3 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      Prev
                    </button>
                    <button
                      :disabled="currentPageClients >= Math.ceil(filteredClients.length / PAGE_SIZE)"
                      @click="currentPageClients = currentPageClients + 1"
                      class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                      <svg class="w-3 h-3 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </article>

    <!-- Modal tambah/edit proyek -->
    <div
      v-if="showProjectModal"
      class="modal-backdrop"
      @click.self="closeProjectModal"
    >
      <form class="modal-card" @submit.prevent="saveProject">
        <div class="modal-header">
          <div>
            <p class="eyebrow">
              {{ projectForm.id ? 'UBAH PROYEK' : 'INISIASI PROYEK' }}
            </p>
            <h3>{{ projectForm.id ? 'Ubah Proyek' : 'Proyek Baru' }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closeProjectModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label class="full-width">
            Nama Proyek
            <input
              v-model="projectForm.project_name"
              type="text"
              placeholder="Contoh: Implementasi Dashboard Keuangan"
              required
            />
          </label>

          <label>
            Klien
            <select v-model="projectForm.client_id" required>
              <option value="">Pilih klien</option>
              <option v-for="client in clients" :key="client.id" :value="String(client.id)">
                {{ client.company_name }}
              </option>
            </select>
          </label>

          <label>
            Kode Proyek
            <input
              v-model="projectForm.project_code"
              type="text"
              placeholder="Contoh: PRJ-001"
              required
            />
          </label>

          <label>
            Nilai Kontrak
            <input
              v-model.number="projectForm.contract_value"
              type="number"
              min="0"
              placeholder="Contoh: 150000000"
              required
            />
          </label>

          <label>
            Status Proyek
            <select v-model="projectForm.status">
              <option value="planning">Planning</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label>
            Tanggal Mulai
            <input v-model="projectForm.start_date" type="date" required />
          </label>

          <label>
            Tanggal Selesai
            <input v-model="projectForm.end_date" type="date" required />
          </label>

          <label class="full-width">
            Catatan Proyek
            <input
              v-model="projectForm.description"
              type="text"
              placeholder="Contoh: Pengembangan dashboard dan laporan keuangan"
            />
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeProjectModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Proyek' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal tambah/edit klien -->
    <div
      v-if="showClientModal"
      class="modal-backdrop"
      @click.self="closeClientModal"
    >
      <form class="modal-card" @submit.prevent="saveClient">
        <div class="modal-header">
          <div>
            <p class="eyebrow">
              {{ clientForm.id ? 'UBAH KLIEN' : 'DATA KLIEN' }}
            </p>
            <h3>{{ clientForm.id ? 'Ubah Klien' : 'Tambah Klien Baru' }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closeClientModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label class="full-width">
            Nama Perusahaan
            <input
              v-model="clientForm.company_name"
              type="text"
              placeholder="Contoh: PT Maju Bersama"
              required
            />
          </label>

          <label>
            Nama PIC
            <input
              v-model="clientForm.pic_name"
              type="text"
              placeholder="Contoh: Rina Putri"
              required
            />
          </label>

          <label>
            Nomor Telepon
            <input
              v-model="clientForm.phone"
              type="text"
              placeholder="Contoh: 081234567890"
            />
          </label>

          <label>
            Email
            <input
              v-model="clientForm.email"
              type="email"
              placeholder="Contoh: client@email.com"
            />
          </label>

          <label>
            Industri
            <input
              v-model="clientForm.industry"
              type="text"
              placeholder="Contoh: Teknologi"
            />
          </label>

          <label>
            Kategori
            <input
              v-model="clientForm.category"
              type="text"
              placeholder="Contoh: Startup"
            />
          </label>

          <label>
            Lokasi
            <input
              v-model="clientForm.location"
              type="text"
              placeholder="Contoh: Jakarta"
            />
          </label>

          <label>
            Status
            <select v-model="clientForm.status">
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </label>

          <label class="full-width">
            Alamat
            <input
              v-model="clientForm.address"
              type="text"
              placeholder="Contoh: Jakarta Selatan"
            />
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeClientModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : 'Simpan Klien' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal detail proyek -->
    <div
      v-if="showProjectDetailModal && selectedProject"
      class="modal-backdrop"
      @click.self="closeProjectDetailModal"
    >
      <section class="modal-card">
        <div class="modal-header">
          <div>
            <p class="eyebrow">DETAIL PROYEK</p>
            <h3>{{ selectedProject.project_name }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closeProjectDetailModal">
            ×
          </button>
        </div>

        <div class="detail-grid">
          <div>
            <p class="detail-label">Kode Proyek</p>
            <p>{{ selectedProject.project_code }}</p>
          </div>

          <div>
            <p class="detail-label">Klien</p>
            <p>{{ selectedProject.client_name }}</p>
          </div>

          <div>
            <p class="detail-label">PIC Klien</p>
            <p>{{ selectedProject.client_pic_name || '-' }}</p>
          </div>

          <div>
            <p class="detail-label">Nilai Kontrak</p>
            <p>{{ formatCurrency(selectedProject.contract_value) }}</p>
          </div>

          <div>
            <p class="detail-label">Status</p>
            <p>{{ projectStatusLabel(selectedProject.status) }}</p>
          </div>

          <div>
            <p class="detail-label">Periode</p>
            <p>
              {{ formatDate(selectedProject.start_date) }} s.d.
              {{ formatDate(selectedProject.end_date) }}
            </p>
          </div>

          <div class="full-width">
            <p class="detail-label">Catatan</p>
            <p>{{ selectedProject.description || '-' }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            @click="openEditProjectModal(selectedProject); closeProjectDetailModal()"
          >
            Ubah
          </button>

          <button
            type="button"
            class="primary-button"
            @click="deleteProject(selectedProject)"
          >
            Hapus
          </button>
        </div>
      </section>
    </div>

    <!-- Modal detail klien -->
    <div
      v-if="showClientDetailModal && selectedClient"
      class="modal-backdrop"
      @click.self="closeClientDetailModal"
    >
      <section class="modal-card">
        <div class="modal-header">
          <div>
            <p class="eyebrow">DETAIL KLIEN</p>
            <h3>{{ selectedClient.company_name }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closeClientDetailModal">
            ×
          </button>
        </div>

        <div class="detail-grid">
          <div>
            <p class="detail-label">PIC</p>
            <p>{{ selectedClient.pic_name }}</p>
          </div>

          <div>
            <p class="detail-label">Email</p>
            <p>{{ selectedClient.email || '-' }}</p>
          </div>

          <div>
            <p class="detail-label">Telepon</p>
            <p>{{ selectedClient.phone || '-' }}</p>
          </div>

          <div>
            <p class="detail-label">Industri</p>
            <p>{{ selectedClient.industry || '-' }}</p>
          </div>

          <div>
            <p class="detail-label">Kategori</p>
            <p>{{ selectedClient.category || '-' }}</p>
          </div>

          <div>
            <p class="detail-label">Lokasi</p>
            <p>{{ selectedClient.location || '-' }}</p>
          </div>

          <div>
            <p class="detail-label">Status</p>
            <p>{{ clientStatusLabel(selectedClient.status) }}</p>
          </div>

          <div class="full-width">
            <p class="detail-label">Alamat</p>
            <p>{{ selectedClient.address || '-' }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            @click="openEditClientModal(selectedClient); closeClientDetailModal()"
          >
            Ubah
          </button>

          <button
            type="button"
            class="primary-button"
            @click="deleteClient(selectedClient)"
          >
            Hapus
          </button>
        </div>
      </section>
    </div>
  </section>
</template>
