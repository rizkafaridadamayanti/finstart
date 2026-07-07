const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api')
  .replace(/\/+$/, '')

const AUTH_TOKEN_KEY = 'finstart-auth-token'
const AUTH_USER_KEY = 'finstart-auth-user'
const AUTH_EXPIRES_KEY = 'finstart-auth-expires-at'

function getStoredToken() {
  if (typeof window === 'undefined') return ''
  return window.sessionStorage.getItem(AUTH_TOKEN_KEY) || ''
}

export function getStoredAuthUser() {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(window.sessionStorage.getItem(AUTH_USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveAuthSession(session) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(AUTH_TOKEN_KEY, session?.token || '')
  window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(session?.user || null))
  window.sessionStorage.setItem(AUTH_EXPIRES_KEY, session?.expires_at || '')
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
  window.sessionStorage.removeItem(AUTH_USER_KEY)
  window.sessionStorage.removeItem(AUTH_EXPIRES_KEY)
}

export function hasAuthSession() {
  if (typeof window === 'undefined') return false
  const token = getStoredToken()
  const expiresAt = window.sessionStorage.getItem(AUTH_EXPIRES_KEY) || ''
  return Boolean(token && (!expiresAt || Date.parse(expiresAt) > Date.now()))
}

function buildUrl(path, query = null) {
  const url = new URL(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`)

  if (query && typeof query === 'object') {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  return url.toString()
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    query,
    headers = {},
  } = options

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      Accept: 'application/json',
      ...(getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // Endpoint non-JSON tetap dilaporkan dengan pesan yang jelas.
  }

  if (!response.ok || payload?.success === false) {
    if (response.status === 401) {
      clearAuthSession()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('finstart-auth-expired'))
      }
    }

    const error = new Error(
      payload?.message || `Permintaan API gagal (${response.status}).`,
    )
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload?.data
}

export const financeApi = {
  health: () => request('/health'),
  login: (email, password, mfaCode = '') => request('/auth/login', { method: 'POST', body: { email, password, mfa_code: mfaCode } }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST', body: {} }),
  requestPasswordReset: (email) => request('/auth/password/request-reset', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => request('/auth/password/reset', { method: 'POST', body: { token, password } }),
  get: (path, query) => request(path, { query }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export function getApiErrorMessage(error, fallback = 'Gagal terhubung ke API FinStart.') {
  return error?.payload?.message || error?.message || fallback
}
