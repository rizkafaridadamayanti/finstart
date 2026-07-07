const express = require('express')
const db = require('../config/db')
const {
  createToken,
  hashPassword,
  hashToken,
  verifyPassword,
} = require('../utils/password')
const { safeAudit } = require('../utils/audit')
const { generateSecret, verifyCode, buildOtpAuthUrl } = require('../utils/totp')
const {
  getAllowedTabs,
  getRolePermissions,
  hasPermission,
  normalizeRole,
} = require('../middleware/authorization')

const router = express.Router()
const SESSION_HOURS = Number(process.env.AUTH_SESSION_HOURS || 8)
const RESET_TOKEN_MINUTES = Number(process.env.AUTH_RESET_TOKEN_MINUTES || 30)
const LOGIN_MAX_ATTEMPTS = Number(process.env.AUTH_LOGIN_MAX_ATTEMPTS || 5)
const LOGIN_LOCK_MINUTES = Number(process.env.AUTH_LOGIN_LOCK_MINUTES || 15)
const loginAttempts = new Map()

const CORE_ROLES = [
  ['admin', 'Administrator sistem dengan akses penuh.'],
  ['finance_manager', 'Menyusun, meninjau, dan mengelola operasi keuangan.'],
  ['finance', 'Staf keuangan untuk transaksi operasional dan sub-ledger.'],
  ['hr', 'Mengelola data SDM dan payroll.'],
  ['tax', 'Mengelola administrasi serta pelaporan pajak internal.'],
  ['project_manager', 'Mengelola klien, proyek, dan alokasi tim.'],
  ['director', 'Membaca ringkasan dan menyetujui/posting jurnal.'],
  ['auditor', 'Akses baca untuk audit dan pemeriksaan.'],
]

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

async function ensureCoreRoles(connection = db) {
  for (const [name, description] of CORE_ROLES) {
    await connection.query(
      'INSERT IGNORE INTO roles (name, description) VALUES (?, ?)',
      [name, description],
    )
  }
}

async function addColumnIfMissing(connection, tableName, columnName, definition) {
  const [columns] = await connection.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName],
  )
  if (columns.length === 0) {
    await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`)
  }
}

async function ensureAuthTables(connection = db) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      token_hash VARCHAR(128) NOT NULL UNIQUE,
      user_agent VARCHAR(255) NULL,
      ip_address VARCHAR(64) NULL,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_auth_sessions_user (user_id),
      INDEX idx_auth_sessions_expiry (expires_at),
      CONSTRAINT fk_auth_sessions_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await connection.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      token_hash VARCHAR(128) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_reset_user (user_id),
      INDEX idx_password_reset_expiry (expires_at),
      CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_security_settings (
      user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
      login_alerts TINYINT(1) NOT NULL DEFAULT 1,
      session_alerts TINYINT(1) NOT NULL DEFAULT 1,
      mfa_status ENUM('not_configured','pending','enabled') NOT NULL DEFAULT 'not_configured',
      mfa_secret VARCHAR(128) NULL,
      mfa_pending_secret VARCHAR(128) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_security_settings_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  await addColumnIfMissing(connection, 'user_security_settings', 'mfa_secret', 'VARCHAR(128) NULL')
  await addColumnIfMissing(connection, 'user_security_settings', 'mfa_pending_secret', 'VARCHAR(128) NULL')
  await ensureCoreRoles(connection)
}

async function ensureInitialUser() {
  await ensureAuthTables()
  const [users] = await db.query('SELECT id FROM users LIMIT 1')
  if (users.length) return

  const defaults = [
    {
      email: process.env.AUTH_DEFAULT_ADMIN_EMAIL || 'admin@kedata.id',
      password: process.env.AUTH_DEFAULT_ADMIN_PASSWORD || 'Admin123!',
      name: process.env.AUTH_DEFAULT_ADMIN_NAME || 'Administrator FinStart',
      roleName: 'admin',
    },
    {
      email: process.env.AUTH_DEFAULT_EMAIL || 'finance@kedata.id',
      password: process.env.AUTH_DEFAULT_PASSWORD || 'kedata123',
      name: process.env.AUTH_DEFAULT_NAME || 'Finance Manager',
      roleName: process.env.AUTH_DEFAULT_ROLE || 'finance_manager',
    },
  ]

  for (const user of defaults) {
    const [roles] = await db.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [normalizeRole(user.roleName)])
    await db.query(
      `INSERT INTO users (role_id, name, email, password_hash, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [roles[0]?.id || null, user.name, user.email.toLowerCase(), hashPassword(user.password)],
    )
  }
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
    `SELECT login_alerts, session_alerts, mfa_status, mfa_secret, mfa_pending_secret, updated_at
     FROM user_security_settings WHERE user_id = ? LIMIT 1`,
    [userId],
  )
  const settings = rows[0] || {}
  return {
    login_alerts: Boolean(settings.login_alerts),
    session_alerts: Boolean(settings.session_alerts),
    // Tidak pernah diklaim aktif sebelum konfigurasi TOTP/identity provider tersedia.
    mfa_status: settings.mfa_status || 'not_configured',
    mfa_pending: Boolean(settings.mfa_pending_secret),
    updated_at: settings.updated_at || null,
  }
}

router.post('/login', async (req, res) => {
  try {
    await ensureInitialUser()

    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const attempt = getAttemptState(req, email)

    if (attempt.lockedUntil > Date.now()) {
      return res.status(429).json({
        success: false,
        message: `Terlalu banyak percobaan login. Coba lagi setelah ${new Date(attempt.lockedUntil).toLocaleTimeString('id-ID')}.`,
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

    const security = await getSecuritySettings(user.id)
    if (security.mfa_status === 'enabled') {
      const mfaCode = String(req.body?.mfa_code || '').replace(/\s/g, '')
      const [securityRows] = await db.query(
        'SELECT mfa_secret FROM user_security_settings WHERE user_id = ? LIMIT 1',
        [user.id],
      )
      const secret = securityRows[0]?.mfa_secret
      if (!mfaCode || !secret || !verifyCode(secret, mfaCode)) {
        const failed = registerFailedAttempt(req, email)
        await safeAudit(db, {
          userId: user.id,
          activity: 'Verifikasi MFA gagal',
          description: `Kode MFA tidak valid untuk ${user.email} (percobaan ${failed.attempts}).`,
          module: 'security',
        })
        return res.status(401).json({ success: false, code: 'MFA_REQUIRED', message: 'Kode MFA enam digit wajib dan harus valid.' })
      }
    }

    clearAttempts(req, email)
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
    res.status(500).json({ success: false, message: 'Gagal memproses login.', error: error.message })
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
    await ensureAuthTables()
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
    res.status(500).json({ success: false, message: 'Gagal mengambil sesi aktif.', error: error.message })
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
    res.status(500).json({ success: false, message: 'Gagal menutup sesi.', error: error.message })
  }
})

router.get('/security-settings', async (req, res) => {
  try {
    await ensureAuthTables()
    res.json({ success: true, data: await getSecuritySettings(req.user.id) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan keamanan.', error: error.message })
  }
})

router.put('/security-settings', async (req, res) => {
  try {
    await ensureAuthTables()
    const loginAlerts = req.body?.login_alerts === undefined ? true : Boolean(req.body.login_alerts)
    const sessionAlerts = req.body?.session_alerts === undefined ? true : Boolean(req.body.session_alerts)
    await db.query(
      `INSERT INTO user_security_settings (user_id, login_alerts, session_alerts, mfa_status)
       VALUES (?, ?, ?, 'not_configured')
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
    res.status(500).json({ success: false, message: 'Gagal menyimpan pengaturan keamanan.', error: error.message })
  }
})


router.post('/mfa/setup', async (req, res) => {
  try {
    await ensureAuthTables()
    const secret = generateSecret()
    await db.query(
      `INSERT INTO user_security_settings (user_id, mfa_status, mfa_pending_secret)
       VALUES (?, 'pending', ?)
       ON DUPLICATE KEY UPDATE mfa_status = 'pending', mfa_pending_secret = VALUES(mfa_pending_secret)`,
      [req.user.id, secret],
    )
    await safeAudit(db, {
      userId: req.user.id,
      activity: 'MFA disiapkan',
      description: `${req.user.name} memulai konfigurasi autentikator MFA.`,
      module: 'security',
    })
    res.json({
      success: true,
      message: 'Simpan secret ini di aplikasi authenticator, lalu konfirmasi dengan kode enam digit.',
      data: {
        secret,
        otpauth_url: buildOtpAuthUrl({ secret, accountName: req.user.email || req.user.name }),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menyiapkan MFA.', error: error.message })
  }
})

router.post('/mfa/confirm', async (req, res) => {
  try {
    await ensureAuthTables()
    const code = String(req.body?.code || '')
    const [rows] = await db.query(
      'SELECT mfa_pending_secret FROM user_security_settings WHERE user_id = ? LIMIT 1',
      [req.user.id],
    )
    const secret = rows[0]?.mfa_pending_secret
    if (!secret || !verifyCode(secret, code)) {
      return res.status(422).json({ success: false, message: 'Kode MFA tidak valid atau sesi konfigurasi sudah berakhir.' })
    }
    await db.query(
      `UPDATE user_security_settings
       SET mfa_status = 'enabled', mfa_secret = mfa_pending_secret, mfa_pending_secret = NULL
       WHERE user_id = ?`,
      [req.user.id],
    )
    await safeAudit(db, {
      userId: req.user.id,
      activity: 'MFA diaktifkan',
      description: `${req.user.name} mengaktifkan autentikasi dua faktor.`,
      module: 'security',
    })
    res.json({ success: true, message: 'MFA berhasil diaktifkan.', data: await getSecuritySettings(req.user.id) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengaktifkan MFA.', error: error.message })
  }
})

router.post('/mfa/disable', async (req, res) => {
  try {
    await ensureAuthTables()
    const code = String(req.body?.code || '')
    const password = String(req.body?.password || '')
    const [userRows] = await db.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [req.user.id])
    const [securityRows] = await db.query('SELECT mfa_status, mfa_secret FROM user_security_settings WHERE user_id = ? LIMIT 1', [req.user.id])
    const security = securityRows[0]
    if (!userRows[0] || !verifyPassword(password, userRows[0].password_hash) || !security || security.mfa_status !== 'enabled' || !verifyCode(security.mfa_secret, code)) {
      return res.status(401).json({ success: false, message: 'Password atau kode MFA tidak valid.' })
    }
    await db.query(
      `UPDATE user_security_settings
       SET mfa_status = 'not_configured', mfa_secret = NULL, mfa_pending_secret = NULL
       WHERE user_id = ?`,
      [req.user.id],
    )
    await safeAudit(db, {
      userId: req.user.id,
      activity: 'MFA dinonaktifkan',
      description: `${req.user.name} menonaktifkan autentikasi dua faktor setelah verifikasi.`,
      module: 'security',
    })
    res.json({ success: true, message: 'MFA dinonaktifkan.', data: await getSecuritySettings(req.user.id) })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menonaktifkan MFA.', error: error.message })
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
    res.status(500).json({ success: false, message: 'Gagal logout.', error: error.message })
  }
})

router.post('/password/change', async (req, res) => {
  try {
    const currentPassword = String(req.body?.current_password || '')
    const newPassword = String(req.body?.new_password || '')
    if (!currentPassword || newPassword.length < 8) return res.status(422).json({ success: false, message: 'Password lama dan password baru minimal 8 karakter wajib diisi.' })
    const [rows] = await db.query('SELECT id, password_hash FROM users WHERE id = ? LIMIT 1', [req.user.id])
    const user = rows[0]
    if (!user || !verifyPassword(currentPassword, user.password_hash)) return res.status(401).json({ success: false, message: 'Password lama tidak sesuai.' })
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(newPassword), req.user.id])
    await db.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = ? AND id <> ? AND revoked_at IS NULL', [req.user.id, req.user.session_id])
    await safeAudit(db, {
      userId: req.user.id,
      activity: 'Password diubah',
      description: `${req.user.name} mengubah password dan menutup sesi lain.`,
      module: 'security',
    })
    res.json({ success: true, message: 'Password berhasil diubah. Sesi lain telah ditutup.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengubah password.', error: error.message })
  }
})

router.post('/password/request-reset', async (req, res) => {
  try {
    await ensureAuthTables()
    const email = String(req.body.email || '').trim().toLowerCase()
    const user = email ? await findUserByEmail(email) : null
    let debugData = null

    if (user) {
      const token = createToken()
      const expiresAt = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000)
      await db.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES (?, ?, ?)`,
        [user.id, hashToken(token), expiresAt],
      )
      await safeAudit(db, {
        userId: user.id,
        activity: 'Permintaan reset password',
        description: `Permintaan reset password dibuat untuk ${user.email}.`,
        module: 'security',
      })
      // Token hanya boleh ditampilkan saat pengembangan lokal secara eksplisit.
      if (process.env.AUTH_SHOW_RESET_TOKEN === 'true') {
        debugData = { reset_token: token, expires_at: expiresAt.toISOString() }
      }
    }

    res.json({
      success: true,
      message: 'Jika email terdaftar, instruksi reset password akan dikirim melalui kanal yang dikonfigurasi administrator.',
      data: debugData,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal membuat permintaan reset password.', error: error.message })
  }
})

router.post('/password/reset', async (req, res) => {
  try {
    const token = String(req.body.token || '')
    const password = String(req.body.password || '')
    if (!token || password.length < 8) return res.status(422).json({ success: false, message: 'Token dan kata sandi baru minimal 8 karakter wajib diisi.' })
    const [tokens] = await db.query(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [hashToken(token)],
    )
    const reset = tokens[0]
    if (!reset) return res.status(401).json({ success: false, message: 'Token reset tidak valid atau sudah kedaluwarsa.' })
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(password), reset.user_id])
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [reset.id])
    await db.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = ?', [reset.user_id])
    await safeAudit(db, {
      userId: reset.user_id,
      activity: 'Password direset',
      description: 'Password akun diperbarui melalui token reset.',
      module: 'security',
    })
    res.json({ success: true, message: 'Kata sandi berhasil diperbarui. Silakan login kembali.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal reset password.', error: error.message })
  }
})

module.exports = router
module.exports.ensureAuthTables = ensureAuthTables
module.exports.ensureCoreRoles = ensureCoreRoles
