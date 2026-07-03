import api from './masterDataApi'

function data(response) {
  return response.data?.data
}

export const payrollApi = {
  getCashAccounts: async () => data(await api.get('/payroll/accounts')),
  getPayrolls: async (params = {}) => data(await api.get('/payroll', { params })),
  getSummary: async (params = {}) => data(await api.get('/payroll/summary', { params })),
  process: async (payload) => data(await api.post('/payroll/process', payload)),
}
