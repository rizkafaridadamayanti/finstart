require('dotenv').config()

const express = require('express')
const cors = require('cors')
const db = require('./config/db')
const { createCorsOptions } = require('./config/cors')

const { authenticate } = require('./middleware/auth')
const {
  enforceApiAuthorization,
} = require('./middleware/authorization')
const {
  activityLogger,
  captureResponsePayload,
} = require('./middleware/activityLogger')
const { idempotency } = require('./middleware/idempotency')

// Route autentikasi dan pengguna
const authRouter = require('./routes/auth')
const rolesRouter = require('./routes/roles')
const usersRouter = require('./routes/users')
const notificationsRouter = require('./routes/notifications')
const auditRouter = require('./routes/audit')

// Route keuangan
const clientsRouter = require('./routes/clients')
const projectsRouter = require('./routes/projects')
const accountsRouter = require('./routes/accounts')
const journalsRouter = require('./routes/journals')
const journalTransactionsRouter = require('./routes/journal-transactions')
const dashboardRouter = require('./routes/dashboard')
const reportsRouter = require('./routes/reports')
const invoicesRouter = require('./routes/invoices')
const billsRouter = require('./routes/bills')
const subscriptionsRouter = require('./routes/subscriptions')
const taxesRouter = require('./routes/taxes')
const taxEngineRouter = require('./routes/tax-engine')
const projectionsRouter = require('./routes/projections')
const assetsRouter = require('./routes/assets')
const assetCategoriesRouter = require('./routes/asset-categories')
const aiCopilotRouter = require('./routes/ai-copilot')

// Route master data operasional dan payroll
const divisionsRouter = require('./routes/divisions')
const positionsRouter = require('./routes/positions')
const employeesRouter = require('./routes/employees')
const bpjsConfigRouter = require('./routes/bpjs-config')
const companySettingsRouter = require('./routes/company-settings')
const payrollRouter = require('./routes/payroll')

const app = express()
const PORT = Number(process.env.PORT) || 4000
const corsOptions = createCorsOptions()

/*
 * CORS harus dipasang sebelum middleware autentikasi.
 * Dengan pemasangan global ini, request OPTIONS/preflight
 * akan ditangani sebelum masuk ke authenticate.
 */
app.use(cors(corsOptions))

// Membaca request body JSON
app.use(express.json({
  limit: '10mb',
}))

// Menangkap response untuk kebutuhan activity log
app.use(captureResponsePayload)

/*
 * Endpoint publik untuk memastikan backend hidup.
 * Tidak memerlukan login.
 */
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    message: 'Backend FinStart aktif',
  })
})

/*
 * Endpoint publik untuk memastikan backend dan database hidup.
 * Tidak memerlukan login.
 */
app.get('/api/health', async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT 1 AS database_connected',
    )

    res.status(200).json({
      success: true,
      message: 'FinStart API dan database berjalan',
      data: {
        app: 'FinStart Backend',
        status: 'online',
        database_connected:
          Number(result?.[0]?.database_connected) === 1,
      },
    })
  } catch (error) {
    console.error(
      '[health] Koneksi database gagal:',
      error,
    )

    res.status(500).json({
      success: false,
      message: 'API berjalan, tetapi koneksi database gagal',
    })
  }
})

/*
 * Middleware keamanan global.
 *
 * Endpoint login atau endpoint publik lain yang berada di router
 * harus dikecualikan melalui PUBLIC_PATHS di middleware/auth.js.
 */
app.use(authenticate)
app.use(enforceApiAuthorization)
app.use(idempotency)
app.use(activityLogger)

// API autentikasi dan pengguna
app.use('/api/auth', authRouter)
app.use('/api/roles', rolesRouter)
app.use('/api/users', usersRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/audit', auditRouter)

// API keuangan
app.use('/api/clients', clientsRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/accounts', accountsRouter)
app.use('/api/journals', journalsRouter)
app.use(
  '/api/journal-transactions',
  journalTransactionsRouter,
)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/invoices', invoicesRouter)
app.use('/api/bills', billsRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/taxes', taxesRouter)
app.use('/api/tax-engine', taxEngineRouter)
app.use('/api/projections', projectionsRouter)
app.use('/api/assets', assetsRouter)
app.use('/api/asset-categories', assetCategoriesRouter)
app.use('/api/ai-copilot', aiCopilotRouter)

// API master data operasional
app.use('/api/divisions', divisionsRouter)
app.use('/api/positions', positionsRouter)
app.use('/api/employees', employeesRouter)
app.use('/api/bpjs-config', bpjsConfigRouter)
app.use(
  '/api/company-settings',
  companySettingsRouter,
)

// API payroll
app.use('/api/payroll', payrollRouter)

/*
 * Penanganan endpoint yang tidak ditemukan.
 * Harus diletakkan setelah seluruh route.
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  })
})

/*
 * Penanganan error umum, termasuk penolakan CORS.
 */
app.use((error, req, res, next) => {
  console.error('[server] Terjadi kesalahan:', error)

  if (res.headersSent) {
    next(error)
    return
  }

  const isCorsError =
    error?.message ===
    'Origin tidak diizinkan oleh konfigurasi CORS'

  res.status(isCorsError ? 403 : 500).json({
    success: false,
    message: isCorsError
      ? 'Origin frontend tidak diizinkan'
      : 'Terjadi kesalahan pada server',
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `FinStart API berjalan pada port ${PORT}`,
  )
})
