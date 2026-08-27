ALTER TABLE `employees`
  ADD COLUMN `cv_path` varchar(255) NULL AFTER `address`,
  ADD COLUMN `ktp_path` varchar(255) NULL AFTER `cv_path`,
  ADD COLUMN `npwp_document_path` varchar(255) NULL AFTER `ktp_path`,
  ADD COLUMN `certificate_path` varchar(255) NULL AFTER `npwp_document_path`;
