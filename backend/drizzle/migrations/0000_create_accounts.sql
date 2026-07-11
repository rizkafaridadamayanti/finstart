-- Versioned schema migration: accounts
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('asset','liability','equity','revenue','expense') COLLATE utf8mb4_unicode_ci NOT NULL,
  `normal_balance` enum('debit','credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `current_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
