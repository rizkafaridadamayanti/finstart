-- Versioned schema migration: payroll_tax_calculations
CREATE TABLE IF NOT EXISTS `payroll_tax_calculations` (
  `id` bigint UNSIGNED NOT NULL,
  `tax_record_id` bigint UNSIGNED NOT NULL,
  `employee_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_nik` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_position` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_period` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ptkp_status` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ter_category` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `allowance_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `gross_income` decimal(15,2) NOT NULL DEFAULT '0.00',
  `ter_rate` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `pph21_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `take_home_pay` decimal(15,2) NOT NULL DEFAULT '0.00',
  `payroll_date` date DEFAULT NULL,
  `salary_expense_account_id` bigint UNSIGNED DEFAULT NULL,
  `cash_account_id` bigint UNSIGNED DEFAULT NULL,
  `payroll_journal_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('draft','posted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
