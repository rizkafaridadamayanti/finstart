-- Migration: seed_tax_accounts
-- Jangan mengubah migration yang sudah pernah dijalankan.
-- Untuk lebih dari satu statement, pisahkan dengan baris: --> statement-breakpoint

-- Module pajak (PPN, PPh 23, PPh 21) mereferensikan akun dengan kode tetap:
-- 2210 PPN Keluaran, 1145 PPN Masukan, 1146 PPN Lebih Bayar, 2211 Utang PPh 23.
-- Seed awal tidak memuat kode tersebut, sehingga penerbitan invoice/tagihan dan
-- penutupan masa PPN gagal dengan pesan "Jalankan migration pajak terlebih dahulu".
INSERT INTO `accounts` (`code`, `name`, `type`, `normal_balance`, `opening_balance`, `current_balance`, `status`) VALUES
  ('2210', 'PPN Keluaran', 'liability', 'credit', 0.00, 0.00, 'active'),
  ('2211', 'Utang PPh 23', 'liability', 'credit', 0.00, 0.00, 'active'),
  ('1145', 'PPN Masukan', 'asset', 'debit', 0.00, 0.00, 'active'),
  ('1146', 'PPN Lebih Bayar', 'asset', 'debit', 0.00, 0.00, 'active')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `type` = VALUES(`type`),
  `normal_balance` = VALUES(`normal_balance`);
