const crypto = require('crypto')

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(buffer) {
  let bits = 0
  let value = 0
  let output = ''
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return output
}

function base32Decode(input) {
  const normalized = String(input || '').toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const bytes = []
  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index < 0) continue
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

function generateSecret(size = 20) {
  return base32Encode(crypto.randomBytes(size))
}

function getCounter(epoch = Date.now(), period = 30) {
  return Math.floor(epoch / 1000 / period)
}

function generateCodeForCounter(secret, counter, digits = 6) {
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64BE(BigInt(counter))
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(buffer).digest()
  const offset = digest[digest.length - 1] & 0x0f
  const binary = ((digest[offset] & 0x7f) << 24)
    | ((digest[offset + 1] & 0xff) << 16)
    | ((digest[offset + 2] & 0xff) << 8)
    | (digest[offset + 3] & 0xff)
  return String(binary % (10 ** digits)).padStart(digits, '0')
}

function generateCode(secret, epoch = Date.now(), period = 30, digits = 6) {
  return generateCodeForCounter(secret, getCounter(epoch, period), digits)
}

function verifyCode(secret, code, window = 1) {
  const normalized = String(code || '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(normalized) || !secret) return false
  for (let offset = -window; offset <= window; offset += 1) {
    const expected = generateCode(secret, Date.now() + offset * 30 * 1000)
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalized))) return true
  }
  return false
}

function verifyCodeWithCounter(secret, code, options = {}) {
  const {
    window = 1,
    centerOffset = 0,
    epoch = Date.now(),
    period = 30,
    digits = 6,
  } = options
  const normalized = String(code || '').replace(/\D/g, '')
  if (!/^\d{6}$/.test(normalized) || !secret) return { valid: false }
  const currentCounter = getCounter(epoch, period)
  for (let delta = -window; delta <= window; delta += 1) {
    const offset = Number(centerOffset || 0) + delta
    const counter = currentCounter + offset
    const expected = generateCodeForCounter(secret, counter, digits)
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalized))) {
      return { valid: true, counter, offset }
    }
  }
  return { valid: false }
}

function buildOtpAuthUrl({ secret, accountName, issuer = 'FinStart' }) {
  const label = encodeURIComponent(`${issuer}:${accountName}`)
  return `otpauth://totp/${label}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
}

module.exports = {
  generateSecret,
  generateCode,
  verifyCodeWithCounter,
  verifyCode,
  buildOtpAuthUrl,
}
