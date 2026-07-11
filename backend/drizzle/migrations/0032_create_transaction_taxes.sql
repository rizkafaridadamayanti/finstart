-- Versioned schema migration: transaction_taxes
CREATE TABLE IF NOT EXISTS `transaction_taxes` (
  `id` bigint UNSIGNED NOT NULL,
  `source_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_id` bigint UNSIGNED NOT NULL,
  `tax_type` enum('PPN_OUTPUT','PPN_INPUT','PPH23') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_period` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dpp_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tax_rate` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `tax_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `is_creditable` tinyint(1) NOT NULL DEFAULT '0',
  `pph23_object` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor_has_npwp` tinyint(1) DEFAULT NULL,
  `tax_record_id` bigint UNSIGNED DEFAULT NULL,
  `journal_entry_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('draft','posted','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
