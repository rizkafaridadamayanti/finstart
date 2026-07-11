-- Versioned schema migration: asset_depreciations
CREATE TABLE IF NOT EXISTS `asset_depreciations` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `depreciation_period` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `depreciation_date` date NOT NULL,
  `depreciation_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `accumulated_depreciation_after` decimal(15,2) NOT NULL DEFAULT '0.00',
  `book_value_after` decimal(15,2) NOT NULL DEFAULT '0.00',
  `journal_entry_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('posted','void') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'posted',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
