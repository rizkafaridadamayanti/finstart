ALTER TABLE `clients` ADD COLUMN `code` varchar(30) NULL AFTER `id`;
--> statement-breakpoint
UPDATE `clients` SET `code` = CONCAT('KLN-', LPAD(`id`, 4, '0')) WHERE `code` IS NULL;
--> statement-breakpoint
ALTER TABLE `clients` ADD UNIQUE KEY `uq_clients_code` (`code`);
