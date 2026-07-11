-- Versioned schema migration: subscription_bill_runs
CREATE TABLE IF NOT EXISTS `subscription_bill_runs` (
  `id` bigint UNSIGNED NOT NULL,
  `subscription_id` bigint UNSIGNED NOT NULL,
  `bill_id` bigint UNSIGNED NOT NULL,
  `billing_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
