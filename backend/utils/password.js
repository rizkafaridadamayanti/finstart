const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const HASH_PREFIX = 'pbkdf2_sha256'
const ITERATIONS = 120000
const KEY_LENGTH = 32
const DIGEST = 'sha256'
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$/

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto
    .pbkdf2Sync(String(password || ''), salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex')

  return `${HASH_PREFIX}$${ITERATIONS}$${salt}$${hash}`
}

function timingSafeEqualText(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8')
  const right = Buffer.from(String(b || ''), 'utf8')

  if (left.length !== right.length) return false

  return crypto.timingSafeEqual(left, right)
}

function parsePbkdf2Hash(storedHash) {
  const hashText = String(storedHash || '')
  if (!hashText.startsWith(`${HASH_PREFIX}$`)) return null

  const [, iterationsText, salt, expectedHash] = hashText.split('$')
  const iterations = Number.parseInt(iterationsText, 10)
  if (!Number.isInteger(iterations) || iterations <= 0 || !salt || !expectedHash) return null

  return { iterations, salt, expectedHash }
}

function verifyPassword(password, storedHash) {
  const hashText = String(storedHash || '')
  const pbkdf2Hash = parsePbkdf2Hash(hashText)

  if (pbkdf2Hash) {
    const actualHash = crypto
      .pbkdf2Sync(String(password || ''), pbkdf2Hash.salt, pbkdf2Hash.iterations, KEY_LENGTH, DIGEST)
      .toString('hex')

    return timingSafeEqualText(actualHash, pbkdf2Hash.expectedHash)
  }

  // Kompatibilitas akun lama yang sebelumnya memakai bcrypt.
  if (BCRYPT_PATTERN.test(hashText)) {
    try {
      return bcrypt.compareSync(String(password || ''), hashText)
    } catch {
      return false
    }
  }

  // Kompatibilitas hash SHA-256 lama. Setelah login berhasil akan di-upgrade.
  if (/^[a-f0-9]{64}$/i.test(hashText)) {
    const actualHash = crypto
      .createHash('sha256')
      .update(String(password || ''))
      .digest('hex')

    return timingSafeEqualText(actualHash, hashText)
  }

  return false
}

function needsPasswordRehash(storedHash) {
  const pbkdf2Hash = parsePbkdf2Hash(storedHash)
  return !pbkdf2Hash || pbkdf2Hash.iterations < ITERATIONS
}

function createToken() {
  return crypto.randomBytes(32).toString('hex')
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex')
}

module.exports = {
  createToken,
  hashPassword,
  hashToken,
  needsPasswordRehash,
  verifyPassword,
}
