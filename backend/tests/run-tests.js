const assert = require('node:assert/strict')
const { hashPassword, verifyPassword } = require('../utils/password')
const { generateSecret, generateCode, verifyCode } = require('../utils/totp')
const { hasPermission, getAllowedTabs } = require('../middleware/authorization')
const journalsRouter = require('../routes/journals')
const invoicesRouter = require('../routes/invoices')
const billsRouter = require('../routes/bills')
const taxesRouter = require('../routes/taxes')

let passed = 0
function test(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    throw error
  }
}

test('password disimpan dalam hash dan hanya password benar yang lolos', () => {
  const hash = hashPassword('PasswordAman123!')
  assert.notEqual(hash, 'PasswordAman123!')
  assert.equal(verifyPassword('PasswordAman123!', hash), true)
  assert.equal(verifyPassword('password-salah', hash), false)
})

test('kode MFA TOTP enam digit dibuat dan diverifikasi untuk secret pengguna', () => {
  const secret = generateSecret()
  const code = generateCode(secret, Date.now())
  assert.match(secret, /^[A-Z2-7]+$/)
  assert.match(code, /^\d{6}$/)
  assert.equal(verifyCode(secret, code), true)
  assert.equal(verifyCode(secret, '000000'), false)
})

test('jurnal seimbang dapat divalidasi', () => {
  const lines = journalsRouter.validateLinesForTest([
    { account_id: 1, debit: 150000, credit: 0 },
    { account_id: 2, debit: 0, credit: 150000 },
  ])
  assert.equal(lines.length, 2)
})

test('jurnal tidak seimbang ditolak', () => {
  assert.throws(
    () => journalsRouter.validateLinesForTest([
      { account_id: 1, debit: 150000, credit: 0 },
      { account_id: 2, debit: 0, credit: 100000 },
    ]),
    /Total debit harus sama dengan total kredit/,
  )
})

test('saldo pembayaran parsial invoice dan bill dihitung dari total dikurangi pembayaran', () => {
  assert.equal(invoicesRouter.getOutstandingForTest({ total_amount: 500000, paid_amount: 175000 }), 325000)
  assert.equal(billsRouter.getOutstandingForTest({ vendor_payable_amount: 900000, total_amount: 1000000, paid_amount: 250000 }), 650000)
})

test('PPN invoice dan PPh 23 bill menghitung nilai pajak dasar secara deterministik', () => {
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

test('PPh 21 payroll menghitung TER bulanan dan menandai Desember untuk rekonsiliasi', () => {
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

test('role HR tidak dapat menulis jurnal, sedangkan director dapat approve/post', () => {
  assert.equal(hasPermission('hr', 'journals', 'write'), false)
  assert.equal(hasPermission('director', 'journals', 'approve'), true)
  assert.equal(hasPermission('director', 'journals', 'post'), true)
  assert.equal(getAllowedTabs('project_manager').includes('crm'), true)
  assert.equal(getAllowedTabs('project_manager').includes('pengaturan'), false)
})

console.log(`\n${passed} pengujian otomatis berhasil.`)
