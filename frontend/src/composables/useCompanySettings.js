import { onMounted, ref } from 'vue'
import { masterDataApi } from '@/services/masterDataApi'

function emptySettings() {
  return {
    company_name: '',
    logo_url: '',
    address: '',
    email: '',
    phone: '',
    npwp: '',
    fiscal_year: new Date().getFullYear(),
    currency: 'IDR',
    city: '',
    province: '',
    postal_code: '',
    website: '',
  }
}

function emptyBpjsConfig() {
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

function messageFrom(error, fallback) {
  return error?.response?.data?.message || fallback
}

export function useCompanySettings() {
  const companyForm = ref(emptySettings())
  const bpjsForm = ref(emptyBpjsConfig())
  const isLoading = ref(false)
  const isSavingCompany = ref(false)
  const isSavingBpjs = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  async function loadSettings() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const [company, bpjs] = await Promise.all([
        masterDataApi.getCompanySettings(),
        masterDataApi.getBpjsConfig(),
      ])

      companyForm.value = { ...emptySettings(), ...(company || {}) }
      bpjsForm.value = { ...emptyBpjsConfig(), ...(bpjs || {}) }
      bpjsForm.value.effective_date = String(bpjsForm.value.effective_date || '').slice(0, 10)
    } catch (error) {
      errorMessage.value = messageFrom(error, 'Gagal memuat pengaturan perusahaan.')
    } finally {
      isLoading.value = false
    }
  }

  async function saveCompanySettings() {
    isSavingCompany.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await masterDataApi.updateCompanySettings({
        ...companyForm.value,
        fiscal_year: Number(companyForm.value.fiscal_year),
      })
      successMessage.value = 'Pengaturan perusahaan berhasil disimpan ke database.'
    } catch (error) {
      errorMessage.value = messageFrom(error, 'Gagal menyimpan pengaturan perusahaan.')
    } finally {
      isSavingCompany.value = false
    }
  }

  async function saveBpjsConfig() {
    isSavingBpjs.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await masterDataApi.updateBpjsConfig({
        ...bpjsForm.value,
        health_company_rate: Number(bpjsForm.value.health_company_rate || 0),
        health_employee_rate: Number(bpjsForm.value.health_employee_rate || 0),
        jht_company_rate: Number(bpjsForm.value.jht_company_rate || 0),
        jht_employee_rate: Number(bpjsForm.value.jht_employee_rate || 0),
        jp_company_rate: Number(bpjsForm.value.jp_company_rate || 0),
        jp_employee_rate: Number(bpjsForm.value.jp_employee_rate || 0),
      })
      successMessage.value = 'Konfigurasi BPJS berhasil disimpan ke database.'
    } catch (error) {
      errorMessage.value = messageFrom(error, 'Gagal menyimpan konfigurasi BPJS.')
    } finally {
      isSavingBpjs.value = false
    }
  }

  onMounted(loadSettings)

  return {
    companyForm,
    bpjsForm,
    isLoading,
    isSavingCompany,
    isSavingBpjs,
    errorMessage,
    successMessage,
    loadSettings,
    saveCompanySettings,
    saveBpjsConfig,
  }
}
