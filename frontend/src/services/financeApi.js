const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api')
  .replace(/\/+$/, '')

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
  get: (path, query) => request(path, { query }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export function getApiErrorMessage(error, fallback = 'Gagal terhubung ke API FinStart.') {
  return error?.payload?.message || error?.message || fallback
}
