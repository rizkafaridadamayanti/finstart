import { access, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const frontendRoot = process.cwd()
const projectRoot = path.resolve(frontendRoot, '..')
const errors = []

async function exists(target) {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

const forbiddenPaths = [
  'frontend/src/views',
  'frontend/src/stores',
  'frontend/src/components/common/WorkspacePage.vue',
  'frontend/src/utils/tablePagination.tsx',
  'backend/database/seed_coa.sql',
  'backend/database/migrations',
  'database/finstart_db.sql',
  'database/finstart_db_final_seed.sql',
]

for (const relativePath of forbiddenPaths) {
  if (await exists(path.join(projectRoot, relativePath))) {
    errors.push(`File/folder legacy masih ada: ${relativePath}`)
  }
}

async function collectFiles(directory) {
  if (!(await exists(directory))) return []
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectFiles(fullPath))
    else files.push(fullPath)
  }
  return files
}

const sourceFiles = await collectFiles(path.join(frontendRoot, 'src'))
for (const file of sourceFiles) {
  if (/\.(jsx|tsx)$/i.test(file)) {
    errors.push(`File JSX/TSX tidak diperbolehkan: ${path.relative(projectRoot, file)}`)
  }
}

if (errors.length) {
  console.error('Audit kebersihan project gagal:\n')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Audit kebersihan project lulus: tidak ada source React lama, store/view legacy, dump database, atau seed SQL manual.')
