const express = require('express')
const db = require('../config/db')
const { safePublicMessage } = require('../utils/api-errors')

const router = express.Router()
const CONFIG_ID = 1
const OFFICIAL_RATES = Object.freeze({
  health_company_rate: 4,
  health_employee_rate: 1,
  jht_company_rate: 3.7,
  jht_employee_rate: 2,
  jp_company_rate: 2,
  jp_employee_rate: 1,
})

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
  if (!Number.isFinite(rate) || rate < 0 || rate > 20) {
    throw new Error(`${label} harus berupa persentase iuran antara 0 sampai 20, bukan pembagian porsi.`)
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

async function saveOfficialRates(notes = 'Tarif BPJS resmi dipulihkan oleh sistem.') {
  await db.query(
    `INSERT INTO bpjs_configurations (
       id, health_company_rate, health_employee_rate,
       jht_company_rate, jht_employee_rate,
       jp_company_rate, jp_employee_rate, effective_date, notes
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       health_company_rate = VALUES(health_company_rate),
       health_employee_rate = VALUES(health_employee_rate),
       jht_company_rate = VALUES(jht_company_rate),
       jht_employee_rate = VALUES(jht_employee_rate),
       jp_company_rate = VALUES(jp_company_rate),
       jp_employee_rate = VALUES(jp_employee_rate),
       effective_date = VALUES(effective_date), notes = VALUES(notes),
       updated_at = CURRENT_TIMESTAMP`,
    [CONFIG_ID, OFFICIAL_RATES.health_company_rate, OFFICIAL_RATES.health_employee_rate,
      OFFICIAL_RATES.jht_company_rate, OFFICIAL_RATES.jht_employee_rate,
      OFFICIAL_RATES.jp_company_rate, OFFICIAL_RATES.jp_employee_rate,
      today(), notes],
  )
}

router.get('/', async (req, res) => {
  try {
    let config = await getConfig()

    const hasInvalidLegacyRate = config && [
      config.health_company_rate, config.health_employee_rate,
      config.jht_company_rate, config.jht_employee_rate,
      config.jp_company_rate, config.jp_employee_rate,
    ].some((rate) => Number(rate) > 20)
    if (!config || hasInvalidLegacyRate) {
      await saveOfficialRates(
        hasInvalidLegacyRate
          ? 'Konfigurasi lama yang tidak valid direset ke tarif resmi.'
          : 'Tarif awal BPJS resmi.',
      )
      config = await getConfig()
    }

    res.json({ success: true, message: 'Konfigurasi BPJS berhasil diambil.', data: config })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil konfigurasi BPJS.'})
  }
})

router.post('/reset', async (req, res) => {
  try {
    await saveOfficialRates('Tarif BPJS direset ke nilai resmi oleh akuntan.')
    res.json({ success: true, message: 'Tarif BPJS berhasil direset ke nilai resmi.', data: await getConfig() })
  } catch (error) {
    res.status(500).json({ success: false, message: safePublicMessage(error, 'Gagal mereset tarif BPJS.') })
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
    res.status(400).json({ success: false, message: safePublicMessage(error, 'Gagal menyimpan konfigurasi BPJS.') })
  }
})

module.exports = router
