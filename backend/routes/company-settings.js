const express = require('express')
const db = require('../config/db')

const router = express.Router()

function cleanText(value, maxLength = 255) {
  const text = String(value ?? '').trim()
  return text ? text.slice(0, maxLength) : null
}

function normalizeCurrency(value) {
  const currency = String(value || 'IDR').trim().toUpperCase()
  if (!/^[A-Z]{3,10}$/.test(currency)) return null
  return currency
}

function normalizeFiscalYear(value) {
  const year = Number(value)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return null
  return year
}

async function getSettings() {
  const [rows] = await db.query('SELECT * FROM company_settings ORDER BY id ASC LIMIT 1')
  return rows[0] || null
}

function defaultSettings() {
  return {
    id: 1,
    company_name: 'FinStart',
    logo_url: null,
    address: null,
    email: null,
    phone: null,
    npwp: null,
    fiscal_year: new Date().getFullYear(),
    currency: 'IDR',
    city: null,
    province: null,
    postal_code: null,
    website: null,
  }
}

function normalizePayload(body = {}) {
  const fiscalYear = normalizeFiscalYear(body.fiscal_year ?? new Date().getFullYear())
  const currency = normalizeCurrency(body.currency ?? 'IDR')

  if (!fiscalYear) throw new Error('Tahun buku harus berada antara 2000 sampai 2100.')
  if (!currency) throw new Error('Mata uang tidak valid.')

  return {
    company_name: cleanText(body.company_name, 180),
    logo_url: cleanText(body.logo_url, 500),
    address: cleanText(body.address, 10000),
    email: cleanText(body.email, 150),
    phone: cleanText(body.phone, 40),
    npwp: cleanText(body.npwp, 50),
    fiscal_year: fiscalYear,
    currency,
    city: cleanText(body.city, 120),
    province: cleanText(body.province, 120),
    postal_code: cleanText(body.postal_code, 15),
    website: cleanText(body.website, 255),
  }
}

router.get('/', async (req, res) => {
  try {
    const settings = (await getSettings()) || defaultSettings()
    res.json({ success: true, message: 'Pengaturan perusahaan berhasil diambil.', data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan perusahaan.', error: error.message })
  }
})

router.put('/', async (req, res) => {
  try {
    const payload = normalizePayload(req.body || {})
    const existing = await getSettings()

    if (existing) {
      await db.query(
        `
          UPDATE company_settings
          SET
            company_name = ?, logo_url = ?, address = ?, email = ?, phone = ?,
            npwp = ?, fiscal_year = ?, currency = ?, city = ?, province = ?,
            postal_code = ?, website = ?
          WHERE id = ?
        `,
        [
          payload.company_name, payload.logo_url, payload.address, payload.email, payload.phone,
          payload.npwp, payload.fiscal_year, payload.currency, payload.city, payload.province,
          payload.postal_code, payload.website, existing.id,
        ],
      )
    } else {
      await db.query(
        `
          INSERT INTO company_settings (
            id, company_name, logo_url, address, email, phone,
            npwp, fiscal_year, currency, city, province, postal_code, website
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          1,
          payload.company_name, payload.logo_url, payload.address, payload.email, payload.phone,
          payload.npwp, payload.fiscal_year, payload.currency, payload.city, payload.province,
          payload.postal_code, payload.website,
        ],
      )
    }

    res.json({ success: true, message: 'Pengaturan perusahaan berhasil disimpan.', data: await getSettings() })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Gagal menyimpan pengaturan perusahaan.' })
  }
})

module.exports = router
