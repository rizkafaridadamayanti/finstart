-- ============================================================
-- FINSTART - MASTER DATA MIGRATION
-- Aman dijalankan berulang kali pada database finstart_db.
-- Tidak menghapus tabel atau data lama.
-- Jalankan:
-- mysql -u root finstart_db < backend/database/master_data_migration.sql
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 1. MASTER DIVISI
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS divisions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_divisions_code (code),
  UNIQUE KEY uq_divisions_name (name),
  KEY idx_divisions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. MASTER JABATAN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS positions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  division_id BIGINT UNSIGNED NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_positions_code (code),
  KEY idx_positions_division_id (division_id),
  KEY idx_positions_status (status),
  CONSTRAINT fk_positions_division
    FOREIGN KEY (division_id) REFERENCES divisions(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. MASTER PEGAWAI
-- Jika tabel employees belum ada, tabel dibuat lengkap.
-- Jika sudah ada, kolom yang belum tersedia ditambahkan di bawah.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_code VARCHAR(50) NULL,
  full_name VARCHAR(150) NULL,
  nik VARCHAR(32) NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(40) NULL,
  division_id BIGINT UNSIGNED NULL,
  position_id BIGINT UNSIGNED NULL,
  employment_type VARCHAR(30) NOT NULL DEFAULT 'permanent',
  ptkp_status VARCHAR(10) NOT NULL DEFAULT 'TK/0',
  bpjs_status VARCHAR(20) NOT NULL DEFAULT 'active',
  employment_status VARCHAR(20) NOT NULL DEFAULT 'active',
  join_date DATE NULL,
  base_salary DECIMAL(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_employees_employee_code (employee_code),
  UNIQUE KEY uq_employees_nik (nik),
  KEY idx_employees_division_id (division_id),
  KEY idx_employees_position_id (position_id),
  KEY idx_employees_employment_status (employment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. MASTER KONFIGURASI BPJS
-- Satu baris aktif dipakai aplikasi dengan id = 1.
-- Nilai awal 0 agar tarif diisi sesuai kebijakan perusahaan.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bpjs_configurations (
  id TINYINT UNSIGNED NOT NULL,
  health_company_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  health_employee_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  jht_company_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  jht_employee_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  jp_company_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  jp_employee_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
  effective_date DATE NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. MASTER PENGATURAN PERUSAHAAN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_settings (
  id TINYINT UNSIGNED NOT NULL,
  company_name VARCHAR(180) NULL,
  logo_url VARCHAR(500) NULL,
  address TEXT NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(40) NULL,
  npwp VARCHAR(50) NULL,
  fiscal_year SMALLINT UNSIGNED NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
  city VARCHAR(120) NULL,
  province VARCHAR(120) NULL,
  postal_code VARCHAR(15) NULL,
  website VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- KOMPATIBILITAS TABEL LAMA
-- Tambahkan kolom/index yang belum tersedia tanpa menghapus data.
-- ============================================================
DELIMITER $$

DROP PROCEDURE IF EXISTS md_add_column_if_missing$$
CREATE PROCEDURE md_add_column_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_column_name VARCHAR(64),
  IN p_column_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @md_sql = CONCAT(
      'ALTER TABLE `', p_table_name,
      '` ADD COLUMN `', p_column_name,
      '` ', p_column_definition
    );
    PREPARE md_stmt FROM @md_sql;
    EXECUTE md_stmt;
    DEALLOCATE PREPARE md_stmt;
  END IF;
END$$

DROP PROCEDURE IF EXISTS md_add_index_if_missing$$
CREATE PROCEDURE md_add_index_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_index_name VARCHAR(64),
  IN p_index_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND INDEX_NAME = p_index_name
  ) THEN
    SET @md_sql = CONCAT(
      'ALTER TABLE `', p_table_name,
      '` ADD ', p_index_definition
    );
    PREPARE md_stmt FROM @md_sql;
    EXECUTE md_stmt;
    DEALLOCATE PREPARE md_stmt;
  END IF;
END$$

-- Kolom employees
CALL md_add_column_if_missing('employees', 'employee_code', 'VARCHAR(50) NULL')$$
CALL md_add_column_if_missing('employees', 'full_name', 'VARCHAR(150) NULL')$$
CALL md_add_column_if_missing('employees', 'nik', 'VARCHAR(32) NULL')$$
CALL md_add_column_if_missing('employees', 'email', 'VARCHAR(150) NULL')$$
CALL md_add_column_if_missing('employees', 'phone', 'VARCHAR(40) NULL')$$
CALL md_add_column_if_missing('employees', 'division_id', 'BIGINT UNSIGNED NULL')$$
CALL md_add_column_if_missing('employees', 'position_id', 'BIGINT UNSIGNED NULL')$$
CALL md_add_column_if_missing('employees', 'employment_type', 'VARCHAR(30) NOT NULL DEFAULT ''permanent''')$$
CALL md_add_column_if_missing('employees', 'ptkp_status', 'VARCHAR(10) NOT NULL DEFAULT ''TK/0''')$$
CALL md_add_column_if_missing('employees', 'bpjs_status', 'VARCHAR(20) NOT NULL DEFAULT ''active''')$$
CALL md_add_column_if_missing('employees', 'employment_status', 'VARCHAR(20) NOT NULL DEFAULT ''active''')$$
CALL md_add_column_if_missing('employees', 'join_date', 'DATE NULL')$$
CALL md_add_column_if_missing('employees', 'base_salary', 'DECIMAL(18,2) NOT NULL DEFAULT 0')$$
CALL md_add_column_if_missing('employees', 'created_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP')$$
CALL md_add_column_if_missing('employees', 'updated_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')$$

-- Index employees
CALL md_add_index_if_missing('employees', 'uq_employees_employee_code', 'UNIQUE INDEX `uq_employees_employee_code` (`employee_code`)')$$
CALL md_add_index_if_missing('employees', 'uq_employees_nik', 'UNIQUE INDEX `uq_employees_nik` (`nik`)')$$
CALL md_add_index_if_missing('employees', 'idx_employees_division_id', 'INDEX `idx_employees_division_id` (`division_id`)')$$
CALL md_add_index_if_missing('employees', 'idx_employees_position_id', 'INDEX `idx_employees_position_id` (`position_id`)')$$
CALL md_add_index_if_missing('employees', 'idx_employees_employment_status', 'INDEX `idx_employees_employment_status` (`employment_status`)')$$

-- Kolom company_settings jika tabel lama sudah ada
CALL md_add_column_if_missing('company_settings', 'company_name', 'VARCHAR(180) NULL')$$
CALL md_add_column_if_missing('company_settings', 'logo_url', 'VARCHAR(500) NULL')$$
CALL md_add_column_if_missing('company_settings', 'address', 'TEXT NULL')$$
CALL md_add_column_if_missing('company_settings', 'email', 'VARCHAR(150) NULL')$$
CALL md_add_column_if_missing('company_settings', 'phone', 'VARCHAR(40) NULL')$$
CALL md_add_column_if_missing('company_settings', 'npwp', 'VARCHAR(50) NULL')$$
CALL md_add_column_if_missing('company_settings', 'fiscal_year', 'SMALLINT UNSIGNED NULL')$$
CALL md_add_column_if_missing('company_settings', 'currency', 'VARCHAR(10) NOT NULL DEFAULT ''IDR''')$$
CALL md_add_column_if_missing('company_settings', 'city', 'VARCHAR(120) NULL')$$
CALL md_add_column_if_missing('company_settings', 'province', 'VARCHAR(120) NULL')$$
CALL md_add_column_if_missing('company_settings', 'postal_code', 'VARCHAR(15) NULL')$$
CALL md_add_column_if_missing('company_settings', 'website', 'VARCHAR(255) NULL')$$
CALL md_add_column_if_missing('company_settings', 'created_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP')$$
CALL md_add_column_if_missing('company_settings', 'updated_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')$$

DROP PROCEDURE IF EXISTS md_add_column_if_missing$$
DROP PROCEDURE IF EXISTS md_add_index_if_missing$$

DELIMITER ;

-- ============================================================
-- DATA AWAL MASTER DIVISI & JABATAN
-- INSERT IGNORE menjaga data yang sebelumnya sudah ada.
-- ============================================================
INSERT IGNORE INTO divisions (code, name, description, status) VALUES
  ('DIV-TECH', 'Technology', 'Divisi teknologi dan pengembangan produk.', 'active'),
  ('DIV-DESIGN', 'Design', 'Divisi desain produk dan visual.', 'active'),
  ('DIV-MKT', 'Marketing', 'Divisi pemasaran dan komunikasi.', 'active'),
  ('DIV-FIN', 'Finance', 'Divisi keuangan dan akuntansi.', 'active'),
  ('DIV-OPS', 'Operations', 'Divisi operasional perusahaan.', 'active'),
  ('DIV-HR', 'Human Resources', 'Divisi sumber daya manusia.', 'active');

INSERT IGNORE INTO positions (division_id, code, name, description, status)
SELECT id, 'POS-TECH-DEV', 'Developer', 'Pengembang aplikasi.', 'active'
FROM divisions WHERE code = 'DIV-TECH';

INSERT IGNORE INTO positions (division_id, code, name, description, status)
SELECT id, 'POS-DESIGN-UIUX', 'UI/UX Designer', 'Perancang pengalaman dan antarmuka pengguna.', 'active'
FROM divisions WHERE code = 'DIV-DESIGN';

INSERT IGNORE INTO positions (division_id, code, name, description, status)
SELECT id, 'POS-MKT-STAFF', 'Marketing Staff', 'Staf pemasaran.', 'active'
FROM divisions WHERE code = 'DIV-MKT';

INSERT IGNORE INTO positions (division_id, code, name, description, status)
SELECT id, 'POS-FIN-STAFF', 'Finance Staff', 'Staf keuangan.', 'active'
FROM divisions WHERE code = 'DIV-FIN';

INSERT IGNORE INTO positions (division_id, code, name, description, status)
SELECT id, 'POS-OPS-STAFF', 'Operations Staff', 'Staf operasional.', 'active'
FROM divisions WHERE code = 'DIV-OPS';

INSERT IGNORE INTO positions (division_id, code, name, description, status)
SELECT id, 'POS-HR-STAFF', 'HR Staff', 'Staf SDM.', 'active'
FROM divisions WHERE code = 'DIV-HR';

INSERT IGNORE INTO positions (division_id, code, name, description, status)
SELECT NULL, 'POS-MANAGER', 'Manager', 'Jabatan manajerial lintas divisi.', 'active';

INSERT IGNORE INTO positions (division_id, code, name, description, status)
SELECT NULL, 'POS-SUPERVISOR', 'Supervisor', 'Jabatan supervisor lintas divisi.', 'active';

-- Konfigurasi BPJS awal; ubah lewat API atau halaman SDM.
INSERT IGNORE INTO bpjs_configurations (
  id,
  health_company_rate,
  health_employee_rate,
  jht_company_rate,
  jht_employee_rate,
  jp_company_rate,
  jp_employee_rate,
  effective_date,
  notes
) VALUES (
  1, 0, 0, 0, 0, 0, 0, CURDATE(),
  'Isi tarif BPJS sesuai kebijakan perusahaan dan ketentuan yang berlaku.'
);

-- Pengaturan perusahaan awal; ubah lewat halaman Settings.
INSERT IGNORE INTO company_settings (
  id, company_name, fiscal_year, currency
) VALUES (
  1, 'FinStart', YEAR(CURDATE()), 'IDR'
);
