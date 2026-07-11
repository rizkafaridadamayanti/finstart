const fs = require('fs')
const path = require('path')

const migrationsFolder = path.join(__dirname, '..', 'drizzle', 'migrations')
const journalPath = path.join(migrationsFolder, 'meta', '_journal.json')

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function main() {
  const name = slugify(process.argv.slice(2).join(' '))
  if (!name) {
    throw new Error('Nama migration wajib diisi. Contoh: npm run db:new -- add_customer_category')
  }

  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'))
  const usedPrefixes = journal.entries
    .map((entry) => Number(String(entry.tag).split('_')[0]))
    .filter(Number.isFinite)
  const nextPrefix = String(Math.max(...usedPrefixes, -1) + 1).padStart(4, '0')
  const tag = `${nextPrefix}_${name}`
  const filePath = path.join(migrationsFolder, `${tag}.sql`)
  if (fs.existsSync(filePath)) throw new Error(`Migration sudah ada: ${tag}.sql`)

  const lastWhen = journal.entries.at(-1)?.when || 0
  const when = Math.max(Date.now(), Number(lastWhen) + 1)
  const template = [
    `-- Migration: ${name}`,
    '-- Jangan mengubah migration yang sudah pernah dijalankan.',
    '-- Untuk lebih dari satu statement, pisahkan dengan baris: --> statement-breakpoint',
    '',
    '-- Tulis SQL perubahan schema di bawah ini.',
    '',
  ].join('\n')

  fs.writeFileSync(filePath, template, 'utf8')
  journal.entries.push({
    idx: journal.entries.length,
    version: '7',
    when,
    tag,
    breakpoints: true,
  })
  fs.writeFileSync(journalPath, `${JSON.stringify(journal, null, 2)}\n`, 'utf8')

  console.log(`Migration dibuat: drizzle/migrations/${tag}.sql`)
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
