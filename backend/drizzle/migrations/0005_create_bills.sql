-- Versioned schema migration: bills
CREATE TABLE IF NOT EXISTS `bills` (
  `id` bigint UNSIGNED NOT NULL,
  `vendor_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` bigint UNSIGNED DEFAULT NULL,
  `bill_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bill_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','unpaid','partial','paid','overdue','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
