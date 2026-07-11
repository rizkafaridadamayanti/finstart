-- Versioned schema migration: financial_projections
CREATE TABLE IF NOT EXISTS `financial_projections` (
  `id` bigint UNSIGNED NOT NULL,
  `projection_year` smallint UNSIGNED NOT NULL,
  `projection_month` tinyint UNSIGNED NOT NULL,
  `revenue_target` decimal(15,2) NOT NULL DEFAULT '0.00',
  `expense_target` decimal(15,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
