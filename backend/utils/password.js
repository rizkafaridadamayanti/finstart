const crypto = require('crypto')

const HASH_PREFIX = 'pbkdf2_sha256'
const ITERATIONS = 120000
const KEY_LENGTH = 32
const DIGEST = 'sha256'

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

function verifyPassword(password, storedHash) {
  const hashText = String(storedHash || '')

  if (hashText.startsWith(`${HASH_PREFIX}$`)) {
    const [, iterationsText, salt, expectedHash] = hashText.split('$')
    const iterations = Number.parseInt(iterationsText, 10)

    if (!Number.isInteger(iterations) || !salt || !expectedHash) return false

    const actualHash = crypto
      .pbkdf2Sync(String(password || ''), salt, iterations, KEY_LENGTH, DIGEST)
      .toString('hex')

    return timingSafeEqualText(actualHash, expectedHash)
  }

  if (/^[a-f0-9]{64}$/i.test(hashText)) {
    const actualHash = crypto
      .createHash('sha256')
      .update(String(password || ''))
      .digest('hex')

    return timingSafeEqualText(actualHash, hashText)
  }

  return false
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
  verifyPassword,
}
