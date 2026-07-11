-- Versioned schema migration: vat_period_closings
CREATE TABLE IF NOT EXISTS `vat_period_closings` (
  `id` bigint UNSIGNED NOT NULL,
  `tax_period` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `output_vat` decimal(15,2) NOT NULL DEFAULT '0.00',
  `input_vat` decimal(15,2) NOT NULL DEFAULT '0.00',
  `net_vat` decimal(15,2) NOT NULL DEFAULT '0.00',
  `due_date` date DEFAULT NULL,
  `status` enum('payable','credit','paid') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_record_id` bigint UNSIGNED DEFAULT NULL,
  `closing_journal_id` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `closed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
