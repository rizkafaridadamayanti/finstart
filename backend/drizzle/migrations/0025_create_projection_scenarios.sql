-- Versioned schema migration: projection_scenarios
CREATE TABLE IF NOT EXISTS `projection_scenarios` (
  `id` bigint UNSIGNED NOT NULL,
  `projection_year` smallint UNSIGNED NOT NULL,
  `scenario_key` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revenue_factor` decimal(8,4) NOT NULL DEFAULT '1.0000',
  `expense_factor` decimal(8,4) NOT NULL DEFAULT '1.0000',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
