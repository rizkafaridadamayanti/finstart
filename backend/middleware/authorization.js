const db = require('../config/db')
const { safeAudit } = require('../utils/audit')

const INTERNAL_ROLE = 'finance_manager'

const ROLE_ALIASES = {
  administrator: 'administrator',
  admin: 'administrator',
  system_admin: 'administrator',
  finance_manager: INTERNAL_ROLE,
  finance_internal: INTERNAL_ROLE,
  keuangan_internal: INTERNAL_ROLE,
  akses_internal: INTERNAL_ROLE,
  internal: INTERNAL_ROLE,
  finance: INTERNAL_ROLE,
  staff_finance: INTERNAL_ROLE,
  hr: 'hr',
  human_resources: 'hr',
  pajak: 'tax',
  tax: 'tax',
  project_manager: 'project_manager',
  direktur: 'director',
  director: 'director',
  auditor: 'auditor',
}

const ROLE_PERMISSIONS = {
  administrator: ['*'],
  [INTERNAL_ROLE]: [
    'dashboard:read',
    'projects:*',
    'accounts:*',
    'journals:*',
    'reports:*',
    'receivable:*',
    'payable:*',
    'subscriptions:*',
    'assets:*',
    'taxes:*',
    'projections:*',
    'employees:*',
    'payroll:*',
    'settings:*',
    'notifications:*',
    'audit:read',
    'roles:read',
    'users:*',
  ],
  director: [
    'dashboard:read',
    'projects:read',
    'accounts:read',
    'journals:read',
    'journals:approve',
    'journals:post',
    'reports:read',
    'receivable:read',
    'payable:read',
    'subscriptions:read',
    'assets:read',
    'taxes:read',
    'projections:read',
    'employees:read',
    'payroll:read',
    'notifications:*',
    'audit:read',
  ],
  project_manager: [
    'dashboard:read',
    'projects:*',
    'receivable:read',
    'payable:read',
    'reports:read',
    'notifications:*',
  ],
  hr: [
    'dashboard:read',
    'employees:*',
    'payroll:*',
    'reports:read',
    'notifications:*',
  ],
  tax: [
    'dashboard:read',
    'accounts:read',
    'journals:read',
    'reports:read',
    'taxes:*',
    'receivable:read',
    'payable:read',
    'notifications:*',
  ],
  auditor: [
    'dashboard:read',
    'projects:read',
    'accounts:read',
    'journals:read',
    'reports:read',
    'receivable:read',
    'payable:read',
    'subscriptions:read',
    'assets:read',
    'taxes:read',
    'projections:read',
    'employees:read',
    'payroll:read',
    'audit:read',
    'notifications:*',
  ],
}

function normalizeRole(roleName) {
  const raw = String(roleName || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  return ROLE_ALIASES[raw] || INTERNAL_ROLE
}

function getRolePermissions(roleName) {
  const role = normalizeRole(roleName)
  return [...(ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[INTERNAL_ROLE])]
}

function hasPermission(roleName, moduleName, action = 'read') {
  const permissions = getRolePermissions(roleName)
  return permissions.some((permission) => {
    if (permission === '*') return true
    const [allowedModule, allowedAction] = permission.split(':')
    return (allowedModule === moduleName || allowedModule === '*')
      && (allowedAction === action || allowedAction === '*' || (action === 'read' && allowedAction === 'write'))
  })
}

function requirePermission(moduleName, action = 'read') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu.' })
    }

    if (!hasPermission(req.user.role_name, moduleName, action)) {
      const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(String(req.method || 'GET').toUpperCase())
      if (isMutation) {
        const referenceId = Number(req.params?.id)
        safeAudit(db, {
          userId: req.user.id,
          activity: 'Percobaan akses ditolak',
          description: `${req.user.name || req.user.email} mencoba melakukan ${action} pada modul ${moduleName} tanpa hak akses.`,
          module: moduleName,
          referenceId: Number.isInteger(referenceId) && referenceId > 0 ? referenceId : null,
        })
      }

      return res.status(403).json({
        success: false,
        message: 'Hak akses Anda tidak mencukupi untuk melakukan tindakan ini.',
      })
    }

    return next()
  }
}

function apiModuleFromPath(pathname) {
  const path = String(pathname || '')
  const rules = [
    ['/api/clients', 'projects'],
    ['/api/projects', 'projects'],
    ['/api/accounts', 'accounts'],
    ['/api/journals', 'journals'],
    ['/api/journal-transactions', 'journals'],
    ['/api/dashboard', 'dashboard'],
    ['/api/reports', 'reports'],
    ['/api/invoices', 'receivable'],
    ['/api/bills', 'payable'],
    ['/api/subscriptions', 'subscriptions'],
    ['/api/taxes', 'taxes'],
    ['/api/tax-engine', 'taxes'],
    ['/api/projections', 'projections'],
    ['/api/assets', 'assets'],
    ['/api/divisions', 'employees'],
    ['/api/positions', 'employees'],
    ['/api/employees', 'employees'],
    ['/api/bpjs-config', 'payroll'],
    ['/api/payroll', 'payroll'],
    ['/api/company-settings', 'settings'],
    ['/api/users', 'users'],
    ['/api/roles', 'roles'],
    ['/api/audit', 'audit'],
    ['/api/notifications', 'notifications'],
  ]

  const found = rules.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))
  return found ? found[1] : null
}

function actionFromRequest(req, moduleName) {
  const method = String(req.method || 'GET').toUpperCase()
  if (moduleName === 'journals' && /\/approve$/.test(req.path)) return 'approve'
  if (moduleName === 'journals' && /\/post$/.test(req.path)) return 'post'
  return ['GET', 'HEAD', 'OPTIONS'].includes(method) ? 'read' : 'write'
}

function enforceApiAuthorization(req, res, next) {
  const moduleName = apiModuleFromPath(req.path)
  if (!moduleName) return next()
  return requirePermission(moduleName, actionFromRequest(req, moduleName))(req, res, next)
}

const TAB_PERMISSIONS = {
  dashboard: ['dashboard:read'],
  crm: ['projects:read'],
  'master-klien': ['projects:read'],
  bukubesar: ['accounts:read'],
  transaksi: ['journals:read'],
  langganan: ['subscriptions:read'],
  piutang: ['receivable:read'],
  utang: ['payable:read'],
  proyeksi: ['projections:read'],
  perpajakan: ['taxes:read'],
  sdm: ['employees:read'],
  aset: ['assets:read'],
  laporan: ['reports:read'],
  pengaturan: ['settings:read'],
}

function getAllowedTabs(roleName) {
  return Object.entries(TAB_PERMISSIONS)
    .filter(([, [moduleAction]]) => {
      const [moduleName, action] = moduleAction.split(':')
      return hasPermission(roleName, moduleName, action)
    })
    .map(([tab]) => tab)
}

module.exports = {
  normalizeRole,
  getRolePermissions,
  hasPermission,
  requirePermission,
  enforceApiAuthorization,
  getAllowedTabs,
}
