-- Versioned schema migration: user_security_settings
CREATE TABLE IF NOT EXISTS `user_security_settings` (
  `user_id` bigint UNSIGNED NOT NULL,
  `login_alerts` tinyint(1) NOT NULL DEFAULT '1',
  `session_alerts` tinyint(1) NOT NULL DEFAULT '1',
  `mfa_status` enum('not_configured','pending','enabled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_configured',
  `mfa_secret` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mfa_pending_secret` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mfa_time_offset_steps` int DEFAULT NULL,
  `mfa_last_counter` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
