require('dotenv').config()

const express = require('express')
const cors = require('cors')
const db = require('./config/db')

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

// Route Master Data Operasional dan Payroll
const divisionsRouter = require('./routes/divisions')
const positionsRouter = require('./routes/positions')
const employeesRouter = require('./routes/employees')
const bpjsConfigRouter = require('./routes/bpjs-config')
const companySettingsRouter = require('./routes/company-settings')
const payrollRouter = require('./routes/payroll')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}))

app.use(express.json())

app.get('/api/health', async (req, res) => {
  try {
    const [result] = await db.query('SELECT 1 AS database_connected')

    res.json({
      success: true,
      message: 'FinStart API dan database berjalan',
      data: {
        app: 'FinStart Backend',
        status: 'online',
        database_connected: result[0].database_connected === 1,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API berjalan, tetapi koneksi database gagal',
      error: error.message,
    })
  }
})

// API Keuangan
app.use('/api/clients', clientsRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/accounts', accountsRouter)
app.use('/api/journals', journalsRouter)
app.use('/api/journal-transactions', journalTransactionsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/invoices', invoicesRouter)
app.use('/api/bills', billsRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/taxes', taxesRouter)
app.use('/api/tax-engine', taxEngineRouter)
app.use('/api/projections', projectionsRouter)
app.use('/api/assets', assetsRouter)

// API Master Data Operasional
app.use('/api/divisions', divisionsRouter)
app.use('/api/positions', positionsRouter)
app.use('/api/employees', employeesRouter)
app.use('/api/bpjs-config', bpjsConfigRouter)
app.use('/api/company-settings', companySettingsRouter)

// API Payroll
app.use('/api/payroll', payrollRouter)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  })
})

app.listen(PORT, () => {
  console.log(`FinStart API berjalan di http://localhost:${PORT}`)
})