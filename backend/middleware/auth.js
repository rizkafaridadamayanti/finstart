const db = require('../config/db')
const { hashToken } = require('../utils/password')

/*
 * Endpoint yang boleh diakses tanpa login.
 *
 * /api/status dan /api/health tetap dicantumkan agar aman,
 * walaupun endpoint tersebut sebaiknya ditempatkan sebelum
 * app.use(authenticate) di backend/index.js.
 */
const PUBLIC_PATHS = new Set([
  '/api/status',
  '/api/health',
  '/api/auth/login',
])

/**
 * Mengambil token dari header:
 *
 * Authorization: Bearer <token>
 *
 * @param {import('express').Request} req
 * @returns {string}
 */
function getBearerToken(req) {
  const authorizationHeader = String(
    req.get('authorization') || '',
  ).trim()

  const match = authorizationHeader.match(
    /^Bearer\s+(.+)$/i,
  )

  return match?.[1]?.trim() || ''
}

/**
 * Memeriksa apakah endpoint dapat diakses tanpa autentikasi.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
function isPublicRequest(req) {
  if (req.method === 'OPTIONS') {
    return true
  }

  const requestPath = String(req.path || '')
  return PUBLIC_PATHS.has(requestPath)
}

/**
 * Middleware autentikasi global.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function authenticate(req, res, next) {
  if (isPublicRequest(req)) {
    return next()
  }

  const authorizationHeader = String(
    req.get('authorization') || '',
  ).trim()

  const token = getBearerToken(req)
  console.log('[auth] Checking authentication', {
    method: req.method,
    path: req.originalUrl,
    authorizationHeaderPresent: authorizationHeader.length > 0,
    tokenLength: token.length,
  })

  if (!token) {
    /*
     * Log ini tidak mencetak isi token.
     * Aman digunakan untuk melihat penyebab request ditolak
     * melalui Railway Deploy Logs.
     */
    console.warn('[auth] Bearer token tidak ditemukan', {
      method: req.method,
      path: req.originalUrl,
      authorizationHeaderPresent:
        authorizationHeader.length > 0,
      authorizationFormatValid:
        /^Bearer\s+.+$/i.test(authorizationHeader),
    })

    return res.status(401).json({
      success: false,
      message:
        'Akses ditolak. Silakan login terlebih dahulu.',
    })
  }

  try {
    const tokenHash = hashToken(token)

    const [rows] = await db.query(
      `
        SELECT
          sessions.id AS session_id,
          sessions.user_id,
          sessions.expires_at,
          sessions.revoked_at,

          users.id AS id,
          users.role_id,
          users.name,
          users.email,
          users.status,

          roles.name AS role_name
        FROM auth_sessions AS sessions
        INNER JOIN users
          ON users.id = sessions.user_id
        LEFT JOIN roles
          ON roles.id = users.role_id
        WHERE sessions.token_hash = ?
          AND sessions.revoked_at IS NULL
          AND sessions.expires_at > NOW()
        LIMIT 1
      `,
      [tokenHash],
    )

    const user = rows?.[0]

    if (!user) {
      console.warn(
        '[auth] Token tidak memiliki sesi aktif',
        {
          method: req.method,
          path: req.originalUrl,
        },
      )

      return res.status(401).json({
        success: false,
        message: 'Sesi tidak valid atau sudah berakhir.',
      })
    }

    if (
      String(user.status || '').toLowerCase() !==
      'active'
    ) {
      console.warn('[auth] Pengguna tidak aktif', {
        method: req.method,
        path: req.originalUrl,
        userId: user.id,
        status: user.status,
      })

      return res.status(403).json({
        success: false,
        message:
          'Akun pengguna sedang tidak aktif.',
      })
    }

    req.authToken = token

    req.user = {
      id: user.id,
      role_id: user.role_id,
      role_name: user.role_name || '',
      name: user.name,
      email: user.email,
      session_id: user.session_id,
      expires_at: user.expires_at,
    }

    return next()
  } catch (error) {
    console.error(
      '[auth middleware] Gagal memvalidasi sesi:',
      error,
    )

    return res.status(500).json({
      success: false,
      message: 'Gagal memvalidasi sesi login.',
    })
  }
}

/**
 * Membatasi endpoint berdasarkan nama role pengguna.
 *
 * Contoh:
 * router.post(
 *   '/endpoint',
 *   requireRole(['finance', 'admin']),
 *   handler,
 * )
 *
 * @param {string[]} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function requireRole(allowedRoles = []) {
  const normalizedAllowedRoles = new Set(
    allowedRoles
      .map((item) =>
        String(item || '').trim().toLowerCase(),
      )
      .filter(Boolean),
  )

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          'Akses ditolak. Silakan login terlebih dahulu.',
      })
    }

    /*
     * Jika allowedRoles kosong, cukup pastikan pengguna
     * sudah berhasil melewati autentikasi.
     */
    if (normalizedAllowedRoles.size === 0) {
      return next()
    }

    const currentRole = String(
      req.user.role_name || '',
    )
      .trim()
      .toLowerCase()

    if (!normalizedAllowedRoles.has(currentRole)) {
      return res.status(403).json({
        success: false,
        message:
          'Akses ditolak untuk peran pengguna saat ini.',
      })
    }

    return next()
  }
}

module.exports = {
  authenticate,
  requireRole,
  getBearerToken,
}
