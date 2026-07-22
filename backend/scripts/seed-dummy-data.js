require('dotenv').config()

const { eq } = require('drizzle-orm')
const { createDrizzleDatabase } = require('../db/drizzle')
const schema = require('../db/schema')

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = String(new Date().getMonth() + 1).padStart(2, '0')
const CURRENT_PERIOD = `${CURRENT_YEAR}-${CURRENT_MONTH}`

async function seedDivisions(db) {
  const rows = [
    { code: 'DIV-ENG', name: 'Engineering', description: 'Tim pengembangan software dan infrastruktur teknologi' },
    { code: 'DIV-FIN', name: 'Finance', description: 'Tim keuangan dan akuntansi internal' },
    { code: 'DIV-HR', name: 'Human Resources', description: 'Tim SDM dan rekrutmen' },
  ]
  for (const row of rows) {
    await db.insert(schema.divisions).values({ ...row, status: 'active' })
      .onDuplicateKeyUpdate({ set: { name: row.name, description: row.description, status: 'active' } })
  }
  console.log(`${rows.length} divisi berhasil disiapkan.`)
  return rows
}

async function seedPositions(db, divisions) {
  const engDiv = divisions.find(d => d.code === 'DIV-ENG')
  const finDiv = divisions.find(d => d.code === 'DIV-FIN')
  const rows = [
    { code: 'POS-SE', name: 'Senior Engineer', divisionId: engDiv?.id, description: 'Pengembang senior' },
    { code: 'POS-JE', name: 'Junior Engineer', divisionId: engDiv?.id, description: 'Pengembang junior' },
    { code: 'POS-FA', name: 'Finance Analyst', divisionId: finDiv?.id, description: 'Analis keuangan' },
    { code: 'POS-AC', name: 'Accountant', divisionId: finDiv?.id, description: 'Akuntan' },
    { code: 'POS-PM', name: 'Project Manager', divisionId: engDiv?.id, description: 'Manajer proyek' },
  ]
  for (const row of rows) {
    await db.insert(schema.positions).values({ ...row, status: 'active' })
      .onDuplicateKeyUpdate({ set: { name: row.name, description: row.description, status: 'active' } })
  }
  console.log(`${rows.length} posisi berhasil disiapkan.`)
  return rows
}

async function seedEmployees(db) {
  const rows = [
    {
      employeeCode: 'EMP-001', fullName: 'Andi Prasetyo', name: 'Andi Prasetyo',
      email: 'andi@kedata.id', phone: '081234567890', position: 'Senior Engineer',
      salary: '18000000.00', baseSalary: '18000000.00', employmentStatus: 'active',
      employmentType: 'permanent', joinDate: '2023-01-15', bpjsStatus: 'active',
      ptkpStatus: 'TK/0', nik: '3201234567890001', npwp: '1234567890123456',
      bankName: 'Bank Mandiri', bankAccountNumber: '1234567890', bankAccountHolder: 'Andi Prasetyo',
    },
    {
      employeeCode: 'EMP-002', fullName: 'Siti Rahayu', name: 'Siti Rahayu',
      email: 'siti@kedata.id', phone: '081234567891', position: 'Finance Analyst',
      salary: '15000000.00', baseSalary: '15000000.00', employmentStatus: 'active',
      employmentType: 'permanent', joinDate: '2023-03-01', bpjsStatus: 'active',
      ptkpStatus: 'K/1', nik: '3201234567890002', npwp: '1234567890123457',
      bankName: 'Bank BCA', bankAccountNumber: '0987654321', bankAccountHolder: 'Siti Rahayu',
    },
    {
      employeeCode: 'EMP-003', fullName: 'Budi Santoso', name: 'Budi Santoso',
      email: 'budi@kedata.id', phone: '081234567892', position: 'Junior Engineer',
      salary: '10000000.00', baseSalary: '10000000.00', employmentStatus: 'active',
      employmentType: 'permanent', joinDate: '2024-01-10', bpjsStatus: 'active',
      ptkpStatus: 'TK/0', nik: '3201234567890003',
      bankName: 'Bank BNI', bankAccountNumber: '5678901234', bankAccountHolder: 'Budi Santoso',
    },
    {
      employeeCode: 'EMP-004', fullName: 'Dewi Lestari', name: 'Dewi Lestari',
      email: 'dewi@kedata.id', phone: '081234567893', position: 'Accountant',
      salary: '12000000.00', baseSalary: '12000000.00', employmentStatus: 'active',
      employmentType: 'permanent', joinDate: '2023-06-15', bpjsStatus: 'active',
      ptkpStatus: 'K/0', nik: '3201234567890004',
      bankName: 'Bank Mandiri', bankAccountNumber: '3456789012', bankAccountHolder: 'Dewi Lestari',
    },
    {
      employeeCode: 'EMP-005', fullName: 'Rizki Ramadhan', name: 'Rizki Ramadhan',
      email: 'rizki@kedata.id', phone: '081234567894', position: 'Project Manager',
      salary: '20000000.00', baseSalary: '20000000.00', employmentStatus: 'active',
      employmentType: 'permanent', joinDate: '2022-09-01', bpjsStatus: 'active',
      ptkpStatus: 'TK/1', nik: '3201234567890005', npwp: '1234567890123458',
      bankName: 'Bank BCA', bankAccountNumber: '6789012345', bankAccountHolder: 'Rizki Ramadhan',
    },
  ]
  for (const row of rows) {
    await db.insert(schema.employees).values(row)
      .onDuplicateKeyUpdate({ set: { fullName: row.fullName, name: row.name, salary: row.salary, baseSalary: row.baseSalary, employmentStatus: 'active' } })
  }
  console.log(`${rows.length} pegawai berhasil disiapkan.`)
}

async function seedClients(db) {
  const rows = [
    {
      companyName: 'PT Maju Jaya Teknologi', picName: 'Hendra Wijaya',
      email: 'hendra@majujaya.co.id', phone: '021-5551234',
      industry: 'Teknologi', category: 'Software House',
      location: 'Jakarta Selatan', address: 'Jl. Sudirman Kav. 45, Jakarta Selatan',
    },
    {
      companyName: 'PT Sejahtera Abadi', picName: 'Maya Kusuma',
      email: 'maya@sejahtera.co.id', phone: '021-5555678',
      industry: 'Manufaktur', category: 'Industri',
      location: 'Bandung', address: 'Jl. Asia Afrika No. 100, Bandung',
    },
    {
      companyName: 'PT Digital Nusantara', picName: 'Arif Setiawan',
      email: 'arif@digitalnusantara.co.id', phone: '021-5559012',
      industry: 'E-Commerce', category: 'Retail Online',
      location: 'Jakarta Pusat', address: 'Jl. MH Thamrin No. 20, Jakarta Pusat',
    },
  ]

  // Kolom "code" nullable & onDuplicateKeyUpdate tidak berguna di sini karena
  // tidak ada kolom unik yang benar-benar terisi untuk dibandingkan (code selalu
  // NULL sebelum baris ini ditambahkan) - jadi cek manual by companyName dulu
  // supaya script ini aman dijalankan berkali-kali tanpa membuat duplikat.
  for (const row of rows) {
    const [existingRows] = await db.execute(
      'SELECT id, code FROM clients WHERE company_name = ? LIMIT 1',
      [row.companyName],
    )
    const existing = (existingRows || [])[0]

    if (existing) {
      if (!existing.code) {
        const code = `KLN-${String(existing.id).padStart(4, '0')}`
        await db.execute('UPDATE clients SET code = ? WHERE id = ?', [code, existing.id])
      }
      continue
    }

    const [result] = await db.insert(schema.clients).values({ ...row, status: 'active' })
    const insertId = result.insertId
    const code = `KLN-${String(insertId).padStart(4, '0')}`
    await db.execute('UPDATE clients SET code = ? WHERE id = ?', [code, insertId])
  }
  console.log(`${rows.length} klien berhasil disiapkan.`)
}

async function seedProjects(db) {
  const [clientRows] = await db.query.clients.findMany ? [[]] : await db.execute('SELECT id, company_name FROM clients ORDER BY id LIMIT 3')
  const clientIds = (clientRows[0] || clientRows).map(c => c.id || c)

  const rows = [
    {
      clientId: clientIds[0] || 1, projectName: 'Implementasi ERP PT Maju Jaya',
      projectCode: 'PRJ-2025-001', contractValue: '250000000.00',
      status: 'ongoing', startDate: `${CURRENT_YEAR}-01-15`, endDate: `${CURRENT_YEAR}-06-30`,
      description: 'Proyek implementasi sistem ERP untuk PT Maju Jaya Teknologi',
      budgetAmount: '200000000.00',
    },
    {
      clientId: clientIds[1] || 2, projectName: 'Dashboard Analytics Sejahtera',
      projectCode: 'PRJ-2025-002', contractValue: '150000000.00',
      status: 'planning', startDate: `${CURRENT_YEAR}-04-01`, endDate: `${CURRENT_YEAR}-09-30`,
      description: 'Pembangunan dashboard analytics untuk PT Sejahtera Abadi',
      budgetAmount: '120000000.00',
    },
    {
      clientId: clientIds[2] || 3, projectName: 'Mobile App Digital Nusantara',
      projectCode: 'PRJ-2024-003', contractValue: '350000000.00',
      status: 'completed', startDate: `${CURRENT_YEAR - 1}-03-01`, endDate: `${CURRENT_YEAR - 1}-12-31`,
      description: 'Pengembangan mobile app untuk PT Digital Nusantara',
      budgetAmount: '280000000.00',
    },
  ]
  for (const row of rows) {
    await db.insert(schema.projects).values(row)
      .onDuplicateKeyUpdate({ set: { projectName: row.projectName, status: row.status, contractValue: row.contractValue } })
  }
  console.log(`${rows.length} proyek berhasil disiapkan.`)
}

async function seedJournalEntries(db) {
  const [accounts] = await db.execute('SELECT id, code FROM accounts ORDER BY id')
  const accountMap = {}
  for (const a of accounts) accountMap[a.code] = a.id

  const kasId = accountMap['1110'] || 1
  const bankId = accountMap['1120'] || 2
  const piutangId = accountMap['1130'] || 3
  const utangUsahaId = accountMap['2100'] || 5
  const modalId = accountMap['3100'] || 7
  const pendapatanJasaId = accountMap['4100'] || 9
  const bebanGajiId = accountMap['5100'] || 10
  const bebanOperasionalId = accountMap['5200'] || 11
  const bebanSewaId = accountMap['5210'] || 12

  const entries = [
    { voucher: `VCH-${CURRENT_YEAR}0101`, date: `${CURRENT_YEAR}-01-05`, description: 'Setoran modal awal', status: 'posted',
      lines: [{ accountId: bankId, debit: '500000000.00', credit: '0.00' }, { accountId: modalId, debit: '0.00', credit: '500000000.00' }] },
    { voucher: `VCH-${CURRENT_YEAR}0201`, date: `${CURRENT_YEAR}-02-01`, description: 'Penerimaan pembayaran proyek Digital Nusantara', status: 'posted',
      lines: [{ accountId: bankId, debit: '350000000.00', credit: '0.00' }, { accountId: pendapatanJasaId, debit: '0.00', credit: '350000000.00' }] },
    { voucher: `VCH-${CURRENT_YEAR}0301`, date: `${CURRENT_YEAR}-03-01`, description: 'Pembayaran gaji karyawan Maret', status: 'posted',
      lines: [{ accountId: bebanGajiId, debit: '75000000.00', credit: '0.00' }, { accountId: bankId, debit: '0.00', credit: '75000000.00' }] },
    { voucher: `VCH-${CURRENT_YEAR}0401`, date: `${CURRENT_YEAR}-04-01`, description: 'Pembayaran sewa kantor Q2', status: 'posted',
      lines: [{ accountId: bebanSewaId, debit: '45000000.00', credit: '0.00' }, { accountId: bankId, debit: '0.00', credit: '45000000.00' }] },
    { voucher: `VCH-${CURRENT_YEAR}0501`, date: `${CURRENT_YEAR}-05-15`, description: 'Pendapatan jasa konsultasi proyek ERP', status: 'posted',
      lines: [{ accountId: piutangId, debit: '125000000.00', credit: '0.00' }, { accountId: pendapatanJasaId, debit: '0.00', credit: '125000000.00' }] },
    { voucher: `VCH-${CURRENT_YEAR}0601`, date: `${CURRENT_YEAR}-06-01`, description: 'Pembayaran gaji karyawan Juni', status: 'posted',
      lines: [{ accountId: bebanGajiId, debit: '75000000.00', credit: '0.00' }, { accountId: bankId, debit: '0.00', credit: '75000000.00' }] },
    { voucher: `VCH-${CURRENT_YEAR}0701`, date: `${CURRENT_YEAR}-07-01`, description: 'Pembayaran beban operasional', status: 'draft',
      lines: [{ accountId: bebanOperasionalId, debit: '15000000.00', credit: '0.00' }, { accountId: bankId, debit: '0.00', credit: '15000000.00' }] },
  ]

  for (const entry of entries) {
    try {
      const [existing] = await db.execute(`SELECT id FROM journal_entries WHERE voucher_number = '${entry.voucher}'`)
      const existingRows = existing || []
      if (existingRows.length > 0) continue

      const totalDebit = entry.lines.reduce((sum, l) => sum + Number(l.debit), 0)
      const [result] = await db.execute(
        `INSERT INTO journal_entries (voucher_number, transaction_date, description, status, source_type, created_by)
         VALUES ('${entry.voucher}', '${entry.date}', '${entry.description}', '${entry.status}', 'manual', 1)`
      )
      const journalId = result.insertId
      for (const line of entry.lines) {
        await db.execute(
          `INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit)
           VALUES (${journalId}, ${line.accountId}, '${line.debit}', '${line.credit}')`
        )
      }
    } catch (err) {
      console.warn(`Skip journal ${entry.voucher}: ${err.message}`)
    }
  }
  console.log(`${entries.length} jurnal transaksi berhasil disiapkan.`)
}

async function seedInvoices(db) {
  const [clients] = await db.execute('SELECT id FROM clients ORDER BY id LIMIT 3')
  const clientRows = clients || []
  const [projects] = await db.execute('SELECT id FROM projects ORDER BY id LIMIT 3')
  const projectRows = projects || []

  const rows = [
    {
      clientId: clientRows[0]?.id || 1, projectId: projectRows[0]?.id || null,
      invoiceNumber: `INV-${CURRENT_YEAR}-001`, issueDate: `${CURRENT_YEAR}-02-15`,
      dueDate: `${CURRENT_YEAR}-03-15`, totalAmount: '125000000.00', paidAmount: '125000000.00',
      status: 'paid', notes: 'Pembayaran phase 1 proyek ERP',
    },
    {
      clientId: clientRows[1]?.id || 2, projectId: projectRows[1]?.id || null,
      invoiceNumber: `INV-${CURRENT_YEAR}-002`, issueDate: `${CURRENT_YEAR}-05-01`,
      dueDate: `${CURRENT_YEAR}-06-01`, totalAmount: '75000000.00', paidAmount: '0.00',
      status: 'unpaid', notes: 'Invoice konsultasi dashboard analytics',
    },
  ]
  for (const row of rows) {
    await db.insert(schema.invoices).values(row)
      .onDuplicateKeyUpdate({ set: { status: row.status, paidAmount: row.paidAmount } })
  }
  console.log(`${rows.length} invoice berhasil disiapkan.`)
}

async function seedBills(db) {
  const [projects] = await db.execute('SELECT id FROM projects ORDER BY id LIMIT 3')
  const projectRows = projects || []

  const rows = [
    {
      vendorName: 'PT Cloud Server Indonesia', projectId: projectRows[0]?.id || null,
      billNumber: `BILL-${CURRENT_YEAR}-001`, billDate: `${CURRENT_YEAR}-03-01`,
      dueDate: `${CURRENT_YEAR}-04-01`, totalAmount: '18000000.00', paidAmount: '18000000.00',
      status: 'paid', notes: 'Tagihan cloud hosting Q1',
    },
    {
      vendorName: 'PT Office Space Rental', projectId: projectRows[1]?.id || null,
      billNumber: `BILL-${CURRENT_YEAR}-002`, billDate: `${CURRENT_YEAR}-06-01`,
      dueDate: `${CURRENT_YEAR}-07-01`, totalAmount: '45000000.00', paidAmount: '0.00',
      status: 'unpaid', notes: 'Tagihan sewa kantor Q3',
    },
  ]
  for (const row of rows) {
    await db.insert(schema.bills).values(row)
      .onDuplicateKeyUpdate({ set: { status: row.status, paidAmount: row.paidAmount } })
  }
  console.log(`${rows.length} bill berhasil disiapkan.`)
}

async function seedSubscriptions(db) {
  const rows = [
    {
      subscriptionName: 'GitHub Enterprise', providerName: 'GitHub Inc.',
      category: 'software', amount: '2500000.00', billingCycle: 'monthly',
      startDate: `${CURRENT_YEAR}-01-01`, renewalDate: `${CURRENT_YEAR}-${CURRENT_MONTH}-01`,
      status: 'active', notes: 'License GitHub untuk tim engineering',
    },
    {
      subscriptionName: 'AWS Cloud Services', providerName: 'Amazon Web Services',
      category: 'cloud', amount: '15000000.00', billingCycle: 'monthly',
      startDate: `${CURRENT_YEAR}-01-01`, renewalDate: `${CURRENT_YEAR}-${CURRENT_MONTH}-01`,
      status: 'active', notes: 'Layanan cloud AWS untuk infrastruktur production',
    },
  ]
  for (const row of rows) {
    await db.insert(schema.subscriptions).values(row)
      .onDuplicateKeyUpdate({ set: { amount: row.amount, status: 'active' } })
  }
  console.log(`${rows.length} langganan berhasil disiapkan.`)
}

async function seedAssets(db) {
  const rows = [
    {
      assetCode: 'AST-001', assetName: 'MacBook Pro 16" M3 Max',
      category: 'Peralatan', acquisitionDate: `${CURRENT_YEAR}-01-15`,
      acquisitionCost: '42000000.00', usefulLifeMonths: 48,
      residualValue: '5000000.00', status: 'active',
      notes: 'Laptop untuk senior engineer',
    },
    {
      assetCode: 'AST-002', assetName: 'Server Dell PowerEdge R750',
      category: 'Infrastruktur', acquisitionDate: `${CURRENT_YEAR - 1}-06-01`,
      acquisitionCost: '85000000.00', usefulLifeMonths: 60,
      residualValue: '10000000.00', status: 'active',
      notes: 'Server utama untuk hosting aplikasi',
    },
  ]
  for (const row of rows) {
    await db.insert(schema.assets).values(row)
      .onDuplicateKeyUpdate({ set: { assetName: row.assetName, status: 'active' } })
  }
  console.log(`${rows.length} aset berhasil disiapkan.`)
}

async function seedTaxes(db) {
  const rows = [
    {
      taxType: 'PPN', taxPeriod: `${CURRENT_YEAR}-${CURRENT_MONTH}`,
      amount: '25000000.00', dueDate: `${CURRENT_YEAR}-${CURRENT_MONTH}-20`,
      status: 'unpaid', notes: 'PPN output bulan berjalan',
    },
    {
      taxType: 'PPh 21', taxPeriod: `${CURRENT_YEAR}-${CURRENT_MONTH}`,
      amount: '8500000.00', dueDate: `${CURRENT_YEAR}-${CURRENT_MONTH}-20`,
      status: 'unpaid', notes: 'PPh 21 potongan gaji karyawan',
    },
    {
      taxType: 'PPh 23', taxPeriod: `${CURRENT_YEAR}-03`,
      amount: '3500000.00', dueDate: `${CURRENT_YEAR}-04-20`,
      paymentDate: `${CURRENT_YEAR}-04-15`, status: 'paid',
      taxNumber: `NTPN-${CURRENT_YEAR}04150001`, notes: 'PPh 23 atas jasa konsultasi',
    },
  ]
  for (const row of rows) {
    await db.insert(schema.taxRecords).values(row)
      .onDuplicateKeyUpdate({ set: { status: row.status, amount: row.amount } })
  }
  console.log(`${rows.length} catatan pajak berhasil disiapkan.`)
}

async function seedNotifications(db) {
  const rows = [
    { userId: 1, title: 'Invoice baru terbit', message: `Invoice INV-${CURRENT_YEAR}-002 untuk PT Sejahtera Abadi telah terbit.`, type: 'info' },
    { userId: 1, title: 'Jurnal menunggu approval', message: 'Jurnal pembayaran beban operasional menunggu persetujuan.', type: 'warning' },
    { userId: 1, title: 'Tagihan jatuh tempo', message: `Bill BILL-${CURRENT_YEAR}-002 akan jatuh tempo 1 Juli.`, type: 'warning' },
    { userId: 1, title: 'Proyek ERP selesai phase 1', message: 'Milestone phase 1 proyek ERP PT Maju Jaya telah selesai.', type: 'success' },
    { userId: 1, title: 'Pajak PPN belum dibayar', message: 'PPN bulan berjalan masih dalam status belum bayar.', type: 'warning' },
  ]
  for (const row of rows) {
    await db.insert(schema.notifications).values(row)
  }
  console.log(`${rows.length} notifikasi berhasil disiapkan.`)
}

async function seedDummyData() {
  const { pool, db } = createDrizzleDatabase({ multipleStatements: true })

  try {
    console.log('--- Memulai seed data dummy ---')
    const divisions = await seedDivisions(db)
    await seedPositions(db, divisions)
    await seedEmployees(db)
    await seedClients(db)
    await seedProjects(db)
    await seedJournalEntries(db)
    await seedInvoices(db)
    await seedBills(db)
    await seedSubscriptions(db)
    await seedAssets(db)
    await seedTaxes(db)
    await seedNotifications(db)
    console.log('--- Seed data dummy selesai ---')
  } finally {
    await pool.end()
  }
}

module.exports = { seedDummyData }

if (require.main === module) {
  seedDummyData().catch((error) => {
    console.error('Seed dummy data gagal:', error.message)
    process.exit(1)
  })
}
