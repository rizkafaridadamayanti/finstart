function getAllowedOrigins(env = process.env) {
  const environmentOrigins = String(
    env.CORS_ORIGIN ||
    env.FRONTEND_URL ||
    '',
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return [
    ...new Set([
      ...environmentOrigins,
      'https://frontend-production-741a.up.railway.app',
      'http://localhost:5173',
      'http://localhost:5174',
    ]),
  ]
}

function createCorsOptions(env = process.env) {
  const allowedOrigins = getAllowedOrigins(env)

  return {
    origin(origin, callback) {
      /*
       * Request tanpa origin tetap diperbolehkan.
       * Contohnya request dari Postman, curl, atau health checker.
       */
      if (!origin) {
        callback(null, true)
        return
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      console.warn(`[cors] Origin ditolak: ${origin}`)
      callback(new Error('Origin tidak diizinkan oleh konfigurasi CORS'))
    },

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
    ],
    exposedHeaders: [
      'Idempotency-Replayed',
    ],

    optionsSuccessStatus: 204,
  }
}

module.exports = { createCorsOptions, getAllowedOrigins }
