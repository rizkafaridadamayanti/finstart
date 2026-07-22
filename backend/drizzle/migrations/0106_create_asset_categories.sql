-- Versioned schema migration: asset_categories
CREATE TABLE IF NOT EXISTS `asset_categories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_asset_categories_code` (`code`),
  UNIQUE KEY `uq_asset_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
INSERT IGNORE INTO `asset_categories` (`code`, `name`) VALUES
  ('ELEKTRONIK-IT', 'Elektronik / IT'),
  ('FURNITURE', 'Furniture'),
  ('KENDARAAN', 'Kendaraan'),
  ('GEDUNG-KANTOR', 'Gedung & Kantor');
