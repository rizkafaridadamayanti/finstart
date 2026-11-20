-- Migration: add_tax_record_employee_id
-- Jangan mengubah migration yang sudah pernah dijalankan.
-- Untuk lebih dari satu statement, pisahkan dengan baris: --> statement-breakpoint

-- Tulis SQL perubahan schema di bawah ini.

ALTER TABLE `tax_records` ADD COLUMN `employee_id` bigint unsigned NULL AFTER `tax_type`;
--> statement-breakpoint
CREATE INDEX `idx_tax_records_employee` ON `tax_records` (`employee_id`);
--> statement-breakpoint
-- MySQL memperbolehkan banyak NULL pada UNIQUE KEY, jadi constraint ini hanya
-- berlaku untuk baris yang employee_id-nya terisi (mis. PPh 21 per pegawai).
ALTER TABLE `tax_records` ADD UNIQUE KEY `uq_tax_records_employee_period_type` (`employee_id`, `tax_period`, `tax_type`);
