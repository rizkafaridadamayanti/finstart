const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const IDEMPOTENCY_TTL_MS = Number(process.env.IDEMPOTENCY_TTL_MS || 60000)
const requests = new Map()

function now() {
  return Date.now()
}

function cleanupExpired() {
  const current = now()
  for (const [key, entry] of requests.entries()) {
    if (entry.expiresAt <= current) requests.delete(key)
  }
}

function cacheKey(req) {
  const rawKey = String(req.get('idempotency-key') || '').trim()
  if (!rawKey || !MUTATION_METHODS.has(req.method)) return ''
  const userId = req.user?.id || 'anonymous'
  return `${userId}:${req.method}:${req.originalUrl}:${rawKey}`
}

function replay(entry, res) {
  res.set('Idempotency-Replayed', 'true')
  return res.status(entry.statusCode).json(entry.payload)
}

function resolveWaiters(entry) {
  const waiters = entry.waiters || []
  entry.waiters = []
  for (const waiter of waiters) {
    if (!waiter.headersSent) replay(entry, waiter)
  }
}

function rejectWaiters(entry, statusCode, payload) {
  const waiters = entry.waiters || []
  entry.waiters = []
  for (const waiter of waiters) {
    if (!waiter.headersSent) waiter.status(statusCode).json(payload)
  }
}

function idempotency(req, res, next) {
  cleanupExpired()
  const key = cacheKey(req)
  if (!key) return next()

  const existing = requests.get(key)
  if (existing?.state === 'complete') return replay(existing, res)
  if (existing?.state === 'pending') {
    existing.waiters.push(res)
    return undefined
  }

  const entry = {
    state: 'pending',
    statusCode: 0,
    payload: null,
    waiters: [],
    expiresAt: now() + IDEMPOTENCY_TTL_MS,
  }
  requests.set(key, entry)

  const originalJson = res.json.bind(res)
  res.json = (payload) => {
    const statusCode = res.statusCode || 200
    if (statusCode >= 200 && statusCode < 300) {
      entry.state = 'complete'
      entry.statusCode = statusCode
      entry.payload = payload
      entry.expiresAt = now() + IDEMPOTENCY_TTL_MS
      resolveWaiters(entry)
    } else {
      requests.delete(key)
      rejectWaiters(entry, statusCode, payload)
    }
    return originalJson(payload)
  }

  res.on('finish', () => {
    if (entry.state !== 'complete') {
      requests.delete(key)
      rejectWaiters(entry, res.statusCode || 500, {
        success: false,
        message: 'Request gagal diproses.',
      })
    }
  })

  return next()
}

module.exports = { idempotency }
