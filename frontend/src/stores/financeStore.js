import { defineStore } from 'pinia'
import {
  accounts as initialAccounts,
  accessUsers as initialAccessUsers,
  assets as initialAssets,
  bpjsSettings as initialBpjsSettings,
  clients as initialClients,
  companySettings as initialCompanySettings,
  employees as initialEmployees,
  payables as initialPayables,
  projects as initialProjects,
  projectionTargets as initialProjectionTargets,
  receivables as initialReceivables,
  subscriptions as initialSubscriptions,
  taxObligations as initialTaxObligations,
  transactions as initialTransactions,
  vendors as initialVendors,
} from '../data/mockData'

const STORAGE_KEY = 'finstartFinanceStateV3'
const SCHEMA_VERSION = 4

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function defaultSecuritySettings() {
  return {
    twoFactor: true,
    loginAlert: true,
    sessionTimeout: '30',
  }
}

function initialTransactionsForState() {
  const accountId = (code) => {
    return initialAccounts.find((account) => account.code === code)?.id || null
  }

  return clone(initialTransactions).map((transaction) => {
    if (transaction.id === 1) {
      return {
        ...transaction,
        lines: [
          { accountId: accountId('1102'), side: 'Debit', amount: toNumber(transaction.amount) },
          { accountId: accountId('4101'), side: 'Credit', amount: toNumber(transaction.amount) },
        ],
        appliedToLedger: true,
      }
    }

    if (transaction.id === 2) {
      return {
        ...transaction,
        lines: [
          { accountId: accountId('5101'), side: 'Debit', amount: toNumber(transaction.amount) },
          { accountId: accountId('1102'), side: 'Credit', amount: toNumber(transaction.amount) },
        ],
        appliedToLedger: true,
      }
    }

    return {
      ...transaction,
      lines: clone(transaction.lines || []),
      appliedToLedger: Boolean(transaction.appliedToLedger),
    }
  })
}

function defaultState() {
  return {
    initialized: false,
    schemaVersion: SCHEMA_VERSION,
    accounts: clone(initialAccounts),
    assets: clone(initialAssets),
    clients: clone(initialClients),
    employees: clone(initialEmployees),
    payables: clone(initialPayables).map((bill) => ({
      ...bill,
      ledgerPosted: bill.status !== 'Draft',
    })),
    projects: clone(initialProjects),
    projectionTargets: clone(initialProjectionTargets),
    receivables: clone(initialReceivables).map((invoice) => ({
      ...invoice,
      ledgerPosted: invoice.status !== 'Draft',
    })),
    subscriptions: clone(initialSubscriptions),
    taxObligations: clone(initialTaxObligations),
    transactions: initialTransactionsForState(),
    vendors: clone(initialVendors),
    bpjsSettings: clone(initialBpjsSettings),
    companySettings: clone(initialCompanySettings),
    accessUsers: clone(initialAccessUsers),
    securitySettings: defaultSecuritySettings(),
  }
}

function todayText() {
  return new Date().toISOString().slice(0, 10)
}

function toNumber(value) {
  return Number(value || 0)
}

function nextId(collection) {
  return Math.max(0, ...collection.map((item) => toNumber(item.id))) + 1
}

export const useFinanceStore = defineStore('finance', {
  state: defaultState,

  getters: {
    getAccountByCode: (state) => (code) => {
      return state.accounts.find((account) => account.code === code)
    },
    getAccountById: (state) => (id) => {
      return state.accounts.find((account) => account.id === Number(id))
    },
  },

  actions: {
    initState() {
      if (this.initialized) return

      const defaults = defaultState()

      try {
        const raw = localStorage.getItem(STORAGE_KEY)

        if (raw) {
          const saved = JSON.parse(raw)

          if (saved && typeof saved === 'object') {
            const merged = {
              ...defaults,
              ...Object.fromEntries(
                Object.keys(defaults)
                  .filter((key) => key in saved)
                  .map((key) => [key, saved[key]]),
              ),
              initialized: true,
              schemaVersion: SCHEMA_VERSION,
            }

            this.$patch(merged)
          } else {
            this.$patch({ ...defaults, initialized: true })
          }
        } else {
          this.$patch({ ...defaults, initialized: true })
        }
      } catch {
        this.$patch({ ...defaults, initialized: true })
      }

      this.$subscribe(
        () => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
        },
        { detached: true },
      )

      this.refreshDateDrivenStatuses()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
    },

    refreshDateDrivenStatuses() {
      const today = todayText()

      this.receivables.forEach((invoice) => {
        const outstanding = Math.max(toNumber(invoice.total) - toNumber(invoice.paidAmount), 0)
        if (invoice.status !== 'Draft' && invoice.status !== 'Paid' && invoice.dueDate && invoice.dueDate < today && outstanding > 0) {
          invoice.status = 'Overdue'
        }
      })

      this.payables.forEach((bill) => {
        const outstanding = Math.max(toNumber(bill.amount) - toNumber(bill.paidAmount), 0)
        if (bill.status !== 'Draft' && bill.status !== 'Paid' && bill.dueDate && bill.dueDate < today && outstanding > 0) {
          bill.status = 'Overdue'
        }
      })

      this.subscriptions.forEach((subscription) => {
        if (subscription.status !== 'Aktif' || !subscription.nextBillingDate) return
        if (subscription.nextBillingDate < today) {
          subscription.paymentStatus = 'Terlambat'
        }
      })
    },

    resetState() {
      this.$patch({
        ...defaultState(),
        initialized: true,
      })

      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
    },

    addAccount(account) {
      this.accounts.unshift({
        ...account,
        id: nextId(this.accounts),
        balance: toNumber(account.balance),
      })
    },

    toggleAccountStatus(accountId) {
      const account = this.accounts.find((item) => item.id === Number(accountId))

      if (!account) return

      account.status = account.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
    },

    addClient(client) {
      const existing = this.clients.find(
        (item) => item.company.toLowerCase() === String(client.company).toLowerCase(),
      )

      if (existing) return existing

      const newClient = {
        id: nextId(this.clients),
        company: client.company,
        industry: client.industry || 'Lainnya',
        category: client.category || 'Prospek',
        location: client.location || '-',
        status: client.status || 'Aktif',
      }

      this.clients.unshift(newClient)
      return newClient
    },

    addProject(project) {
      this.projects.unshift({
        ...project,
        id: nextId(this.projects),
        contractValue: toNumber(project.contractValue),
      })
    },

    updateProjectStatus(projectId, status) {
      const project = this.projects.find((item) => item.id === Number(projectId))
      if (project) project.status = status
    },

    addVendor(vendor) {
      const existing = this.vendors.find(
        (item) => item.name.toLowerCase() === String(vendor.name).toLowerCase(),
      )

      if (existing) return existing

      const newVendor = {
        id: nextId(this.vendors),
        name: vendor.name,
        category: vendor.category || 'Lainnya',
      }

      this.vendors.unshift(newVendor)
      return newVendor
    },

    addInvoice(invoice) {
      this.receivables.unshift({
        paidAmount: 0,
        status: 'Draft',
        ledgerPosted: false,
        description: '',
        ...invoice,
        id: nextId(this.receivables),
        total: toNumber(invoice.total),
        paidAmount: toNumber(invoice.paidAmount),
      })
    },

    issueInvoice(invoiceId) {
      const invoice = this.receivables.find((item) => item.id === Number(invoiceId))
      if (!invoice || invoice.status === 'Paid') return { ok: false, message: 'Invoice tidak ditemukan.' }

      if (invoice.status === 'Draft') invoice.status = 'Sent'

      if (!invoice.ledgerPosted) {
        this.createSystemJournal({
          date: invoice.invoiceDate || todayText(),
          memo: `Penerbitan invoice ${invoice.invoiceNumber} - ${invoice.client}`,
          amount: toNumber(invoice.total),
          debitCode: '1201',
          creditCode: '4101',
          sourceType: 'invoice',
          sourceId: invoice.id,
        })
        invoice.ledgerPosted = true
      }

      return { ok: true }
    },

    receiveInvoicePayment({ invoiceId, amount, paymentDate, cashAccountCode = '1102' }) {
      const invoice = this.receivables.find((item) => item.id === Number(invoiceId))
      if (!invoice) return { ok: false, message: 'Invoice tidak ditemukan.' }

      const outstanding = Math.max(toNumber(invoice.total) - toNumber(invoice.paidAmount), 0)
      const paidAmount = toNumber(amount)

      if (paidAmount <= 0 || paidAmount > outstanding) {
        return { ok: false, message: 'Nominal pembayaran tidak valid.' }
      }

      if (invoice.status === 'Draft') this.issueInvoice(invoice.id)

      invoice.paidAmount = toNumber(invoice.paidAmount) + paidAmount
      invoice.status = invoice.paidAmount >= toNumber(invoice.total) ? 'Paid' : 'Partially Paid'

      this.createSystemJournal({
        date: paymentDate || todayText(),
        memo: `Pelunasan piutang ${invoice.invoiceNumber} - ${invoice.client}`,
        amount: paidAmount,
        debitCode: cashAccountCode,
        creditCode: '1201',
        sourceType: 'receipt',
        sourceId: invoice.id,
      })

      return { ok: true }
    },

    addPayable(payable) {
      this.payables.unshift({
        paidAmount: 0,
        status: 'Draft',
        ledgerPosted: false,
        ...payable,
        id: nextId(this.payables),
        amount: toNumber(payable.amount),
        paidAmount: toNumber(payable.paidAmount),
      })
    },

    approvePayable(billId) {
      const bill = this.payables.find((item) => item.id === Number(billId))
      if (!bill) return { ok: false, message: 'Tagihan tidak ditemukan.' }

      bill.status = bill.paidAmount > 0 ? 'Partially Paid' : 'Approved'

      if (!bill.ledgerPosted) {
        this.createSystemJournal({
          date: bill.billDate || todayText(),
          memo: `Pencatatan utang ${bill.billNumber} - ${bill.vendor}`,
          amount: toNumber(bill.amount),
          debitCode: '5101',
          creditCode: '2101',
          sourceType: 'payable',
          sourceId: bill.id,
        })
        bill.ledgerPosted = true
      }

      return { ok: true }
    },

    payBill({ billId, amount, paymentDate, cashAccountCode = '1102', paymentRef = '' }) {
      const bill = this.payables.find((item) => item.id === Number(billId))
      if (!bill) return { ok: false, message: 'Tagihan tidak ditemukan.' }

      if (bill.status === 'Draft') {
        const approved = this.approvePayable(bill.id)
        if (!approved.ok) return approved
      }

      const outstanding = Math.max(toNumber(bill.amount) - toNumber(bill.paidAmount), 0)
      const paidAmount = toNumber(amount)

      if (paidAmount <= 0 || paidAmount > outstanding) {
        return { ok: false, message: 'Nominal pembayaran tidak valid.' }
      }

      bill.paidAmount = toNumber(bill.paidAmount) + paidAmount
      bill.status = bill.paidAmount >= toNumber(bill.amount) ? 'Paid' : 'Partially Paid'

      this.createSystemJournal({
        date: paymentDate || todayText(),
        memo: `Pembayaran utang ${bill.billNumber} - ${bill.vendor}${paymentRef ? ` (${paymentRef})` : ''}`,
        amount: paidAmount,
        debitCode: '2101',
        creditCode: cashAccountCode,
        sourceType: 'payment',
        sourceId: bill.id,
      })

      return { ok: true }
    },

    addTransaction(transaction) {
      const newTransaction = {
        id: nextId(this.transactions),
        date: transaction.date || todayText(),
        ref: transaction.ref || `JRN/${new Date().getFullYear()}/${String(this.transactions.length + 1).padStart(3, '0')}`,
        memo: transaction.memo || '-',
        amount: toNumber(transaction.amount),
        status: transaction.status || 'Draft',
        lines: clone(transaction.lines || []),
        sourceType: transaction.sourceType || 'manual',
        sourceId: transaction.sourceId || null,
        postedAt: transaction.postedAt || null,
        appliedToLedger: Boolean(transaction.appliedToLedger),
      }

      this.transactions.unshift(newTransaction)

      if (newTransaction.status === 'Approved' && newTransaction.lines.length > 0) {
        this.postTransaction(newTransaction.id)
      }

      return newTransaction
    },

    createSystemJournal({ date, memo, amount, debitCode, creditCode, sourceType, sourceId }) {
      const debitAccount = this.accounts.find((account) => account.code === debitCode)
      const creditAccount = this.accounts.find((account) => account.code === creditCode)

      if (!debitAccount || !creditAccount || toNumber(amount) <= 0) {
        return null
      }

      const ref = `AUTO/${new Date().getFullYear()}/${String(this.transactions.length + 1).padStart(3, '0')}`

      const transaction = {
        id: nextId(this.transactions),
        date: date || todayText(),
        ref,
        memo,
        amount: toNumber(amount),
        status: 'Approved',
        lines: [
          { accountId: debitAccount.id, side: 'Debit', amount: toNumber(amount) },
          { accountId: creditAccount.id, side: 'Credit', amount: toNumber(amount) },
        ],
        sourceType: sourceType || 'system',
        sourceId: sourceId || null,
        postedAt: new Date().toISOString(),
        appliedToLedger: false,
        systemGenerated: true,
      }

      this.transactions.unshift(transaction)
      this.applyJournalToLedger(transaction)
      transaction.appliedToLedger = true

      return transaction
    },

    postTransaction(transactionId) {
      const transaction = this.transactions.find((item) => item.id === Number(transactionId))
      if (!transaction) return { ok: false, message: 'Jurnal tidak ditemukan.' }

      if (transaction.appliedToLedger) {
        transaction.status = 'Approved'
        return { ok: true }
      }

      if (!Array.isArray(transaction.lines) || transaction.lines.length < 2) {
        return { ok: false, message: 'Baris debit dan kredit jurnal belum lengkap.' }
      }

      const debitTotal = transaction.lines
        .filter((line) => line.side === 'Debit')
        .reduce((total, line) => total + toNumber(line.amount), 0)
      const creditTotal = transaction.lines
        .filter((line) => line.side === 'Credit')
        .reduce((total, line) => total + toNumber(line.amount), 0)

      if (debitTotal <= 0 || debitTotal !== creditTotal) {
        return { ok: false, message: 'Debit dan kredit jurnal harus seimbang.' }
      }

      this.applyJournalToLedger(transaction)
      transaction.status = 'Approved'
      transaction.appliedToLedger = true
      transaction.postedAt = new Date().toISOString()
      return { ok: true }
    },

    applyJournalToLedger(transaction) {
      transaction.lines.forEach((line) => {
        const account = this.accounts.find((item) => item.id === Number(line.accountId))
        if (!account) return

        const amount = toNumber(line.amount)
        const debitIncreases = account.type === 'Aset' || account.type === 'Beban'
        const isDebit = line.side === 'Debit'
        const increase = isDebit ? debitIncreases : !debitIncreases

        account.balance = Math.max(
          0,
          toNumber(account.balance) + (increase ? amount : -amount),
        )
      })
    },

    addSubscription(subscription) {
      this.subscriptions.unshift({
        ...subscription,
        id: nextId(this.subscriptions),
        fee: toNumber(subscription.fee),
      })
    },

    renewSubscription(subscriptionId, cashAccountCode = '1102') {
      const subscription = this.subscriptions.find((item) => item.id === Number(subscriptionId))
      if (!subscription) return { ok: false, message: 'Langganan tidak ditemukan.' }

      const billingDate = subscription.nextBillingDate || todayText()
      const nextDate = new Date(`${billingDate}T00:00:00`)

      this.createSystemJournal({
        date: todayText(),
        memo: `Perpanjangan langganan ${subscription.service}`,
        amount: toNumber(subscription.fee),
        debitCode: '5101',
        creditCode: cashAccountCode,
        sourceType: 'subscription',
        sourceId: subscription.id,
      })

      if (subscription.cycle === 'Tahunan') {
        nextDate.setFullYear(nextDate.getFullYear() + 1)
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1)
      }

      subscription.nextBillingDate = nextDate.toISOString().slice(0, 10)
      subscription.paymentStatus = 'Patuh'
      subscription.status = 'Aktif'
      return { ok: true }
    },

    addProjectionTarget(target) {
      this.projectionTargets.unshift({
        ...target,
        id: nextId(this.projectionTargets),
        targetValue: toNumber(target.targetValue),
      })
    },

    removeProjectionTarget(targetId) {
      this.projectionTargets = this.projectionTargets.filter(
        (target) => target.id !== Number(targetId),
      )
    },

    payTax({ taxId, paymentDate, ntpn, cashAccountCode = '1102' }) {
      const tax = this.taxObligations.find((item) => item.id === Number(taxId))
      if (!tax) return { ok: false, message: 'Kewajiban pajak tidak ditemukan.' }
      if (tax.status === 'Dibayar') return { ok: false, message: 'Pajak ini sudah dibayar.' }

      tax.status = 'Dibayar'
      tax.paymentDate = paymentDate || todayText()
      tax.ntpn = ntpn || '-'

      this.createSystemJournal({
        date: tax.paymentDate,
        memo: `Setoran ${tax.type} periode ${tax.period} (NTPN ${tax.ntpn})`,
        amount: toNumber(tax.amount),
        debitCode: '5101',
        creditCode: cashAccountCode,
        sourceType: 'tax',
        sourceId: tax.id,
      })

      return { ok: true }
    },

    addEmployee(employee) {
      this.employees.unshift({
        active: true,
        ...employee,
        id: nextId(this.employees),
        baseSalary: toNumber(employee.baseSalary),
      })
    },

    toggleEmployeeStatus(employeeId) {
      const employee = this.employees.find((item) => item.id === Number(employeeId))
      if (employee) employee.active = !employee.active
    },

    processPayroll({ employeeId, paymentDate, netSalary, paymentRef = '' }) {
      const employee = this.employees.find((item) => item.id === Number(employeeId))
      if (!employee) return { ok: false, message: 'Pegawai tidak ditemukan.' }

      this.createSystemJournal({
        date: paymentDate || todayText(),
        memo: `Payroll ${employee.name}${paymentRef ? ` (${paymentRef})` : ''}`,
        amount: toNumber(netSalary),
        debitCode: '5101',
        creditCode: '1102',
        sourceType: 'payroll',
        sourceId: employee.id,
      })

      return { ok: true }
    },

    addAsset(asset) {
      this.assets.unshift({
        accumulatedDepreciation: 0,
        monthsDepreciated: 0,
        ...asset,
        id: nextId(this.assets),
        acquisitionCost: toNumber(asset.acquisitionCost),
        usefulLifeMonths: toNumber(asset.usefulLifeMonths),
        residualValue: toNumber(asset.residualValue),
      })
    },

    recordDepreciation(assetId) {
      const asset = this.assets.find((item) => item.id === Number(assetId))
      if (!asset || asset.status !== 'Aktif') {
        return { ok: false, message: 'Aset tidak dapat disusutkan.' }
      }

      const monthly = (toNumber(asset.acquisitionCost) - toNumber(asset.residualValue)) /
        Math.max(toNumber(asset.usefulLifeMonths), 1)
      const maximum = toNumber(asset.acquisitionCost) - toNumber(asset.residualValue)
      const remaining = maximum - toNumber(asset.accumulatedDepreciation)

      if (remaining <= 0) {
        asset.status = 'Disusutkan Penuh'
        return { ok: false, message: 'Aset sudah disusutkan penuh.' }
      }

      const amount = Math.min(monthly, remaining)
      asset.accumulatedDepreciation = toNumber(asset.accumulatedDepreciation) + amount
      asset.monthsDepreciated = Math.min(
        toNumber(asset.monthsDepreciated) + 1,
        toNumber(asset.usefulLifeMonths),
      )

      if (asset.accumulatedDepreciation >= maximum) {
        asset.accumulatedDepreciation = maximum
        asset.status = 'Disusutkan Penuh'
      }

      return { ok: true, amount }
    },

    toggleAssetStatus(assetId) {
      const asset = this.assets.find((item) => item.id === Number(assetId))
      if (!asset || asset.status === 'Disusutkan Penuh') return
      asset.status = asset.status === 'Aktif' ? 'Dalam Perawatan' : 'Aktif'
    },

    updateCompanySettings(settings) {
      this.companySettings = {
        ...this.companySettings,
        ...settings,
      }
    },

    updateSecuritySettings(settings) {
      this.securitySettings = {
        ...this.securitySettings,
        ...settings,
      }
    },

    addAccessUser(user) {
      const duplicate = this.accessUsers.some(
        (item) => item.email.toLowerCase() === String(user.email).toLowerCase(),
      )

      if (duplicate) return { ok: false, message: 'Email pengguna sudah terdaftar.' }

      this.accessUsers.unshift({
        status: 'Aktif',
        ...user,
        id: nextId(this.accessUsers),
      })
      return { ok: true }
    },

    toggleAccessUserStatus(userId) {
      const user = this.accessUsers.find((item) => item.id === Number(userId))
      if (!user) return
      user.status = user.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
    },
  },
})
