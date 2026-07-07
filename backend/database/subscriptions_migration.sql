-- ============================================================
-- FinStart: Pengembangan Modul Langganan
-- Jalankan SATU KALI pada database finstart_db.
-- ============================================================

USE finstart_db;

-- Kolom pendukung agar langganan dapat memiliki kategori
-- dan menentukan jatuh tempo draft tagihan yang dibuat.
ALTER TABLE subscriptions
  ADD COLUMN category VARCHAR(100) NULL AFTER provider_name,
  ADD COLUMN payment_terms_days SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER renewal_date;

-- Menghubungkan setiap langganan dengan draft tagihan vendor yang dibuat.
-- Unique key mencegah satu langganan membuat dua tagihan pada tanggal renewal yang sama.
CREATE TABLE IF NOT EXISTS subscription_bill_runs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subscription_id BIGINT UNSIGNED NOT NULL,
  bill_id BIGINT UNSIGNED NOT NULL,
  billing_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_subscription_billing_date (subscription_id, billing_date),
  UNIQUE KEY uq_subscription_bill (bill_id),
  KEY idx_subscription_bill_runs_subscription (subscription_id),
  KEY idx_subscription_bill_runs_billing_date (billing_date),

  CONSTRAINT fk_subscription_bill_runs_subscription
    FOREIGN KEY (subscription_id)
    REFERENCES subscriptions(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_subscription_bill_runs_bill
    FOREIGN KEY (bill_id)
    REFERENCES bills(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Isi kategori untuk data lama apabila ada.
UPDATE subscriptions
SET category = 'Software'
WHERE category IS NULL OR TRIM(category) = '';
