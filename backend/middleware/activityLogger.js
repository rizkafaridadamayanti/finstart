const db = require('../config/db')
const { safeAudit } = require('../utils/audit')

const HUMAN_MODULES = {
  clients: 'Klien', projects: 'Proyek', accounts: 'COA', journals: 'Jurnal',
  invoices: 'Invoice', bills: 'Tagihan Vendor', subscriptions: 'Langganan',
  assets: 'Aset', taxes: 'Pajak', projections: 'Proyeksi', employees: 'SDM',
  payroll: 'Payroll', users: 'Pengguna', roles: 'Role', settings: 'Pengaturan',
}

function moduleFromPath(pathname) {
  const matches = String(pathname || '').match(/^\/api\/([^/?]+)/)
  const key = matches?.[1] || ''
  const map = {
    clients: 'clients', projects: 'projects', accounts: 'accounts', journals: 'journals',
    invoices: 'invoices', bills: 'bills', subscriptions: 'subscriptions', assets: 'assets',
    taxes: 'taxes', 'tax-engine': 'taxes', projections: 'projections', employees: 'employees',
    divisions: 'employees', positions: 'employees', payroll: 'payroll', 'bpjs-config': 'payroll',
    users: 'users', roles: 'roles', 'company-settings': 'settings',
  }
  return map[key] || null
}

function getReferenceId(req, payload) {
  const candidate = req.params?.id || payload?.data?.id || payload?.data?.insertId || null
  const number = Number(candidate)
  return Number.isInteger(number) && number > 0 ? number : null
}

function activityLogger(req, res, next) {
  if (!req.user || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  if (String(req.path || '').startsWith('/api/auth/')) return next()

  const startedAt = Date.now()
  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return
    const moduleKey = moduleFromPath(req.path)
    if (!moduleKey) return

    const label = HUMAN_MODULES[moduleKey] || moduleKey
    const action = req.method === 'POST' ? 'menambahkan' : req.method === 'PUT' || req.method === 'PATCH' ? 'memperbarui' : req.method === 'DELETE' ? 'menghapus' : 'memproses'
    const referenceId = getReferenceId(req, res.locals?.finstartPayload)
    const description = `${req.user.name || req.user.email} ${action} data ${label.toLowerCase()} melalui sistem.`

    safeAudit(db, {
      userId: req.user.id,
      activity: `${action.charAt(0).toUpperCase()}${action.slice(1)} ${label}`,
      description,
      module: moduleKey,
      referenceId,
      notification: {
        title: `${label} diperbarui`,
        message: description,
        type: req.method === 'DELETE' ? 'warning' : 'success',
        referenceType: moduleKey,
      },
      duration: Date.now() - startedAt,
    })
  })
  return next()
}

function captureResponsePayload(req, res, next) {
  const originalJson = res.json.bind(res)
  res.json = (payload) => {
    res.locals.finstartPayload = payload
    return originalJson(payload)
  }
  next()
}

module.exports = { activityLogger, captureResponsePayload }
