const assert = require('node:assert/strict')
const bcrypt = require('bcryptjs')
const { createCorsOptions } = require('../config/cors')
const { hashPassword, needsPasswordRehash, verifyPassword } = require('../utils/password')
const { authenticate } = require('../middleware/auth')
const { hasPermission, getAllowedTabs, enforceApiAuthorization } = require('../middleware/authorization')
const db = require('../config/db')
const journalsRouter = require('../routes/journals')
const invoicesRouter = require('../routes/invoices')
const billsRouter = require('../routes/bills')
const taxesRouter = require('../routes/taxes')
const authRouter = require('../routes/auth')
const clientsRouter = require('../routes/clients')
const accountsRouter = require('../routes/accounts')
const projectsRouter = require('../routes/projects')
const journalTransactionsRouter = require('../routes/journal-transactions')
const projectionsRouter = require('../routes/projections')
const assetsRouter = require('../routes/assets')
const { currentPeriodInJakarta, isValidDate, isValidPeriod, todayInJakarta } = require('../utils/date-validation')
const { safePublicMessage } = require('../utils/api-errors')

let passed = 0
async function test(name, fn) {
  try {
    await fn()
    passed += 1
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    throw error
  }
}

async function invokeRoute(router, routePath, method, req) {
  const layer = router.stack.find((item) =>
    item.route?.path === routePath &&
    item.route?.methods?.[method.toLowerCase()]
  )
  assert.ok(layer, `Route ${method} ${routePath} tidak ditemukan`)

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }

  const handlers = layer.route.stack.map((item) => item.handle)
  let index = 0
  async function runNext(error) {
    if (error) throw error
    const handler = handlers[index]
    index += 1
    if (!handler) return

    let nextCalled = false
    let nextError = null
    const result = handler(req, res, (nextValue) => {
      nextCalled = true
      nextError = nextValue
    })

    if (result && typeof result.then === 'function') {
      await result
    }

    if (nextCalled) {
      await runNext(nextError)
    }
  }

  await runNext()
  return res
}

function makeFakeConnection(queryHandler) {
  const calls = []
  return {
    calls,
    beginCount: 0,
    commitCount: 0,
    rollbackCount: 0,
    releaseCount: 0,
    async beginTransaction() {
      this.beginCount += 1
    },
    async commit() {
      this.commitCount += 1
    },
    async rollback() {
      this.rollbackCount += 1
    },
    release() {
      this.releaseCount += 1
    },
    async query(sql, params) {
      const text = String(sql).replace(/\s+/g, ' ').trim()
      calls.push({ sql: text, params })
      return queryHandler(text, params, calls.length)
    },
  }
}

async function withMockConnection(connection, fn) {
  const originalGetConnection = db.getConnection
  db.getConnection = async () => connection
  try {
    return await fn()
  } finally {
    db.getConnection = originalGetConnection
  }
}

async function withMockQuery(queryHandler, fn) {
  const originalQuery = db.query
  const calls = []
  db.query = async (sql, params = []) => {
    const text = String(sql).replace(/\s+/g, ' ').trim()
    calls.push({ sql: text, params })
    return queryHandler(text, params, calls.length)
  }
  try {
    return await fn(calls)
  } finally {
    db.query = originalQuery
  }
}

async function invokeMiddleware(middleware, reqOverrides = {}) {
  const req = {
    method: 'GET',
    path: '/api/accounts',
    originalUrl: '/api/accounts',
    get() {
      return ''
    },
    ...reqOverrides,
  }
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
  let nextCalled = false
  await middleware(req, res, () => {
    nextCalled = true
  })
  return { res, nextCalled }
}

function checkCorsOrigin(origin, env = {}) {
  const options = createCorsOptions(env)
  return new Promise((resolve) => {
    options.origin(origin, (error, allowed) => {
      resolve({ error, allowed })
    })
  })
}

async function main() {

await test('password disimpan dalam hash dan hanya password benar yang lolos', () => {
  const hash = hashPassword('PasswordAman123!')
  assert.notEqual(hash, 'PasswordAman123!')
  assert.equal(verifyPassword('PasswordAman123!', hash), true)
  assert.equal(verifyPassword('password-salah', hash), false)
})

await test('hash bcrypt lama tetap dapat login dan ditandai untuk upgrade', () => {
  const legacyHash = bcrypt.hashSync('PasswordLama123!', 8)
  assert.equal(verifyPassword('PasswordLama123!', legacyHash), true)
  assert.equal(verifyPassword('password-salah', legacyHash), false)
  assert.equal(needsPasswordRehash(legacyHash), true)
  assert.equal(needsPasswordRehash(hashPassword('PasswordBaru123!')), false)
})

await test('login dengan hash lama otomatis upgrade tanpa mengubah password', async () => {
  const password = 'PasswordLama123!'
  const email = `legacy-${Date.now()}@example.test`
  const legacyHash = bcrypt.hashSync(password, 8)
  let upgradedHash = ''
  let userLookupCount = 0
  let passwordHashUpdateCount = 0

  await withMockQuery((sql, params) => {
    if (sql.includes('FROM users')) {
      userLookupCount += 1
      return [[{
        id: 42,
        role_id: 1,
        name: 'User Legacy',
        email,
        status: 'active',
        password_hash: userLookupCount === 1 ? legacyHash : upgradedHash,
        role_name: 'finance_manager',
      }]]
    }

    if (sql.startsWith('UPDATE users SET password_hash = ?')) {
      passwordHashUpdateCount += 1
      upgradedHash = params[0]
      assert.equal(params[1], 42)
      assert.notEqual(upgradedHash, legacyHash)
      assert.equal(verifyPassword(password, upgradedHash), true)
      assert.equal(needsPasswordRehash(upgradedHash), false)
      return [{}]
    }

    if (sql.startsWith('INSERT INTO auth_sessions')) {
      assert.equal(params[0], 42)
      assert.equal(String(params[2]).includes('LegacyTestAgent'), true)
      return [{ insertId: 700 + userLookupCount }]
    }

    if (sql.startsWith('UPDATE users SET last_login_at')) return [{}]
    if (sql.startsWith('INSERT IGNORE INTO user_security_settings')) return [{}]
    if (sql.includes('FROM user_security_settings')) return [[{ login_alerts: 0, session_alerts: 1 }]]
    if (sql.startsWith('INSERT INTO activity_logs')) return [{}]
    throw new Error(`Query tidak diharapkan: ${sql}`)
  }, async () => {
    const firstLogin = await invokeRoute(authRouter, '/login', 'POST', {
      body: { email, password },
      headers: { 'user-agent': 'LegacyTestAgent/1.0' },
      ip: '127.0.0.11',
    })

    assert.equal(firstLogin.statusCode, 200)
    assert.equal(firstLogin.body.success, true)
    assert.equal(typeof firstLogin.body.data.token, 'string')
    assert.equal(passwordHashUpdateCount, 1)

    const secondLogin = await invokeRoute(authRouter, '/login', 'POST', {
      body: { email, password },
      headers: { 'user-agent': 'LegacyTestAgent/1.0' },
      ip: '127.0.0.11',
    })

    assert.equal(secondLogin.statusCode, 200)
    assert.equal(secondLogin.body.success, true)
    assert.equal(passwordHashUpdateCount, 1)
    assert.equal(userLookupCount, 2)
  })
})

await test('jurnal seimbang dapat divalidasi', () => {
  const lines = journalsRouter.validateLinesForTest([
    { account_id: 1, debit: 150000, credit: 0 },
    { account_id: 2, debit: 0, credit: 150000 },
  ])
  assert.equal(lines.length, 2)
})

await test('jurnal tidak seimbang ditolak', () => {
  assert.throws(
    () => journalsRouter.validateLinesForTest([
      { account_id: 1, debit: 150000, credit: 0 },
      { account_id: 2, debit: 0, credit: 100000 },
    ]),
    /Total debit harus sama dengan total kredit/,
  )
})

await test('saldo pembayaran parsial invoice dan bill dihitung dari total dikurangi pembayaran', () => {
  assert.equal(invoicesRouter.getOutstandingForTest({ total_amount: 500000, paid_amount: 175000 }), 325000)
  assert.equal(billsRouter.getOutstandingForTest({ vendor_payable_amount: 900000, total_amount: 1000000, paid_amount: 250000 }), 650000)
})

await test('PPN invoice dan PPh 23 bill menghitung nilai pajak dasar secara deterministik', () => {
  assert.deepEqual(invoicesRouter.normalizePpnForTest({ ppn_enabled: true, ppn_rate: 11 }, 1000000), {
    enabled: true,
    rate: 11,
    amount: 110000,
  })
  const billTaxes = billsRouter.normalizeBillTaxesForTest({
    ppn_enabled: true,
    ppn_rate: 11,
    pph23_enabled: true,
    pph23_rate: 2,
    vendor_has_npwp: false,
  }, 1000000)
  assert.equal(billTaxes.ppn.amount, 110000)
  assert.equal(billTaxes.pph23.effective_rate, 4)
  assert.equal(billTaxes.pph23.amount, 40000)
})

await test('nominal pajak besar dan desimal tetap dibulatkan dua desimal secara deterministik', () => {
  const ppn = invoicesRouter.normalizePpnForTest({ ppn_enabled: true, ppn_rate: 11 }, 999999999999.99)
  assert.equal(ppn.amount, 110000000000)

  const billTaxes = billsRouter.normalizeBillTaxesForTest(
    { ppn_enabled: true, ppn_rate: 11, pph23_enabled: true, pph23_rate: 2, vendor_has_npwp: false },
    1234567890.12,
  )
  assert.equal(billTaxes.ppn.amount, 135802467.91)
  assert.equal(billTaxes.pph23.effective_rate, 4)
  assert.equal(billTaxes.pph23.amount, 49382715.6)

  const debit = 1234567890.12 + billTaxes.ppn.amount
  const credit = 1234567890.12 + billTaxes.ppn.amount
  assert.equal(Math.round((debit - credit) * 100), 0)
})

await test('tanggal default Asia/Jakarta tidak bergeser saat UTC masih hari sebelumnya', () => {
  const justAfterMidnightJakarta = new Date('2026-07-16T17:30:00.000Z')
  assert.equal(justAfterMidnightJakarta.toISOString().slice(0, 10), '2026-07-16')
  assert.equal(todayInJakarta(justAfterMidnightJakarta), '2026-07-17')
  assert.equal(currentPeriodInJakarta(justAfterMidnightJakarta), '2026-07')
})

await test('PPh 21 payroll menghitung TER bulanan dan menandai Desember untuk rekonsiliasi', () => {
  const calculation = taxesRouter.buildEmployeePph21Calculation({
    employee_name: 'Pegawai Uji',
    employee_nik: '3173000000000001',
    employee_position: 'Staf',
    tax_period: '2026-07',
    ptkp_status: 'TK/0',
    base_salary: 7500000,
    allowance_amount: 500000,
  })
  assert.equal(calculation.gross_income, 8000000)
  assert.equal(calculation.ter_rate, 0.015)
  assert.equal(calculation.pph21_amount, 120000)
  assert.equal(calculation.needs_final_reconciliation, false)

  const december = taxesRouter.buildEmployeePph21Calculation({
    employee_name: 'Pegawai Uji',
    tax_period: '2026-12',
    ptkp_status: 'TK/0',
    base_salary: 8000000,
    allowance_amount: 0,
  })
  assert.equal(december.needs_final_reconciliation, true)
  assert.equal(december.pph21_amount, null)
})


await test('status jurnal transaksi dinormalisasi ke lima status final', () => {
  const status = journalTransactionsRouter.getTransactionStatusForTest
  assert.equal(status({ journalId: null, sourceType: 'invoice_draft', sourceStatus: 'draft' }), 'unposted')
  assert.equal(status({ journalId: 10, journalStatus: 'approved', sourceType: 'manual' }), 'unposted')
  assert.equal(status({ journalId: 1, journalStatus: 'posted', sourceType: 'manual' }), 'posted')
  assert.equal(status({ journalId: 2, journalStatus: 'posted', sourceType: 'invoice', sourceStatus: 'partial' }), 'posted-unpaid')
  assert.equal(status({ journalId: 5, journalStatus: 'posted', sourceType: 'bill', sourceStatus: 'payable' }), 'posted-unpaid')
  assert.equal(status({ journalId: 3, journalStatus: 'posted', sourceType: 'invoice_payment', sourceStatus: 'paid' }), 'posted-paid')
  assert.equal(status({ journalId: 6, journalStatus: 'posted', sourceType: 'tax_payment', sourceStatus: 'paid' }), 'posted-paid')
  assert.equal(status({ journalId: 4, journalStatus: 'cancelled', sourceType: 'manual' }), 'canceled')
  assert.equal(status({ journalId: 7, journalStatus: 'posted', sourceType: 'invoice_void', sourceStatus: 'void' }), 'canceled')
})

await test('role HR tidak dapat menulis jurnal, sedangkan director dapat approve/post', () => {
  assert.equal(hasPermission('hr', 'journals', 'write'), false)
  assert.equal(hasPermission('director', 'journals', 'approve'), true)
  assert.equal(hasPermission('director', 'journals', 'post'), true)
  assert.equal(getAllowedTabs('project_manager').includes('crm'), true)
  assert.equal(getAllowedTabs('project_manager').includes('pengaturan'), false)
})

await test('CORS hanya menerima origin terkonfigurasi dan localhost 5173', async () => {
  const originalWarn = console.warn
  console.warn = () => {}
  try {
    const localhost = await checkCorsOrigin('http://localhost:5173')
    assert.equal(localhost.error, null)
    assert.equal(localhost.allowed, true)

    const configured = await checkCorsOrigin('https://app.example.test', {
      CORS_ORIGIN: 'https://app.example.test',
    })
    assert.equal(configured.error, null)
    assert.equal(configured.allowed, true)

    const blocked = await checkCorsOrigin('https://evil.example.test')
    assert.ok(blocked.error)
    assert.equal(blocked.allowed, undefined)
    assert.match(blocked.error.message, /Origin tidak diizinkan/)
  } finally {
    console.warn = originalWarn
  }
})

await test('role tanpa permission ditolak 403 sebelum mutasi dijalankan', async () => {
  const originalQuery = db.query
  const auditCalls = []
  db.query = async (sql, params = []) => {
    auditCalls.push({ sql: String(sql), params })
    return [{}]
  }
  try {
    const result = await invokeMiddleware(enforceApiAuthorization, {
      method: 'POST',
      path: '/api/accounts',
      originalUrl: '/api/accounts',
      user: {
        id: 22,
        name: 'Auditor Uji',
        email: 'auditor@example.test',
        role_name: 'auditor',
      },
    })

    assert.equal(result.res.statusCode, 403)
    assert.equal(result.nextCalled, false)
    assert.match(result.res.body.message, /Hak akses/)
    assert.ok(auditCalls.some((call) => call.sql.includes('INSERT INTO activity_logs')))
  } finally {
    db.query = originalQuery
  }
})

await test('endpoint protected tanpa Bearer token ditolak 401 dan endpoint publik tetap lewat', async () => {
  const originalWarn = console.warn
  console.warn = () => {}
  try {
    const protectedResult = await invokeMiddleware(authenticate)
    assert.equal(protectedResult.res.statusCode, 401)
    assert.equal(protectedResult.res.body.success, false)
    assert.match(protectedResult.res.body.message, /login/i)
    assert.equal(protectedResult.nextCalled, false)

    const malformedHeaderResult = await invokeMiddleware(authenticate, {
      get(header) {
        return String(header).toLowerCase() === 'authorization'
          ? 'Token abc'
          : ''
      },
    })
    assert.equal(malformedHeaderResult.res.statusCode, 401)
    assert.equal(malformedHeaderResult.nextCalled, false)

    const queryBodyTokenResult = await invokeMiddleware(authenticate, {
      query: { token: 'query-token-yang-harus-diabaikan' },
      body: { token: 'body-token-yang-harus-diabaikan' },
    })
    assert.equal(queryBodyTokenResult.res.statusCode, 401)
    assert.equal(queryBodyTokenResult.nextCalled, false)

    const loginResult = await invokeMiddleware(authenticate, {
      method: 'POST',
      path: '/api/auth/login',
      originalUrl: '/api/auth/login',
    })
    assert.equal(loginResult.res.statusCode, 200)
    assert.equal(loginResult.nextCalled, true)

    const statusResult = await invokeMiddleware(authenticate, {
      path: '/api/status',
      originalUrl: '/api/status',
    })
    assert.equal(statusResult.res.statusCode, 200)
    assert.equal(statusResult.nextCalled, true)

    const statusWithInvalidTokenResult = await invokeMiddleware(authenticate, {
      path: '/api/status',
      originalUrl: '/api/status',
      get(header) {
        return String(header).toLowerCase() === 'authorization'
          ? 'Bearer token-tidak-valid'
          : ''
      },
    })
    assert.equal(statusWithInvalidTokenResult.res.statusCode, 200)
    assert.equal(statusWithInvalidTokenResult.nextCalled, true)
  } finally {
    console.warn = originalWarn
  }
})

await test('invoice draft tampil di transaksi sebagai unposted dengan sumber dan nominal benar', async () => {
  const response = await withMockQuery((sql, params) => {
    if (sql.includes('FROM journal_entries je LEFT JOIN users creator')) {
      return [[]]
    }

    if (sql.includes('FROM invoices inv') && sql.includes("inv.status IN ('draft', 'cancelled')")) {
      assert.deepEqual(params, ['%INV-DRAFT-001%', '%INV-DRAFT-001%', '%INV-DRAFT-001%'])
      return [[{
        id: 17,
        invoice_number: 'INV-DRAFT-001',
        issue_date: '2026-07-17',
        created_at: '2026-07-17T08:15:00.000Z',
        total_amount: '4000000.00',
        status: 'draft',
        client_name: 'PT Contoh Nusantara',
        project_name: 'Implementasi ERP',
      }]]
    }

    if (sql.includes('FROM bills')) return [[]]
    if (sql.includes('FROM tax_records')) return [[]]
    throw new Error(`Query tidak diharapkan: ${sql}`)
  }, () => invokeRoute(
    journalTransactionsRouter,
    '/',
    'GET',
    { query: { search: 'INV-DRAFT-001' } },
  ))

  assert.equal(response.statusCode, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.length, 1)
  assert.deepEqual(response.body.data[0], {
    id: 'INV-17',
    journal_id: null,
    tanggal: '2026-07-17',
    refVoucher: 'INV-DRAFT-001',
    keterangan: 'Piutang PT Contoh Nusantara (Implementasi ERP)',
    source_type: 'invoice_draft',
    source_status: 'draft',
    source_number: 'INV-DRAFT-001',
    party_name: 'PT Contoh Nusantara',
    nominal: 4000000,
    total_debit: 0,
    total_credit: 0,
    debitAkun: '',
    kreditAkun: '',
    debit_allocations: [],
    credit_allocations: [],
    status: 'unposted',
    journal_status: null,
    approved_at: null,
    created_by_name: '-',
    approved_by_name: '-',
    _raw: {
      id: 17,
      invoice_number: 'INV-DRAFT-001',
      issue_date: '2026-07-17',
      created_at: '2026-07-17T08:15:00.000Z',
      total_amount: '4000000.00',
      status: 'draft',
      client_name: 'PT Contoh Nusantara',
      project_name: 'Implementasi ERP',
    },
  })
})

await test('bill draft dan pajak draft tampil tanpa duplikasi dan bisa dicari dengan filter tanggal', async () => {
  const response = await withMockQuery((sql, params) => {
    if (sql.includes('FROM journal_entries je LEFT JOIN users creator')) {
      assert.equal(params[0], '2026-07-17')
      assert.equal(params.slice(1).length, 18)
      return [[]]
    }

    if (sql.includes('FROM invoices inv') && sql.includes("inv.status IN ('draft', 'cancelled')")) {
      assert.deepEqual(params, ['2026-07-17', '%DOK-UJI%', '%DOK-UJI%', '%DOK-UJI%'])
      return [[]]
    }

    if (sql.includes('FROM bills') && sql.includes("status IN ('draft', 'cancelled')")) {
      assert.deepEqual(params, ['2026-07-17', '%DOK-UJI%', '%DOK-UJI%', '%DOK-UJI%'])
      return [[{
        id: 23,
        bill_number: 'BIL-DOK-UJI',
        bill_date: '2026-07-17',
        created_at: '2026-07-17T09:00:00.000Z',
        total_amount: '2750000.00',
        vendor_name: 'Vendor DOK-UJI',
        notes: 'Tagihan layanan DOK-UJI',
        status: 'draft',
      }]]
    }

    if (sql.includes('FROM tax_records') && sql.includes("status = 'draft'")) {
      assert.deepEqual(params, ['2026-07-17', '%DOK-UJI%', '%DOK-UJI%', '%DOK-UJI%', '%DOK-UJI%'])
      return [[{
        id: 31,
        tax_type: 'PPN DOK-UJI',
        tax_period: '2026-07',
        tax_number: 'TAX-DOK-UJI',
        amount: '550000.00',
        due_date: '2026-08-31',
        created_at: '2026-07-17T10:00:00.000Z',
        notes: 'Pajak keluaran DOK-UJI',
      }]]
    }

    throw new Error(`Query tidak diharapkan: ${sql}`)
  }, () => invokeRoute(
    journalTransactionsRouter,
    '/',
    'GET',
    { query: { search: 'DOK-UJI', date: '2026-07-17' } },
  ))

  assert.equal(response.statusCode, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.length, 2)

  const bill = response.body.data.find((row) => row.id === 'BIL-23')
  assert.ok(bill)
  assert.equal(bill.status, 'unposted')
  assert.equal(bill.source_type, 'bill_draft')
  assert.equal(bill.source_number, 'BIL-DOK-UJI')
  assert.equal(bill.party_name, 'Vendor DOK-UJI')
  assert.equal(bill.nominal, 2750000)
  assert.equal(bill.tanggal, '2026-07-17')

  const tax = response.body.data.find((row) => row.id === 'TAX-31')
  assert.ok(tax)
  assert.equal(tax.status, 'unposted')
  assert.equal(tax.source_type, 'tax_draft')
  assert.equal(tax.source_status, 'draft')
  assert.equal(tax.source_number, 'TAX-DOK-UJI')
  assert.equal(tax.nominal, 550000)
  assert.equal(tax.tanggal, '2026-07-17')

  assert.equal(new Set(response.body.data.map((row) => row.id)).size, response.body.data.length)
})

await test('jurnal manual draft dan approved bisa dibatalkan tanpa perubahan saldo', async () => {
  for (const status of ['draft', 'approved']) {
    const connection = makeFakeConnection((sql, params) => {
      if (sql.includes('SELECT id, status, source_type FROM journal_entries')) {
        return [[{ id: params[0], status, source_type: 'manual' }]]
      }
      if (sql.startsWith("UPDATE journal_entries SET status = 'cancelled'")) return [{}]
      if (sql.includes('FROM journal_entries') && sql.includes('LEFT JOIN users AS creator')) {
        return [[{ id: params[0], status: 'cancelled', source_type: 'manual' }]]
      }
      if (sql.includes('FROM journal_lines') && sql.includes('INNER JOIN accounts')) return [[]]
      throw new Error(`Query tidak diharapkan: ${sql}`)
    })

    const response = await withMockConnection(connection, () => invokeRoute(
      journalsRouter,
      '/:id/void',
      'POST',
      {
        params: { id: status === 'draft' ? '101' : '102' },
        body: {},
        user: { id: 1, name: 'Director', email: 'director@example.test', role_name: 'director' },
      },
    ))

    assert.equal(response.statusCode, 200)
    assert.equal(response.body.success, true)
    assert.equal(response.body.data.status, 'cancelled')
    assert.equal(connection.commitCount, 1)
    assert.equal(connection.rollbackCount, 0)
    assert.equal(connection.calls.some((call) => call.sql.startsWith('UPDATE accounts')), false)
  }
})

await test('jurnal posted manual dibatalkan dengan pembalikan saldo tepat satu kali', async () => {
  const balanceUpdates = []
  const connection = makeFakeConnection((sql, params) => {
    if (sql.includes('SELECT id, status, source_type FROM journal_entries')) {
      return [[{ id: 201, status: 'posted', source_type: 'manual' }]]
    }
    if (sql === 'SELECT account_id, debit, credit FROM journal_lines WHERE journal_entry_id = ?') {
      return [[
        { account_id: 1, debit: 1000000, credit: 0 },
        { account_id: 2, debit: 0, credit: 1000000 },
      ]]
    }
    if (sql.includes('FROM accounts') && sql.includes('WHERE id IN (?)') && sql.includes('FOR UPDATE')) {
      return [[
        { id: 1, code: '1120', name: 'Bank', normal_balance: 'debit', status: 'active' },
        { id: 2, code: '4100', name: 'Pendapatan', normal_balance: 'credit', status: 'active' },
      ]]
    }
    if (sql.startsWith('UPDATE accounts SET current_balance')) {
      balanceUpdates.push({ amount: params[0], accountId: params[1] })
      return [{}]
    }
    if (sql.startsWith("UPDATE journal_entries SET status = 'cancelled'")) return [{}]
    if (sql.includes('FROM journal_entries') && sql.includes('LEFT JOIN users AS creator')) {
      return [[{ id: 201, status: 'cancelled', source_type: 'manual' }]]
    }
    if (sql.includes('FROM journal_lines') && sql.includes('INNER JOIN accounts')) return [[]]
    throw new Error(`Query tidak diharapkan: ${sql}`)
  })

  const response = await withMockConnection(connection, () => invokeRoute(
    journalsRouter,
    '/:id/void',
    'POST',
    {
      params: { id: '201' },
      body: {},
      user: { id: 1, name: 'Director', email: 'director@example.test', role_name: 'director' },
    },
  ))

  assert.equal(response.statusCode, 200)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.status, 'cancelled')
  assert.deepEqual(balanceUpdates, [
    { amount: -1000000, accountId: 1 },
    { amount: -1000000, accountId: 2 },
  ])
  assert.equal(connection.calls.filter((call) => call.sql.startsWith('UPDATE accounts SET current_balance')).length, 2)
  assert.equal(connection.commitCount, 1)
  assert.equal(connection.rollbackCount, 0)

  const secondConnection = makeFakeConnection((sql) => {
    if (sql.includes('SELECT id, status, source_type FROM journal_entries')) {
      return [[{ id: 201, status: 'cancelled', source_type: 'manual' }]]
    }
    throw new Error(`Query tidak boleh lanjut setelah status cancelled: ${sql}`)
  })

  const secondResponse = await withMockConnection(secondConnection, () => invokeRoute(
    journalsRouter,
    '/:id/void',
    'POST',
    {
      params: { id: '201' },
      body: {},
      user: { id: 1, name: 'Director', email: 'director@example.test', role_name: 'director' },
    },
  ))

  assert.equal(secondResponse.statusCode, 422)
  assert.match(secondResponse.body.message, /sudah berstatus cancelled/i)
  assert.equal(secondConnection.commitCount, 0)
  assert.equal(secondConnection.rollbackCount, 1)
})

await test('jurnal otomatis ditolak saat dibatalkan dari route jurnal', async () => {
  const connection = makeFakeConnection((sql, params) => {
    if (sql.includes('SELECT id, status, source_type FROM journal_entries')) {
      return [[{ id: params[0], status: 'posted', source_type: 'invoice' }]]
    }
    throw new Error(`Query tidak boleh lanjut untuk jurnal otomatis: ${sql}`)
  })

  const response = await withMockConnection(connection, () => invokeRoute(
    journalsRouter,
    '/:id/void',
    'POST',
    {
      params: { id: '301' },
      body: {},
      user: { id: 1, name: 'Director', email: 'director@example.test', role_name: 'director' },
    },
  ))

  assert.equal(response.statusCode, 422)
  assert.match(response.body.message, /halaman transaksi sumber/i)
  assert.equal(connection.commitCount, 0)
  assert.equal(connection.rollbackCount, 1)
  assert.equal(connection.calls.some((call) => call.sql.startsWith('UPDATE journal_entries')), false)
  assert.equal(connection.calls.some((call) => call.sql.startsWith('UPDATE accounts')), false)
})

await test('payload injeksi login tetap menjadi parameter SQL dan error database tidak bocor', async () => {
  const injection = "' OR 1=1 --"
  const normalizedInjection = injection.toLowerCase()
  const response = await withMockQuery((sql, params) => {
    if (sql.includes('FROM users')) {
      assert.equal(params[0], normalizedInjection)
      assert.equal(sql.includes(injection), false)
      assert.equal(sql.includes(normalizedInjection), false)
      return [[]]
    }
    if (sql.startsWith('INSERT INTO activity_logs')) return [{}]
    return [[]]
  }, () => invokeRoute(
    authRouter,
    '/login',
    'POST',
    {
      body: { email: injection, password: 'apa-saja' },
      headers: {},
      ip: '127.0.0.1',
    },
  ))

  assert.equal(response.statusCode, 401)
  assert.equal(response.body.success, false)
  assert.match(response.body.message, /Email atau kata sandi tidak sesuai/)

  const sqlError = Object.assign(new Error("ER_PARSE_ERROR: syntax error near 'OR 1=1'"), {
    code: 'ER_PARSE_ERROR',
  })
  assert.equal(safePublicMessage(sqlError, 'Gagal memproses permintaan.'), 'Gagal memproses permintaan.')
})

await test('login salah berulang dikunci sementara tanpa membocorkan user', async () => {
  const email = `bruteforce-${Date.now()}@example.test`
  await withMockQuery((sql) => {
    if (sql.includes('FROM users')) return [[]]
    if (sql.startsWith('INSERT INTO activity_logs')) return [{}]
    return [[]]
  }, async () => {
    let response = null
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      response = await invokeRoute(
        authRouter,
        '/login',
        'POST',
        {
          body: { email, password: 'password-salah' },
          headers: {},
          ip: '203.0.113.10',
        },
      )
      assert.equal(response.statusCode, 401)
      assert.match(response.body.message, /Email atau kata sandi tidak sesuai/)
    }

    response = await invokeRoute(
      authRouter,
      '/login',
      'POST',
      {
        body: { email, password: 'password-salah' },
        headers: {},
        ip: '203.0.113.10',
      },
    )
    assert.equal(response.statusCode, 429)
    assert.match(response.body.message, /Terlalu banyak percobaan/)
    assert.equal(/tidak ditemukan|nonaktif|user|pengguna/i.test(response.body.message), false)
  })
})

await test('hapus parent yang masih punya child diblokir dengan pesan non-teknis', async () => {
  const clientResponse = await withMockQuery((sql) => {
    if (sql.includes('FROM clients WHERE id = ?')) {
      return [[{ id: 7, status: 'active' }]]
    }
    if (sql.includes('FROM projects')) {
      return [[{ total: 2 }]]
    }
    throw new Error('DELETE tidak boleh dijalankan untuk klien yang masih dipakai')
  }, () => invokeRoute(
    clientsRouter,
    '/:id',
    'DELETE',
    { params: { id: '7' } },
  ))

  assert.equal(clientResponse.statusCode, 409)
  assert.equal(clientResponse.body.code, 'CLIENT_IN_USE')
  assert.match(clientResponse.body.message, /nonaktifkan klien/i)
  assert.equal(clientResponse.body.data.project_count, 2)

  const accountResponse = await withMockQuery(() => {
    const error = new Error('Cannot delete or update a parent row: a foreign key constraint fails')
    error.code = 'ER_ROW_IS_REFERENCED_2'
    throw error
  }, () => invokeRoute(
    accountsRouter,
    '/:id',
    'DELETE',
    { params: { id: '4' } },
  ))

  assert.equal(accountResponse.statusCode, 422)
  assert.match(accountResponse.body.message, /dipakai oleh data lain/)
  assert.equal(/foreign key|constraint|sql|mysql/i.test(accountResponse.body.message), false)
})

await test('hapus project yang punya transaksi atau anggota diblokir tanpa orphan', async () => {
  const calls = []
  const response = await withMockQuery((sql) => {
    calls.push(sql)
    if (sql.includes('FROM projects WHERE id = ?')) {
      return [[{ id: 9, status: 'ongoing' }]]
    }
    if (sql.includes('FROM project_members') && sql.includes('FROM invoices') && sql.includes('FROM bills')) {
      return [[{ member_count: 3, invoice_count: 2, bill_count: 1 }]]
    }
    throw new Error(`Query tidak diharapkan: ${sql}`)
  }, () => invokeRoute(
    projectsRouter,
    '/:id',
    'DELETE',
    { params: { id: '9' } },
  ))

  assert.equal(response.statusCode, 409)
  assert.equal(response.body.code, 'PROJECT_IN_USE')
  assert.match(response.body.message, /ubah status project/i)
  assert.deepEqual(response.body.data, {
    member_count: 3,
    invoice_count: 2,
    bill_count: 1,
  })
  assert.equal(calls.some((sql) => sql.startsWith('DELETE FROM project_members')), false)
  assert.equal(calls.some((sql) => sql.startsWith('DELETE FROM projects')), false)
})

await test('format tanggal dan bulan invalid ditolak sebelum data diterima', async () => {
  assert.equal(isValidDate('2026-02-28'), true)
  assert.equal(isValidDate('2026-02-31'), false)
  assert.equal(isValidDate('2026-13-01'), false)
  assert.equal(isValidDate('2026-01-01-extra'), false)
  assert.equal(isValidPeriod('2026-07'), true)
  assert.equal(isValidPeriod('2026-13'), false)
  assert.equal(isValidPeriod('2026-00'), false)
  assert.equal(isValidPeriod('2026-07-01'), false)

  const invalidInvoiceDate = await invokeRoute(
    invoicesRouter,
    '/',
    'POST',
    { body: { client_id: 1, issue_date: '2026-02-31' } },
  )
  assert.equal(invalidInvoiceDate.statusCode, 400)
  assert.match(invalidInvoiceDate.body.message, /Tanggal invoice tidak valid/)

  const invalidInvoiceDueDate = await invokeRoute(
    invoicesRouter,
    '/',
    'POST',
    { body: { client_id: 1, issue_date: '2026-03-10', due_date: '2026-03-09' } },
  )
  assert.equal(invalidInvoiceDueDate.statusCode, 400)
  assert.match(invalidInvoiceDueDate.body.message, /Tanggal jatuh tempo tidak valid/)

  const invalidBillDueDate = await invokeRoute(
    billsRouter,
    '/',
    'POST',
    { body: { vendor_name: 'Vendor Uji', bill_date: '2026-03-10', due_date: '2026-03-09' } },
  )
  assert.equal(invalidBillDueDate.statusCode, 400)
  assert.match(invalidBillDueDate.body.message, /Tanggal jatuh tempo tidak valid/)
})

await test('budget menolak bulan dan nominal di luar batas tanpa NaN atau overflow', () => {
  const isValidMonth = projectionsRouter.isValidMonthForTest
  const isValidBudgetAmount = projectionsRouter.isValidBudgetAmountForTest
  const maxBudgetAmount = projectionsRouter.MAX_BUDGET_AMOUNT_FOR_TEST

  assert.equal(isValidMonth(-1), false)
  assert.equal(isValidMonth(0), false)
  assert.equal(isValidMonth(1), true)
  assert.equal(isValidMonth(12), true)
  assert.equal(isValidMonth(13), false)
  assert.equal(isValidMonth(1.5), false)

  assert.equal(isValidBudgetAmount(-1), false)
  assert.equal(isValidBudgetAmount(0), true)
  assert.equal(isValidBudgetAmount(2500000.75), true)
  assert.equal(isValidBudgetAmount(Number.NaN), false)
  assert.equal(isValidBudgetAmount(Number.POSITIVE_INFINITY), false)
  assert.equal(isValidBudgetAmount(maxBudgetAmount + 1), false)
})

await test('budget backend memberi pesan field spesifik untuk akun dan nilai wajib', async () => {
  const missingAccount = await invokeRoute(
    projectionsRouter,
    '/budgets',
    'POST',
    {
      body: {
        budget_year: 2026,
        budget_month: 7,
        account_id: '',
        budget_amount: 1000000,
      },
    },
  )
  assert.equal(missingAccount.statusCode, 422)
  assert.match(missingAccount.body.message, /Akun buku besar wajib dipilih/)

  const missingAmount = await invokeRoute(
    projectionsRouter,
    '/budgets',
    'POST',
    {
      body: {
        budget_year: 2026,
        budget_month: 7,
        account_id: 10,
        budget_amount: '',
      },
    },
  )
  assert.equal(missingAmount.statusCode, 422)
  assert.match(missingAmount.body.message, /Nilai budget wajib diisi/)
})

await test('target pendapatan menerima minimum nol dan menolak nilai di luar batas', () => {
  const isValidProjectionTargetAmount = projectionsRouter.isValidProjectionTargetAmountForTest
  const maxTargetAmount = projectionsRouter.MAX_PROJECTION_TARGET_AMOUNT_FOR_TEST

  assert.equal(isValidProjectionTargetAmount(-1), false)
  assert.equal(isValidProjectionTargetAmount(0), true)
  assert.equal(isValidProjectionTargetAmount(1250000.75), true)
  assert.equal(isValidProjectionTargetAmount(Number.NaN), false)
  assert.equal(isValidProjectionTargetAmount(Number.POSITIVE_INFINITY), false)
  assert.equal(isValidProjectionTargetAmount(maxTargetAmount + 1), false)
})

await test('penyusutan aset periode perolehan dapat diposting dan duplikat periode ditolak', async () => {
  const balanceUpdates = []
  const depreciationInserts = []
  const connection = makeFakeConnection((sql, params) => {
    if (sql.includes("SELECT * FROM assets WHERE id = ? AND status = 'active'")) {
      return [[{
        id: 501,
        asset_code: 'AST-20260715-001',
        asset_name: 'Laptop Uji',
        acquisition_date: '2026-07-15',
        acquisition_cost: 12000000,
        useful_life_months: 12,
        residual_value: 0,
        accumulated_depreciation: 0,
        status: 'active',
      }]]
    }

    if (sql.includes('FROM asset_depreciations') && sql.includes('WHERE asset_id = ? AND depreciation_period = ?')) {
      assert.deepEqual(params, [501, '2026-07'])
      return [[]]
    }

    if (sql.includes('FROM accounts') && sql.includes('WHERE code = ?')) {
      if (params[0] === '5250') {
        return [[{ id: 5250, code: '5250', name: 'Beban Penyusutan Aset', normal_balance: 'debit', status: 'active' }]]
      }
      if (params[0] === '1220') {
        return [[{ id: 1220, code: '1220', name: 'Akumulasi Penyusutan Aset', normal_balance: 'credit', status: 'active' }]]
      }
      return [[]]
    }

    if (sql.startsWith('INSERT INTO asset_depreciations')) {
      depreciationInserts.push(params)
      assert.equal(params[0], 501)
      assert.equal(params[1], '2026-07')
      assert.equal(params[2], '2026-07-31')
      assert.equal(params[3], 1000000)
      assert.equal(params[4], 1000000)
      assert.equal(params[5], 11000000)
      return [{ insertId: 8801 }]
    }

    if (sql.startsWith('INSERT INTO journal_entries')) {
      assert.deepEqual(params, [
        'DEP-202607-A501',
        '2026-07-31',
        'Penyusutan aset Laptop Uji (AST-20260715-001) periode 2026-07',
        'asset_depreciation',
        8801,
      ])
      return [{ insertId: 9901 }]
    }

    if (sql.startsWith('INSERT INTO journal_lines')) {
      assert.equal(params[0], 9901)
      assert.equal(params[1], 5250)
      assert.equal(params[3], 1000000)
      assert.equal(params[4], 0)
      assert.equal(params[5], 9901)
      assert.equal(params[6], 1220)
      assert.equal(params[8], 0)
      assert.equal(params[9], 1000000)
      return [{}]
    }

    if (sql.includes('FROM accounts') && sql.includes('WHERE id = ?') && sql.includes('FOR UPDATE')) {
      if (params[0] === 5250) return [[{ id: 5250, normal_balance: 'debit' }]]
      if (params[0] === 1220) return [[{ id: 1220, normal_balance: 'credit' }]]
      return [[]]
    }

    if (sql.startsWith('UPDATE accounts SET current_balance')) {
      balanceUpdates.push({ amount: params[0], accountId: params[1] })
      return [{}]
    }

    if (sql.startsWith('UPDATE asset_depreciations SET journal_entry_id')) {
      assert.deepEqual(params, [9901, 8801])
      return [{}]
    }

    if (sql.startsWith('UPDATE assets SET accumulated_depreciation')) {
      assert.deepEqual(params, [1000000, 501])
      return [{}]
    }

    throw new Error(`Query tidak diharapkan: ${sql}`)
  })

  const response = await withMockConnection(connection, () => invokeRoute(
    assetsRouter,
    '/:id/depreciate',
    'POST',
    {
      params: { id: '501' },
      body: { depreciation_period: '2026-07' },
    },
  ))

  assert.equal(response.statusCode, 201)
  assert.equal(response.body.success, true)
  assert.equal(response.body.data.depreciation_amount, 1000000)
  assert.equal(response.body.data.accumulated_depreciation_after, 1000000)
  assert.equal(response.body.data.book_value_after, 11000000)
  assert.equal(response.body.data.journal_voucher_number, 'DEP-202607-A501')
  assert.deepEqual(balanceUpdates, [
    { amount: 1000000, accountId: 5250 },
    { amount: 1000000, accountId: 1220 },
  ])
  assert.equal(depreciationInserts.length, 1)
  assert.equal(connection.commitCount, 1)
  assert.equal(connection.rollbackCount, 0)

  const duplicateConnection = makeFakeConnection((sql, params) => {
    if (sql.includes("SELECT * FROM assets WHERE id = ? AND status = 'active'")) {
      return [[{
        id: 501,
        asset_code: 'AST-20260715-001',
        asset_name: 'Laptop Uji',
        acquisition_date: '2026-07-15',
        acquisition_cost: 12000000,
        useful_life_months: 12,
        residual_value: 0,
        accumulated_depreciation: 1000000,
        status: 'active',
      }]]
    }
    if (sql.includes('FROM asset_depreciations') && sql.includes('WHERE asset_id = ? AND depreciation_period = ?')) {
      assert.deepEqual(params, [501, '2026-07'])
      return [[{ id: 8801 }]]
    }
    throw new Error(`Query tidak boleh lanjut untuk penyusutan duplikat: ${sql}`)
  })

  const duplicateResponse = await withMockConnection(duplicateConnection, () => invokeRoute(
    assetsRouter,
    '/:id/depreciate',
    'POST',
    {
      params: { id: '501' },
      body: { depreciation_period: '2026-07' },
    },
  ))

  assert.equal(duplicateResponse.statusCode, 400)
  assert.match(duplicateResponse.body.message, /sudah pernah diposting/i)
  assert.equal(duplicateConnection.commitCount, 0)
  assert.equal(duplicateConnection.rollbackCount, 1)
  assert.equal(duplicateConnection.calls.some((call) => call.sql.startsWith('INSERT INTO asset_depreciations')), false)
  assert.equal(duplicateConnection.calls.some((call) => call.sql.startsWith('INSERT INTO journal_entries')), false)
})

await test('error tengah pembayaran invoice memicu rollback tanpa commit', async () => {
  const connection = makeFakeConnection((sql, params) => {
    if (sql.includes('FROM invoices WHERE id = ? FOR UPDATE')) {
      return [[{
        id: 10,
        invoice_number: 'INV-ROLLBACK',
        issue_date: '2026-07-01',
        due_date: '2026-07-31',
        total_amount: 1000000,
        paid_amount: 0,
        status: 'unpaid',
      }]]
    }
    if (sql.includes("source_type = 'invoice'")) return [[{ id: 90 }]]
    if (sql.includes('FROM accounts') && sql.includes('WHERE code = ?')) {
      return [[{ id: 1, code: params[0], name: 'Piutang Usaha', type: 'asset', normal_balance: 'debit' }]]
    }
    if (sql.includes('FROM accounts') && sql.includes('WHERE id = ?') && !sql.includes('FOR UPDATE')) {
      return [[{ id: 2, code: '1120', name: 'Bank', type: 'asset', normal_balance: 'debit' }]]
    }
    if (sql.startsWith('INSERT INTO invoice_payments')) return [{ insertId: 77 }]
    if (sql.startsWith('INSERT INTO journal_entries')) return [{ insertId: 88 }]
    if (sql.startsWith('INSERT INTO journal_lines')) return [{}]
    if (sql.includes('FROM accounts') && sql.includes('FOR UPDATE')) {
      return [[{ id: params[0], normal_balance: 'debit' }]]
    }
    if (sql.startsWith('UPDATE accounts')) {
      throw new Error('Simulasi gagal update saldo di tengah posting')
    }
    return [{}]
  })

  const response = await withMockConnection(connection, () => invokeRoute(
    invoicesRouter,
    '/:id/payments',
    'POST',
    {
      params: { id: '10' },
      body: {
        payment_date: '2026-07-17',
        amount: 250000,
        cash_account_id: 2,
      },
    },
  ))

  assert.equal(response.statusCode, 400)
  assert.equal(response.body.success, false)
  assert.equal(connection.beginCount, 1)
  assert.equal(connection.rollbackCount, 1)
  assert.equal(connection.commitCount, 0)
  assert.equal(connection.releaseCount, 1)
  assert.ok(connection.calls.some((call) => call.sql.startsWith('INSERT INTO invoice_payments')))
  assert.ok(connection.calls.some((call) => call.sql.startsWith('INSERT INTO journal_lines')))
  assert.ok(!connection.calls.some((call) => call.sql.startsWith('UPDATE invoices')))
})

await test('error tengah posting jurnal memicu rollback tanpa mengubah status posted', async () => {
  let accountUpdateCount = 0
  const connection = makeFakeConnection((sql) => {
    if (sql.includes('FROM journal_entries WHERE id = ? FOR UPDATE')) {
      return [[{ id: 15, status: 'approved' }]]
    }
    if (sql.includes('FROM journal_lines')) {
      return [[
        { account_id: 1, debit: 500000, credit: 0 },
        { account_id: 2, debit: 0, credit: 500000 },
      ]]
    }
    if (sql.includes('FROM accounts') && sql.includes('FOR UPDATE')) {
      return [[
        { id: 1, code: '1120', name: 'Bank', normal_balance: 'debit', status: 'active' },
        { id: 2, code: '4100', name: 'Pendapatan', normal_balance: 'credit', status: 'active' },
      ]]
    }
    if (sql.startsWith('UPDATE accounts')) {
      accountUpdateCount += 1
      if (accountUpdateCount === 2) {
        throw new Error('Simulasi gagal update saldo akun kedua')
      }
      return [{}]
    }
    return [{}]
  })

  const response = await withMockConnection(connection, () => invokeRoute(
    journalsRouter,
    '/:id/post',
    'POST',
    {
      params: { id: '15' },
      body: {},
      user: { id: 1, name: 'Director', email: 'director@example.test', role_name: 'director' },
    },
  ))

  assert.equal(response.statusCode, 500)
  assert.equal(response.body.success, false)
  assert.equal(connection.beginCount, 1)
  assert.equal(connection.rollbackCount, 1)
  assert.equal(connection.commitCount, 0)
  assert.equal(connection.releaseCount, 1)
  assert.equal(accountUpdateCount, 2)
  assert.ok(!connection.calls.some((call) => call.sql.includes("status = 'posted'")))
})

console.log(`\n${passed} pengujian otomatis berhasil.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
