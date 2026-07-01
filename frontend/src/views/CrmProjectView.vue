<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const projectList = computed(() => financeStore.projects)
const clients = computed(() => financeStore.clients)

const keyword = ref('')
const activeTab = ref('projects')
const showProjectModal = ref(false)
const showProjectDetailModal = ref(false)
const showClientDetailModal = ref(false)
const selectedProject = ref(null)
const selectedClient = ref(null)

const projectForm = ref({
  name: '',
  client: '',
  team: '',
  contractValue: 0,
  tenderType: 'Tender Umum',
  status: 'Planning',
  startDate: '',
  endDate: '',
})

const filteredProjects = computed(() => {
  const search = keyword.value.toLowerCase()

  return projectList.value.filter((project) => {
    return (
      project.name.toLowerCase().includes(search) ||
      project.client.toLowerCase().includes(search) ||
      project.status.toLowerCase().includes(search) ||
      project.tenderType.toLowerCase().includes(search)
    )
  })
})

const filteredClients = computed(() => {
  const search = keyword.value.toLowerCase()

  return clients.value.filter((client) => {
    return (
      client.company.toLowerCase().includes(search) ||
      client.industry.toLowerCase().includes(search) ||
      client.location.toLowerCase().includes(search)
    )
  })
})

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date) {
  if (!date) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function openProjectModal() {
  projectForm.value = {
    name: '',
    client: '',
    team: '',
    contractValue: 0,
    tenderType: 'Tender Umum',
    status: 'Planning',
    startDate: '',
    endDate: '',
  }

  showProjectModal.value = true
}

function closeProjectModal() {
  showProjectModal.value = false
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

function saveProject() {
  if (
    !projectForm.value.name.trim() ||
    !projectForm.value.client ||
    !projectForm.value.team.trim() ||
    !projectForm.value.startDate ||
    !projectForm.value.endDate ||
    Number(projectForm.value.contractValue) <= 0
  ) {
    alert('Lengkapi nama proyek, klien, tim, nilai kontrak, dan periode proyek.')
    return
  }

  if (projectForm.value.endDate < projectForm.value.startDate) {
    alert('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.')
    return
  }

  const newProject = {
    id: Date.now(),
    name: projectForm.value.name,
    client: projectForm.value.client,
    team: projectForm.value.team,
    contractValue: Number(projectForm.value.contractValue),
    status: projectForm.value.status,
    startDate: projectForm.value.startDate,
    endDate: projectForm.value.endDate,
    tenderType: projectForm.value.tenderType,
  }

  financeStore.addProject(newProject)

  const clientExists = financeStore.clients.some(
    (client) => client.company === projectForm.value.client,
  )

  if (!clientExists) {
    financeStore.addClient({
      id: Date.now() + 1,
      company: projectForm.value.client,
      industry: 'Unknown',
      category: 'Prospek',
      location: '-',
      status: 'Aktif',
    })
  }

  closeProjectModal()
  alert('Proyek baru berhasil diinisiasi.')
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">CRM & PORTOFOLIO</p>
        <h1>CRM & Proyek</h1>
        <p>Kelola data klien, proyek berjalan, nilai kontrak, dan tim yang terlibat.</p>
      </div>

      <button
        type="button"
        class="primary-button"
        @click="openProjectModal"
      >
        + Inisiasi Proyek Baru
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
            ? 'Cari proyek, klien, status, atau tender...'
            : 'Cari perusahaan, bidang, atau lokasi...'
        "
      />
    </div>

    <article v-if="activeTab === 'projects'" class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Proyek</h3>
          <p>Menampilkan portofolio dan proyek yang sedang dikerjakan.</p>
        </div>

        <span class="table-count">{{ filteredProjects.length }} proyek</span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Info Proyek</th>
              <th>Klien & Tim</th>
              <th>Nilai Kontrak</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="project in filteredProjects" :key="project.id">
              <td>
                <strong>{{ project.name }}</strong>
                <small class="table-subtext">
                  {{ project.tenderType }} ·
                  {{ formatDate(project.startDate) }} s.d.
                  {{ formatDate(project.endDate) }}
                </small>
              </td>

              <td>
                <strong>{{ project.client }}</strong>
                <small class="table-subtext">{{ project.team }}</small>
              </td>

              <td>{{ formatCurrency(project.contractValue) }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="{ warning: project.status === 'Planning' }"
                >
                  {{ project.status }}
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

            <tr v-if="filteredProjects.length === 0">
              <td colspan="5" class="empty-table">
                Proyek tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article v-else class="panel">
      <div class="panel-header">
        <div>
          <h3>Daftar Klien</h3>
          <p>Data perusahaan klien dan partner bisnis.</p>
        </div>

        <span class="table-count">{{ filteredClients.length }} klien</span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Perusahaan</th>
              <th>Bidang & Kategori</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="client in filteredClients" :key="client.id">
              <td>
                <strong>{{ client.company }}</strong>
              </td>

              <td>
                <strong>{{ client.industry }}</strong>
                <small class="table-subtext">{{ client.category }}</small>
              </td>

              <td>{{ client.location }}</td>

              <td>
                <span class="status-badge">{{ client.status }}</span>
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
          </tbody>
        </table>
      </div>
    </article>

    <div
      v-if="showProjectModal"
      class="modal-backdrop"
      @click.self="closeProjectModal"
    >
      <form class="modal-card" @submit.prevent="saveProject">
        <div class="modal-header">
          <div>
            <p class="eyebrow">INISIASI PROYEK</p>
            <h3>Proyek Baru</h3>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="closeProjectModal"
          >
            ×
          </button>
        </div>

        <div class="form-grid">
          <label class="full-width">
            Nama Proyek
            <input
              v-model="projectForm.name"
              type="text"
              placeholder="Contoh: Implementasi Dashboard Keuangan"
              required
            />
          </label>

          <label>
            Klien / Partner
            <select v-model="projectForm.client" required>
              <option value="">Pilih klien</option>

              <option
                v-for="client in clients"
                :key="client.id"
                :value="client.company"
              >
                {{ client.company }}
              </option>
            </select>
          </label>

          <label>
            Tim Proyek
            <input
              v-model="projectForm.team"
              type="text"
              placeholder="Contoh: Rizka, Andi, Sinta"
              required
            />
          </label>

          <label>
            Nilai Kontrak
            <input
              v-model.number="projectForm.contractValue"
              type="number"
              min="0"
              placeholder="Contoh: 150000000"
              required
            />
          </label>

          <label>
            Jenis Tender
            <select v-model="projectForm.tenderType">
              <option>Tender Umum</option>
              <option>Tender Terbatas</option>
              <option>Penunjukan Langsung</option>
              <option>Pengadaan Langsung</option>
            </select>
          </label>

          <label>
            Status Proyek
            <select v-model="projectForm.status">
              <option>Planning</option>
              <option>Ongoing</option>
              <option>Completed</option>
            </select>
          </label>

          <label>
            Tanggal Mulai
            <input
              v-model="projectForm.startDate"
              type="date"
              required
            />
          </label>

          <label>
            Tanggal Selesai
            <input
              v-model="projectForm.endDate"
              type="date"
              required
            />
          </label>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            @click="closeProjectModal"
          >
            Batal
          </button>

          <button type="submit" class="primary-button">
            Simpan Proyek
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="showProjectDetailModal && selectedProject"
      class="modal-backdrop"
      @click.self="closeProjectDetailModal"
    >
      <section class="modal-card">
        <div class="modal-header">
          <div>
            <p class="eyebrow">DETAIL PROYEK</p>
            <h3>{{ selectedProject.name }}</h3>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="closeProjectDetailModal"
          >
            ×
          </button>
        </div>

        <div class="detail-grid">
          <div>
            <p class="detail-label">Klien</p>
            <p>{{ selectedProject.client }}</p>
          </div>
          <div>
            <p class="detail-label">Tim</p>
            <p>{{ selectedProject.team }}</p>
          </div>
          <div>
            <p class="detail-label">Nilai Kontrak</p>
            <p>{{ formatCurrency(selectedProject.contractValue) }}</p>
          </div>
          <div>
            <p class="detail-label">Status</p>
            <p>{{ selectedProject.status }}</p>
          </div>
          <div>
            <p class="detail-label">Jenis Tender</p>
            <p>{{ selectedProject.tenderType }}</p>
          </div>
          <div>
            <p class="detail-label">Periode</p>
            <p>
              {{ formatDate(selectedProject.startDate) }} s.d.
              {{ formatDate(selectedProject.endDate) }}
            </p>
          </div>
        </div>
      </section>
    </div>

    <div
      v-if="showClientDetailModal && selectedClient"
      class="modal-backdrop"
      @click.self="closeClientDetailModal"
    >
      <section class="modal-card">
        <div class="modal-header">
          <div>
            <p class="eyebrow">DETAIL KLIEN</p>
            <h3>{{ selectedClient.company }}</h3>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="closeClientDetailModal"
          >
            ×
          </button>
        </div>

        <div class="detail-grid">
          <div>
            <p class="detail-label">Industri</p>
            <p>{{ selectedClient.industry }}</p>
          </div>
          <div>
            <p class="detail-label">Kategori</p>
            <p>{{ selectedClient.category }}</p>
          </div>
          <div>
            <p class="detail-label">Lokasi</p>
            <p>{{ selectedClient.location }}</p>
          </div>
          <div>
            <p class="detail-label">Status</p>
            <p>{{ selectedClient.status }}</p>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>