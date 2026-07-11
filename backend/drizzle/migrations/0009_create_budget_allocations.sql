-- Versioned schema migration: budget_allocations
CREATE TABLE IF NOT EXISTS `budget_allocations` (
  `id` bigint UNSIGNED NOT NULL,
  `budget_year` smallint UNSIGNED NOT NULL,
  `budget_month` tinyint UNSIGNED DEFAULT NULL,
  `scenario_key` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `account_id` bigint UNSIGNED NOT NULL,
  `division_id` bigint UNSIGNED DEFAULT NULL,
  `budget_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
