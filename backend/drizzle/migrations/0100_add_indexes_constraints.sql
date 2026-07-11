-- Index, primary key, auto-increment, and foreign-key definitions.
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `fk_accounts_parent` (`parent_id`),
  ADD KEY `idx_accounts_type` (`type`),
  ADD KEY `idx_accounts_status` (`status`);

--> statement-breakpoint

ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_logs_user` (`user_id`),
  ADD KEY `idx_activity_logs_module` (`module`);

--> statement-breakpoint

ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_code` (`asset_code`),
  ADD KEY `idx_assets_status` (`status`);

--> statement-breakpoint

ALTER TABLE `asset_depreciations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_asset_depreciation_period` (`asset_id`,`depreciation_period`),
  ADD KEY `idx_asset_depreciation_period` (`depreciation_period`),
  ADD KEY `idx_asset_depreciation_journal` (`journal_entry_id`);

--> statement-breakpoint

ALTER TABLE `auth_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_auth_sessions_user` (`user_id`),
  ADD KEY `idx_auth_sessions_expiry` (`expires_at`);

--> statement-breakpoint

ALTER TABLE `bills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bill_number` (`bill_number`),
  ADD KEY `idx_bills_project` (`project_id`),
  ADD KEY `idx_bills_status` (`status`);

--> statement-breakpoint

ALTER TABLE `bill_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bill_items_bill` (`bill_id`);

--> statement-breakpoint

ALTER TABLE `bill_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bill_payments_journal` (`journal_entry_id`),
  ADD KEY `idx_bill_payments_bill` (`bill_id`);

--> statement-breakpoint

ALTER TABLE `bpjs_configurations`
  ADD PRIMARY KEY (`id`);

--> statement-breakpoint

ALTER TABLE `budget_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_budget_allocations_period` (`budget_year`,`budget_month`,`scenario_key`),
  ADD KEY `idx_budget_allocations_account` (`account_id`),
  ADD KEY `idx_budget_allocations_division` (`division_id`);

--> statement-breakpoint

ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_clients_status` (`status`),
  ADD KEY `idx_clients_name` (`company_name`);

--> statement-breakpoint

ALTER TABLE `company_settings`
  ADD PRIMARY KEY (`id`);

--> statement-breakpoint

ALTER TABLE `divisions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_divisions_code` (`code`),
  ADD UNIQUE KEY `uq_divisions_name` (`name`),
  ADD KEY `idx_divisions_status` (`status`);

--> statement-breakpoint

ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_employees_employee_code` (`employee_code`),
  ADD UNIQUE KEY `uq_employees_nik` (`nik`),
  ADD KEY `idx_employees_status` (`employment_status`),
  ADD KEY `idx_employees_division_id` (`division_id`),
  ADD KEY `idx_employees_position_id` (`position_id`),
  ADD KEY `idx_employees_employment_status` (`employment_status`);

--> statement-breakpoint

ALTER TABLE `financial_projections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_financial_projection_month` (`projection_year`,`projection_month`),
  ADD KEY `idx_financial_projection_year` (`projection_year`);

--> statement-breakpoint

ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `idx_invoices_client` (`client_id`),
  ADD KEY `idx_invoices_project` (`project_id`),
  ADD KEY `idx_invoices_status` (`status`);

--> statement-breakpoint

ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_items_invoice` (`invoice_id`);

--> statement-breakpoint

ALTER TABLE `invoice_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_payments_journal` (`journal_entry_id`),
  ADD KEY `idx_invoice_payments_invoice` (`invoice_id`);

--> statement-breakpoint

ALTER TABLE `journal_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `voucher_number` (`voucher_number`),
  ADD KEY `fk_journal_created_by` (`created_by`),
  ADD KEY `fk_journal_approved_by` (`approved_by`),
  ADD KEY `idx_journal_status` (`status`),
  ADD KEY `idx_journal_date` (`transaction_date`),
  ADD KEY `idx_journal_entries_division` (`division_id`);

--> statement-breakpoint

ALTER TABLE `journal_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_journal_lines_entry` (`journal_entry_id`),
  ADD KEY `idx_journal_lines_account` (`account_id`);

--> statement-breakpoint

ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user` (`user_id`),
  ADD KEY `idx_notifications_read` (`is_read`);

--> statement-breakpoint

ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_password_reset_user` (`user_id`),
  ADD KEY `idx_password_reset_expiry` (`expires_at`);

--> statement-breakpoint

ALTER TABLE `payroll_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_payroll_records_employee_period` (`employee_id`,`payroll_period`),
  ADD KEY `idx_payroll_records_period` (`payroll_period`),
  ADD KEY `idx_payroll_records_status` (`status`),
  ADD KEY `idx_payroll_records_payment_date` (`payment_date`),
  ADD KEY `fk_payroll_records_salary_expense` (`salary_expense_account_id`),
  ADD KEY `fk_payroll_records_bpjs_expense` (`bpjs_expense_account_id`),
  ADD KEY `fk_payroll_records_cash_account` (`cash_account_id`),
  ADD KEY `fk_payroll_records_bpjs_payable` (`bpjs_payable_account_id`),
  ADD KEY `fk_payroll_records_journal` (`journal_entry_id`);

--> statement-breakpoint

ALTER TABLE `payroll_tax_calculations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_payroll_tax_record` (`tax_record_id`),
  ADD KEY `idx_payroll_tax_period` (`tax_period`),
  ADD KEY `idx_payroll_employee_nik` (`employee_nik`),
  ADD KEY `fk_payroll_salary_expense` (`salary_expense_account_id`),
  ADD KEY `fk_payroll_cash_account` (`cash_account_id`),
  ADD KEY `fk_payroll_journal` (`payroll_journal_id`);

--> statement-breakpoint

ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_positions_code` (`code`),
  ADD KEY `idx_positions_division_id` (`division_id`),
  ADD KEY `idx_positions_status` (`status`);

--> statement-breakpoint

ALTER TABLE `projection_scenarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_projection_scenario_year` (`projection_year`,`scenario_key`),
  ADD KEY `idx_projection_scenario_year` (`projection_year`);

--> statement-breakpoint

ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `project_code` (`project_code`),
  ADD KEY `idx_projects_client` (`client_id`),
  ADD KEY `idx_projects_status` (`status`);

--> statement-breakpoint

ALTER TABLE `project_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_project_members_employee` (`employee_id`),
  ADD KEY `fk_project_members_user` (`user_id`),
  ADD KEY `idx_project_members_project` (`project_id`);

--> statement-breakpoint

ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--> statement-breakpoint

ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscriptions_status` (`status`);

--> statement-breakpoint

ALTER TABLE `subscription_bill_runs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_subscription_billing_date` (`subscription_id`,`billing_date`),
  ADD UNIQUE KEY `uq_subscription_bill` (`bill_id`),
  ADD KEY `idx_subscription_bill_runs_subscription` (`subscription_id`),
  ADD KEY `idx_subscription_bill_runs_billing_date` (`billing_date`);

--> statement-breakpoint

ALTER TABLE `tax_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tax_status` (`status`);

--> statement-breakpoint

ALTER TABLE `transaction_taxes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_transaction_tax` (`source_type`,`source_id`,`tax_type`),
  ADD KEY `idx_transaction_taxes_period` (`tax_period`),
  ADD KEY `idx_transaction_taxes_record` (`tax_record_id`),
  ADD KEY `idx_transaction_taxes_status` (`status`),
  ADD KEY `fk_transaction_taxes_journal` (`journal_entry_id`);

--> statement-breakpoint

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--> statement-breakpoint

ALTER TABLE `user_security_settings`
  ADD PRIMARY KEY (`user_id`);

--> statement-breakpoint

ALTER TABLE `vat_period_closings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_vat_period` (`tax_period`),
  ADD UNIQUE KEY `uq_vat_tax_record` (`tax_record_id`),
  ADD KEY `idx_vat_closing_status` (`status`),
  ADD KEY `fk_vat_period_journal` (`closing_journal_id`);

--> statement-breakpoint

ALTER TABLE `accounts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `activity_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `assets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `asset_depreciations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `auth_sessions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `bills`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `bill_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `bill_payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `budget_allocations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `clients`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `company_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `divisions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `employees`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `financial_projections`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `invoices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `invoice_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `invoice_payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `journal_entries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `journal_lines`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `notifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `payroll_records`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `payroll_tax_calculations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `positions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `projection_scenarios`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `projects`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `project_members`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `subscription_bill_runs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `tax_records`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `transaction_taxes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `vat_period_closings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--> statement-breakpoint

ALTER TABLE `accounts`
  ADD CONSTRAINT `fk_accounts_parent` FOREIGN KEY (`parent_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_activity_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `asset_depreciations`
  ADD CONSTRAINT `fk_asset_depreciation_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asset_depreciation_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `auth_sessions`
  ADD CONSTRAINT `fk_auth_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `bills`
  ADD CONSTRAINT `fk_bills_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `bill_items`
  ADD CONSTRAINT `fk_bill_items_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `bill_payments`
  ADD CONSTRAINT `fk_bill_payments_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bill_payments_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoices_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invoices_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `invoice_items`
  ADD CONSTRAINT `fk_invoice_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `invoice_payments`
  ADD CONSTRAINT `fk_invoice_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invoice_payments_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `journal_entries`
  ADD CONSTRAINT `fk_journal_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_journal_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `journal_lines`
  ADD CONSTRAINT `fk_journal_lines_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_journal_lines_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `payroll_records`
  ADD CONSTRAINT `fk_payroll_records_bpjs_expense` FOREIGN KEY (`bpjs_expense_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_bpjs_payable` FOREIGN KEY (`bpjs_payable_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_cash_account` FOREIGN KEY (`cash_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_salary_expense` FOREIGN KEY (`salary_expense_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `payroll_tax_calculations`
  ADD CONSTRAINT `fk_payroll_cash_account` FOREIGN KEY (`cash_account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payroll_journal` FOREIGN KEY (`payroll_journal_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payroll_salary_expense` FOREIGN KEY (`salary_expense_account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payroll_tax_record` FOREIGN KEY (`tax_record_id`) REFERENCES `tax_records` (`id`) ON DELETE CASCADE;

--> statement-breakpoint

ALTER TABLE `positions`
  ADD CONSTRAINT `fk_positions_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `project_members`
  ADD CONSTRAINT `fk_project_members_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_project_members_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_project_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `subscription_bill_runs`
  ADD CONSTRAINT `fk_subscription_bill_runs_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_subscription_bill_runs_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `transaction_taxes`
  ADD CONSTRAINT `fk_transaction_taxes_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transaction_taxes_record` FOREIGN KEY (`tax_record_id`) REFERENCES `tax_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `user_security_settings`
  ADD CONSTRAINT `fk_user_security_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint

ALTER TABLE `vat_period_closings`
  ADD CONSTRAINT `fk_vat_period_journal` FOREIGN KEY (`closing_journal_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vat_period_record` FOREIGN KEY (`tax_record_id`) REFERENCES `tax_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
