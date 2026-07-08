<script setup>
import { computed, ref, watch } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const employeeList = computed(() => financeStore.employees)
const bpjsConfig = computed(() => financeStore.bpjsSettings)

const keyword = ref('')
const selectedDivision = ref('Semua')
const selectedEmploymentStatus = ref('Semua')
const currentPage = ref(1)
const PAGE_SIZE = 10

const showEmployeeModal = ref(false)
const showEmployeeDetailModal = ref(false)
const selectedEmployee = ref(null)

const employeeForm = ref({
  employeeId: '',
  name: '',
  division: 'Technology',
  position: '',
  employmentStatus: 'Tetap',
  joinDate: '',
  baseSalary: 0,
  taxStatus: 'TK/0',
  bpjsStatus: 'Terdaftar',
})

const activeEmployees = computed(() => {
  return employeeList.value.filter((employee) => employee.active)
})

const filteredEmployees = computed(() => {
  const search = keyword.value.toLowerCase()

  const filtered = employeeList.value.filter((employee) => {
    const matchesKeyword =
      employee.name.toLowerCase().includes(search) ||
      employee.employeeId.toLowerCase().includes(search) ||
      employee.position.toLowerCase().includes(search) ||
      employee.division.toLowerCase().includes(search)

    const matchesDivision =
      selectedDivision.value === 'Semua' ||
      employee.division === selectedDivision.value

    const matchesEmploymentStatus =
      selectedEmploymentStatus.value === 'Semua' ||
      employee.employmentStatus === selectedEmploymentStatus.value

    return matchesKeyword && matchesDivision && matchesEmploymentStatus
  })

  // Sort by newest first using joinDate or created_at if available
  return [...filtered].sort((a, b) => {
    const dateA = a.joinDate ? new Date(a.joinDate) : (a.created_at ? new Date(a.created_at) : new Date(0))
    const dateB = b.joinDate ? new Date(b.joinDate) : (b.created_at ? new Date(b.created_at) : new Date(0))
    return dateB - dateA
  })
})

const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredEmployees.value.slice(start, start + PAGE_SIZE)
})

// Reset to page 1 when filters change
watch([keyword, selectedDivision, selectedEmploymentStatus], () => {
  currentPage.value = 1
})

const registeredBpjsCount = computed(() => {
  return activeEmployees.value.filter(
    (employee) => employee.bpjsStatus === 'Terdaftar',
  ).length
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

function calculatePayroll(employee) {
  const baseSalary = Number(employee.baseSalary)

  const healthCompany =
    (baseSalary * Number(bpjsConfig.value.healthCompanyRate)) / 100

  const healthEmployee =
    (baseSalary * Number(bpjsConfig.value.healthEmployeeRate)) / 100

  const jhtCompany =
    (baseSalary * Number(bpjsConfig.value.jhtCompanyRate)) / 100

  const jhtEmployee =
    (baseSalary * Number(bpjsConfig.value.jhtEmployeeRate)) / 100

  const jpCompany =
    (baseSalary * Number(bpjsConfig.value.jpCompanyRate)) / 100

  const jpEmployee =
    (baseSalary * Number(bpjsConfig.value.jpEmployeeRate)) / 100

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

function getNewEmployeeId() {
  const number = String(employeeList.value.length + 1).padStart(3, '0')
  return `EMP-${number}`
}

function openEmployeeModal() {
  employeeForm.value = {
    employeeId: getNewEmployeeId(),
    name: '',
    division: 'Technology',
    position: '',
    employmentStatus: 'Tetap',
    joinDate: '',
    baseSalary: 0,
    taxStatus: 'TK/0',
    bpjsStatus: 'Terdaftar',
  }

  showEmployeeModal.value = true
}

function closeEmployeeModal() {
  showEmployeeModal.value = false
}

function addEmployee() {
  if (
    !employeeForm.value.name.trim() ||
    !employeeForm.value.position.trim() ||
    !employeeForm.value.joinDate ||
    Number(employeeForm.value.baseSalary) <= 0
  ) {
    alert('Lengkapi nama, jabatan, tanggal bergabung, dan gaji pokok.')
    return
  }

  financeStore.addEmployee({
    employeeId: employeeForm.value.employeeId,
    name: employeeForm.value.name,
    division: employeeForm.value.division,
    position: employeeForm.value.position,
    employmentStatus: employeeForm.value.employmentStatus,
    joinDate: employeeForm.value.joinDate,
    baseSalary: Number(employeeForm.value.baseSalary),
    taxStatus: employeeForm.value.taxStatus,
    bpjsStatus: employeeForm.value.bpjsStatus,
    active: true,
  })

  closeEmployeeModal()
  alert('Data pegawai berhasil ditambahkan.')
}

function openEmployeeDetail(employee) {
  selectedEmployee.value = employee
  showEmployeeDetailModal.value = true
}

function closeEmployeeDetail() {
  selectedEmployee.value = null
  showEmployeeDetailModal.value = false
}

function toggleEmployeeStatus(employee) {
  financeStore.toggleEmployeeStatus(employee.id)
}

function processPayroll() {
  if (!selectedEmployee.value || !selectedPayroll.value) return

  const result = financeStore.processPayroll({
    employeeId: selectedEmployee.value.id,
    paymentDate: new Date().toISOString().slice(0, 10),
    netSalary: selectedPayroll.value.netSalary,
    paymentRef: `PAYROLL-${selectedEmployee.value.employeeId}`,
  })

  if (!result.ok) {
    alert(result.message)
    return
  }

  alert('Payroll berhasil dicatat ke jurnal. Beban, kas, Dashboard, laporan, dan AI sudah diperbarui.')
  closePayrollModal()
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

      <button class="primary-button" @click="openEmployeeModal">
        + Tambah Pegawai
      </button>
    </div>

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

        <span class="table-count">Prototype payroll</span>
      </div>

      <div class="rate-grid">
        <label>
          BPJS Kesehatan Perusahaan (%)
          <input v-model.number="bpjsConfig.healthCompanyRate" type="number" min="0" step="0.1" />
        </label>

        <label>
          BPJS Kesehatan Pegawai (%)
          <input v-model.number="bpjsConfig.healthEmployeeRate" type="number" min="0" step="0.1" />
        </label>

        <label>
          JHT Perusahaan (%)
          <input v-model.number="bpjsConfig.jhtCompanyRate" type="number" min="0" step="0.1" />
        </label>

        <label>
          JHT Pegawai (%)
          <input v-model.number="bpjsConfig.jhtEmployeeRate" type="number" min="0" step="0.1" />
        </label>

        <label>
          JP Perusahaan (%)
          <input v-model.number="bpjsConfig.jpCompanyRate" type="number" min="0" step="0.1" />
        </label>

        <label>
          JP Pegawai (%)
          <input v-model.number="bpjsConfig.jpEmployeeRate" type="number" min="0" step="0.1" />
        </label>
      </div>
    </article>

    <div class="module-toolbar">
      <div class="filter-group">
        <input
          v-model="keyword"
          class="module-search"
          type="text"
          placeholder="Cari nama, ID pegawai, jabatan, atau divisi..."
        />

        <select v-model="selectedDivision" class="filter-select">
          <option>Semua</option>
          <option>Technology</option>
          <option>Design</option>
          <option>Marketing</option>
          <option>Operations</option>
          <option>Finance</option>
        </select>

        <select v-model="selectedEmploymentStatus" class="filter-select">
          <option>Semua</option>
          <option>Tetap</option>
          <option>Kontrak</option>
          <option>Magang</option>
        </select>
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
            <tr v-for="employee in paginatedEmployees" :key="employee.id">
              <td>
                <strong>{{ employee.name }}</strong>
                <small class="table-subtext">
                  {{ employee.employeeId }} · Bergabung {{ formatDate(employee.joinDate) }}
                </small>
              </td>

              <td>
                <strong>{{ employee.position }}</strong>
                <small class="table-subtext">{{ employee.division }}</small>
              </td>

              <td>
                <span class="account-type">
                  {{ employee.employmentStatus }}
                </span>
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="{ warning: employee.bpjsStatus === 'Belum Terdaftar' }"
                >
                  {{ employee.bpjsStatus }}
                </span>
              </td>

              <td>{{ formatCurrency(employee.baseSalary) }}</td>

              <td>
                <strong>{{ formatCurrency(calculatePayroll(employee).netSalary) }}</strong>
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="{ danger: !employee.active }"
                >
                  {{ employee.active ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>

              <td>
                <div class="inline-actions">
                  <button class="table-action" type="button" @click="openEmployeeDetail(employee)">
                    Detail
                  </button>

                  <button class="table-action" type="button" @click="toggleEmployeeStatus(employee)">
                    {{ employee.active ? 'Nonaktifkan' : 'Aktifkan' }}
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredEmployees.length === 0">
              <td colspan="8" class="empty-table">
                Data pegawai tidak ditemukan.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between p-4 border-t border-[#E8EEF7]">
          <div class="text-xs text-[#6B7A90]">
            Menampilkan {{ Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredEmployees.length) }} - {{ Math.min(currentPage * PAGE_SIZE, filteredEmployees.length) }} dari {{ filteredEmployees.length }} data
          </div>
          <div class="flex items-center gap-2">
            <button
              :disabled="currentPage <= 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
              class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg class="w-3 h-3 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              Prev
            </button>
            <button
              :disabled="currentPage >= Math.ceil(filteredEmployees.length / PAGE_SIZE)"
              @click="currentPage = currentPage + 1"
              class="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#D8E5F4] text-[#0B1F4A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <svg class="w-3 h-3 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </article>

    <div
      v-if="showEmployeeModal"
      class="modal-backdrop"
      @click.self="closeEmployeeModal"
    >
      <form class="modal-card" @submit.prevent="addEmployee">
        <div class="modal-header">
          <div>
            <p class="eyebrow">DATA PEGAWAI</p>
            <h3>Tambah Pegawai Baru</h3>
          </div>

          <button type="button" class="modal-close" @click="closeEmployeeModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label>
            ID Pegawai
            <input v-model="employeeForm.employeeId" type="text" readonly />
          </label>

          <label>
            Nama Lengkap
            <input
              v-model="employeeForm.name"
              type="text"
              placeholder="Contoh: Rizka Farida"
              required
            />
          </label>

          <label>
            Divisi
            <select v-model="employeeForm.division">
              <option>Technology</option>
              <option>Design</option>
              <option>Marketing</option>
              <option>Operations</option>
              <option>Finance</option>
            </select>
          </label>

          <label>
            Jabatan
            <input
              v-model="employeeForm.position"
              type="text"
              placeholder="Contoh: Frontend Developer"
              required
            />
          </label>

          <label>
            Status Kerja
            <select v-model="employeeForm.employmentStatus">
              <option>Tetap</option>
              <option>Kontrak</option>
              <option>Magang</option>
            </select>
          </label>

          <label>
            Tanggal Bergabung
            <input v-model="employeeForm.joinDate" type="date" required />
          </label>

          <label>
            Gaji Pokok Bulanan
            <input
              v-model.number="employeeForm.baseSalary"
              type="number"
              min="0"
              placeholder="Contoh: 7000000"
              required
            />
          </label>

          <label>
            Status Pajak
            <select v-model="employeeForm.taxStatus">
              <option>TK/0</option>
              <option>K/0</option>
              <option>K/1</option>
              <option>K/2</option>
              <option>K/3</option>
            </select>
          </label>

          <label class="full-width">
            Status Kepesertaan BPJS
            <select v-model="employeeForm.bpjsStatus">
              <option>Terdaftar</option>
              <option>Belum Terdaftar</option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeEmployeeModal">
            Batal
          </button>

          <button type="submit" class="primary-button">
            Simpan Pegawai
          </button>
        </div>
      </form>
    </div>

    <div
      v-if="showEmployeeDetailModal && selectedEmployee && selectedPayroll"
      class="modal-backdrop"
      @click.self="closeEmployeeDetail"
    >
      <form class="modal-card payroll-modal" @submit.prevent>
        <div class="modal-header">
          <div>
            <p class="eyebrow">DETAIL PEGAWAI</p>
            <h3>{{ selectedEmployee.name }}</h3>
            <p class="modal-subtitle">Detail lengkap pegawai dan ringkasan gaji dalam tampilan formulir.</p>
          </div>

          <button type="button" class="modal-close" @click="closeEmployeeDetail">
            ×
          </button>
        </div>

        <div class="detail-form-grid">
          <label>
            ID Pegawai
            <input type="text" :value="selectedEmployee.employeeId" readonly />
          </label>

          <label>
            Jabatan
            <input type="text" :value="selectedEmployee.position" readonly />
          </label>

          <label>
            Divisi
            <input type="text" :value="selectedEmployee.division" readonly />
          </label>

          <label>
            Status Kerja
            <input type="text" :value="selectedEmployee.employmentStatus" readonly />
          </label>

          <label>
            Tanggal Bergabung
            <input type="text" :value="formatDate(selectedEmployee.joinDate)" readonly />
          </label>

          <label>
            Status Pajak
            <input type="text" :value="selectedEmployee.taxStatus" readonly />
          </label>

          <label>
            Status BPJS
            <input type="text" :value="selectedEmployee.bpjsStatus" readonly />
          </label>

          <label>
            Gaji Pokok
            <input type="text" :value="formatCurrency(selectedEmployee.baseSalary)" readonly />
          </label>
        </div>

        <div class="detail-form-grid section-separator">
          <label class="full-width">
            Estimasi Gaji Bersih
            <input type="text" :value="formatCurrency(selectedPayroll.netSalary)" readonly />
          </label>

          <label>
            Potongan BPJS Kesehatan
            <input type="text" :value="formatCurrency(selectedPayroll.healthEmployee)" readonly />
          </label>

          <label>
            Potongan JHT
            <input type="text" :value="formatCurrency(selectedPayroll.jhtEmployee)" readonly />
          </label>

          <label>
            Potongan JP
            <input type="text" :value="formatCurrency(selectedPayroll.jpEmployee)" readonly />
          </label>

          <label class="full-width">
            Kontribusi Perusahaan BPJS/JHT/JP
            <input type="text" :value="formatCurrency(selectedPayroll.employerContribution)" readonly />
          </label>
        </div>

        <p class="payroll-note">
          Informasi ini hanya ringkasan detail pegawai dan estimasi gaji. PPh 21 belum termasuk dalam perhitungan.
        </p>

        <div class="modal-actions">
          <button type="button" class="primary-button" @click="closeEmployeeDetail">Tutup</button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 17, 41, 0.78);
  padding: 1.5rem;
}

.modal-card {
  width: min(100%, 920px);
  max-height: calc(100vh - 3rem);
  overflow-y: auto;
  border-radius: 32px;
  background: #ffffff;
  border: 1px solid rgba(15, 36, 75, 0.08);
  box-shadow: 0 30px 75px rgba(15, 36, 75, 0.18);
  padding: 2rem;
}

.modal-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0.5rem 0 0;
  font-size: 1.75rem;
  color: #102A56;
}

.modal-subtitle {
  margin-top: 0.35rem;
  color: #5F6F8C;
  font-size: 0.95rem;
  max-width: 44rem;
}

.modal-close {
  border: none;
  background: rgba(15, 36, 75, 0.04);
  color: #102A56;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;
}

.detail-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-form-grid label {
  display: grid;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #4B5B7A;
}

.detail-form-grid input {
  width: 100%;
  border: 1px solid #DCE7F4;
  border-radius: 16px;
  background: #F8FBFE;
  color: #102A56;
  padding: 0.95rem 1rem;
  font-size: 0.96rem;
}

.full-width {
  grid-column: span 2;
}

.section-separator {
  padding-top: 0.8rem;
  border-top: 1px solid #E8EEF7;
}

.payroll-note {
  color: #5F6F8C;
  font-size: 0.95rem;
  line-height: 1.7;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  gap: 0.75rem;
}

.primary-button,
.secondary-button,
.table-action {
  cursor: pointer;
}
</style>