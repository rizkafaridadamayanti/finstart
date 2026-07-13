// Drizzle schema lengkap untuk seluruh tabel FinStart.
// Sumber resmi struktur database adalah schema ini dan migration versioned di drizzle/migrations.
const { sql } = require("drizzle-orm");
const { bigint, char, date, datetime, decimal, index, int, json, mysqlEnum, mysqlTable, smallint, text, timestamp, tinyint, uniqueIndex, varchar } = require("drizzle-orm/mysql-core");

const accounts = mysqlTable("accounts", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  code: varchar("code", { length: 30 }).unique().notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  type: mysqlEnum("type", ["asset", "liability", "equity", "revenue", "expense"]).notNull(),
  normalBalance: mysqlEnum("normal_balance", ["debit", "credit"]).notNull(),
  openingBalance: decimal("opening_balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("fk_accounts_parent").on(table.parentId),
  index("idx_accounts_type").on(table.type),
  index("idx_accounts_status").on(table.status),
]);

const activityLogs = mysqlTable("activity_logs", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  activity: varchar("activity", { length: 150 }).notNull(),
  description: text("description"),
  module: varchar("module", { length: 100 }),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_activity_logs_user").on(table.userId),
  index("idx_activity_logs_module").on(table.module),
]);

const assets = mysqlTable("assets", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  assetCode: varchar("asset_code", { length: 50 }).unique().notNull(),
  assetName: varchar("asset_name", { length: 150 }).notNull(),
  category: varchar("category", { length: 100 }),
  acquisitionDate: date("acquisition_date"),
  acquisitionCost: decimal("acquisition_cost", { precision: 15, scale: 2 }).notNull().default("0.00"),
  usefulLifeMonths: int("useful_life_months", { unsigned: true }),
  residualValue: decimal("residual_value", { precision: 15, scale: 2 }).notNull().default("0.00"),
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 15, scale: 2 }).notNull().default("0.00"),
  status: mysqlEnum("status", ["active", "disposed", "inactive"]).notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_assets_status").on(table.status),
]);

const assetDepreciations = mysqlTable("asset_depreciations", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  assetId: bigint("asset_id", { mode: "number", unsigned: true }).notNull(),
  depreciationPeriod: char("depreciation_period", { length: 7 }).notNull(),
  depreciationDate: date("depreciation_date").notNull(),
  depreciationAmount: decimal("depreciation_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  accumulatedDepreciationAfter: decimal("accumulated_depreciation_after", { precision: 15, scale: 2 }).notNull().default("0.00"),
  bookValueAfter: decimal("book_value_after", { precision: 15, scale: 2 }).notNull().default("0.00"),
  journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["posted", "void"]).notNull().default("posted"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex("uq_asset_depreciation_period").on(table.assetId, table.depreciationPeriod),
  index("idx_asset_depreciation_period").on(table.depreciationPeriod),
  index("idx_asset_depreciation_journal").on(table.journalEntryId),
]);

const authSessions = mysqlTable("auth_sessions", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).unique().notNull(),
  userAgent: varchar("user_agent", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 64 }),
  expiresAt: datetime("expires_at").notNull(),
  revokedAt: datetime("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_auth_sessions_user").on(table.userId),
  index("idx_auth_sessions_expiry").on(table.expiresAt),
]);

const bills = mysqlTable("bills", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  vendorName: varchar("vendor_name", { length: 150 }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  billNumber: varchar("bill_number", { length: 50 }).unique().notNull(),
  billDate: date("bill_date").notNull(),
  dueDate: date("due_date"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  status: mysqlEnum("status", ["draft", "unpaid", "partial", "paid", "overdue", "cancelled"]).notNull().default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_bills_project").on(table.projectId),
  index("idx_bills_status").on(table.status),
]);

const billItems = mysqlTable("bill_items", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  billId: bigint("bill_id", { mode: "number", unsigned: true }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull().default("1.00"),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull().default("0.00"),
  lineTotal: decimal("line_total", { precision: 15, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_bill_items_bill").on(table.billId),
]);

const billPayments = mysqlTable("bill_payments", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  billId: bigint("bill_id", { mode: "number", unsigned: true }).notNull(),
  journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("fk_bill_payments_journal").on(table.journalEntryId),
  index("idx_bill_payments_bill").on(table.billId),
]);

const bpjsConfigurations = mysqlTable("bpjs_configurations", {
  id: tinyint("id", { unsigned: true }).primaryKey().notNull(),
  healthCompanyRate: decimal("health_company_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  healthEmployeeRate: decimal("health_employee_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  jhtCompanyRate: decimal("jht_company_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  jhtEmployeeRate: decimal("jht_employee_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  jpCompanyRate: decimal("jp_company_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  jpEmployeeRate: decimal("jp_employee_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  effectiveDate: date("effective_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
]);

const budgetAllocations = mysqlTable("budget_allocations", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  budgetYear: smallint("budget_year", { unsigned: true }).notNull(),
  budgetMonth: tinyint("budget_month", { unsigned: true }),
  scenarioKey: varchar("scenario_key", { length: 20 }).notNull().default("normal"),
  accountId: bigint("account_id", { mode: "number", unsigned: true }).notNull(),
  divisionId: bigint("division_id", { mode: "number", unsigned: true }),
  budgetAmount: decimal("budget_amount", { precision: 18, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_budget_allocations_period").on(table.budgetYear, table.budgetMonth, table.scenarioKey),
  index("idx_budget_allocations_account").on(table.accountId),
  index("idx_budget_allocations_division").on(table.divisionId),
]);

const clients = mysqlTable("clients", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  companyName: varchar("company_name", { length: 150 }).notNull(),
  picName: varchar("pic_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }),
  phone: varchar("phone", { length: 30 }),
  industry: varchar("industry", { length: 100 }),
  category: varchar("category", { length: 100 }),
  location: varchar("location", { length: 150 }),
  address: text("address"),
  status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_clients_status").on(table.status),
  index("idx_clients_name").on(table.companyName),
]);

const companySettings = mysqlTable("company_settings", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  companyName: varchar("company_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }),
  phone: varchar("phone", { length: 30 }),
  address: text("address"),
  npwp: varchar("npwp", { length: 50 }),
  currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
  logo: varchar("logo", { length: 255 }),
  fiscalYearStartMonth: tinyint("fiscal_year_start_month", { unsigned: true }).notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  logoUrl: varchar("logo_url", { length: 500 }),
  fiscalYear: smallint("fiscal_year", { unsigned: true }),
  city: varchar("city", { length: 120 }),
  province: varchar("province", { length: 120 }),
  postalCode: varchar("postal_code", { length: 15 }),
  website: varchar("website", { length: 255 }),
}, (table) => [
]);

const divisions = mysqlTable("divisions", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 120 }).unique().notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_divisions_status").on(table.status),
]);

const employees = mysqlTable("employees", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }),
  phone: varchar("phone", { length: 30 }),
  position: varchar("position", { length: 100 }),
  salary: decimal("salary", { precision: 15, scale: 2 }).notNull().default("0.00"),
  employmentStatus: mysqlEnum("employment_status", ["active", "inactive"]).notNull().default("active"),
  joinDate: date("join_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  employeeCode: varchar("employee_code", { length: 50 }).unique(),
  fullName: varchar("full_name", { length: 150 }),
  nik: varchar("nik", { length: 32 }).unique(),
  divisionId: bigint("division_id", { mode: "number", unsigned: true }),
  positionId: bigint("position_id", { mode: "number", unsigned: true }),
  employmentType: varchar("employment_type", { length: 30 }).notNull().default("permanent"),
  ptkpStatus: varchar("ptkp_status", { length: 10 }).notNull().default("TK/0"),
  bpjsStatus: varchar("bpjs_status", { length: 20 }).notNull().default("active"),
  baseSalary: decimal("base_salary", { precision: 18, scale: 2 }).notNull().default("0.00"),
  npwp: varchar("npwp", { length: 50 }),
  bpjsHealthNumber: varchar("bpjs_health_number", { length: 50 }),
  bpjsEmploymentNumber: varchar("bpjs_employment_number", { length: 50 }),
  bankName: varchar("bank_name", { length: 100 }),
  bankAccountNumber: varchar("bank_account_number", { length: 80 }),
  bankAccountHolder: varchar("bank_account_holder", { length: 150 }),
  address: text("address"),
}, (table) => [
  index("idx_employees_status").on(table.employmentStatus),
  index("idx_employees_division_id").on(table.divisionId),
  index("idx_employees_position_id").on(table.positionId),
  index("idx_employees_employment_status").on(table.employmentStatus),
]);

const financialProjections = mysqlTable("financial_projections", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  projectionYear: smallint("projection_year", { unsigned: true }).notNull(),
  projectionMonth: tinyint("projection_month", { unsigned: true }).notNull(),
  revenueTarget: decimal("revenue_target", { precision: 15, scale: 2 }).notNull().default("0.00"),
  expenseTarget: decimal("expense_target", { precision: 15, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex("uq_financial_projection_month").on(table.projectionYear, table.projectionMonth),
  index("idx_financial_projection_year").on(table.projectionYear),
]);

const invoices = mysqlTable("invoices", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  clientId: bigint("client_id", { mode: "number", unsigned: true }).notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  status: mysqlEnum("status", ["draft", "unpaid", "partial", "paid", "overdue", "cancelled"]).notNull().default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_invoices_client").on(table.clientId),
  index("idx_invoices_project").on(table.projectId),
  index("idx_invoices_status").on(table.status),
]);

const invoiceItems = mysqlTable("invoice_items", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull().default("1.00"),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull().default("0.00"),
  lineTotal: decimal("line_total", { precision: 15, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_invoice_items_invoice").on(table.invoiceId),
]);

const invoicePayments = mysqlTable("invoice_payments", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  invoiceId: bigint("invoice_id", { mode: "number", unsigned: true }).notNull(),
  journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("fk_invoice_payments_journal").on(table.journalEntryId),
  index("idx_invoice_payments_invoice").on(table.invoiceId),
]);

const journalEntries = mysqlTable("journal_entries", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  voucherNumber: varchar("voucher_number", { length: 50 }).unique().notNull(),
  transactionDate: date("transaction_date").notNull(),
  description: text("description"),
  sourceType: varchar("source_type", { length: 50 }),
  sourceId: bigint("source_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "approved", "posted", "rejected"]).notNull().default("draft"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  approvedAt: datetime("approved_at"),
  postedAt: datetime("posted_at"),
  rejectionReason: varchar("rejection_reason", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  divisionId: bigint("division_id", { mode: "number", unsigned: true }),
}, (table) => [
  index("fk_journal_created_by").on(table.createdBy),
  index("fk_journal_approved_by").on(table.approvedBy),
  index("idx_journal_status").on(table.status),
  index("idx_journal_date").on(table.transactionDate),
  index("idx_journal_entries_division").on(table.divisionId),
]);

const journalLines = mysqlTable("journal_lines", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }).notNull(),
  accountId: bigint("account_id", { mode: "number", unsigned: true }).notNull(),
  description: varchar("description", { length: 255 }),
  debit: decimal("debit", { precision: 15, scale: 2 }).notNull().default("0.00"),
  credit: decimal("credit", { precision: 15, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_journal_lines_entry").on(table.journalEntryId),
  index("idx_journal_lines_account").on(table.accountId),
]);

const notifications = mysqlTable("notifications", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 150 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"),
  isRead: tinyint("is_read").notNull().default(0),
  referenceType: varchar("reference_type", { length: 50 }),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_notifications_user").on(table.userId),
  index("idx_notifications_read").on(table.isRead),
]);

const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  tokenHash: varchar("token_hash", { length: 128 }).unique().notNull(),
  expiresAt: datetime("expires_at").notNull(),
  usedAt: datetime("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_password_reset_user").on(table.userId),
  index("idx_password_reset_expiry").on(table.expiresAt),
]);

const payrollRecords = mysqlTable("payroll_records", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  payrollPeriod: char("payroll_period", { length: 7 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  employeeCode: varchar("employee_code", { length: 50 }),
  employeeName: varchar("employee_name", { length: 150 }).notNull(),
  employeeNik: varchar("employee_nik", { length: 32 }),
  employeePosition: varchar("employee_position", { length: 150 }),
  baseSalary: decimal("base_salary", { precision: 18, scale: 2 }).notNull().default("0.00"),
  healthCompanyRate: decimal("health_company_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  healthEmployeeRate: decimal("health_employee_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  jhtCompanyRate: decimal("jht_company_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  jhtEmployeeRate: decimal("jht_employee_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  jpCompanyRate: decimal("jp_company_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  jpEmployeeRate: decimal("jp_employee_rate", { precision: 8, scale: 4 }).notNull().default("0.0000"),
  healthCompanyAmount: decimal("health_company_amount", { precision: 18, scale: 2 }).notNull().default("0.00"),
  healthEmployeeAmount: decimal("health_employee_amount", { precision: 18, scale: 2 }).notNull().default("0.00"),
  jhtCompanyAmount: decimal("jht_company_amount", { precision: 18, scale: 2 }).notNull().default("0.00"),
  jhtEmployeeAmount: decimal("jht_employee_amount", { precision: 18, scale: 2 }).notNull().default("0.00"),
  jpCompanyAmount: decimal("jp_company_amount", { precision: 18, scale: 2 }).notNull().default("0.00"),
  jpEmployeeAmount: decimal("jp_employee_amount", { precision: 18, scale: 2 }).notNull().default("0.00"),
  employeeBpjsDeduction: decimal("employee_bpjs_deduction", { precision: 18, scale: 2 }).notNull().default("0.00"),
  employerBpjsContribution: decimal("employer_bpjs_contribution", { precision: 18, scale: 2 }).notNull().default("0.00"),
  netPay: decimal("net_pay", { precision: 18, scale: 2 }).notNull().default("0.00"),
  salaryExpenseAccountId: bigint("salary_expense_account_id", { mode: "number", unsigned: true }).notNull(),
  bpjsExpenseAccountId: bigint("bpjs_expense_account_id", { mode: "number", unsigned: true }).notNull(),
  cashAccountId: bigint("cash_account_id", { mode: "number", unsigned: true }).notNull(),
  bpjsPayableAccountId: bigint("bpjs_payable_account_id", { mode: "number", unsigned: true }).notNull(),
  journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }),
  notes: text("notes"),
  status: mysqlEnum("status", ["draft", "posted", "cancelled"]).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  overtimeAmount: decimal("overtime_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  allowanceAmount: decimal("allowance_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  bonusAmount: decimal("bonus_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  loanDeduction: decimal("loan_deduction", { precision: 15, scale: 2 }).notNull().default("0.00"),
  otherDeduction: decimal("other_deduction", { precision: 15, scale: 2 }).notNull().default("0.00"),
  pph21Amount: decimal("pph21_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  taxRecordId: bigint("tax_record_id", { mode: "number", unsigned: true }),
}, (table) => [
  uniqueIndex("uq_payroll_records_employee_period").on(table.employeeId, table.payrollPeriod),
  index("idx_payroll_records_period").on(table.payrollPeriod),
  index("idx_payroll_records_status").on(table.status),
  index("idx_payroll_records_payment_date").on(table.paymentDate),
  index("fk_payroll_records_salary_expense").on(table.salaryExpenseAccountId),
  index("fk_payroll_records_bpjs_expense").on(table.bpjsExpenseAccountId),
  index("fk_payroll_records_cash_account").on(table.cashAccountId),
  index("fk_payroll_records_bpjs_payable").on(table.bpjsPayableAccountId),
  index("fk_payroll_records_journal").on(table.journalEntryId),
]);

const payrollTaxCalculations = mysqlTable("payroll_tax_calculations", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  taxRecordId: bigint("tax_record_id", { mode: "number", unsigned: true }).unique().notNull(),
  employeeName: varchar("employee_name", { length: 150 }).notNull(),
  employeeNik: varchar("employee_nik", { length: 32 }),
  employeePosition: varchar("employee_position", { length: 100 }),
  taxPeriod: char("tax_period", { length: 7 }).notNull(),
  ptkpStatus: varchar("ptkp_status", { length: 5 }).notNull(),
  terCategory: char("ter_category", { length: 1 }).notNull(),
  baseSalary: decimal("base_salary", { precision: 15, scale: 2 }).notNull().default("0.00"),
  allowanceAmount: decimal("allowance_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  grossIncome: decimal("gross_income", { precision: 15, scale: 2 }).notNull().default("0.00"),
  terRate: decimal("ter_rate", { precision: 7, scale: 4 }).notNull().default("0.0000"),
  pph21Amount: decimal("pph21_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  takeHomePay: decimal("take_home_pay", { precision: 15, scale: 2 }).notNull().default("0.00"),
  payrollDate: date("payroll_date"),
  salaryExpenseAccountId: bigint("salary_expense_account_id", { mode: "number", unsigned: true }),
  cashAccountId: bigint("cash_account_id", { mode: "number", unsigned: true }),
  payrollJournalId: bigint("payroll_journal_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "posted"]).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_payroll_tax_period").on(table.taxPeriod),
  index("idx_payroll_employee_nik").on(table.employeeNik),
  index("fk_payroll_salary_expense").on(table.salaryExpenseAccountId),
  index("fk_payroll_cash_account").on(table.cashAccountId),
  index("fk_payroll_journal").on(table.payrollJournalId),
]);

const positions = mysqlTable("positions", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  divisionId: bigint("division_id", { mode: "number", unsigned: true }),
  code: varchar("code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_positions_division_id").on(table.divisionId),
  index("idx_positions_status").on(table.status),
]);

const projectionScenarios = mysqlTable("projection_scenarios", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  projectionYear: smallint("projection_year", { unsigned: true }).notNull(),
  scenarioKey: varchar("scenario_key", { length: 20 }).notNull(),
  revenueFactor: decimal("revenue_factor", { precision: 8, scale: 4 }).notNull().default("1.0000"),
  expenseFactor: decimal("expense_factor", { precision: 8, scale: 4 }).notNull().default("1.0000"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex("uq_projection_scenario_year").on(table.projectionYear, table.scenarioKey),
  index("idx_projection_scenario_year").on(table.projectionYear),
]);

const projects = mysqlTable("projects", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  clientId: bigint("client_id", { mode: "number", unsigned: true }).notNull(),
  projectName: varchar("project_name", { length: 150 }).notNull(),
  projectCode: varchar("project_code", { length: 50 }).unique().notNull(),
  contractValue: decimal("contract_value", { precision: 15, scale: 2 }).notNull().default("0.00"),
  status: mysqlEnum("status", ["planning", "ongoing", "completed", "cancelled"]).notNull().default("planning"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  budgetAmount: decimal("budget_amount", { precision: 18, scale: 2 }).notNull().default("0.00"),
  milestonesJson: json("milestones_json"),
}, (table) => [
  index("idx_projects_client").on(table.clientId),
  index("idx_projects_status").on(table.status),
]);

const projectMembers = mysqlTable("project_members", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  projectId: bigint("project_id", { mode: "number", unsigned: true }).notNull(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  roleName: varchar("role_name", { length: 100 }),
  allocationPercent: decimal("allocation_percent", { precision: 5, scale: 2 }).notNull().default("100.00"),
  assignedAt: date("assigned_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  memberName: varchar("member_name", { length: 150 }),
  estimatedCost: decimal("estimated_cost", { precision: 18, scale: 2 }).notNull().default("0.00"),
}, (table) => [
  index("fk_project_members_employee").on(table.employeeId),
  index("fk_project_members_user").on(table.userId),
  index("idx_project_members_project").on(table.projectId),
]);

const roles = mysqlTable("roles", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  name: varchar("name", { length: 50 }).unique().notNull(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
]);

const subscriptions = mysqlTable("subscriptions", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  subscriptionName: varchar("subscription_name", { length: 150 }).notNull(),
  providerName: varchar("provider_name", { length: 150 }),
  category: varchar("category", { length: 100 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  billingCycle: mysqlEnum("billing_cycle", ["monthly", "quarterly", "yearly"]).notNull().default("monthly"),
  startDate: date("start_date"),
  renewalDate: date("renewal_date"),
  paymentTermsDays: smallint("payment_terms_days", { unsigned: true }).notNull().default(0),
  status: mysqlEnum("status", ["active", "inactive", "cancelled"]).notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_subscriptions_status").on(table.status),
]);

const subscriptionBillRuns = mysqlTable("subscription_bill_runs", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  subscriptionId: bigint("subscription_id", { mode: "number", unsigned: true }).notNull(),
  billId: bigint("bill_id", { mode: "number", unsigned: true }).unique().notNull(),
  billingDate: date("billing_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("uq_subscription_billing_date").on(table.subscriptionId, table.billingDate),
  index("idx_subscription_bill_runs_subscription").on(table.subscriptionId),
  index("idx_subscription_bill_runs_billing_date").on(table.billingDate),
]);

const taxRecords = mysqlTable("tax_records", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  taxType: varchar("tax_type", { length: 100 }).notNull(),
  taxPeriod: varchar("tax_period", { length: 20 }),
  taxNumber: varchar("tax_number", { length: 100 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  dueDate: date("due_date"),
  paymentDate: date("payment_date"),
  status: mysqlEnum("status", ["draft", "unpaid", "paid", "overdue"]).notNull().default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_tax_status").on(table.status),
]);

const transactionTaxes = mysqlTable("transaction_taxes", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  sourceType: varchar("source_type", { length: 30 }).notNull(),
  sourceId: bigint("source_id", { mode: "number", unsigned: true }).notNull(),
  taxType: mysqlEnum("tax_type", ["PPN_OUTPUT", "PPN_INPUT", "PPH23"]).notNull(),
  taxPeriod: char("tax_period", { length: 7 }).notNull(),
  dppAmount: decimal("dpp_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  taxRate: decimal("tax_rate", { precision: 7, scale: 4 }).notNull().default("0.0000"),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  isCreditable: tinyint("is_creditable").notNull().default(0),
  pph23Object: varchar("pph23_object", { length: 100 }),
  vendorHasNpwp: tinyint("vendor_has_npwp"),
  taxRecordId: bigint("tax_record_id", { mode: "number", unsigned: true }),
  journalEntryId: bigint("journal_entry_id", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["draft", "posted", "closed"]).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex("uq_transaction_tax").on(table.sourceType, table.sourceId, table.taxType),
  index("idx_transaction_taxes_period").on(table.taxPeriod),
  index("idx_transaction_taxes_record").on(table.taxRecordId),
  index("idx_transaction_taxes_status").on(table.status),
  index("fk_transaction_taxes_journal").on(table.journalEntryId),
]);

const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  roleId: bigint("role_id", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
  lastLoginAt: datetime("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
  index("fk_users_role").on(table.roleId),
]);

const userSecuritySettings = mysqlTable("user_security_settings", {
  userId: bigint("user_id", { mode: "number", unsigned: true }).primaryKey().notNull(),
  loginAlerts: tinyint("login_alerts").notNull().default(1),
  sessionAlerts: tinyint("session_alerts").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => [
]);

const vatPeriodClosings = mysqlTable("vat_period_closings", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey().notNull(),
  taxPeriod: char("tax_period", { length: 7 }).unique().notNull(),
  outputVat: decimal("output_vat", { precision: 15, scale: 2 }).notNull().default("0.00"),
  inputVat: decimal("input_vat", { precision: 15, scale: 2 }).notNull().default("0.00"),
  netVat: decimal("net_vat", { precision: 15, scale: 2 }).notNull().default("0.00"),
  dueDate: date("due_date"),
  status: mysqlEnum("status", ["payable", "credit", "paid"]).notNull(),
  taxRecordId: bigint("tax_record_id", { mode: "number", unsigned: true }).unique(),
  closingJournalId: bigint("closing_journal_id", { mode: "number", unsigned: true }),
  notes: text("notes"),
  closedAt: datetime("closed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_vat_closing_status").on(table.status),
  index("fk_vat_period_journal").on(table.closingJournalId),
]);

module.exports = {
  accounts,
  activityLogs,
  assets,
  assetDepreciations,
  authSessions,
  bills,
  billItems,
  billPayments,
  bpjsConfigurations,
  budgetAllocations,
  clients,
  companySettings,
  divisions,
  employees,
  financialProjections,
  invoices,
  invoiceItems,
  invoicePayments,
  journalEntries,
  journalLines,
  notifications,
  passwordResetTokens,
  payrollRecords,
  payrollTaxCalculations,
  positions,
  projectionScenarios,
  projects,
  projectMembers,
  roles,
  subscriptions,
  subscriptionBillRuns,
  taxRecords,
  transactionTaxes,
  users,
  userSecuritySettings,
  vatPeriodClosings,
};
