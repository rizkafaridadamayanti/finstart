-- ============================================================
-- FINSTART - FULL DATABASE SCHEMA (MySQL 8+)
-- Aman untuk di-import berulang: membuat tabel yang belum ada.
-- Tidak menghapus database, tabel, atau data yang sudah ada.
-- ============================================================

CREATE DATABASE IF NOT EXISTS finstart_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE finstart_db;

-- 1. Akses dan pengaturan perusahaan
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  npwp VARCHAR(50) NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
  logo VARCHAR(255) NULL,
  fiscal_year_start_month TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Master data
CREATE TABLE IF NOT EXISTS clients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  pic_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(30) NULL,
  industry VARCHAR(100) NULL,
  category VARCHAR(100) NULL,
  location VARCHAR(150) NULL,
  address TEXT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clients_status (status),
  INDEX idx_clients_name (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employees (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(30) NULL,
  position VARCHAR(100) NULL,
  salary DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  employment_status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  join_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employees_status (employment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id BIGINT UNSIGNED NOT NULL,
  project_name VARCHAR(150) NOT NULL,
  project_code VARCHAR(50) NOT NULL UNIQUE,
  contract_value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status ENUM('planning','ongoing','completed','cancelled') NOT NULL DEFAULT 'planning',
  start_date DATE NULL,
  end_date DATE NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES clients(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_projects_client (client_id),
  INDEX idx_projects_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_members (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  employee_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NULL,
  role_name VARCHAR(100) NULL,
  allocation_percent DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  assigned_at DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_project_members_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_project_members_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  type ENUM('asset','liability','equity','revenue','expense') NOT NULL,
  normal_balance ENUM('debit','credit') NOT NULL,
  opening_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  parent_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_accounts_parent FOREIGN KEY (parent_id) REFERENCES accounts(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_accounts_type (type),
  INDEX idx_accounts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subscription_name VARCHAR(150) NOT NULL,
  provider_name VARCHAR(150) NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  billing_cycle ENUM('monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
  start_date DATE NULL,
  renewal_date DATE NULL,
  status ENUM('active','inactive','cancelled') NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subscriptions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_code VARCHAR(50) NOT NULL UNIQUE,
  asset_name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NULL,
  acquisition_date DATE NULL,
  acquisition_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  useful_life_months INT UNSIGNED NULL,
  residual_value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  accumulated_depreciation DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status ENUM('active','disposed','inactive') NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_assets_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tax_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tax_type VARCHAR(100) NOT NULL,
  tax_period VARCHAR(20) NULL,
  tax_number VARCHAR(100) NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  due_date DATE NULL,
  payment_date DATE NULL,
  status ENUM('draft','unpaid','paid','overdue') NOT NULL DEFAULT 'draft',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tax_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Receivable dan payable
CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  due_date DATE NULL,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status ENUM('draft','unpaid','partial','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_invoices_project FOREIGN KEY (project_id) REFERENCES projects(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_invoices_client (client_id),
  INDEX idx_invoices_project (project_id),
  INDEX idx_invoices_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_invoice_items_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bills (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vendor_name VARCHAR(150) NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  bill_number VARCHAR(50) NOT NULL UNIQUE,
  bill_date DATE NOT NULL,
  due_date DATE NULL,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status ENUM('draft','unpaid','partial','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bills_project FOREIGN KEY (project_id) REFERENCES projects(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_bills_project (project_id),
  INDEX idx_bills_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bill_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bill_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bill_items_bill FOREIGN KEY (bill_id) REFERENCES bills(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_bill_items_bill (bill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Proses akuntansi
CREATE TABLE IF NOT EXISTS journal_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  voucher_number VARCHAR(50) NOT NULL UNIQUE,
  transaction_date DATE NOT NULL,
  description TEXT NULL,
  source_type VARCHAR(50) NULL,
  source_id BIGINT UNSIGNED NULL,
  status ENUM('draft','approved','posted','rejected') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NULL,
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  posted_at DATETIME NULL,
  rejection_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_journal_created_by FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_journal_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_journal_status (status),
  INDEX idx_journal_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS journal_lines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  journal_entry_id BIGINT UNSIGNED NOT NULL,
  account_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255) NULL,
  debit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  credit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_journal_line_one_side CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)),
  CONSTRAINT fk_journal_lines_entry FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_journal_lines_account FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_journal_lines_entry (journal_entry_id),
  INDEX idx_journal_lines_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoice_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  journal_entry_id BIGINT UNSIGNED NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference_number VARCHAR(100) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_invoice_payments_journal FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_invoice_payments_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bill_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bill_id BIGINT UNSIGNED NOT NULL,
  journal_entry_id BIGINT UNSIGNED NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference_number VARCHAR(100) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bill_payments_bill FOREIGN KEY (bill_id) REFERENCES bills(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_bill_payments_journal FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_bill_payments_bill (bill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Pendukung
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  reference_type VARCHAR(50) NULL,
  reference_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  activity VARCHAR(150) NOT NULL,
  description TEXT NULL,
  module VARCHAR(100) NULL,
  reference_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_activity_logs_user (user_id),
  INDEX idx_activity_logs_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- End of schema
