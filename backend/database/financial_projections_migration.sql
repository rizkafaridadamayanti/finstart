-- FinStart: Target & Proyeksi Bisnis Bulanan
-- Jalankan satu kali pada database finstart_db.

USE finstart_db;

CREATE TABLE IF NOT EXISTS financial_projections (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projection_year SMALLINT UNSIGNED NOT NULL,
  projection_month TINYINT UNSIGNED NOT NULL,
  revenue_target DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  expense_target DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_financial_projection_month (
    projection_year,
    projection_month
  ),
  KEY idx_financial_projection_year (projection_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
