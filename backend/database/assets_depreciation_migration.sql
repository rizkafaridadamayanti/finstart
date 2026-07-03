-- ============================================================
-- FinStart: Modul Aset Tetap dan Penyusutan
-- Jalankan satu kali pada database finstart_db.
-- ============================================================

USE finstart_db;

-- Akun beban untuk jurnal penyusutan bulanan.
INSERT INTO accounts (
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
  '5250',
  'Beban Penyusutan',
  'expense',
  'debit',
  0.00,
  0.00,
  'active',
  id
FROM accounts
WHERE code = '5000'
LIMIT 1
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  type = VALUES(type),
  normal_balance = VALUES(normal_balance),
  status = 'active';

-- Riwayat penyusutan bulanan setiap aset.
CREATE TABLE IF NOT EXISTS asset_depreciations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id BIGINT UNSIGNED NOT NULL,

  depreciation_period CHAR(7) NOT NULL,
  depreciation_date DATE NOT NULL,

  depreciation_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  accumulated_depreciation_after DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  book_value_after DECIMAL(15,2) NOT NULL DEFAULT 0.00,

  journal_entry_id BIGINT UNSIGNED NULL,
  status ENUM('posted', 'void') NOT NULL DEFAULT 'posted',
  notes TEXT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_asset_depreciation_period (
    asset_id,
    depreciation_period
  ),
  KEY idx_asset_depreciation_period (depreciation_period),
  KEY idx_asset_depreciation_journal (journal_entry_id),

  CONSTRAINT fk_asset_depreciation_asset
    FOREIGN KEY (asset_id)
    REFERENCES assets(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_asset_depreciation_journal
    FOREIGN KEY (journal_entry_id)
    REFERENCES journal_entries(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
