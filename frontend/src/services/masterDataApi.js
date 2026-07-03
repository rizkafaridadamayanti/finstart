import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

function data(response) {
  return response.data?.data
}

export const masterDataApi = {
  // Divisi
  getDivisions: async (params = {}) => data(await api.get('/divisions', { params })),
  getDivision: async (id) => data(await api.get(`/divisions/${id}`)),
  createDivision: async (payload) => data(await api.post('/divisions', payload)),
  updateDivision: async (id, payload) => data(await api.put(`/divisions/${id}`, payload)),
  setDivisionStatus: async (id, status) => data(await api.patch(`/divisions/${id}/status`, { status })),

  // Jabatan
  getPositions: async (params = {}) => data(await api.get('/positions', { params })),
  getPosition: async (id) => data(await api.get(`/positions/${id}`)),
  createPosition: async (payload) => data(await api.post('/positions', payload)),
  updatePosition: async (id, payload) => data(await api.put(`/positions/${id}`, payload)),
  setPositionStatus: async (id, status) => data(await api.patch(`/positions/${id}/status`, { status })),

  // Pegawai
  getEmployees: async (params = {}) => data(await api.get('/employees', { params })),
  getEmployee: async (id) => data(await api.get(`/employees/${id}`)),
  createEmployee: async (payload) => data(await api.post('/employees', payload)),
  updateEmployee: async (id, payload) => data(await api.put(`/employees/${id}`, payload)),
  setEmployeeStatus: async (id, employment_status) => data(await api.patch(`/employees/${id}/status`, { employment_status })),

  // BPJS dan Settings
  getBpjsConfig: async () => data(await api.get('/bpjs-config')),
  updateBpjsConfig: async (payload) => data(await api.put('/bpjs-config', payload)),
  getCompanySettings: async () => data(await api.get('/company-settings')),
  updateCompanySettings: async (payload) => data(await api.put('/company-settings', payload)),
}

export default api
