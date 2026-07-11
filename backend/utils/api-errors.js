const DATABASE_ERROR_CODES = new Set([
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'ER_BAD_FIELD_ERROR',
  'ER_DUP_ENTRY',
  'ER_LOCK_DEADLOCK',
  'ER_LOCK_WAIT_TIMEOUT',
  'ER_NO_REFERENCED_ROW_2',
  'ER_NO_SUCH_TABLE',
  'ER_PARSE_ERROR',
  'ER_ROW_IS_REFERENCED_2',
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'PROTOCOL_CONNECTION_LOST',
])

const DATABASE_MESSAGE_PATTERN = /\b(sql|mysql|mariadb|database|table|column|constraint|foreign key|duplicate entry|unknown column|syntax error|query|sequelize|drizzle)\b/i

function isDatabaseError(error) {
  const code = String(error?.code || '').toUpperCase()
  const message = String(error?.message || '')
  return DATABASE_ERROR_CODES.has(code) || code.startsWith('ER_') || DATABASE_MESSAGE_PATTERN.test(message)
}

/**
 * Keeps intentional validation messages readable, but never exposes raw
 * database/SQL details to API clients.
 */
function safePublicMessage(error, fallback = 'Permintaan tidak dapat diproses.') {
  const message = String(error?.message || '').trim()
  if (!message || isDatabaseError(error)) return fallback
  if (message.length > 240 || /\n|\bat\s+\S+\s*\(/.test(message)) return fallback
  return message
}

module.exports = { isDatabaseError, safePublicMessage }
