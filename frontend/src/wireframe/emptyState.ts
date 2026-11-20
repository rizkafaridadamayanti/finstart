// Mode data kosong (opsional).
//
// Default: aplikasi membaca data sungguhan dari backend seperti semula.
// Isi file ini dipakai kalau VITE_EMPTY_DATA_MODE=true, supaya seluruh daftar
// dan angka dikosongkan dan aplikasi tampil seperti wireframe tanpa data
// (tapi Buku Besar tetap memakai COA).

const env = ((import.meta as any)?.env || {}) as Record<string, string | undefined>;

export const EMPTY_DATA_MODE = String(env.VITE_EMPTY_DATA_MODE ?? "false") === "true";

const year = () => new Date().getFullYear();

const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const zeroTotals = () => ({
  total_revenue: 0,
  total_expense: 0,
  net_profit: 0,
});

// COA standar yang wajib ada di awal (kas, bank, piutang, utang, modal,
// pendapatan, beban). Bukan data transaksi - hanya struktur akun, jadi tetap
// ditampilkan supaya Buku Besar bisa dipakai dan COA baru bisa ditambahkan.
const standardAccounts = [
  { id: 1, code: "1001", name: "Kas Operasional", type: "asset", sub_type: "Kas", current_balance: 0, normal_balance: "debit", status: "active" },
  { id: 2, code: "1002", name: "Bank Operasional", type: "asset", sub_type: "Bank", current_balance: 0, normal_balance: "debit", status: "active" },
  { id: 3, code: "1010", name: "Kas Masuk/Keluar", type: "asset", sub_type: "Kas", current_balance: 0, normal_balance: "debit", status: "active" },
  { id: 4, code: "1101", name: "Piutang Usaha", type: "asset", sub_type: "Piutang", current_balance: 0, normal_balance: "debit", status: "active" },
  { id: 5, code: "1201", name: "Persediaan", type: "asset", sub_type: "Persediaan", current_balance: 0, normal_balance: "debit", status: "active" },
  { id: 6, code: "1301", name: "Aset Tetap", type: "asset", sub_type: "Tetap", current_balance: 0, normal_balance: "debit", status: "active" },
  { id: 7, code: "2101", name: "Utang Usaha", type: "liability", sub_type: "Utang", current_balance: 0, normal_balance: "credit", status: "active" },
  { id: 8, code: "2201", name: "Utang Pajak", type: "liability", sub_type: "Pajak", current_balance: 0, normal_balance: "credit", status: "active" },
  { id: 9, code: "3001", name: "Modal Penyetor", type: "equity", sub_type: "Modal", current_balance: 0, normal_balance: "credit", status: "active" },
  { id: 10, code: "3101", name: "Laba Ditahan", type: "equity", sub_type: "Modal", current_balance: 0, normal_balance: "credit", status: "active" },
  { id: 11, code: "4001", name: "Pendapatan Operasional", type: "revenue", sub_type: "Operasional", current_balance: 0, normal_balance: "credit", status: "active" },
  { id: 12, code: "4101", name: "Pendapatan Lain-lain", type: "revenue", sub_type: "Lain-lain", current_balance: 0, normal_balance: "credit", status: "active" },
  { id: 13, code: "5001", name: "Beban Operasional", type: "expense", sub_type: "Operasional", current_balance: 0, normal_balance: "debit", status: "active" },
  { id: 14, code: "5101", name: "Beban Pegawai", type: "expense", sub_type: "Operasional", current_balance: 0, normal_balance: "debit", status: "active" },
  { id: 15, code: "5201", name: "Beban Utilitas", type: "expense", sub_type: "Operasional", current_balance: 0, normal_balance: "debit", status: "active" },
  { id: 16, code: "5301", name: "Beban Penyusutan", type: "expense", sub_type: "Operasional", current_balance: 0, normal_balance: "debit", status: "active" },
];

const ACCOUNT_CODE_PREFIX: Record<string, string> = {
  Aset: "1",
  Kewajiban: "2",
  Modal: "3",
  Pendapatan: "4",
  Beban: "5",
};

// Dipakai saat endpoint next-code tidak tersedia (backend mati) supaya form
// tetap menampilkan nomor akun berikutnya.
export function localNextAccountCode(type: string, existingCodes: string[]) {
  const prefix = ACCOUNT_CODE_PREFIX[type] || "1";
  const numbers = existingCodes
    .map((code) => String(code || "").trim())
    .filter((code) => code.startsWith(prefix) && /^\d+$/.test(code))
    .map((code) => Number(code));
  const last = numbers.length ? Math.max(...numbers) : Number(prefix) * 100;
  const next = String(last + 1).slice(prefix.length).padStart(3, "0");
  return `${prefix}${next}`;
}

export function createEmptyData() {
  return {
    clients: [] as any[],
    projects: [] as any[],
    accounts: standardAccounts,
    journalTransactions: [] as any[],
    journalDetail: {
      id: null,
      voucher_number: "",
      transaction_date: "",
      division_id: null,
      description: "",
      status: "",
      total_debit: 0,
      total_credit: 0,
      lines: [] as any[],
    },
    subscriptions: { subscriptions: [] as any[] },
    assets: { assets: [] as any[] },
    invoices: [] as any[],
    bills: [] as any[],
    taxes: [] as any[],
    taxSummary: { total_unpaid: 0, total_paid: 0, total_overdue: 0 },
    taxCalculation: zeroTotals(),
    employees: [] as any[],
    divisions: [] as any[],
    positions: [] as any[],
    bpjsConfig: {
      health_company_rate: 0,
      health_employee_rate: 0,
      jht_company_rate: 0,
      jht_employee_rate: 0,
      jp_company_rate: 0,
      jp_employee_rate: 0,
      jkk_company_rate: 0,
      jkm_company_rate: 0,
    },
    payrollHistory: [] as any[],
    payrollAccounts: [] as any[],
    payrollSummary: {
      payroll_count: 0,
      total_base_salary: 0,
      total_employee_bpjs_deduction: 0,
      total_employer_bpjs_contribution: 0,
      total_net_pay: 0,
    },
    assetCategories: [] as any[],
    companySettings: {},
    securitySettings: {
      login_alerts: false,
      session_alerts: false,
      password_min_length: 0,
      require_mfa: false,
      max_failed_attempts: 0,
    },
    roles: [] as any[],
    users: [] as any[],
    sessions: [] as any[],
    auditLog: [] as any[],
    notifications: [] as any[],
    dashboardSummary: {
      cash_balance: 0,
      total_receivable: 0,
      total_payable: 0,
      total_revenue: 0,
      total_expense: 0,
      net_profit: 0,
      active_projects: 0,
      monthly_income: 0,
      monthly_expense: 0,
      period_label: "",
      cashflow_series: [] as any[],
      recent_transactions: [] as any[],
    },
    projectionData: {
      year: year(),
      scenario: { scenario_key: "normal", revenue_factor: 1, expense_factor: 1, notes: "" },
      scenarios: [] as any[],
      months: [] as any[],
      summary: {
        cash_balance: 0,
        monthly_burn_rate: 0,
        runway_months: null,
        forecast_revenue: 0,
        revenue_target: 0,
        revenue_actual: 0,
        expense_target: 0,
        expense_actual: 0,
        profit_target: 0,
        profit_actual: 0,
        value: {
          revenue_target: 0,
          revenue_actual: 0,
          expense_target: 0,
          expense_actual: 0,
          profit_target: 0,
          profit_actual: 0,
        },
      },
      budget_allocations: [] as any[],
      budget_summary: { total_budget: 0, total_actual: 0, total_variance: 0 },
    },
    reportPeriod: currentPeriod(),
    reportPeriods: [] as any[],
    reportData: {
      period: currentPeriod(),
      period_label: "",
      income_statement: {
        revenue_items: [] as any[],
        expense_items: [] as any[],
        total_revenue: 0,
        total_expense: 0,
        net_profit: 0,
      },
      balance_sheet: {
        assets: [] as any[],
        liabilities: [] as any[],
        equity: [] as any[],
        total_assets: 0,
        total_liabilities: 0,
        total_equity: 0,
      },
      cash_flow: {
        operating_items: [] as any[],
        investing_items: [] as any[],
        financing_items: [] as any[],
        net_cash: 0,
      },
      trial_balance: {
        items: [] as any[],
        total_debit: 0,
        total_credit: 0,
        difference: 0,
      },
      general_ledger: {
        items: [] as any[],
        total_debit: 0,
        total_credit: 0,
      },
      receivable_aging: { items: [] as any[], total_outstanding: 0 },
      payable_aging: { items: [] as any[], total_outstanding: 0 },
      tax_report: { items: [] as any[], total: 0 },
      payroll_report: {
        items: [] as any[],
        summary: { total_records: 0, total_net_salary: 0, total_gross: 0 },
      },
      asset_report: {
        items: [] as any[],
        total_book_value: 0,
        total_period_depreciation: 0,
      },
      project_profitability: {
        note: "",
        items: [] as any[],
        total_profit: 0,
      },
    },
  };
}
