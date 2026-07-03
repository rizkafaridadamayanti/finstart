require('dotenv').config()

const express = require('express')
const cors = require('cors')
const db = require('./config/db')
const clientsRouter = require('./routes/clients')
const projectsRouter = require('./routes/projects')

const divisionsRouter = require('./routes/divisions')
const positionsRouter = require('./routes/positions')
const employeesRouter = require('./routes/employees')
const bpjsConfigRouter = require('./routes/bpjs-config')
const companySettingsRouter = require('./routes/company-settings')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: process.env.CORS_ORIGIN,
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

app.use('/api/clients', clientsRouter)
app.use('/api/projects', projectsRouter)

app.use('/api/divisions', divisionsRouter)
app.use('/api/positions', positionsRouter)
app.use('/api/employees', employeesRouter)
app.use('/api/bpjs-config', bpjsConfigRouter)
app.use('/api/company-settings', companySettingsRouter)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  })
})

app.listen(PORT, () => {
  console.log(`FinStart API berjalan di http://localhost:${PORT}`)
})