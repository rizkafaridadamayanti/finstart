-- Versioned schema migration: bill_payments
CREATE TABLE IF NOT EXISTS `bill_payments` (
  `id` bigint UNSIGNED NOT NULL,
  `bill_id` bigint UNSIGNED NOT NULL,
  `journal_entry_id` bigint UNSIGNED DEFAULT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
