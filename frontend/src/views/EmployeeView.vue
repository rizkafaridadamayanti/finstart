<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const employeeList = computed(() => financeStore.employees)
const bpjsConfig = computed(() => financeStore.bpjsSettings)

const keyword = ref('')
const selectedDivision = ref('Semua')
const selectedEmploymentStatus = ref('Semua')

const showEmployeeModal = ref(false)
const showPayrollModal = ref(false)
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

  return employeeList.value.filter((employee) => {
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

function openPayrollModal(employee) {
  selectedEmployee.value = employee
  showPayrollModal.value = true
}

function closePayrollModal() {
  selectedEmployee.value = null
  showPayrollModal.value = false
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
            <tr v-for="employee in filteredEmployees" :key="employee.id">
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
                  <button class="table-action" @click="openPayrollModal(employee)">
                    Detail
                  </button>

                  <button class="table-action" @click="toggleEmployeeStatus(employee)">
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
      v-if="showPayrollModal && selectedEmployee && selectedPayroll"
      class="modal-backdrop"
      @click.self="closePayrollModal"
    >
      <article class="modal-card payroll-modal">
        <div class="modal-header">
          <div>
            <p class="eyebrow">SIMULASI PENGGAJIAN</p>
            <h3>{{ selectedEmployee.name }}</h3>
          </div>

          <button type="button" class="modal-close" @click="closePayrollModal">
            ×
          </button>
        </div>

        <div class="payroll-profile">
          <p><span>ID Pegawai</span><strong>{{ selectedEmployee.employeeId }}</strong></p>
          <p><span>Jabatan</span><strong>{{ selectedEmployee.position }}</strong></p>
          <p><span>Status Pajak</span><strong>{{ selectedEmployee.taxStatus }}</strong></p>
          <p><span>Status BPJS</span><strong>{{ selectedEmployee.bpjsStatus }}</strong></p>
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
          PPh 21 otomatis belum dihitung. Tombol catat payroll akan membuat jurnal biaya gaji dan mengurangi saldo Bank BCA.
        </p>

        <div class="modal-actions">
          <button class="secondary-button" @click="closePayrollModal">Tutup</button>
          <button class="primary-button" @click="processPayroll">Catat Payroll</button>
        </div>
      </article>
    </div>
  </section>
</template>