-- MFA/TOTP is no longer part of FinStart authentication.
ALTER TABLE `user_security_settings`
  DROP COLUMN `mfa_status`,
  DROP COLUMN `mfa_secret`,
  DROP COLUMN `mfa_pending_secret`,
  DROP COLUMN `mfa_setup_code`,
  DROP COLUMN `mfa_time_offset_steps`,
  DROP COLUMN `mfa_last_counter`;
