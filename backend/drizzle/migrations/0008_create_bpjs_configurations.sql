-- Versioned schema migration: bpjs_configurations
CREATE TABLE IF NOT EXISTS `bpjs_configurations` (
  `id` tinyint UNSIGNED NOT NULL,
  `health_company_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `health_employee_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jht_company_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jht_employee_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jp_company_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jp_employee_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `effective_date` date NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
