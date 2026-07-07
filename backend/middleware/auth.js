const db = require('../config/db')
const { hashToken } = require('../utils/password')

const PUBLIC_PATHS = new Set([
  '/api/health',
  '/api/auth/login',
  '/api/auth/password/request-reset',
  '/api/auth/password/reset',
])

function getBearerToken(req) {
  const header = String(req.headers.authorization || '')
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ''
}

async function authenticate(req, res, next) {
  if (PUBLIC_PATHS.has(req.path)) {
    return next()
  }

  const token = getBearerToken(req)

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Silakan login terlebih dahulu.',
    })
  }

  try {
    const [rows] = await db.query(
      `
        SELECT
          sessions.id AS session_id,
          sessions.expires_at,
          users.id,
          users.role_id,
          users.name,
          users.email,
          users.status,
          roles.name AS role_name
        FROM auth_sessions AS sessions
        INNER JOIN users ON users.id = sessions.user_id
        LEFT JOIN roles ON roles.id = users.role_id
        WHERE sessions.token_hash = ?
          AND sessions.revoked_at IS NULL
          AND sessions.expires_at > NOW()
        LIMIT 1
      `,
      [hashToken(token)],
    )

    const user = rows[0]

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Sesi tidak valid atau sudah berakhir.',
      })
    }

    req.authToken = token
    req.user = {
      id: user.id,
      role_id: user.role_id,
      role_name: user.role_name,
      name: user.name,
      email: user.email,
      session_id: user.session_id,
    }

    return next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memvalidasi sesi login.',
      error: error.message,
    })
  }
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const role = String(req.user?.role_name || '').toLowerCase()

    if (allowedRoles.length && !allowedRoles.map((item) => item.toLowerCase()).includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak untuk peran pengguna saat ini.',
      })
    }

    return next()
  }
}

module.exports = {
  authenticate,
  requireRole,
}
