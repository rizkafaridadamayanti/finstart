require('dotenv').config()

const mysql = require('mysql2/promise')
const { migrate } = require('drizzle-orm/mysql2/migrator')
const { createDrizzleDatabase, validatedDatabaseName } = require('../db/drizzle')
const path = require('path')

const migrationsFolder = path.join(__dirname, '..', 'drizzle', 'migrations')

async function ensureDatabaseExists() {
  const database = validatedDatabaseName()
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  })

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    )
  } finally {
    await connection.end()
  }
}

async function main() {
  await ensureDatabaseExists()
  const { pool, db } = createDrizzleDatabase()

  try {
    await migrate(db, {
      migrationsFolder,
      migrationsTable: '__drizzle_migrations',
    })
    console.log('Seluruh migration Drizzle berhasil dijalankan.')
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error('Migration gagal:', error.message)
  process.exit(1)
})
