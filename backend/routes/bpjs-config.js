const express = require('express')
const db = require('../config/db')

const router = express.Router()
const CONFIG_ID = 1

function numberValue(value) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : NaN
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function cleanText(value, maxLength = 5000) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, maxLength) : null
}

function normalizeRate(value, label) {
  const rate = numberValue(value)
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new Error(`${label} harus bernilai antara 0 sampai 100.`)
  }
  return Math.round((rate + Number.EPSILON) * 10000) / 10000
}

function normalizePayload(body) {
  const effectiveDate = body?.effective_date || today()
  if (!isValidDate(effectiveDate)) throw new Error('Tanggal efektif konfigurasi BPJS tidak valid.')

  return {
    health_company_rate: normalizeRate(body?.health_company_rate, 'Tarif BPJS Kesehatan perusahaan'),
    health_employee_rate: normalizeRate(body?.health_employee_rate, 'Tarif BPJS Kesehatan pegawai'),
    jht_company_rate: normalizeRate(body?.jht_company_rate, 'Tarif JHT perusahaan'),
    jht_employee_rate: normalizeRate(body?.jht_employee_rate, 'Tarif JHT pegawai'),
    jp_company_rate: normalizeRate(body?.jp_company_rate, 'Tarif JP perusahaan'),
    jp_employee_rate: normalizeRate(body?.jp_employee_rate, 'Tarif JP pegawai'),
    effective_date: effectiveDate,
    notes: cleanText(body?.notes),
  }
}

async function getConfig() {
  const [rows] = await db.query(
    'SELECT * FROM bpjs_configurations WHERE id = ? LIMIT 1',
    [CONFIG_ID],
  )

  const config = rows[0]
  if (!config) return null

  return {
    ...config,
    health_company_rate: Number(config.health_company_rate || 0),
    health_employee_rate: Number(config.health_employee_rate || 0),
    jht_company_rate: Number(config.jht_company_rate || 0),
    jht_employee_rate: Number(config.jht_employee_rate || 0),
    jp_company_rate: Number(config.jp_company_rate || 0),
    jp_employee_rate: Number(config.jp_employee_rate || 0),
  }
}

router.get('/', async (req, res) => {
  try {
    let config = await getConfig()

    if (!config) {
      await db.query(
        `
          INSERT INTO bpjs_configurations (id, effective_date, notes)
          VALUES (?, ?, ?)
        `,
        [CONFIG_ID, today(), 'Isi tarif BPJS sesuai kebijakan perusahaan dan ketentuan yang berlaku.'],
      )
      config = await getConfig()
    }

    res.json({ success: true, message: 'Konfigurasi BPJS berhasil diambil.', data: config })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil konfigurasi BPJS.', error: error.message })
  }
})

router.put('/', async (req, res) => {
  try {
    const payload = normalizePayload(req.body || {})

    await db.query(
      `
        INSERT INTO bpjs_configurations (
          id, health_company_rate, health_employee_rate,
          jht_company_rate, jht_employee_rate,
          jp_company_rate, jp_employee_rate,
          effective_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          health_company_rate = VALUES(health_company_rate),
          health_employee_rate = VALUES(health_employee_rate),
          jht_company_rate = VALUES(jht_company_rate),
          jht_employee_rate = VALUES(jht_employee_rate),
          jp_company_rate = VALUES(jp_company_rate),
          jp_employee_rate = VALUES(jp_employee_rate),
          effective_date = VALUES(effective_date),
          notes = VALUES(notes),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        CONFIG_ID,
        payload.health_company_rate,
        payload.health_employee_rate,
        payload.jht_company_rate,
        payload.jht_employee_rate,
        payload.jp_company_rate,
        payload.jp_employee_rate,
        payload.effective_date,
        payload.notes,
      ],
    )

    res.json({ success: true, message: 'Konfigurasi BPJS berhasil disimpan.', data: await getConfig() })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal menyimpan konfigurasi BPJS.' })
  }
})

module.exports = router
