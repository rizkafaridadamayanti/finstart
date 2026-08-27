-- Versioned schema migration: employee_documents
CREATE TABLE IF NOT EXISTS `employee_documents` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` bigint UNSIGNED NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_documents_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
