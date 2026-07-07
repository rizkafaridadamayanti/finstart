-- ============================================================
-- FINSTART - MIGRATION PAYROLL
-- Aman dijalankan pada database finstart_db yang sudah memiliki
-- accounts, employees, journal_entries, dan journal_lines.
-- ============================================================

-- Akun kewajiban BPJS untuk potongan pegawai + kontribusi perusahaan
INSERT IGNORE INTO accounts (
  code,
  name,
  type,
  normal_balance,
  opening_balance,
  current_balance,
  status,
  parent_id
)
SELECT
  '2220',
  'Utang BPJS',
  'liability',
  'credit',
  0,
  0,
  'active',
  parent.id
FROM accounts parent
WHERE parent.code = '2200'
LIMIT 1;

-- Akun beban kontribusi BPJS dari perusahaan
INSERT IGNORE INTO accounts (
  code,
  name,
  type,
  normal_balance,
  opening_balance,
  current_balance,
  status,
  parent_id
)
SELECT
  '5110',
  'Beban BPJS Perusahaan',
  'expense',
  'debit',
  0,
  0,
  'active',
  parent.id
FROM accounts parent
WHERE parent.code = '5000'
LIMIT 1;

CREATE TABLE IF NOT EXISTS payroll_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_id BIGINT UNSIGNED NOT NULL,
  payroll_period CHAR(7) NOT NULL,
  payment_date DATE NOT NULL,

  employee_code VARCHAR(50) NULL,
  employee_name VARCHAR(150) NOT NULL,
  employee_nik VARCHAR(32) NULL,
  employee_position VARCHAR(150) NULL,

  base_salary DECIMAL(18,2) NOT NULL DEFAULT 0,

  health_company_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  health_employee_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  jht_company_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  jht_employee_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  jp_company_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  jp_employee_rate DECIMAL(8,4) NOT NULL DEFAULT 0,

  health_company_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  health_employee_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  jht_company_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  jht_employee_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  jp_company_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  jp_employee_amount DECIMAL(18,2) NOT NULL DEFAULT 0,

  employee_bpjs_deduction DECIMAL(18,2) NOT NULL DEFAULT 0,
  employer_bpjs_contribution DECIMAL(18,2) NOT NULL DEFAULT 0,
  net_pay DECIMAL(18,2) NOT NULL DEFAULT 0,

  salary_expense_account_id BIGINT UNSIGNED NOT NULL,
  bpjs_expense_account_id BIGINT UNSIGNED NOT NULL,
  cash_account_id BIGINT UNSIGNED NOT NULL,
  bpjs_payable_account_id BIGINT UNSIGNED NOT NULL,
  journal_entry_id BIGINT UNSIGNED NULL,

  notes TEXT NULL,
  status ENUM('draft', 'posted', 'cancelled') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_payroll_records_employee_period (employee_id, payroll_period),
  KEY idx_payroll_records_period (payroll_period),
  KEY idx_payroll_records_status (status),
  KEY idx_payroll_records_payment_date (payment_date),
  KEY fk_payroll_records_salary_expense (salary_expense_account_id),
  KEY fk_payroll_records_bpjs_expense (bpjs_expense_account_id),
  KEY fk_payroll_records_cash_account (cash_account_id),
  KEY fk_payroll_records_bpjs_payable (bpjs_payable_account_id),
  KEY fk_payroll_records_journal (journal_entry_id),

  CONSTRAINT fk_payroll_records_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payroll_records_salary_expense
    FOREIGN KEY (salary_expense_account_id) REFERENCES accounts(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payroll_records_bpjs_expense
    FOREIGN KEY (bpjs_expense_account_id) REFERENCES accounts(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payroll_records_cash_account
    FOREIGN KEY (cash_account_id) REFERENCES accounts(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payroll_records_bpjs_payable
    FOREIGN KEY (bpjs_payable_account_id) REFERENCES accounts(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payroll_records_journal
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
