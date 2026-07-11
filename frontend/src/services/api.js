import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config

  const token =
    window.localStorage.getItem('finstart-auth-token') ||
    window.sessionStorage.getItem('finstart-auth-token')

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('finstart-auth-expired'))
    }

    return Promise.reject(error)
  },
)

export default api
