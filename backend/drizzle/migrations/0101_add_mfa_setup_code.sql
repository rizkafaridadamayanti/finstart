-- Column used only while an MFA setup is pending.
ALTER TABLE user_security_settings
  ADD COLUMN mfa_setup_code VARCHAR(16) NULL AFTER mfa_pending_secret;
