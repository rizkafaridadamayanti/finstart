-- ============================================================
-- FINSTART FINAL - MIGRASI PENGAMANAN, SDM, PROYEK, DAN AUDIT
-- MySQL 8+. Aman dijalankan berulang kali setelah schema utama.
-- Tidak menghapus data apa pun.
-- ============================================================

USE finstart_db;

INSERT IGNORE INTO roles (name, description) VALUES
  ('admin', 'Administrator sistem dengan akses penuh.'),
  ('finance_manager', 'Menyusun, meninjau, dan mengelola operasi keuangan.'),
  ('finance', 'Staf keuangan untuk transaksi operasional dan sub-ledger.'),
  ('hr', 'Mengelola data SDM dan payroll.'),
  ('tax', 'Mengelola administrasi serta pelaporan pajak internal.'),
  ('project_manager', 'Mengelola klien, proyek, dan alokasi tim.'),
  ('director', 'Membaca ringkasan dan menyetujui/posting jurnal.'),
  ('auditor', 'Akses baca untuk audit dan pemeriksaan.');

CREATE TABLE IF NOT EXISTS auth_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  user_agent VARCHAR(255) NULL,
  ip_address VARCHAR(64) NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_auth_sessions_user (user_id),
  INDEX idx_auth_sessions_expiry (expires_at),
  CONSTRAINT fk_auth_sessions_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_reset_user (user_id),
  INDEX idx_password_reset_expiry (expires_at),
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_security_settings (
  user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  login_alerts TINYINT(1) NOT NULL DEFAULT 1,
  session_alerts TINYINT(1) NOT NULL DEFAULT 1,
  mfa_status ENUM('not_configured','pending','enabled') NOT NULL DEFAULT 'not_configured',
  mfa_secret VARCHAR(255) NULL,
  mfa_pending_secret VARCHAR(255) NULL,
  mfa_setup_code VARCHAR(16) NULL,
  mfa_time_offset_steps INT NULL,
  mfa_last_counter BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_security_settings_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$

DROP PROCEDURE IF EXISTS final_add_column_if_missing$$
CREATE PROCEDURE final_add_column_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_column_name VARCHAR(64),
  IN p_column_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @final_sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN `', p_column_name, '` ', p_column_definition);
    PREPARE final_stmt FROM @final_sql;
    EXECUTE final_stmt;
    DEALLOCATE PREPARE final_stmt;
  END IF;
END$$

CALL final_add_column_if_missing('project_members', 'member_name', 'VARCHAR(150) NULL')$$
CALL final_add_column_if_missing('project_members', 'estimated_cost', 'DECIMAL(18,2) NOT NULL DEFAULT 0')$$

CALL final_add_column_if_missing('user_security_settings', 'mfa_secret', 'VARCHAR(255) NULL')$$
CALL final_add_column_if_missing('user_security_settings', 'mfa_pending_secret', 'VARCHAR(255) NULL')$$
CALL final_add_column_if_missing('user_security_settings', 'mfa_setup_code', 'VARCHAR(16) NULL')$$
CALL final_add_column_if_missing('user_security_settings', 'mfa_time_offset_steps', 'INT NULL')$$
CALL final_add_column_if_missing('user_security_settings', 'mfa_last_counter', 'BIGINT NULL')$$

CALL final_add_column_if_missing('projects', 'budget_amount', 'DECIMAL(18,2) NOT NULL DEFAULT 0')$$
CALL final_add_column_if_missing('projects', 'milestones_json', 'JSON NULL')$$
CALL final_add_column_if_missing('journal_entries', 'division_id', 'BIGINT UNSIGNED NULL')$$

CALL final_add_column_if_missing('payroll_records', 'overtime_amount', 'DECIMAL(15,2) NOT NULL DEFAULT 0')$$
CALL final_add_column_if_missing('payroll_records', 'allowance_amount', 'DECIMAL(15,2) NOT NULL DEFAULT 0')$$
CALL final_add_column_if_missing('payroll_records', 'bonus_amount', 'DECIMAL(15,2) NOT NULL DEFAULT 0')$$
CALL final_add_column_if_missing('payroll_records', 'loan_deduction', 'DECIMAL(15,2) NOT NULL DEFAULT 0')$$
CALL final_add_column_if_missing('payroll_records', 'other_deduction', 'DECIMAL(15,2) NOT NULL DEFAULT 0')$$
CALL final_add_column_if_missing('payroll_records', 'pph21_amount', 'DECIMAL(15,2) NOT NULL DEFAULT 0')$$
CALL final_add_column_if_missing('payroll_records', 'tax_record_id', 'BIGINT UNSIGNED NULL')$$

CALL final_add_column_if_missing('employees', 'npwp', 'VARCHAR(50) NULL')$$
CALL final_add_column_if_missing('employees', 'bpjs_health_number', 'VARCHAR(50) NULL')$$
CALL final_add_column_if_missing('employees', 'bpjs_employment_number', 'VARCHAR(50) NULL')$$
CALL final_add_column_if_missing('employees', 'bank_name', 'VARCHAR(100) NULL')$$
CALL final_add_column_if_missing('employees', 'bank_account_number', 'VARCHAR(80) NULL')$$
CALL final_add_column_if_missing('employees', 'bank_account_holder', 'VARCHAR(150) NULL')$$
CALL final_add_column_if_missing('employees', 'address', 'TEXT NULL')$$

DROP PROCEDURE IF EXISTS final_add_column_if_missing$$
DELIMITER ;

-- MFA TOTP tersedia di Pengaturan. Secret hanya dibuat saat pengguna memulai setup.
-- Integrasi eksternal (DJP/Bank Persepsi/e-Faktur/payment gateway) sengaja tidak dibuat
-- sebagai klaim fiktif; catatan pajak dan pembayaran eksternal disimpan secara internal.


-- Proyeksi dan anggaran operasional
CREATE TABLE IF NOT EXISTS financial_projections (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projection_year SMALLINT UNSIGNED NOT NULL,
  projection_month TINYINT UNSIGNED NOT NULL,
  revenue_target DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  expense_target DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_financial_projection_month (projection_year, projection_month),
  KEY idx_financial_projection_year (projection_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projection_scenarios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projection_year SMALLINT UNSIGNED NOT NULL,
  scenario_key VARCHAR(20) NOT NULL,
  revenue_factor DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
  expense_factor DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_projection_scenario_year (projection_year, scenario_key),
  KEY idx_projection_scenario_year (projection_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS budget_allocations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  budget_year SMALLINT UNSIGNED NOT NULL,
  budget_month TINYINT UNSIGNED NULL,
  scenario_key VARCHAR(20) NOT NULL DEFAULT 'normal',
  account_id BIGINT UNSIGNED NOT NULL,
  division_id BIGINT UNSIGNED NULL,
  budget_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_budget_allocations_period (budget_year, budget_month, scenario_key),
  KEY idx_budget_allocations_account (account_id),
  KEY idx_budget_allocations_division (division_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
