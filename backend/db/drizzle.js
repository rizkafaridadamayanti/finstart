require('dotenv').config()

const mysql = require('mysql2/promise')
const { drizzle } = require('drizzle-orm/mysql2')
const schema = require('./schema')

function validatedDatabaseName() {
  const value = String(process.env.DB_NAME || 'finstart_db')
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error('DB_NAME hanya boleh berisi huruf, angka, dan underscore.')
  }
  return value
}

function createPool(options = {}) {
  return mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: validatedDatabaseName(),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    queueLimit: 0,
    dateStrings: true,
    multipleStatements: Boolean(options.multipleStatements),
  })
}

function createDrizzleDatabase(options = {}) {
  const pool = createPool(options)
  return { pool, db: drizzle(pool, { schema, mode: 'default' }) }
}

module.exports = { createDrizzleDatabase, createPool, validatedDatabaseName }
