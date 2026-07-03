import { computed, onMounted, ref } from 'vue'
import { masterDataApi } from '@/services/masterDataApi'

const today = new Date().toISOString().slice(0, 10)

function emptyEmployee() {
  return {
    employee_code: '',
    full_name: '',
    nik: '',
    email: '',
    phone: '',
    division_id: '',
    position_id: '',
    employment_type: 'permanent',
    ptkp_status: 'TK/0',
    bpjs_status: 'active',
    employment_status: 'active',
    join_date: today,
    base_salary: 0,
  }
}

function messageFrom(error, fallback) {
  return error?.response?.data?.message || fallback
}

export function useEmployeeMasterData() {
  const employees = ref([])
  const divisions = ref([])
  const positions = ref([])
  const bpjsConfig = ref(null)
  const employeeForm = ref(emptyEmployee())
  const search = ref('')
  const status = ref('all')
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const availablePositions = computed(() => {
    const divisionId = Number(employeeForm.value.division_id)
    return positions.value.filter((position) => {
      return !position.division_id || Number(position.division_id) === divisionId
    })
  })

  async function loadMasterData() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const [employeeRows, divisionRows, positionRows, config] = await Promise.all([
        masterDataApi.getEmployees({ search: search.value || undefined, status: status.value }),
        masterDataApi.getDivisions({ status: 'active' }),
        masterDataApi.getPositions({ status: 'active' }),
        masterDataApi.getBpjsConfig(),
      ])
      employees.value = employeeRows || []
      divisions.value = divisionRows || []
      positions.value = positionRows || []
      bpjsConfig.value = config || null
    } catch (error) {
      errorMessage.value = messageFrom(error, 'Gagal memuat master data pegawai.')
    } finally {
      isLoading.value = false
    }
  }

  function prepareCreate() {
    errorMessage.value = ''
    successMessage.value = ''
    employeeForm.value = emptyEmployee()
  }

  function prepareEdit(employee) {
    errorMessage.value = ''
    successMessage.value = ''
    employeeForm.value = {
      ...emptyEmployee(),
      ...employee,
      division_id: String(employee.division_id || ''),
      position_id: String(employee.position_id || ''),
      base_salary: Number(employee.base_salary || 0),
      join_date: String(employee.join_date || '').slice(0, 10),
    }
  }

  function changeDivision() {
    const position = positions.value.find((item) => Number(item.id) === Number(employeeForm.value.position_id))
    if (position?.division_id && Number(position.division_id) !== Number(employeeForm.value.division_id)) {
      employeeForm.value.position_id = ''
    }
  }

  async function saveEmployee() {
    errorMessage.value = ''
    successMessage.value = ''
    isSaving.value = true

    try {
      const payload = {
        ...employeeForm.value,
        division_id: Number(employeeForm.value.division_id),
        position_id: Number(employeeForm.value.position_id),
        base_salary: Number(employeeForm.value.base_salary || 0),
      }

      const saved = employeeForm.value.id
        ? await masterDataApi.updateEmployee(employeeForm.value.id, payload)
        : await masterDataApi.createEmployee(payload)

      successMessage.value = `Data pegawai ${saved.employee_name || saved.full_name} berhasil disimpan.`
      await loadMasterData()
      prepareCreate()
      return saved
    } catch (error) {
      errorMessage.value = messageFrom(error, 'Gagal menyimpan data pegawai.')
      return null
    } finally {
      isSaving.value = false
    }
  }

  async function updateEmployeeStatus(employee, employmentStatus) {
    errorMessage.value = ''
    successMessage.value = ''
    isSaving.value = true

    try {
      const saved = await masterDataApi.setEmployeeStatus(employee.id, employmentStatus)
      successMessage.value = `Status ${saved.employee_name || saved.full_name} berhasil diperbarui.`
      await loadMasterData()
    } catch (error) {
      errorMessage.value = messageFrom(error, 'Gagal mengubah status pegawai.')
    } finally {
      isSaving.value = false
    }
  }

  onMounted(loadMasterData)

  return {
    employees,
    divisions,
    positions,
    bpjsConfig,
    employeeForm,
    search,
    status,
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
  }
}
