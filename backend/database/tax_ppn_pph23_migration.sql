-- ============================================================
-- FINSTART: PPN & PPh 23 TERINTEGRASI
-- Jalankan sekali pada database finstart_db.
-- Tidak mengubah transaksi lama yang sudah posted.
-- Fitur ini berlaku untuk invoice/tagihan BARU setelah migration.
-- ============================================================

USE finstart_db;

-- Akun khusus pajak agar PPN dan PPh 23 tidak tercampur dengan Utang Pajak umum.
INSERT INTO accounts (
  code,
  name,
  type,
  normal_balance,
  opening_balance,
  current_balance,
  status,
  parent_id
) VALUES
  ('1145', 'PPN Masukan', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
  ('1146', 'PPN Lebih Bayar', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
  ('2210', 'PPN Keluaran', 'liability', 'credit', 0.00, 0.00, 'active', NULL),
  ('2211', 'Utang PPh 23', 'liability', 'credit', 0.00, 0.00, 'active', NULL)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  type = VALUES(type),
  normal_balance = VALUES(normal_balance),
  status = 'active';

-- Menyimpan pajak yang bersumber dari invoice dan tagihan vendor.
CREATE TABLE IF NOT EXISTS transaction_taxes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_type VARCHAR(30) NOT NULL,
  source_id BIGINT UNSIGNED NOT NULL,
  tax_type ENUM('PPN_OUTPUT','PPN_INPUT','PPH23') NOT NULL,
  tax_period CHAR(7) NOT NULL,
  dpp_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(7,4) NOT NULL DEFAULT 0.0000,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  is_creditable TINYINT(1) NOT NULL DEFAULT 0,
  pph23_object VARCHAR(100) NULL,
  vendor_has_npwp TINYINT(1) NULL,
  tax_record_id BIGINT UNSIGNED NULL,
  journal_entry_id BIGINT UNSIGNED NULL,
  status ENUM('draft','posted','closed') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_transaction_tax (source_type, source_id, tax_type),
  KEY idx_transaction_taxes_period (tax_period),
  KEY idx_transaction_taxes_record (tax_record_id),
  KEY idx_transaction_taxes_status (status),

  CONSTRAINT fk_transaction_taxes_record
    FOREIGN KEY (tax_record_id)
    REFERENCES tax_records(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_transaction_taxes_journal
    FOREIGN KEY (journal_entry_id)
    REFERENCES journal_entries(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menyimpan proses penutupan PPN tiap Masa Pajak.
CREATE TABLE IF NOT EXISTS vat_period_closings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tax_period CHAR(7) NOT NULL,
  output_vat DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  input_vat DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  net_vat DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  due_date DATE NULL,
  status ENUM('payable','credit','paid') NOT NULL,
  tax_record_id BIGINT UNSIGNED NULL,
  closing_journal_id BIGINT UNSIGNED NULL,
  notes TEXT NULL,
  closed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_vat_period (tax_period),
  UNIQUE KEY uq_vat_tax_record (tax_record_id),
  KEY idx_vat_closing_status (status),

  CONSTRAINT fk_vat_period_record
    FOREIGN KEY (tax_record_id)
    REFERENCES tax_records(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT fk_vat_period_journal
    FOREIGN KEY (closing_journal_id)
    REFERENCES journal_entries(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
