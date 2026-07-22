ALTER TABLE `projects` ADD COLUMN `status_before_cancel` enum('planning','ongoing','completed') NULL AFTER `status`;
