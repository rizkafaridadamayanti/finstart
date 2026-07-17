const express = require('express')
const db = require('../config/db')
const {
  createToken,
  hashPassword,
  hashToken,
  needsPasswordRehash,
  verifyPassword,
} = require('../utils/password')
const { safeAudit } = require('../utils/audit')
const {
  getAllowedTabs,
  getRolePermissions,
  hasPermission,
  normalizeRole,
} = require('../middleware/authorization')

const router = express.Router()
const SESSION_HOURS = Number(process.env.AUTH_SESSION_HOURS || 8)
const LOGIN_MAX_ATTEMPTS = Number(process.env.AUTH_LOGIN_MAX_ATTEMPTS || 5)
const LOGIN_LOCK_MINUTES = Number(process.env.AUTH_LOGIN_LOCK_MINUTES || 1)
const loginAttempts = new Map()

function sanitizeUser(user) {
  const roleName = normalizeRole(user.role_name || 'auditor')
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role_id: user.role_id,
    role_name: roleName,
    status: user.status,
    permissions: getRolePermissions(roleName),
    allowed_tabs: getAllowedTabs(roleName),
  }
}

function sendAuthServerError(res, message, error) {
  console.error(`[auth] ${message}`, error)
  return res.status(500).json({ success: false, message })
}

function attemptKey(req, email) {
  return `${String(req.ip || 'unknown')}|${String(email || '').toLowerCase()}`
}

function getAttemptState(req, email) {
  const key = attemptKey(req, email)
  const item = loginAttempts.get(key)
  if (!item) return { key, attempts: 0, lockedUntil: 0 }
  if (item.lockedUntil && item.lockedUntil <= Date.now()) {
    loginAttempts.delete(key)
    return { key, attempts: 0, lockedUntil: 0 }
  }
  return { key, attempts: item.attempts || 0, lockedUntil: item.lockedUntil || 0 }
}

function registerFailedAttempt(req, email) {
  const state = getAttemptState(req, email)
  const attempts = state.attempts + 1
  const lockedUntil = attempts >= LOGIN_MAX_ATTEMPTS
    ? Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000
    : 0
  loginAttempts.set(state.key, { attempts, lockedUntil })
  return { attempts, lockedUntil }
}

function clearAttempts(req, email) {
  loginAttempts.delete(attemptKey(req, email))
}

async function findUserByEmail(email) {
  const [rows] = await db.query(
    `
      SELECT users.*, roles.name AS role_name
      FROM users
      LEFT JOIN roles ON roles.id = users.role_id
      WHERE users.email = ?
      LIMIT 1
    `,
    [email],
  )
  return rows[0] || null
}

async function getSecuritySettings(userId) {
  await db.query('INSERT IGNORE INTO user_security_settings (user_id) VALUES (?)', [userId])
  const [rows] = await db.query(
    `SELECT login_alerts, session_alerts, updated_at
     FROM user_security_settings WHERE user_id = ? LIMIT 1`,
    [userId],
  )
  const settings = rows[0] || {}
  return {
    login_alerts: Boolean(settings.login_alerts),
    session_alerts: Boolean(settings.session_alerts),
    updated_at: settings.updated_at || null,
  }
}

router.post('/login', async (req, res) => {
  try {

    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const attempt = getAttemptState(req, email)

    if (attempt.lockedUntil > Date.now()) {
      const remainingSeconds = Math.max(1, Math.ceil((attempt.lockedUntil - Date.now()) / 1000))
      const remainingText = remainingSeconds >= 60 ? '1 menit' : `${remainingSeconds} detik`
      return res.status(429).json({
        success: false,
        message: `Terlalu banyak percobaan. Coba lagi ${remainingText}.`,
      })
    }

    if (!email || !password) {
      return res.status(422).json({ success: false, message: 'Email dan kata sandi wajib diisi.' })
    }

    const user = await findUserByEmail(email)
    if (!user || user.status !== 'active' || !verifyPassword(password, user.password_hash)) {
      const failed = registerFailedAttempt(req, email)
      await safeAudit(db, {
        userId: user?.id || null,
        activity: 'Login gagal',
        description: `Percobaan login gagal untuk ${email || 'email kosong'} (percobaan ${failed.attempts}).`,
        module: 'security',
      })
      return res.status(401).json({ success: false, message: 'Email atau kata sandi tidak sesuai.' })
    }

    clearAttempts(req, email)

    // Akun lama tetap bisa login. Hash lama di-upgrade sekali setelah password terverifikasi.
    if (needsPasswordRehash(user.password_hash)) {
      await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(password), user.id])
    }

    const token = createToken()
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000)
    const [sessionResult] = await db.query(
      `INSERT INTO auth_sessions (user_id, token_hash, user_agent, ip_address, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user.id,
        hashToken(token),
        String(req.headers['user-agent'] || '').slice(0, 255),
        req.ip,
        expiresAt,
      ],
    )

    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id])
    const security = await getSecuritySettings(user.id)
    await safeAudit(db, {
      userId: user.id,
      activity: 'Login berhasil',
      description: `${user.name} membuka sesi baru dari ${String(req.headers['user-agent'] || 'perangkat tidak diketahui').slice(0, 120)}.`,
      module: 'security',
      referenceId: sessionResult.insertId,
      notification: security.login_alerts ? {
        title: 'Login berhasil',
        message: 'Sesi login baru telah dibuat untuk akun Anda.',
        type: 'info',
        referenceType: 'auth_session',
      } : null,
    })

    res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        expires_at: expiresAt.toISOString(),
        user: sanitizeUser(user),
      },
    })
  } catch (error) {
    return sendAuthServerError(res, 'Gagal memproses login.', error)
  }
})

router.get('/me', async (req, res) => {
  res.json({
    success: true,
    message: 'Sesi aktif.',
    data: { user: sanitizeUser(req.user) },
  })
})

router.get('/sessions', async (req, res) => {
  try {
    const canViewAll = hasPermission(req.user.role_name, 'users', 'read')
    const params = []
    const where = ["sessions.revoked_at IS NULL", "sessions.expires_at > NOW()"]
    if (!canViewAll) {
      where.push('sessions.user_id = ?')
      params.push(req.user.id)
    }

    const [rows] = await db.query(
      `SELECT sessions.id, sessions.user_id, sessions.user_agent, sessions.ip_address,
              sessions.created_at, sessions.expires_at, users.name AS user_name, users.email AS user_email
       FROM auth_sessions sessions
       INNER JOIN users ON users.id = sessions.user_id
       WHERE ${where.join(' AND ')}
       ORDER BY sessions.created_at DESC`,
      params,
    )

    res.json({
      success: true,
      data: rows.map((row) => ({
        ...row,
        current_session: Number(row.id) === Number(req.user.session_id),
      })),
    })
  } catch (error) {
    return sendAuthServerError(res, 'Gagal mengambil sesi aktif.', error)
  }
})

router.delete('/sessions/:id', async (req, res) => {
  try {
    const sessionId = Number(req.params.id)
    if (!Number.isInteger(sessionId) || sessionId <= 0) return res.status(422).json({ success: false, message: 'ID sesi tidak valid.' })
    const [rows] = await db.query('SELECT user_id FROM auth_sessions WHERE id = ? LIMIT 1', [sessionId])
    const target = rows[0]
    if (!target) return res.status(404).json({ success: false, message: 'Sesi tidak ditemukan.' })
    if (Number(target.user_id) !== Number(req.user.id) && !hasPermission(req.user.role_name, 'users', 'write')) {
      return res.status(403).json({ success: false, message: 'Anda hanya dapat menutup sesi milik sendiri.' })
    }
    await db.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE id = ? AND revoked_at IS NULL', [sessionId])
    await safeAudit(db, {
      userId: req.user.id,
      activity: 'Sesi ditutup',
      description: `${req.user.name} menutup sesi ${sessionId}.`,
      module: 'security',
      referenceId: sessionId,
    })
    res.json({ success: true, message: 'Sesi berhasil ditutup.' })
  } catch (error) {
    return sendAuthServerError(res, 'Gagal menutup sesi.', error)
  }
})

router.get('/security-settings', async (req, res) => {
  try {
    res.json({ success: true, data: await getSecuritySettings(req.user.id) })
  } catch (error) {
    return sendAuthServerError(res, 'Gagal mengambil pengaturan keamanan.', error)
  }
})

router.put('/security-settings', async (req, res) => {
  try {
    const loginAlerts = req.body?.login_alerts === undefined ? true : Boolean(req.body.login_alerts)
    const sessionAlerts = req.body?.session_alerts === undefined ? true : Boolean(req.body.session_alerts)
    await db.query(
      `INSERT INTO user_security_settings (user_id, login_alerts, session_alerts)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE login_alerts = VALUES(login_alerts), session_alerts = VALUES(session_alerts)`,
      [req.user.id, loginAlerts ? 1 : 0, sessionAlerts ? 1 : 0],
    )
    await safeAudit(db, {
      userId: req.user.id,
      activity: 'Pengaturan keamanan diperbarui',
      description: `${req.user.name} memperbarui preferensi keamanan akun.`,
      module: 'security',
    })
    res.json({ success: true, message: 'Pengaturan keamanan disimpan.', data: await getSecuritySettings(req.user.id) })
  } catch (error) {
    return sendAuthServerError(res, 'Gagal menyimpan pengaturan keamanan.', error)
  }
})


router.post('/logout', async (req, res) => {
  try {
    await db.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE id = ?', [req.user.session_id])
    await safeAudit(db, {
      userId: req.user.id,
      activity: 'Logout',
      description: `${req.user.name} menutup sesi aktif.`,
      module: 'security',
      referenceId: req.user.session_id,
    })
    res.json({ success: true, message: 'Logout berhasil.' })
  } catch (error) {
    return sendAuthServerError(res, 'Gagal logout.', error)
  }
})

module.exports = router
