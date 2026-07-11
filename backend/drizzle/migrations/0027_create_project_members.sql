-- Versioned schema migration: project_members
CREATE TABLE IF NOT EXISTS `project_members` (
  `id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `role_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allocation_percent` decimal(5,2) NOT NULL DEFAULT '100.00',
  `assigned_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `member_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimated_cost` decimal(18,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
