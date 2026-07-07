-- FinStart: modul PPh 21 pegawai dan slip internal
-- Perbaikan tipe foreign key: seluruh ID mengikuti bigint unsigned.

CREATE TABLE IF NOT EXISTS payroll_tax_calculations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tax_record_id BIGINT UNSIGNED NOT NULL,

  employee_name VARCHAR(150) NOT NULL,
  employee_nik VARCHAR(32) NULL,
  employee_position VARCHAR(100) NULL,

  tax_period CHAR(7) NOT NULL,
  ptkp_status VARCHAR(5) NOT NULL,
  ter_category CHAR(1) NOT NULL,

  base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  allowance_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  gross_income DECIMAL(15,2) NOT NULL DEFAULT 0,

  ter_rate DECIMAL(7,4) NOT NULL DEFAULT 0,
  pph21_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  take_home_pay DECIMAL(15,2) NOT NULL DEFAULT 0,

  payroll_date DATE NULL,
  salary_expense_account_id BIGINT UNSIGNED NULL,
  cash_account_id BIGINT UNSIGNED NULL,
  payroll_journal_id BIGINT UNSIGNED NULL,

  status ENUM('draft', 'posted') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_payroll_tax_record (tax_record_id),
  KEY idx_payroll_tax_period (tax_period),
  KEY idx_payroll_employee_nik (employee_nik),

  CONSTRAINT fk_payroll_tax_record
    FOREIGN KEY (tax_record_id)
    REFERENCES tax_records(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_payroll_salary_expense
    FOREIGN KEY (salary_expense_account_id)
    REFERENCES accounts(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_payroll_cash_account
    FOREIGN KEY (cash_account_id)
    REFERENCES accounts(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_payroll_journal
    FOREIGN KEY (payroll_journal_id)
    REFERENCES journal_entries(id)
    ON DELETE SET NULL
);
