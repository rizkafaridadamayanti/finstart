-- ============================================================
-- FINSTART - DEFAULT CHART OF ACCOUNTS (COA)
-- Aman dijalankan berulang kali.
-- Menambah / memperbarui akun berdasarkan kode akun.
-- ============================================================

USE finstart_db;

INSERT INTO accounts (
    code,
    name,
    type,
    normal_balance,
    opening_balance,
    current_balance,
    status,
    parent_id
)
VALUES
    ('1000', 'ASET', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
    ('1100', 'Aset Lancar', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
    ('1110', 'Kas', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
    ('1120', 'Bank', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
    ('1130', 'Piutang Usaha', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
    ('1140', 'Uang Muka', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
    ('1200', 'Aset Tetap', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
    ('1210', 'Peralatan', 'asset', 'debit', 0.00, 0.00, 'active', NULL),
    ('1220', 'Akumulasi Penyusutan', 'asset', 'credit', 0.00, 0.00, 'active', NULL),

    ('2000', 'KEWAJIBAN', 'liability', 'credit', 0.00, 0.00, 'active', NULL),
    ('2100', 'Utang Usaha', 'liability', 'credit', 0.00, 0.00, 'active', NULL),
    ('2200', 'Utang Pajak', 'liability', 'credit', 0.00, 0.00, 'active', NULL),
    ('2300', 'Pendapatan Diterima Dimuka', 'liability', 'credit', 0.00, 0.00, 'active', NULL),

    ('3000', 'EKUITAS', 'equity', 'credit', 0.00, 0.00, 'active', NULL),
    ('3100', 'Modal Pemilik', 'equity', 'credit', 0.00, 0.00, 'active', NULL),
    ('3200', 'Laba Ditahan', 'equity', 'credit', 0.00, 0.00, 'active', NULL),

    ('4000', 'PENDAPATAN', 'revenue', 'credit', 0.00, 0.00, 'active', NULL),
    ('4100', 'Pendapatan Jasa', 'revenue', 'credit', 0.00, 0.00, 'active', NULL),
    ('4200', 'Pendapatan Lain-lain', 'revenue', 'credit', 0.00, 0.00, 'active', NULL),

    ('5000', 'BEBAN', 'expense', 'debit', 0.00, 0.00, 'active', NULL),
    ('5100', 'Beban Gaji', 'expense', 'debit', 0.00, 0.00, 'active', NULL),
    ('5200', 'Beban Operasional', 'expense', 'debit', 0.00, 0.00, 'active', NULL),
    ('5210', 'Beban Sewa', 'expense', 'debit', 0.00, 0.00, 'active', NULL),
    ('5220', 'Beban Utilitas', 'expense', 'debit', 0.00, 0.00, 'active', NULL),
    ('5230', 'Beban Internet dan Software', 'expense', 'debit', 0.00, 0.00, 'active', NULL),
    ('5240', 'Beban Transportasi', 'expense', 'debit', 0.00, 0.00, 'active', NULL)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    normal_balance = VALUES(normal_balance),
    status = VALUES(status);

-- Cek hasil:
-- SELECT code, name, type, normal_balance, current_balance, status
-- FROM accounts
-- ORDER BY code;
