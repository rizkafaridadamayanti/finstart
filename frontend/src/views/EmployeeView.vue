<script setup>
import { computed, ref, watch } from 'vue'
import { masterDataApi } from '@/services/masterDataApi'
import { useEmployeeMasterData } from '@/composables/useEmployeeMasterData'

const {
  employees,
  divisions,
  bpjsConfig,
  employeeForm,
  isLoading,
  isSaving,
  errorMessage,
  successMessage,
  availablePositions,
  loadMasterData,
  prepareCreate,
  prepareEdit,
  changeDivision,
  saveEmployee,
  updateEmployeeStatus,
} = useEmployeeMasterData()

const keyword = ref('')
const selectedDivision = ref('all')
const selectedEmploymentType = ref('all')

const showEmployeeModal = ref(false)
const showPayrollModal = ref(false)
const selectedEmployee = ref(null)
const isSavingBpjs = ref(false)

const bpjsForm = ref(emptyBpjsForm())

function emptyBpjsForm() {
  return {
    health_company_rate: 0,
    health_employee_rate: 0,
    jht_company_rate: 0,
    jht_employee_rate: 0,
    jp_company_rate: 0,
    jp_employee_rate: 0,
    effective_date: new Date().toISOString().slice(0, 10),
    notes: '',
  }
}

watch(
  bpjsConfig,
  (config) => {
    bpjsForm.value = {
      ...emptyBpjsForm(),
      ...(config || {}),
      effective_date: String(config?.effective_date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    }
  },
  { immediate: true },
)

const activeEmployees = computed(() => {
  return employees.value.filter((employee) => employee.employment_status === 'active')
})

const filteredEmployees = computed(() => {
  const search = keyword.value.toLowerCase().trim()

  return employees.value.filter((employee) => {
    const matchesKeyword =
      !search ||
      [
        employee.full_name,
        employee.employee_code,
        employee.nik,
        employee.position_name,
        employee.division_name,
      ].some((value) => String(value || '').toLowerCase().includes(search))

    const matchesDivision =
      selectedDivision.value === 'all' ||
      Number(employee.division_id) === Number(selectedDivision.value)

    const matchesEmploymentType =
      selectedEmploymentType.value === 'all' ||
      employee.employment_type === selectedEmploymentType.value

    return matchesKeyword && matchesDivision && matchesEmploymentType
  })
})

const registeredBpjsCount = computed(() => {
  return activeEmployees.value.filter((employee) => employee.bpjs_status === 'active').length
})

const totalEstimatedNetSalary = computed(() => {
  return activeEmployees.value.reduce((total, employee) => {
    return total + calculatePayroll(employee).netSalary
  }, 0)
})

const selectedPayroll = computed(() => {
  if (!selectedEmployee.value) return null
  return calculatePayroll(selectedEmployee.value)
})

const isEditing = computed(() => Boolean(employeeForm.value.id))

function numberValue(value) {
  return Number(value || 0)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(numberValue(value))
}

function formatDate(value) {
  if (!value) return '-'

  const text = String(value).slice(0, 10)
  const [year, month, day] = text.split('-')

  if (!year || !month || !day) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(Number(year), Number(month) - 1, Number(day)))
}

function employmentTypeLabel(type) {
  const labels = {
    permanent: 'Tetap',
    contract: 'Kontrak',
    intern: 'Magang',
    freelance: 'Freelance',
    daily: 'Harian',
  }

  return labels[type] || type || '-'
}

function bpjsStatusLabel(status) {
  return status === 'active' ? 'Terdaftar' : 'Belum Terdaftar'
}

function employmentStatusLabel(status) {
  return status === 'active' ? 'Aktif' : 'Tidak Aktif'
}

function calculatePayroll(employee) {
  const baseSalary = numberValue(employee.base_salary)
  const isBpjsActive = employee.bpjs_status === 'active'

  const healthCompany = isBpjsActive
    ? (baseSalary * numberValue(bpjsForm.value.health_company_rate)) / 100
    : 0
  const healthEmployee = isBpjsActive
    ? (baseSalary * numberValue(bpjsForm.value.health_employee_rate)) / 100
    : 0
  const jhtCompany = isBpjsActive
    ? (baseSalary * numberValue(bpjsForm.value.jht_company_rate)) / 100
    : 0
  const jhtEmployee = isBpjsActive
    ? (baseSalary * numberValue(bpjsForm.value.jht_employee_rate)) / 100
    : 0
  const jpCompany = isBpjsActive
    ? (baseSalary * numberValue(bpjsForm.value.jp_company_rate)) / 100
    : 0
  const jpEmployee = isBpjsActive
    ? (baseSalary * numberValue(bpjsForm.value.jp_employee_rate)) / 100
    : 0

  const employeeDeduction = healthEmployee + jhtEmployee + jpEmployee

  return {
    baseSalary,
    healthCompany,
    healthEmployee,
    jhtCompany,
    jhtEmployee,
    jpCompany,
    jpEmployee,
    employerContribution: healthCompany + jhtCompany + jpCompany,
    employeeDeduction,
    netSalary: baseSalary - employeeDeduction,
  }
}

function openEmployeeModal() {
  prepareCreate()
  showEmployeeModal.value = true
}

function openEditModal(employee) {
  prepareEdit(employee)
  showEmployeeModal.value = true
}

function closeEmployeeModal() {
  showEmployeeModal.value = false
  prepareCreate()
}

async function submitEmployee() {
  const saved = await saveEmployee()

  if (saved) {
    showEmployeeModal.value = false
  }
}

function openPayrollModal(employee) {
  selectedEmployee.value = employee
  showPayrollModal.value = true
}

function closePayrollModal() {
  selectedEmployee.value = null
  showPayrollModal.value = false
}

async function toggleEmployeeStatus(employee) {
  const nextStatus =
    employee.employment_status === 'active' ? 'inactive' : 'active'

  const label = nextStatus === 'active' ? 'mengaktifkan' : 'menonaktifkan'
  const confirmed = window.confirm(
    `Yakin ingin ${label} ${employee.full_name}?`,
  )

  if (!confirmed) return

  await updateEmployeeStatus(employee, nextStatus)
}

async function saveBpjs() {
  errorMessage.value = ''
  successMessage.value = ''
  isSavingBpjs.value = true

  try {
    await masterDataApi.updateBpjsConfig({
      ...bpjsForm.value,
      health_company_rate: numberValue(bpjsForm.value.health_company_rate),
      health_employee_rate: numberValue(bpjsForm.value.health_employee_rate),
      jht_company_rate: numberValue(bpjsForm.value.jht_company_rate),
      jht_employee_rate: numberValue(bpjsForm.value.jht_employee_rate),
      jp_company_rate: numberValue(bpjsForm.value.jp_company_rate),
      jp_employee_rate: numberValue(bpjsForm.value.jp_employee_rate),
    })

    successMessage.value = 'Konfigurasi BPJS berhasil disimpan ke database.'
    await loadMasterData()
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      'Gagal menyimpan konfigurasi BPJS.'
  } finally {
    isSavingBpjs.value = false
  }
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">HUMAN RESOURCE</p>
        <h1>SDM</h1>
        <p>
          Kelola data pegawai, status kepatuhan BPJS, jabatan, dan simulasi penggajian.
        </p>
      </div>

      <button class="primary-button" :disabled="isSaving" @click="openEmployeeModal">
        + Tambah Pegawai
      </button>
    </div>

    <article v-if="errorMessage" class="receivable-message error-message">
      {{ errorMessage }}
    </article>

    <article v-if="successMessage" class="receivable-message success-message">
      {{ successMessage }}
    </article>

    <div class="employee-metrics">
      <article class="employee-stat">
        <p>Pegawai Aktif</p>
        <h2>{{ activeEmployees.length }} Pegawai</h2>
        <small>Total pegawai dengan status aktif</small>
      </article>

      <article class="employee-stat">
        <p>Estimasi Gaji Bersih</p>
        <h2>{{ formatCurrency(totalEstimatedNetSalary) }}</h2>
        <small>Simulasi gaji setelah potongan BPJS pegawai</small>
      </article>

      <article class="employee-stat">
        <p>Kepatuhan BPJS</p>
        <h2>{{ registeredBpjsCount }}/{{ activeEmployees.length }}</h2>
        <small>Pegawai aktif yang sudah terdaftar BPJS</small>
      </article>
    </div>

    <article class="panel bpjs-panel">
      <div class="panel-header">
        <div>
          <h3>Konfigurasi BPJS</h3>
          <p>
            Persentase ini digunakan untuk simulasi potongan dan kontribusi perusahaan.
          </p>
        </div>

        <button
          type="button"
          class="secondary-button"
          :disabled="isSavingBpjs"
          @click="saveBpjs"
        >
          {{ isSavingBpjs ? 'Menyimpan...' : 'Simpan Konfigurasi' }}
        </button>
      </div>

      <div class="rate-grid">
        <label>
          BPJS Kesehatan Perusahaan (%)
          <input v-model.number="bpjsForm.health_company_rate" type="number" min="0" max="100" step="0.01" />
        </label>

        <label>
          BPJS Kesehatan Pegawai (%)
          <input v-model.number="bpjsForm.health_employee_rate" type="number" min="0" max="100" step="0.01" />
        </label>

        <label>
          JHT Perusahaan (%)
          <input v-model.number="bpjsForm.jht_company_rate" type="number" min="0" max="100" step="0.01" />
        </label>

        <label>
          JHT Pegawai (%)
          <input v-model.number="bpjsForm.jht_employee_rate" type="number" min="0" max="100" step="0.01" />
        </label>

        <label>
          JP Perusahaan (%)
          <input v-model.number="bpjsForm.jp_company_rate" type="number" min="0" max="100" step="0.01" />
        </label>

        <label>
          JP Pegawai (%)
          <input v-model.number="bpjsForm.jp_employee_rate" type="number" min="0" max="100" step="0.01" />
        </label>
      </div>
    </article>

    <div class="module-toolbar">
      <div class="filter-group">
        <input
          v-model="keyword"
          class="module-search"
          type="text"
          placeholder="Cari nama, kode pegawai, NIK, jabatan, atau divisi..."
        />

        <select v-model="selectedDivision" class="filter-select">
          <option value="all">Semua Divisi</option>
          <option
            v-for="division in divisions"
            :key="division.id"
            :value="String(division.id)"
          >
            {{ division.name }}
          </option>
        </select>

        <select v-model="selectedEmploymentType" class="filter-select">
          <option value="all">Semua Jenis Kerja</option>
          <option value="permanent">Tetap</option>
          <option value="contract">Kontrak</option>
          <option value="intern">Magang</option>
          <option value="freelance">Freelance</option>
          <option value="daily">Harian</option>
        </select>

        <button
          type="button"
          class="table-action"
          :disabled="isLoading"
          @click="loadMasterData"
        >
          {{ isLoading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>

      <span class="table-count">{{ filteredEmployees.length }} pegawai</span>
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Data Pegawai</h3>
          <p>Data identitas pegawai, jabatan, BPJS, serta estimasi gaji bersih.</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Pegawai</th>
              <th>Divisi & Jabatan</th>
              <th>Status Kerja</th>
              <th>BPJS</th>
              <th>Gaji Pokok</th>
              <th>Estimasi Gaji Bersih</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="employee in filteredEmployees" :key="employee.id">
              <td>
                <strong>{{ employee.full_name }}</strong>
                <small class="table-subtext">
                  {{ employee.employee_code }} · Bergabung {{ formatDate(employee.join_date) }}
                </small>
              </td>

              <td>
                <strong>{{ employee.position_name || '-' }}</strong>
                <small class="table-subtext">{{ employee.division_name || '-' }}</small>
              </td>

              <td>
                <span class="account-type">
                  {{ employmentTypeLabel(employee.employment_type) }}
                </span>
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="{ warning: employee.bpjs_status !== 'active' }"
                >
                  {{ bpjsStatusLabel(employee.bpjs_status) }}
                </span>
              </td>

              <td>{{ formatCurrency(employee.base_salary) }}</td>

              <td>
                <strong>{{ formatCurrency(calculatePayroll(employee).netSalary) }}</strong>
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="{ danger: employee.employment_status !== 'active' }"
                >
                  {{ employmentStatusLabel(employee.employment_status) }}
                </span>
              </td>

              <td>
                <div class="inline-actions">
                  <button class="table-action" :disabled="isSaving" @click="openEditModal(employee)">
                    Edit
                  </button>

                  <button class="table-action" @click="openPayrollModal(employee)">
                    Detail
                  </button>

                  <button
                    class="table-action"
                    :disabled="isSaving"
                    @click="toggleEmployeeStatus(employee)"
                  >
                    {{ employee.employment_status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!isLoading && filteredEmployees.length === 0">
              <td colspan="8" class="empty-table">
                Data pegawai tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div
      v-if="showEmployeeModal"
      class="modal-backdrop"
      @click.self="closeEmployeeModal"
    >
      <form class="modal-card" @submit.prevent="submitEmployee">
        <div class="modal-header">
          <div>
            <p class="eyebrow">DATA PEGAWAI</p>
            <h3>{{ isEditing ? 'Edit Pegawai' : 'Tambah Pegawai Baru' }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closeEmployeeModal">
            ×
          </button>
        </div>

        <article v-if="errorMessage" class="receivable-message error-message">
          {{ errorMessage }}
        </article>
        
        <div class="form-grid">
          <label>
            Kode Pegawai <span class="optional-label">(otomatis bila kosong)</span>
            <input
              v-model="employeeForm.employee_code"
              type="text"
              placeholder="Contoh: EMP/202607/001"
            />
          </label>

          <label>
            Nama Lengkap
            <input
              v-model="employeeForm.full_name"
              type="text"
              placeholder="Contoh: Rizka Farida"
              required
            />
          </label>

          <label>
            NIK
            <input
              v-model="employeeForm.nik"
              type="text"
              inputmode="numeric"
              placeholder="16 digit NIK"
              required
            />
          </label>

          <label>
            Email <span class="optional-label">(opsional)</span>
            <input
              v-model="employeeForm.email"
              type="email"
              placeholder="pegawai@perusahaan.id"
            />
          </label>

          <label>
            Nomor Telepon <span class="optional-label">(opsional)</span>
            <input
              v-model="employeeForm.phone"
              type="text"
              placeholder="+62"
            />
          </label>

          <label>
            Divisi
            <select
              v-model="employeeForm.division_id"
              required
              @change="changeDivision"
            >
              <option value="">Pilih divisi</option>
              <option
                v-for="division in divisions"
                :key="division.id"
                :value="String(division.id)"
              >
                {{ division.name }}
              </option>
            </select>
          </label>

          <label>
            Jabatan
            <select v-model="employeeForm.position_id" required>
              <option value="">Pilih jabatan</option>
              <option
                v-for="position in availablePositions"
                :key="position.id"
                :value="String(position.id)"
              >
                {{ position.name }}
              </option>
            </select>
          </label>

          <label>
            Jenis Kerja
            <select v-model="employeeForm.employment_type">
              <option value="permanent">Tetap</option>
              <option value="contract">Kontrak</option>
              <option value="intern">Magang</option>
              <option value="freelance">Freelance</option>
              <option value="daily">Harian</option>
            </select>
          </label>

          <label>
            Tanggal Bergabung
            <input v-model="employeeForm.join_date" type="date" required />
          </label>

          <label>
            Gaji Pokok Bulanan
            <input
              v-model.number="employeeForm.base_salary"
              type="number"
              min="0"
              placeholder="Contoh: 7000000"
              required
            />
          </label>

          <label>
            Status PTKP
            <select v-model="employeeForm.ptkp_status">
              <option>TK/0</option>
              <option>TK/1</option>
              <option>TK/2</option>
              <option>TK/3</option>
              <option>K/0</option>
              <option>K/1</option>
              <option>K/2</option>
              <option>K/3</option>
            </select>
          </label>

          <label>
            Status Kepesertaan BPJS
            <select v-model="employeeForm.bpjs_status">
              <option value="active">Terdaftar</option>
              <option value="inactive">Belum Terdaftar</option>
            </select>
          </label>

          <label v-if="isEditing">
            Status Pegawai
            <select v-model="employeeForm.employment_status">
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="isSaving" @click="closeEmployeeModal">
            Batal
          </button>

          <button type="submit" class="primary-button" :disabled="isSaving">
            {{ isSaving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Pegawai' }}
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="showPayrollModal && selectedEmployee && selectedPayroll"
      class="modal-backdrop"
      @click.self="closePayrollModal"
    >
      <article class="modal-card payroll-modal">
        <div class="modal-header">
          <div>
            <p class="eyebrow">SIMULASI PENGGAJIAN</p>
            <h3>{{ selectedEmployee.full_name }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closePayrollModal">
            ×
          </button>
        </div>

        <div class="payroll-profile">
          <p><span>Kode Pegawai</span><strong>{{ selectedEmployee.employee_code }}</strong></p>
          <p><span>Jabatan</span><strong>{{ selectedEmployee.position_name || '-' }}</strong></p>
          <p><span>Status PTKP</span><strong>{{ selectedEmployee.ptkp_status }}</strong></p>
          <p><span>Status BPJS</span><strong>{{ bpjsStatusLabel(selectedEmployee.bpjs_status) }}</strong></p>
        </div>

        <div class="payroll-breakdown">
          <div>
            <span>Gaji Pokok</span>
            <strong>{{ formatCurrency(selectedPayroll.baseSalary) }}</strong>
          </div>

          <div>
            <span>Potongan BPJS Kesehatan Pegawai</span>
            <strong>- {{ formatCurrency(selectedPayroll.healthEmployee) }}</strong>
          </div>

          <div>
            <span>Potongan JHT Pegawai</span>
            <strong>- {{ formatCurrency(selectedPayroll.jhtEmployee) }}</strong>
          </div>

          <div>
            <span>Potongan JP Pegawai</span>
            <strong>- {{ formatCurrency(selectedPayroll.jpEmployee) }}</strong>
          </div>

          <div class="payroll-net">
            <span>Estimasi Gaji Bersih</span>
            <strong>{{ formatCurrency(selectedPayroll.netSalary) }}</strong>
          </div>

          <div class="payroll-company">
            <span>Kontribusi Perusahaan BPJS/JHT/JP</span>
            <strong>{{ formatCurrency(selectedPayroll.employerContribution) }}</strong>
          </div>
        </div>

        <p class="payroll-note">
          Ini adalah simulasi dari master pegawai dan konfigurasi BPJS database. Pencatatan jurnal payroll belum dilakukan karena endpoint payroll belum dibuat.
        </p>

        <div class="modal-actions">
          <button class="secondary-button" @click="closePayrollModal">Tutup</button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.receivable-message {
  margin-bottom: 16px;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
}
.error-message {
  border: 1px solid #f3c7c7;
  background: #fff6f6;
  color: #a84343;
}
.success-message {
  border: 1px solid #bfe8d0;
  background: #f1fff6;
  color: #23774b;
}
.optional-label {
  color: #8d9cb3;
  font-size: 10px;
  font-weight: 500;
}
</style>
