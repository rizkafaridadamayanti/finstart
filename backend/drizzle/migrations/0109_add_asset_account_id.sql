-- Migration: add_asset_account_id
-- Jangan mengubah migration yang sudah pernah dijalankan.
-- Untuk lebih dari satu statement, pisahkan dengan baris: --> statement-breakpoint

ALTER TABLE `assets` ADD COLUMN `asset_account_id` bigint unsigned NULL AFTER `accumulated_depreciation`;
--> statement-breakpoint
CREATE INDEX `idx_assets_account` ON `assets` (`asset_account_id`);
