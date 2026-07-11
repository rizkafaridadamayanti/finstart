-- Versioned schema migration: assets
CREATE TABLE IF NOT EXISTS `assets` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acquisition_date` date DEFAULT NULL,
  `acquisition_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `useful_life_months` int UNSIGNED DEFAULT NULL,
  `residual_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `accumulated_depreciation` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','disposed','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
