-- FinStart database seed (sanitized for repository)
-- Import only into a NEW / EMPTY database named finstart_db.
-- Runtime sessions, reset tokens, and MFA secrets are deliberately excluded.
-- For an existing finstart_db, do not import this snapshot again: use the existing database and run the app.

-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 07, 2026 at 06:27 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `finstart_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('asset','liability','equity','revenue','expense') COLLATE utf8mb4_unicode_ci NOT NULL,
  `normal_balance` enum('debit','credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `opening_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `current_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `code`, `name`, `type`, `normal_balance`, `opening_balance`, `current_balance`, `status`, `parent_id`, `created_at`, `updated_at`) VALUES
(1, '1000', 'ASET', 'asset', 'debit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(2, '1100', 'Aset Lancar', 'asset', 'debit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(3, '1110', 'Kas', 'asset', 'debit', 0.00, 9900000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 07:18:08'),
(4, '1120', 'Bank', 'asset', 'debit', 0.00, 19814000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(5, '1130', 'Piutang Usaha', 'asset', 'debit', 0.00, 181500000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(6, '1140', 'Uang Muka', 'asset', 'debit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(7, '1200', 'Aset Tetap', 'asset', 'debit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(8, '1210', 'Peralatan', 'asset', 'debit', 0.00, 89000000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(9, '1220', 'Akumulasi Penyusutan', 'asset', 'credit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(10, '2000', 'KEWAJIBAN', 'liability', 'credit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(11, '2100', 'Utang Usaha', 'liability', 'credit', 0.00, 56980000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(12, '2200', 'Utang Pajak', 'liability', 'credit', 0.00, 27746000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-07 06:07:27'),
(13, '2300', 'Pendapatan Diterima Dimuka', 'liability', 'credit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(14, '3000', 'EKUITAS', 'equity', 'credit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(15, '3100', 'Modal Pemilik', 'equity', 'credit', 0.00, 10000000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:40:03'),
(16, '3200', 'Laba Ditahan', 'equity', 'credit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(17, '4000', 'PENDAPATAN', 'revenue', 'credit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(18, '4100', 'Pendapatan Jasa', 'revenue', 'credit', 0.00, 462450000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(19, '4200', 'Pendapatan Lain-lain', 'revenue', 'credit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(20, '5000', 'BEBAN', 'expense', 'debit', 0.00, 0.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-02 04:20:01'),
(21, '5100', 'Beban Gaji', 'expense', 'debit', 0.00, 114072000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-07 06:07:27'),
(22, '5200', 'Beban Operasional', 'expense', 'debit', 0.00, 72100000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(23, '5210', 'Beban Sewa', 'expense', 'debit', 0.00, 9500000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(24, '5220', 'Beban Utilitas', 'expense', 'debit', 0.00, 9500000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(25, '5230', 'Beban Internet dan Software', 'expense', 'debit', 0.00, 55700000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(26, '5240', 'Beban Transportasi', 'expense', 'debit', 0.00, 6000000.00, 'active', NULL, '2026-07-02 04:20:01', '2026-07-06 09:41:17'),
(28, '1145', 'PPN Masukan', 'asset', 'debit', 0.00, 0.00, 'active', NULL, '2026-07-02 13:20:33', '2026-07-02 13:59:47'),
(29, '1146', 'PPN Lebih Bayar', 'asset', 'debit', 0.00, 0.00, 'active', NULL, '2026-07-02 13:20:33', '2026-07-02 13:20:33'),
(30, '2210', 'PPN Keluaran', 'liability', 'credit', 0.00, 0.00, 'active', NULL, '2026-07-02 13:20:33', '2026-07-02 13:59:47'),
(31, '2211', 'Utang PPh 23', 'liability', 'credit', 0.00, 10000.00, 'active', NULL, '2026-07-02 13:20:33', '2026-07-02 13:43:09'),
(32, '5250', 'Beban Penyusutan', 'expense', 'debit', 0.00, 0.00, 'active', 20, '2026-07-03 02:07:58', '2026-07-03 02:07:58'),
(33, '2220', 'Utang BPJS', 'liability', 'credit', 0.00, 19900000.00, 'active', 12, '2026-07-06 03:30:15', '2026-07-06 07:18:08'),
(34, '5110', 'Beban BPJS Perusahaan', 'expense', 'debit', 0.00, 10000000.00, 'active', 20, '2026-07-06 03:30:15', '2026-07-06 07:18:08'),
(38, '1150', 'Piutang Pegawai', 'asset', 'debit', 0.00, 0.00, 'active', NULL, '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(39, '2225', 'Utang Potongan Lain', 'liability', 'credit', 0.00, 0.00, 'active', NULL, '2026-07-07 06:03:38', '2026-07-07 06:03:38');

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `activity` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `module` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `activity`, `description`, `module`, `reference_id`, `created_at`) VALUES
(1, NULL, 'Seed data dummy', 'Menambahkan data dummy master dan transaksi untuk pengujian aplikasi.', 'system', NULL, '2026-07-06 09:41:17'),
(2, NULL, 'Klien dummy ditambahkan', 'Menambahkan daftar klien dummy untuk CRM.', 'crm', NULL, '2026-07-06 09:41:17'),
(3, NULL, 'Proyek dummy ditambahkan', 'Menambahkan proyek dummy untuk manajemen proyek.', 'projects', NULL, '2026-07-06 09:41:17'),
(4, NULL, 'Invoice dummy diterbitkan', 'Menambahkan invoice dummy untuk piutang usaha.', 'receivables', NULL, '2026-07-06 09:41:17'),
(5, NULL, 'Tagihan dummy diterbitkan', 'Menambahkan bill dummy untuk utang usaha.', 'payables', NULL, '2026-07-06 09:41:17'),
(6, NULL, 'Aset dummy ditambahkan', 'Menambahkan aset dummy untuk register aset.', 'assets', NULL, '2026-07-06 09:41:17'),
(7, NULL, 'Langganan dummy ditambahkan', 'Menambahkan langganan dummy untuk biaya berulang.', 'subscriptions', NULL, '2026-07-06 09:41:17'),
(8, NULL, 'Pegawai dummy ditambahkan', 'Menambahkan pegawai fiktif untuk SDM.', 'hr', NULL, '2026-07-06 09:41:17'),
(9, NULL, 'Pajak dummy dibuat', 'Menambahkan kewajiban pajak dummy.', 'tax', NULL, '2026-07-06 09:41:17'),
(10, NULL, 'Jurnal dummy diposting', 'Menambahkan jurnal dummy yang seimbang.', 'general-ledger', NULL, '2026-07-06 09:41:17'),
(11, 1, 'Login berhasil', 'Finance Manager membuka sesi baru dari Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36.', 'security', 3, '2026-07-07 06:06:34');

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acquisition_date` date DEFAULT NULL,
  `acquisition_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `useful_life_months` int UNSIGNED DEFAULT NULL,
  `residual_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `accumulated_depreciation` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','disposed','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`id`, `asset_code`, `asset_name`, `category`, `acquisition_date`, `acquisition_cost`, `useful_life_months`, `residual_value`, `accumulated_depreciation`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'L900', 'Laptop Operasional', 'Peralatan IT', '2026-07-03', 9000000.00, 36, 80000.00, 0.00, 'active', NULL, '2026-07-03 02:34:10', '2026-07-03 02:34:10'),
(2, 'DUM26-AST-001', 'Laptop Developer Dell Latitude', 'Peralatan TI', '2026-01-10', 18500000.00, 48, 1850000.00, 0.00, 'active', 'Aset dummy untuk tim Technology.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(3, 'DUM26-AST-002', 'Laptop Designer ASUS ProArt', 'Peralatan TI', '2026-01-15', 22000000.00, 48, 2200000.00, 0.00, 'active', 'Aset dummy untuk tim Design.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(4, 'DUM26-AST-003', 'Monitor Ultrawide 34 Inch', 'Peralatan Kantor', '2026-02-02', 8500000.00, 48, 850000.00, 0.00, 'active', 'Aset dummy monitor kerja.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(5, 'DUM26-AST-004', 'Printer Multifungsi Laser', 'Peralatan Kantor', '2026-02-12', 6200000.00, 60, 620000.00, 0.00, 'active', 'Aset dummy administrasi.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(6, 'DUM26-AST-005', 'Server NAS Backup', 'Infrastruktur TI', '2026-02-20', 17500000.00, 60, 1750000.00, 0.00, 'active', 'Aset dummy penyimpanan data.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(7, 'DUM26-AST-006', 'Router Enterprise', 'Infrastruktur TI', '2026-03-01', 7300000.00, 48, 730000.00, 0.00, 'active', 'Aset dummy jaringan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(8, 'DUM26-AST-007', 'Kamera Konten Digital', 'Peralatan Multimedia', '2026-03-12', 9800000.00, 48, 980000.00, 0.00, 'active', 'Aset dummy marketing.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(9, 'DUM26-AST-008', 'Meja Kerja Modular', 'Perabot Kantor', '2026-03-18', 12400000.00, 72, 1240000.00, 0.00, 'active', 'Aset dummy perabot.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 'DUM26-AST-009', 'Kursi Ergonomis', 'Perabot Kantor', '2026-03-20', 9600000.00, 60, 960000.00, 0.00, 'active', 'Aset dummy perabot.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 'DUM26-AST-010', 'AC Inverter Ruang Kerja', 'Fasilitas Kantor', '2026-04-01', 11500000.00, 72, 1150000.00, 0.00, 'active', 'Aset dummy fasilitas.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 'DUM26-AST-011', 'Proyektor Meeting', 'Peralatan Kantor', '2026-04-05', 5400000.00, 48, 540000.00, 0.00, 'active', 'Aset dummy rapat.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 'DUM26-AST-012', 'Tablet Survey Lapangan', 'Peralatan TI', '2026-04-14', 7600000.00, 36, 760000.00, 0.00, 'active', 'Aset dummy operasi lapangan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(14, 'DUM26-AST-013', 'UPS Server', 'Infrastruktur TI', '2026-04-20', 4900000.00, 48, 490000.00, 0.00, 'active', 'Aset dummy kelistrikan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 'DUM26-AST-014', 'Lemari Arsip Besi', 'Perabot Kantor', '2026-05-02', 4200000.00, 72, 420000.00, 0.00, 'active', 'Aset dummy arsip.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 'DUM26-AST-015', 'Smart TV Ruang Meeting', 'Peralatan Multimedia', '2026-05-10', 8900000.00, 48, 890000.00, 0.00, 'active', 'Aset dummy presentasi.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(17, 'DUM26-AST-016', 'Scanner Dokumen ADF', 'Peralatan Kantor', '2026-05-16', 3900000.00, 48, 390000.00, 0.00, 'active', 'Aset dummy administrasi.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(18, 'DUM26-AST-017', 'Perangkat Uji Jaringan', 'Infrastruktur TI', '2026-05-21', 6800000.00, 48, 680000.00, 0.00, 'active', 'Aset dummy engineering.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(19, 'DUM26-AST-018', 'Rak Server 20U', 'Infrastruktur TI', '2026-05-29', 7200000.00, 72, 720000.00, 0.00, 'active', 'Aset dummy data center.', '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `asset_depreciations`
--

CREATE TABLE `asset_depreciations` (
  `id` bigint UNSIGNED NOT NULL,
  `asset_id` bigint UNSIGNED NOT NULL,
  `depreciation_period` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `depreciation_date` date NOT NULL,
  `depreciation_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `accumulated_depreciation_after` decimal(15,2) NOT NULL DEFAULT '0.00',
  `book_value_after` decimal(15,2) NOT NULL DEFAULT '0.00',
  `journal_entry_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('posted','void') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'posted',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_sessions`
--

CREATE TABLE `auth_sessions` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `token_hash` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_sessions`
--

-- Data runtime tabel `auth_sessions` sengaja tidak disertakan pada repository.

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

CREATE TABLE `bills` (
  `id` bigint UNSIGNED NOT NULL,
  `vendor_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` bigint UNSIGNED DEFAULT NULL,
  `bill_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bill_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','unpaid','partial','paid','overdue','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bills`
--

INSERT INTO `bills` (`id`, `vendor_name`, `project_id`, `bill_number`, `bill_date`, `due_date`, `total_amount`, `paid_amount`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'hkjk', NULL, 'hjkjj', '2026-07-02', '2026-07-03', 700000.00, 700000.00, 'paid', NULL, '2026-07-02 08:57:55', '2026-07-02 08:58:06'),
(2, 'hkjjkjk', NULL, '999', '2026-07-02', '2026-07-24', 525000.00, 515000.00, 'paid', NULL, '2026-07-02 13:43:01', '2026-07-02 13:43:13'),
(3, 'CV Karya Komputer Sejati', 3, 'DUM26-BIL-001', '2026-05-02', '2026-05-23', 4200000.00, 4200000.00, 'paid', 'Tagihan dummy perangkat kerja dan lisensi.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(4, 'PT Jaringan Data Nusantara', 4, 'DUM26-BIL-002', '2026-05-04', '2026-05-25', 3500000.00, 1400000.00, 'overdue', 'Tagihan dummy layanan internet kantor.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(5, 'CV Sinar Print Indonesia', 5, 'DUM26-BIL-003', '2026-05-06', '2026-05-27', 2800000.00, 0.00, 'overdue', 'Tagihan dummy cetak materi promosi.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(6, 'PT Ruang Kerja Bersama', 6, 'DUM26-BIL-004', '2026-05-08', '2026-05-29', 9500000.00, 9500000.00, 'paid', 'Tagihan dummy sewa ruang kerja.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(7, 'CV Trans Media Solusi', 7, 'DUM26-BIL-005', '2026-05-10', '2026-05-31', 6200000.00, 2480000.00, 'overdue', 'Tagihan dummy biaya kampanye digital.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(8, 'PT Energi Cahaya Utama', 8, 'DUM26-BIL-006', '2026-05-12', '2026-06-02', 3100000.00, 0.00, 'overdue', 'Tagihan dummy listrik dan utilitas.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(9, 'CV Kreatif Konten Studio', 9, 'DUM26-BIL-007', '2026-05-14', '2026-06-04', 4800000.00, 4800000.00, 'paid', 'Tagihan dummy produksi konten.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 'PT Amanah Perjalanan', 10, 'DUM26-BIL-008', '2026-05-16', '2026-06-06', 2700000.00, 0.00, 'overdue', 'Tagihan dummy perjalanan dinas.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 'CV Office Mart Nusantara', 11, 'DUM26-BIL-009', '2026-05-18', '2026-06-08', 1900000.00, 1900000.00, 'paid', 'Tagihan dummy atk dan kebutuhan kantor.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 'PT Cloud Infrastruktur Indonesia', 12, 'DUM26-BIL-010', '2026-05-20', '2026-06-10', 7600000.00, 3040000.00, 'overdue', 'Tagihan dummy layanan cloud.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(13, 'CV Mitra Legal Konsultan', 13, 'DUM26-BIL-011', '2026-05-22', '2026-06-12', 5400000.00, 0.00, 'overdue', 'Tagihan dummy jasa legal dan kontrak.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(14, 'PT Asuransi Daya Prima', 14, 'DUM26-BIL-012', '2026-05-24', '2026-06-14', 3400000.00, 3400000.00, 'paid', 'Tagihan dummy asuransi aset.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 'CV Bersih Rapi Sejahtera', 15, 'DUM26-BIL-013', '2026-05-26', '2026-06-16', 2200000.00, 880000.00, 'overdue', 'Tagihan dummy jasa kebersihan.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(16, 'PT Sistem Keamanan Digital', 16, 'DUM26-BIL-014', '2026-05-28', '2026-06-18', 5100000.00, 0.00, 'overdue', 'Tagihan dummy keamanan perangkat.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(17, 'CV Event Kreasi Indonesia', 17, 'DUM26-BIL-015', '2026-05-30', '2026-06-20', 4300000.00, 4300000.00, 'paid', 'Tagihan dummy kegiatan komunitas.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(18, 'PT Telekomunikasi Cerdas', 18, 'DUM26-BIL-016', '2026-06-01', '2026-06-22', 2900000.00, 1160000.00, 'overdue', 'Tagihan dummy telekomunikasi.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(19, 'CV Data Riset Mandiri', 19, 'DUM26-BIL-017', '2026-06-03', '2026-06-24', 6000000.00, 0.00, 'overdue', 'Tagihan dummy riset pasar.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(20, 'PT Logistik Cepat Indonesia', 20, 'DUM26-BIL-018', '2026-06-05', '2026-06-26', 3300000.00, 0.00, 'overdue', 'Tagihan dummy pengiriman dan logistik.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(21, 'CV Sumber Daya Kreatif', 21, 'DUM26-BIL-019', '2026-06-07', '2026-06-28', 4500000.00, 4500000.00, 'paid', 'Tagihan dummy pelatihan tim.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(22, 'PT Perlengkapan Kantor Raya', 22, 'DUM26-BIL-020', '2026-06-09', '2026-06-30', 8700000.00, 3480000.00, 'overdue', 'Tagihan dummy perabot kantor.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(23, 'CV Pemasaran Terarah', 23, 'DUM26-BIL-021', '2026-06-11', '2026-07-02', 3900000.00, 0.00, 'overdue', 'Tagihan dummy jasa pemasaran.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(24, 'PT Teknologi Pendukung', 24, 'DUM26-BIL-022', '2026-06-13', '2026-07-04', 6900000.00, 6900000.00, 'paid', 'Tagihan dummy pemeliharaan aplikasi.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(25, 'CV Analitik Cermat', 25, 'DUM26-BIL-023', '2026-06-15', '2026-07-06', 4700000.00, 1880000.00, 'overdue', 'Tagihan dummy jasa analitik.', '2026-07-06 09:41:17', '2026-07-07 02:09:25'),
(26, 'PT Fasilitas Mandiri', 26, 'DUM26-BIL-024', '2026-06-17', '2026-07-08', 3200000.00, 0.00, 'unpaid', 'Tagihan dummy pemeliharaan fasilitas.', '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `bill_items`
--

CREATE TABLE `bill_items` (
  `id` bigint UNSIGNED NOT NULL,
  `bill_id` bigint UNSIGNED NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT '1.00',
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `line_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bill_items`
--

INSERT INTO `bill_items` (`id`, `bill_id`, `description`, `quantity`, `unit_price`, `line_total`, `created_at`, `updated_at`) VALUES
(1, 1, 'gjh', 1.00, 700000.00, 700000.00, '2026-07-02 08:57:55', '2026-07-02 08:57:55'),
(2, 2, 'hjj', 1.00, 500000.00, 500000.00, '2026-07-02 13:43:01', '2026-07-02 13:43:01'),
(3, 3, 'Tagihan dummy - Perangkat kerja dan lisensi', 1.00, 4200000.00, 4200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(4, 4, 'Tagihan dummy - Layanan internet kantor', 1.00, 3500000.00, 3500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(5, 5, 'Tagihan dummy - Cetak materi promosi', 1.00, 2800000.00, 2800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(6, 6, 'Tagihan dummy - Sewa ruang kerja', 1.00, 9500000.00, 9500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(7, 7, 'Tagihan dummy - Biaya kampanye digital', 1.00, 6200000.00, 6200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(8, 8, 'Tagihan dummy - Listrik dan utilitas', 1.00, 3100000.00, 3100000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(9, 9, 'Tagihan dummy - Produksi konten', 1.00, 4800000.00, 4800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 10, 'Tagihan dummy - Perjalanan dinas', 1.00, 2700000.00, 2700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 11, 'Tagihan dummy - ATK dan kebutuhan kantor', 1.00, 1900000.00, 1900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 12, 'Tagihan dummy - Layanan cloud', 1.00, 7600000.00, 7600000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 13, 'Tagihan dummy - Jasa legal dan kontrak', 1.00, 5400000.00, 5400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(14, 14, 'Tagihan dummy - Asuransi aset', 1.00, 3400000.00, 3400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 15, 'Tagihan dummy - Jasa kebersihan', 1.00, 2200000.00, 2200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 16, 'Tagihan dummy - Keamanan perangkat', 1.00, 5100000.00, 5100000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(17, 17, 'Tagihan dummy - Kegiatan komunitas', 1.00, 4300000.00, 4300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(18, 18, 'Tagihan dummy - Telekomunikasi', 1.00, 2900000.00, 2900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(19, 19, 'Tagihan dummy - Riset pasar', 1.00, 6000000.00, 6000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(20, 20, 'Tagihan dummy - Pengiriman dan logistik', 1.00, 3300000.00, 3300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(21, 21, 'Tagihan dummy - Pelatihan tim', 1.00, 4500000.00, 4500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(22, 22, 'Tagihan dummy - Perabot kantor', 1.00, 8700000.00, 8700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(23, 23, 'Tagihan dummy - Jasa pemasaran', 1.00, 3900000.00, 3900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(24, 24, 'Tagihan dummy - Pemeliharaan aplikasi', 1.00, 6900000.00, 6900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(25, 25, 'Tagihan dummy - Jasa analitik', 1.00, 4700000.00, 4700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(26, 26, 'Tagihan dummy - Pemeliharaan fasilitas', 1.00, 3200000.00, 3200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `bill_payments`
--

CREATE TABLE `bill_payments` (
  `id` bigint UNSIGNED NOT NULL,
  `bill_id` bigint UNSIGNED NOT NULL,
  `journal_entry_id` bigint UNSIGNED DEFAULT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bill_payments`
--

INSERT INTO `bill_payments` (`id`, `bill_id`, `journal_entry_id`, `payment_date`, `payment_method`, `amount`, `reference_number`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 9, '2026-07-02', 'Transfer Bank', 700000.00, NULL, NULL, '2026-07-02 08:58:06', '2026-07-02 08:58:06'),
(2, 2, 18, '2026-07-02', 'Transfer Bank', 515000.00, NULL, NULL, '2026-07-02 13:43:13', '2026-07-02 13:43:13'),
(3, 3, 85, '2026-05-12', 'transfer', 4200000.00, 'DUM26-PAY-001', 'Pembayaran dummy untuk DUM26-BIL-001', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(4, 4, 86, '2026-05-14', 'transfer', 1400000.00, 'DUM26-PAY-002', 'Pembayaran dummy untuk DUM26-BIL-002', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(5, 6, 87, '2026-05-18', 'transfer', 9500000.00, 'DUM26-PAY-004', 'Pembayaran dummy untuk DUM26-BIL-004', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(6, 7, 88, '2026-05-20', 'transfer', 2480000.00, 'DUM26-PAY-005', 'Pembayaran dummy untuk DUM26-BIL-005', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(7, 9, 89, '2026-05-24', 'transfer', 4800000.00, 'DUM26-PAY-007', 'Pembayaran dummy untuk DUM26-BIL-007', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(8, 11, 90, '2026-05-28', 'transfer', 1900000.00, 'DUM26-PAY-009', 'Pembayaran dummy untuk DUM26-BIL-009', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(9, 12, 91, '2026-05-30', 'transfer', 3040000.00, 'DUM26-PAY-010', 'Pembayaran dummy untuk DUM26-BIL-010', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 14, 92, '2026-06-03', 'transfer', 3400000.00, 'DUM26-PAY-012', 'Pembayaran dummy untuk DUM26-BIL-012', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 15, 93, '2026-06-05', 'transfer', 880000.00, 'DUM26-PAY-013', 'Pembayaran dummy untuk DUM26-BIL-013', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 17, 94, '2026-06-09', 'transfer', 4300000.00, 'DUM26-PAY-015', 'Pembayaran dummy untuk DUM26-BIL-015', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 18, 95, '2026-06-11', 'transfer', 1160000.00, 'DUM26-PAY-016', 'Pembayaran dummy untuk DUM26-BIL-016', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(14, 21, 96, '2026-06-17', 'transfer', 4500000.00, 'DUM26-PAY-019', 'Pembayaran dummy untuk DUM26-BIL-019', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 22, 97, '2026-06-19', 'transfer', 3480000.00, 'DUM26-PAY-020', 'Pembayaran dummy untuk DUM26-BIL-020', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 24, 98, '2026-06-23', 'transfer', 6900000.00, 'DUM26-PAY-022', 'Pembayaran dummy untuk DUM26-BIL-022', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(17, 25, 99, '2026-06-25', 'transfer', 1880000.00, 'DUM26-PAY-023', 'Pembayaran dummy untuk DUM26-BIL-023', '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `bpjs_configurations`
--

CREATE TABLE `bpjs_configurations` (
  `id` tinyint UNSIGNED NOT NULL,
  `health_company_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `health_employee_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jht_company_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jht_employee_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jp_company_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jp_employee_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `effective_date` date NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bpjs_configurations`
--

INSERT INTO `bpjs_configurations` (`id`, `health_company_rate`, `health_employee_rate`, `jht_company_rate`, `jht_employee_rate`, `jp_company_rate`, `jp_employee_rate`, `effective_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 90.0000, 90.0000, 5.0000, 5.0000, 5.0000, 4.0000, '2026-07-06', 'Konfigurasi BPJS diperbarui dari workspace FinStart.', '2026-07-06 03:29:54', '2026-07-06 07:17:21');

-- --------------------------------------------------------

--
-- Table structure for table `budget_allocations`
--

CREATE TABLE `budget_allocations` (
  `id` bigint UNSIGNED NOT NULL,
  `budget_year` smallint UNSIGNED NOT NULL,
  `budget_month` tinyint UNSIGNED DEFAULT NULL,
  `scenario_key` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `account_id` bigint UNSIGNED NOT NULL,
  `division_id` bigint UNSIGNED DEFAULT NULL,
  `budget_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` bigint UNSIGNED NOT NULL,
  `company_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pic_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `industry` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `company_name`, `pic_name`, `email`, `phone`, `industry`, `category`, `location`, `address`, `status`, `created_at`, `updated_at`) VALUES
(1, 'pt mencari cinta sejati', 'tanti', 'rizkaafaridadamayanti@gmail.com', '0987778787', 'percintaan', 'startup', 'jakarta', 'Jalan Hayam Wuruk 46', 'active', '2026-07-02 04:06:42', '2026-07-02 04:06:42'),
(2, 'gh', 'fsgd', 'et@gmail.com', '355546', 'gd', 'grr', 'ffv', NULL, 'active', '2026-07-02 08:25:12', '2026-07-02 08:25:12'),
(3, 'PT Arunika Digital Nusantara', 'Rendi Pratama', 'rendi@arunika-dummy.test', '08000000001', 'Teknologi Informasi', 'Enterprise', 'Jakarta Selatan', 'Gedung Arunika, Jalan TB Simatupang No. 18, Jakarta Selatan', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(4, 'PT Citra Solusi Mandiri', 'Nadia Puspita', 'nadia@citra-dummy.test', '08000000002', 'Konsultan Bisnis', 'Corporate', 'Bandung', 'Jalan Asia Afrika No. 88, Bandung', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(5, 'PT Langit Data Prima', 'Fikri Ramadhan', 'fikri@langitdata-dummy.test', '08000000003', 'Data dan Analitik', 'Enterprise', 'Surabaya', 'Jalan Basuki Rahmat No. 30, Surabaya', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(6, 'PT Sembada Kreatif Indonesia', 'Dinda Maharani', 'dinda@sembada-dummy.test', '08000000004', 'Kreatif dan Media', 'SME', 'Yogyakarta', 'Jalan Kaliurang KM 6, Sleman', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(7, 'PT Nusa Karya Teknologi', 'Rizwan Hakim', 'rizwan@nusakarya-dummy.test', '08000000005', 'Teknologi Informasi', 'Enterprise', 'Semarang', 'Jalan Pandanaran No. 45, Semarang', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(8, 'PT Mitra Jaya Logistik', 'Tasya Nabila', 'tasya@mitrajaya-dummy.test', '08000000006', 'Logistik', 'Corporate', 'Bekasi', 'Jalan Ahmad Yani No. 112, Bekasi', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(9, 'PT Cakrawala Edukasi', 'Bima Saputra', 'bima@cakrawalaedu-dummy.test', '08000000007', 'Pendidikan', 'SME', 'Malang', 'Jalan Ijen No. 19, Malang', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 'PT Harmoni Ritel Indonesia', 'Kezia Aurelia', 'kezia@harmoni-dummy.test', '08000000008', 'Ritel', 'Corporate', 'Tangerang', 'Jalan Boulevard Gading Serpong No. 7, Tangerang', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 'PT Tirta Inovasi Sejahtera', 'Ari Wibowo', 'ari@tirta-dummy.test', '08000000009', 'Manufaktur', 'Enterprise', 'Sidoarjo', 'Jalan Raya Waru No. 20, Sidoarjo', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 'PT Griya Niaga Sentosa', 'Mila Oktaviani', 'mila@griya-dummy.test', '08000000010', 'Properti', 'SME', 'Depok', 'Jalan Margonda Raya No. 155, Depok', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 'PT Sinar Mapan Abadi', 'Dion Prakoso', 'dion@sinar-dummy.test', '08000000011', 'Perdagangan', 'Corporate', 'Solo', 'Jalan Slamet Riyadi No. 205, Surakarta', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(14, 'PT Bumi Pangan Lestari', 'Nisa Khairani', 'nisa@bumipangan-dummy.test', '08000000012', 'Pangan dan Agribisnis', 'Enterprise', 'Bogor', 'Jalan Pajajaran No. 65, Bogor', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 'PT Karya Medika Utama', 'Larasati Putri', 'laras@medika-dummy.test', '08000000013', 'Kesehatan', 'Corporate', 'Jakarta Timur', 'Jalan Raya Bekasi No. 66, Jakarta Timur', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 'PT Pelita Transportasi', 'Galang Putra', 'galang@pelita-dummy.test', '08000000014', 'Transportasi', 'SME', 'Cirebon', 'Jalan Kartini No. 21, Cirebon', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(17, 'PT Daya Utama Industri', 'Novi Andriani', 'novi@dayautama-dummy.test', '08000000015', 'Industri', 'Enterprise', 'Karawang', 'Kawasan Industri Surya Cipta Blok B-12, Karawang', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(18, 'CV Prima Boga Nusantara', 'Siska Melati', 'siska@primaboga-dummy.test', '08000000016', 'Kuliner', 'SME', 'Kediri', 'Jalan Brawijaya No. 41, Kediri', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(19, 'CV Lintas Media Kreatif', 'Hendra Kurniawan', 'hendra@lintasmedia-dummy.test', '08000000017', 'Media', 'SME', 'Denpasar', 'Jalan Teuku Umar No. 90, Denpasar', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(20, 'CV Satu Arah Konsultan', 'Yusuf Hidayat', 'yusuf@satuarah-dummy.test', '08000000018', 'Konsultan', 'SME', 'Makassar', 'Jalan AP Pettarani No. 15, Makassar', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(21, 'CV Inti Usaha Bersama', 'Anisa Wulandari', 'anisa@intiusaha-dummy.test', '08000000019', 'Perdagangan', 'SME', 'Medan', 'Jalan Gatot Subroto No. 190, Medan', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(22, 'CV Karya Sentosa Mandiri', 'Farhan Akbar', 'farhan@karyasentosa-dummy.test', '08000000020', 'Jasa Profesional', 'SME', 'Palembang', 'Jalan Sudirman No. 80, Palembang', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(23, 'UD Koperasi Mandiri', 'Rara Anggraini', 'rara@koperasimandiri-dummy.test', '08000000021', 'Koperasi', 'Micro', 'Madiun', 'Jalan Pahlawan No. 30, Madiun', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(24, 'Yayasan Cendekia Negeri', 'Yoga Prasetyo', 'yoga@cendekia-dummy.test', '08000000022', 'Pendidikan', 'Nonprofit', 'Jember', 'Jalan Diponegoro No. 12, Jember', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(25, 'Yayasan Sahabat Inovasi', 'Niken Larasati', 'niken@sahabat-dummy.test', '08000000023', 'Sosial', 'Nonprofit', 'Banjarmasin', 'Jalan A Yani KM 4, Banjarmasin', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(26, 'PT Jawa Sistem Integrasi', 'Khalid Maulana', 'khalid@jawasistem-dummy.test', '08000000024', 'Teknologi Informasi', 'Enterprise', 'Jakarta Barat', 'Jalan Daan Mogot No. 50, Jakarta Barat', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(27, 'PT Merdeka Pangan Sejahtera', 'Dewi Rahmawati', 'dewi@merdeka-dummy.test', '08000000025', 'FMCG', 'Corporate', 'Serang', 'Jalan Veteran No. 25, Serang', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(28, 'PT Awan Biru Teknologi', 'Rafi Kurnia', 'rafi@awanbiru-dummy.test', '08000000026', 'SaaS', 'Startup', 'Bandung', 'Jalan Pasteur No. 12, Bandung', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(29, 'PT Rukun Cipta Properti', 'Nanda Prameswari', 'nanda@rukun-dummy.test', '08000000027', 'Properti', 'Corporate', 'Surabaya', 'Jalan Tunjungan No. 35, Surabaya', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(30, 'PT Global Mitra Usaha', 'Iqbal Fadli', 'iqbal@globalmitra-dummy.test', '08000000028', 'Jasa Profesional', 'Corporate', 'Jakarta Pusat', 'Jalan Kramat Raya No. 7, Jakarta Pusat', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(31, 'PT Andalan Sarana Prima', 'Citra Salsabila', 'citra@andalan-dummy.test', '08000000029', 'Sarana Kantor', 'SME', 'Sukabumi', 'Jalan Siliwangi No. 99, Sukabumi', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(32, 'PT Koneksa Digital Indonesia', 'Vina Maheswari', 'vina@koneksa-dummy.test', '08000000030', 'Digital Agency', 'Startup', 'Yogyakarta', 'Jalan Gejayan No. 67, Sleman', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `company_settings`
--

CREATE TABLE `company_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `company_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `npwp` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IDR',
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fiscal_year_start_month` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fiscal_year` smallint UNSIGNED DEFAULT NULL,
  `city` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_settings`
--

INSERT INTO `company_settings` (`id`, `company_name`, `email`, `phone`, `address`, `npwp`, `currency`, `logo`, `fiscal_year_start_month`, `created_at`, `updated_at`, `logo_url`, `fiscal_year`, `city`, `province`, `postal_code`, `website`) VALUES
(1, 'kedata', NULL, NULL, NULL, NULL, 'IDR', NULL, 1, '2026-07-06 03:29:54', '2026-07-06 06:48:56', NULL, 2026, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `divisions`
--

CREATE TABLE `divisions` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `divisions`
--

INSERT INTO `divisions` (`id`, `code`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'DIV-TECH', 'Technology', 'Divisi teknologi dan pengembangan produk.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(2, 'DIV-DESIGN', 'Design', 'Divisi desain produk dan visual.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(3, 'DIV-MKT', 'Marketing', 'Divisi pemasaran dan komunikasi.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(4, 'DIV-FIN', 'Finance', 'Divisi keuangan dan akuntansi.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(5, 'DIV-OPS', 'Operations', 'Divisi operasional perusahaan.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(6, 'DIV-HR', 'Human Resources', 'Divisi sumber daya manusia.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(7, 'FIN', 'Keuangan', 'Divisi keuangan dan akuntansi.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(8, 'HR', 'SDM', 'Divisi sumber daya manusia.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(9, 'TAX', 'Pajak', 'Divisi administrasi pajak.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(10, 'PMO', 'Manajemen Proyek', 'Divisi pengelolaan proyek.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(11, 'OPS', 'Operasional', 'Divisi operasional perusahaan.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `employment_status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `join_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nik` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `division_id` bigint UNSIGNED DEFAULT NULL,
  `position_id` bigint UNSIGNED DEFAULT NULL,
  `employment_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'permanent',
  `ptkp_status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TK/0',
  `bpjs_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `base_salary` decimal(18,2) NOT NULL DEFAULT '0.00',
  `npwp` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bpjs_health_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bpjs_employment_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_number` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_holder` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `email`, `phone`, `position`, `salary`, `employment_status`, `join_date`, `created_at`, `updated_at`, `employee_code`, `full_name`, `nik`, `division_id`, `position_id`, `employment_type`, `ptkp_status`, `bpjs_status`, `base_salary`, `npwp`, `bpjs_health_number`, `bpjs_employment_number`, `bank_name`, `bank_account_number`, `bank_account_holder`, `address`) VALUES
(1, 'Pegawai Finance Test', 'finance.test@finstart.local', '081234567890', NULL, 0.00, 'active', '2026-07-01', '2026-07-06 03:40:20', '2026-07-06 03:40:20', 'EMP/202607/001', 'Pegawai Finance Test', 'TEST-FIN-001', 4, 4, 'permanent', 'TK/0', 'active', 5000000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'rizka farida damayanti', 'rizkaafaridadamayanti@gmail.com', '0989999999', NULL, 0.00, 'active', '2026-07-06', '2026-07-06 07:01:54', '2026-07-06 07:01:54', '98000000000', 'rizka farida damayanti', '9898989898989898', 2, 2, 'permanent', 'TK/0', 'active', 9000000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'aiinin', 'ainin@gmail.com', '0099999999', NULL, 0.00, 'active', '2026-07-01', '2026-07-06 07:18:02', '2026-07-06 07:18:02', 'EMP/202607/002', 'aiinin', '9000000000000000', 4, 4, 'permanent', 'TK/0', 'active', 10000000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Aulia Putri Ramadhan', 'aulia.putri@dummy.finstart.test', '08000010001', 'Developer', 12500000.00, 'active', '2024-01-08', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-001', 'Aulia Putri Ramadhan', '9900000000000001', 1, 1, 'permanent', 'TK/0', 'active', 12500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Bagas Pratama Nugroho', 'bagas.pratama@dummy.finstart.test', '08000010002', 'Quality Assurance Engineer', 9500000.00, 'active', '2024-02-12', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-002', 'Bagas Pratama Nugroho', '9900000000000002', 1, 9, 'contract', 'TK/0', 'active', 9500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Citra Ayu Lestari', 'citra.ayu@dummy.finstart.test', '08000010003', 'UI/UX Designer', 11000000.00, 'active', '2024-03-04', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-003', 'Citra Ayu Lestari', '9900000000000003', 2, 2, 'permanent', 'K/0', 'active', 11000000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'Dimas Arya Saputra', 'dimas.arya@dummy.finstart.test', '08000010004', 'Data Analyst', 10500000.00, 'active', '2024-03-18', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-004', 'Dimas Arya Saputra', '9900000000000004', 1, 10, 'contract', 'TK/1', 'active', 10500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Eka Putri Wulandari', 'eka.putri@dummy.finstart.test', '08000010005', 'Marketing Staff', 8500000.00, 'active', '2024-04-01', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-005', 'Eka Putri Wulandari', '9900000000000005', 3, 3, 'permanent', 'K/1', 'active', 8500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'Fajar Maulana', 'fajar.maulana@dummy.finstart.test', '08000010006', 'Finance Staff', 9800000.00, 'active', '2024-04-15', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-006', 'Fajar Maulana', '9900000000000006', 4, 4, 'permanent', 'TK/0', 'active', 9800000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'Gita Nur Azizah', 'gita.azizah@dummy.finstart.test', '08000010007', 'HR Staff', 9000000.00, 'active', '2024-05-06', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-007', 'Gita Nur Azizah', '9900000000000007', 6, 6, 'permanent', 'K/0', 'active', 9000000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'Hafiz Rahman', 'hafiz.rahman@dummy.finstart.test', '08000010008', 'Operations Staff', 8200000.00, 'active', '2024-05-20', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-008', 'Hafiz Rahman', '9900000000000008', 5, 5, 'contract', 'TK/0', 'active', 8200000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'Intan Permata Sari', 'intan.permata@dummy.finstart.test', '08000010009', 'Graphic Designer', 8700000.00, 'active', '2024-06-03', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-009', 'Intan Permata Sari', '9900000000000009', 2, 11, 'permanent', 'TK/0', 'active', 8700000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'Joko Prabowo', 'joko.prabowo@dummy.finstart.test', '08000010010', 'Customer Support', 7800000.00, 'active', '2024-06-17', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-010', 'Joko Prabowo', '9900000000000010', 5, 14, 'permanent', 'K/2', 'active', 7800000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Kania Fitria', 'kania.fitria@dummy.finstart.test', '08000010011', 'Social Media Specialist', 7600000.00, 'active', '2024-07-01', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-011', 'Kania Fitria', '9900000000000011', 3, 12, 'contract', 'TK/0', 'active', 7600000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'Luthfi Alamsyah', 'luthfi.alamsyah@dummy.finstart.test', '08000010012', 'Accounting Staff', 10200000.00, 'active', '2024-07-15', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-012', 'Luthfi Alamsyah', '9900000000000012', 4, 13, 'permanent', 'K/0', 'active', 10200000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'Maya Kartika', 'maya.kartika@dummy.finstart.test', '08000010013', 'Recruiter', 8300000.00, 'active', '2024-08-05', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-013', 'Maya Kartika', '9900000000000013', 6, 15, 'contract', 'TK/1', 'active', 8300000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'Naufal Rizki', 'naufal.rizki@dummy.finstart.test', '08000010014', 'Developer', 13000000.00, 'active', '2024-08-19', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-014', 'Naufal Rizki', '9900000000000014', 1, 1, 'permanent', 'TK/0', 'active', 13000000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'Olivia Anindita', 'olivia.anindita@dummy.finstart.test', '08000010015', 'UI/UX Designer', 11500000.00, 'active', '2024-09-02', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-015', 'Olivia Anindita', '9900000000000015', 2, 2, 'permanent', 'K/1', 'active', 11500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'Putra Aditya', 'putra.aditya@dummy.finstart.test', '08000010016', 'Operations Staff', 6500000.00, 'active', '2024-09-16', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-016', 'Putra Aditya', '9900000000000016', 5, 5, 'daily', 'TK/0', 'inactive', 6500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Qori Anisa', 'qori.anisa@dummy.finstart.test', '08000010017', 'Marketing Staff', 8900000.00, 'active', '2024-10-07', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-017', 'Qori Anisa', '9900000000000017', 3, 3, 'permanent', 'K/0', 'active', 8900000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, 'Raka Mahendra', 'raka.mahendra@dummy.finstart.test', '08000010018', 'Finance Staff', 9400000.00, 'active', '2024-10-21', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-018', 'Raka Mahendra', '9900000000000018', 4, 4, 'contract', 'TK/0', 'active', 9400000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'Salsabila Putri', 'salsabila.putri@dummy.finstart.test', '08000010019', 'HR Staff', 8800000.00, 'active', '2024-11-04', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-019', 'Salsabila Putri', '9900000000000019', 6, 6, 'permanent', 'K/1', 'active', 8800000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, 'Tegar Prasetyo', 'tegar.prasetyo@dummy.finstart.test', '08000010020', 'Quality Assurance Engineer', 9200000.00, 'active', '2024-11-18', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-020', 'Tegar Prasetyo', '9900000000000020', 1, 9, 'contract', 'TK/0', 'active', 9200000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'Umi Khasanah', 'umi.khasanah@dummy.finstart.test', '08000010021', 'Customer Support', 7500000.00, 'active', '2024-12-02', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-021', 'Umi Khasanah', '9900000000000021', 5, 14, 'permanent', 'K/2', 'active', 7500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, 'Vina Amelia', 'vina.amelia@dummy.finstart.test', '08000010022', 'Graphic Designer', 7000000.00, 'active', '2024-12-16', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-022', 'Vina Amelia', '9900000000000022', 2, 11, 'freelance', 'TK/0', 'inactive', 7000000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, 'Wahyu Setiawan', 'wahyu.setiawan@dummy.finstart.test', '08000010023', 'Data Analyst', 12000000.00, 'active', '2025-01-06', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-023', 'Wahyu Setiawan', '9900000000000023', 1, 10, 'permanent', 'K/0', 'active', 12000000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'Yuni Kartika', 'yuni.kartika@dummy.finstart.test', '08000010024', 'Social Media Specialist', 7800000.00, 'active', '2025-01-20', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-024', 'Yuni Kartika', '9900000000000024', 3, 12, 'contract', 'TK/1', 'active', 7800000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, 'Zaki Fadillah', 'zaki.fadillah@dummy.finstart.test', '08000010025', 'Accounting Staff', 10500000.00, 'active', '2025-02-03', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-025', 'Zaki Fadillah', '9900000000000025', 4, 13, 'permanent', 'TK/0', 'active', 10500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'Dwi Rahayu', 'dwi.rahayu@dummy.finstart.test', '08000010026', 'Recruiter', 8000000.00, 'active', '2025-02-17', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-026', 'Dwi Rahayu', '9900000000000026', 6, 15, 'contract', 'K/0', 'active', 8000000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'Rafi Akbar', 'rafi.akbar@dummy.finstart.test', '08000010027', 'Operations Staff', 8400000.00, 'active', '2025-03-03', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-027', 'Rafi Akbar', '9900000000000027', 5, 5, 'permanent', 'TK/0', 'active', 8400000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'Nabila Azzahra', 'nabila.azzahra@dummy.finstart.test', '08000010028', 'UI/UX Designer', 4500000.00, 'active', '2025-03-17', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-028', 'Nabila Azzahra', '9900000000000028', 2, 2, 'intern', 'TK/0', 'inactive', 4500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'Arief Hidayat', 'arief.hidayat@dummy.finstart.test', '08000010029', 'Developer', 13500000.00, 'active', '2025-04-07', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-029', 'Arief Hidayat', '9900000000000029', 1, 1, 'permanent', 'K/1', 'active', 13500000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'Melati Puspasari', 'melati.puspasari@dummy.finstart.test', '08000010030', 'Marketing Staff', 8100000.00, 'active', '2025-04-21', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 'DUM26-EMP-030', 'Melati Puspasari', '9900000000000030', 3, 3, 'contract', 'TK/0', 'active', 8100000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `financial_projections`
--

CREATE TABLE `financial_projections` (
  `id` bigint UNSIGNED NOT NULL,
  `projection_year` smallint UNSIGNED NOT NULL,
  `projection_month` tinyint UNSIGNED NOT NULL,
  `revenue_target` decimal(15,2) NOT NULL DEFAULT '0.00',
  `expense_target` decimal(15,2) NOT NULL DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `financial_projections`
--

INSERT INTO `financial_projections` (`id`, `projection_year`, `projection_month`, `revenue_target`, `expense_target`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2026, 7, 10000000.00, 5000000.00, NULL, '2026-07-02 14:52:31', '2026-07-02 14:52:31'),
(2, 2026, 1, 128000000.00, 74500000.00, 'Target dummy bulan 01 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(3, 2026, 2, 136000000.00, 79000000.00, 'Target dummy bulan 02 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(4, 2026, 3, 144000000.00, 83500000.00, 'Target dummy bulan 03 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(5, 2026, 4, 152000000.00, 88000000.00, 'Target dummy bulan 04 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(6, 2026, 5, 160000000.00, 92500000.00, 'Target dummy bulan 05 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(7, 2026, 6, 168000000.00, 97000000.00, 'Target dummy bulan 06 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(8, 2026, 8, 184000000.00, 106000000.00, 'Target dummy bulan 08 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(9, 2026, 9, 192000000.00, 110500000.00, 'Target dummy bulan 09 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 2026, 10, 200000000.00, 115000000.00, 'Target dummy bulan 10 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 2026, 11, 208000000.00, 119500000.00, 'Target dummy bulan 11 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 2026, 12, 216000000.00, 124000000.00, 'Target dummy bulan 12 tahun 2026.', '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint UNSIGNED NOT NULL,
  `client_id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED DEFAULT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','unpaid','partial','paid','overdue','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `client_id`, `project_id`, `invoice_number`, `issue_date`, `due_date`, `total_amount`, `paid_amount`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'inv99909090', '2026-07-02', '2026-07-03', 800000.00, 800000.00, 'paid', 'hjhj', '2026-07-02 07:36:49', '2026-07-02 07:46:18'),
(2, 2, NULL, 'ffevfrvf', '2026-07-02', '2026-07-04', 80000000.00, 80000000.00, 'paid', NULL, '2026-07-02 08:27:00', '2026-07-02 08:27:08'),
(3, 2, NULL, 'INV/202607/003', '2026-07-02', '2026-07-25', 6300000.00, 6300000.00, 'paid', NULL, '2026-07-02 13:42:04', '2026-07-02 13:42:13'),
(4, 3, 3, 'DUM26-INV-001', '2026-05-01', '2026-05-15', 12500000.00, 12500000.00, 'paid', 'Invoice dummy termin proyek Implementasi ERP Keuangan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(5, 4, 4, 'DUM26-INV-002', '2026-05-03', '2026-05-17', 18000000.00, 18000000.00, 'paid', 'Invoice dummy termin proyek Dashboard Kinerja Operasional.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(6, 5, 5, 'DUM26-INV-003', '2026-05-05', '2026-06-04', 9600000.00, 4800000.00, 'overdue', 'Invoice dummy termin proyek Pengembangan Portal Pelanggan.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(7, 6, 6, 'DUM26-INV-004', '2026-05-07', '2026-05-21', 14500000.00, 0.00, 'overdue', 'Invoice dummy termin proyek Sistem Manajemen Dokumen.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(8, 7, 7, 'DUM26-INV-005', '2026-05-09', '2026-05-23', 11250000.00, 11250000.00, 'paid', 'Invoice dummy termin proyek Otomasi Laporan Bulanan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(9, 8, 8, 'DUM26-INV-006', '2026-05-11', '2026-06-10', 20000000.00, 10000000.00, 'overdue', 'Invoice dummy termin proyek Integrasi API Pembayaran.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(10, 9, 9, 'DUM26-INV-007', '2026-05-13', '2026-05-27', 8500000.00, 0.00, 'overdue', 'Invoice dummy termin proyek Redesign Website Korporat.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(11, 10, 10, 'DUM26-INV-008', '2026-05-15', '2026-05-29', 17500000.00, 0.00, 'overdue', 'Invoice dummy termin proyek Sistem Inventori Cabang.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 11, 11, 'DUM26-INV-009', '2026-05-17', '2026-06-16', 13200000.00, 13200000.00, 'paid', 'Invoice dummy termin proyek Aplikasi Monitoring Proyek.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 12, 12, 'DUM26-INV-010', '2026-05-19', '2026-06-02', 22000000.00, 11000000.00, 'overdue', 'Invoice dummy termin proyek Pengembangan Mobile Sales.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(14, 13, 13, 'DUM26-INV-011', '2026-05-21', '2026-06-04', 7800000.00, 0.00, 'overdue', 'Invoice dummy termin proyek Analitik Data Penjualan.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(15, 14, 14, 'DUM26-INV-012', '2026-05-23', '2026-06-22', 10500000.00, 10500000.00, 'paid', 'Invoice dummy termin proyek Portal Vendor Digital.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 15, 15, 'DUM26-INV-013', '2026-05-25', '2026-06-08', 9200000.00, 4600000.00, 'overdue', 'Invoice dummy termin proyek Sistem Absensi Terintegrasi.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(17, 16, 16, 'DUM26-INV-014', '2026-05-27', '2026-06-10', 11800000.00, 0.00, 'overdue', 'Invoice dummy termin proyek Platform E-Learning Internal.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(18, 17, 17, 'DUM26-INV-015', '2026-05-29', '2026-06-28', 16000000.00, 16000000.00, 'paid', 'Invoice dummy termin proyek Dashboard Supply Chain.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(19, 18, 18, 'DUM26-INV-016', '2026-05-31', '2026-06-14', 7300000.00, 0.00, 'overdue', 'Invoice dummy termin proyek Optimasi Proses Procurement.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(20, 19, 19, 'DUM26-INV-017', '2026-06-02', '2026-06-16', 12800000.00, 6400000.00, 'overdue', 'Invoice dummy termin proyek Sistem CRM Pelanggan.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(21, 20, 20, 'DUM26-INV-018', '2026-06-04', '2026-07-04', 9700000.00, 0.00, 'overdue', 'Invoice dummy termin proyek Migrasi Data Operasional.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(22, 21, 21, 'DUM26-INV-019', '2026-06-06', '2026-06-20', 11000000.00, 11000000.00, 'paid', 'Invoice dummy termin proyek Aplikasi Helpdesk Internal.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(23, 22, 22, 'DUM26-INV-020', '2026-06-08', '2026-06-22', 15000000.00, 7500000.00, 'overdue', 'Invoice dummy termin proyek Portal Mitra Bisnis.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(24, 23, 23, 'DUM26-INV-021', '2026-06-10', '2026-07-10', 8700000.00, 0.00, 'unpaid', 'Invoice dummy termin proyek Sistem Reservasi Layanan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(25, 24, 24, 'DUM26-INV-022', '2026-06-12', '2026-06-26', 14200000.00, 14200000.00, 'paid', 'Invoice dummy termin proyek Manajemen Kontrak Digital.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(26, 25, 25, 'DUM26-INV-023', '2026-06-14', '2026-06-28', 10400000.00, 5200000.00, 'overdue', 'Invoice dummy termin proyek Dashboard Marketing Performance.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(27, 26, 26, 'DUM26-INV-024', '2026-06-16', '2026-07-16', 8900000.00, 0.00, 'unpaid', 'Invoice dummy termin proyek Integrasi Chat Customer Service.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(28, 27, 27, 'DUM26-INV-025', '2026-06-18', '2026-07-02', 16500000.00, 16500000.00, 'paid', 'Invoice dummy termin proyek Aplikasi Audit Internal.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(29, 28, 28, 'DUM26-INV-026', '2026-06-20', '2026-07-04', 7600000.00, 3800000.00, 'overdue', 'Invoice dummy termin proyek Portal Knowledge Base.', '2026-07-06 09:41:17', '2026-07-06 09:42:01'),
(30, 29, 29, 'DUM26-INV-027', '2026-06-22', '2026-07-22', 13300000.00, 0.00, 'unpaid', 'Invoice dummy termin proyek Sistem Pengajuan Anggaran.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(31, 30, 30, 'DUM26-INV-028', '2026-06-24', '2026-07-08', 12000000.00, 12000000.00, 'paid', 'Invoice dummy termin proyek Monitoring SLA Layanan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(32, 31, 31, 'DUM26-INV-029', '2026-06-26', '2026-07-10', 9400000.00, 4700000.00, 'partial', 'Invoice dummy termin proyek Aplikasi Rekonsiliasi Bank.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(33, 32, 32, 'DUM26-INV-030', '2026-06-28', '2026-07-28', 15500000.00, 0.00, 'unpaid', 'Invoice dummy termin proyek Platform Kolaborasi Tim.', '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` bigint UNSIGNED NOT NULL,
  `invoice_id` bigint UNSIGNED NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT '1.00',
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `line_total` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `description`, `quantity`, `unit_price`, `line_total`, `created_at`, `updated_at`) VALUES
(1, 1, 'jasa landing page', 1.00, 800000.00, 800000.00, '2026-07-02 07:36:49', '2026-07-02 07:36:49'),
(2, 2, 'dfdf', 1.00, 80000000.00, 80000000.00, '2026-07-02 08:27:00', '2026-07-02 08:27:00'),
(3, 3, 'kjk', 1.00, 6000000.00, 6000000.00, '2026-07-02 13:42:04', '2026-07-02 13:42:04'),
(4, 4, 'Termin proyek dummy - Implementasi ERP Keuangan', 1.00, 12500000.00, 12500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(5, 5, 'Termin proyek dummy - Dashboard Kinerja Operasional', 1.00, 18000000.00, 18000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(6, 6, 'Termin proyek dummy - Pengembangan Portal Pelanggan', 1.00, 9600000.00, 9600000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(7, 7, 'Termin proyek dummy - Sistem Manajemen Dokumen', 1.00, 14500000.00, 14500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(8, 8, 'Termin proyek dummy - Otomasi Laporan Bulanan', 1.00, 11250000.00, 11250000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(9, 9, 'Termin proyek dummy - Integrasi API Pembayaran', 1.00, 20000000.00, 20000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 10, 'Termin proyek dummy - Redesign Website Korporat', 1.00, 8500000.00, 8500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 11, 'Termin proyek dummy - Sistem Inventori Cabang', 1.00, 17500000.00, 17500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 12, 'Termin proyek dummy - Aplikasi Monitoring Proyek', 1.00, 13200000.00, 13200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 13, 'Termin proyek dummy - Pengembangan Mobile Sales', 1.00, 22000000.00, 22000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(14, 14, 'Termin proyek dummy - Analitik Data Penjualan', 1.00, 7800000.00, 7800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 15, 'Termin proyek dummy - Portal Vendor Digital', 1.00, 10500000.00, 10500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 16, 'Termin proyek dummy - Sistem Absensi Terintegrasi', 1.00, 9200000.00, 9200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(17, 17, 'Termin proyek dummy - Platform E-Learning Internal', 1.00, 11800000.00, 11800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(18, 18, 'Termin proyek dummy - Dashboard Supply Chain', 1.00, 16000000.00, 16000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(19, 19, 'Termin proyek dummy - Optimasi Proses Procurement', 1.00, 7300000.00, 7300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(20, 20, 'Termin proyek dummy - Sistem CRM Pelanggan', 1.00, 12800000.00, 12800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(21, 21, 'Termin proyek dummy - Migrasi Data Operasional', 1.00, 9700000.00, 9700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(22, 22, 'Termin proyek dummy - Aplikasi Helpdesk Internal', 1.00, 11000000.00, 11000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(23, 23, 'Termin proyek dummy - Portal Mitra Bisnis', 1.00, 15000000.00, 15000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(24, 24, 'Termin proyek dummy - Sistem Reservasi Layanan', 1.00, 8700000.00, 8700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(25, 25, 'Termin proyek dummy - Manajemen Kontrak Digital', 1.00, 14200000.00, 14200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(26, 26, 'Termin proyek dummy - Dashboard Marketing Performance', 1.00, 10400000.00, 10400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(27, 27, 'Termin proyek dummy - Integrasi Chat Customer Service', 1.00, 8900000.00, 8900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(28, 28, 'Termin proyek dummy - Aplikasi Audit Internal', 1.00, 16500000.00, 16500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(29, 29, 'Termin proyek dummy - Portal Knowledge Base', 1.00, 7600000.00, 7600000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(30, 30, 'Termin proyek dummy - Sistem Pengajuan Anggaran', 1.00, 13300000.00, 13300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(31, 31, 'Termin proyek dummy - Monitoring SLA Layanan', 1.00, 12000000.00, 12000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(32, 32, 'Termin proyek dummy - Aplikasi Rekonsiliasi Bank', 1.00, 9400000.00, 9400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(33, 33, 'Termin proyek dummy - Platform Kolaborasi Tim', 1.00, 15500000.00, 15500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_payments`
--

CREATE TABLE `invoice_payments` (
  `id` bigint UNSIGNED NOT NULL,
  `invoice_id` bigint UNSIGNED NOT NULL,
  `journal_entry_id` bigint UNSIGNED DEFAULT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_payments`
--

INSERT INTO `invoice_payments` (`id`, `invoice_id`, `journal_entry_id`, `payment_date`, `payment_method`, `amount`, `reference_number`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 5, '2026-07-02', 'Transfer Bank', 800000.00, NULL, NULL, '2026-07-02 07:46:18', '2026-07-02 07:46:18'),
(2, 2, 7, '2026-07-02', 'Transfer Bank', 80000000.00, NULL, NULL, '2026-07-02 08:27:08', '2026-07-02 08:27:08'),
(3, 3, 16, '2026-07-02', 'Transfer Bank', 6300000.00, NULL, NULL, '2026-07-02 13:42:13', '2026-07-02 13:42:13'),
(4, 4, 100, '2026-05-08', 'transfer', 12500000.00, 'DUM26-RCP-001', 'Pembayaran dummy untuk DUM26-INV-001', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(5, 5, 101, '2026-05-10', 'transfer', 18000000.00, 'DUM26-RCP-002', 'Pembayaran dummy untuk DUM26-INV-002', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(6, 6, 102, '2026-05-12', 'transfer', 4800000.00, 'DUM26-RCP-003', 'Pembayaran dummy untuk DUM26-INV-003', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(7, 8, 103, '2026-05-16', 'transfer', 11250000.00, 'DUM26-RCP-005', 'Pembayaran dummy untuk DUM26-INV-005', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(8, 9, 104, '2026-05-18', 'transfer', 10000000.00, 'DUM26-RCP-006', 'Pembayaran dummy untuk DUM26-INV-006', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(9, 12, 105, '2026-05-24', 'transfer', 13200000.00, 'DUM26-RCP-009', 'Pembayaran dummy untuk DUM26-INV-009', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 13, 106, '2026-05-26', 'transfer', 11000000.00, 'DUM26-RCP-010', 'Pembayaran dummy untuk DUM26-INV-010', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 15, 107, '2026-05-30', 'transfer', 10500000.00, 'DUM26-RCP-012', 'Pembayaran dummy untuk DUM26-INV-012', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 16, 108, '2026-06-01', 'transfer', 4600000.00, 'DUM26-RCP-013', 'Pembayaran dummy untuk DUM26-INV-013', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 18, 109, '2026-06-05', 'transfer', 16000000.00, 'DUM26-RCP-015', 'Pembayaran dummy untuk DUM26-INV-015', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(14, 20, 110, '2026-06-09', 'transfer', 6400000.00, 'DUM26-RCP-017', 'Pembayaran dummy untuk DUM26-INV-017', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 22, 111, '2026-06-13', 'transfer', 11000000.00, 'DUM26-RCP-019', 'Pembayaran dummy untuk DUM26-INV-019', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 23, 112, '2026-06-15', 'transfer', 7500000.00, 'DUM26-RCP-020', 'Pembayaran dummy untuk DUM26-INV-020', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(17, 25, 113, '2026-06-19', 'transfer', 14200000.00, 'DUM26-RCP-022', 'Pembayaran dummy untuk DUM26-INV-022', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(18, 26, 114, '2026-06-21', 'transfer', 5200000.00, 'DUM26-RCP-023', 'Pembayaran dummy untuk DUM26-INV-023', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(19, 28, 115, '2026-06-25', 'transfer', 16500000.00, 'DUM26-RCP-025', 'Pembayaran dummy untuk DUM26-INV-025', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(20, 29, 116, '2026-06-27', 'transfer', 3800000.00, 'DUM26-RCP-026', 'Pembayaran dummy untuk DUM26-INV-026', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(21, 31, 117, '2026-07-01', 'transfer', 12000000.00, 'DUM26-RCP-028', 'Pembayaran dummy untuk DUM26-INV-028', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(22, 32, 118, '2026-07-03', 'transfer', 4700000.00, 'DUM26-RCP-029', 'Pembayaran dummy untuk DUM26-INV-029', '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `journal_entries`
--

CREATE TABLE `journal_entries` (
  `id` bigint UNSIGNED NOT NULL,
  `voucher_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `source_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('draft','approved','posted','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `posted_at` datetime DEFAULT NULL,
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `division_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `journal_entries`
--

INSERT INTO `journal_entries` (`id`, `voucher_number`, `transaction_date`, `description`, `source_type`, `source_id`, `status`, `created_by`, `approved_by`, `approved_at`, `posted_at`, `rejection_reason`, `created_at`, `updated_at`, `division_id`) VALUES
(1, 'JV-001', '2026-07-02', 'Setoran modal awal perusahaan', NULL, NULL, 'posted', NULL, NULL, '2026-07-02 11:37:28', '2026-07-02 11:40:03', NULL, '2026-07-02 04:36:30', '2026-07-02 04:40:03', NULL),
(2, 'JV-20260702-002', '2026-07-02', 'Penerimaan pendapatan jasa', NULL, NULL, 'posted', NULL, NULL, '2026-07-02 12:59:27', '2026-07-02 12:59:34', NULL, '2026-07-02 05:59:16', '2026-07-02 05:59:34', NULL),
(3, 'JV-20260702-003', '2026-07-02', 'Pembayaran beban operasional', NULL, NULL, 'posted', NULL, NULL, '2026-07-02 14:14:41', '2026-07-02 14:14:45', NULL, '2026-07-02 07:14:36', '2026-07-02 07:14:45', NULL),
(4, 'AR-INV-1', '2026-07-02', 'Penerbitan invoice inv99909090', 'invoice', 1, 'posted', NULL, NULL, NULL, '2026-07-02 14:44:22', NULL, '2026-07-02 07:44:22', '2026-07-02 07:44:22', NULL),
(5, 'AR-RCP-1-1', '2026-07-02', 'Penerimaan pembayaran invoice inv99909090', 'invoice_payment', 1, 'posted', NULL, NULL, NULL, '2026-07-02 14:46:18', NULL, '2026-07-02 07:46:18', '2026-07-02 07:46:18', NULL),
(6, 'AR-INV-2', '2026-07-02', 'Penerbitan invoice ffevfrvf', 'invoice', 2, 'posted', NULL, NULL, NULL, '2026-07-02 15:27:05', NULL, '2026-07-02 08:27:05', '2026-07-02 08:27:05', NULL),
(7, 'AR-RCP-2-2', '2026-07-02', 'Penerimaan pembayaran invoice ffevfrvf', 'invoice_payment', 2, 'posted', NULL, NULL, NULL, '2026-07-02 15:27:08', NULL, '2026-07-02 08:27:08', '2026-07-02 08:27:08', NULL),
(8, 'AP-BIL-1', '2026-07-02', 'Penerbitan tagihan hjkjj dari hkjk', 'bill', 1, 'posted', NULL, NULL, NULL, '2026-07-02 15:58:01', NULL, '2026-07-02 08:58:01', '2026-07-02 08:58:01', NULL),
(9, 'AP-PAY-1-1', '2026-07-02', 'Pembayaran tagihan hjkjj ke hkjk', 'bill_payment', 1, 'posted', NULL, NULL, NULL, '2026-07-02 15:58:06', NULL, '2026-07-02 08:58:06', '2026-07-02 08:58:06', NULL),
(10, 'TAX-OBL-1', '2026-07-02', 'Kewajiban PPN periode 2026-07', 'tax_record', 1, 'posted', NULL, NULL, NULL, '2026-07-02 16:20:59', NULL, '2026-07-02 09:20:59', '2026-07-02 09:20:59', NULL),
(11, 'TAX-PAY-1', '2026-07-02', 'Setoran PPN periode 2026-07', 'tax_payment', 1, 'posted', NULL, NULL, NULL, '2026-07-02 16:21:04', NULL, '2026-07-02 09:21:04', '2026-07-02 09:21:04', NULL),
(12, 'TAX-OBL-2', '2026-07-02', 'Kewajiban PPh 21 periode 2026-07', 'tax_record', 2, 'posted', NULL, NULL, NULL, '2026-07-02 16:31:34', NULL, '2026-07-02 09:31:34', '2026-07-02 09:31:34', NULL),
(13, 'TAX-PAY-2', '2026-07-02', 'Setoran PPh 21 periode 2026-07', 'tax_payment', 2, 'posted', NULL, NULL, NULL, '2026-07-02 16:31:45', NULL, '2026-07-02 09:31:45', '2026-07-02 09:31:45', NULL),
(14, 'PAYROLL-1', '2026-07-02', 'Payroll yu periode 2026-07', 'employee_payroll', 1, 'posted', NULL, NULL, NULL, '2026-07-02 16:57:51', NULL, '2026-07-02 09:57:51', '2026-07-02 09:57:51', NULL),
(15, 'AR-INV-3', '2026-07-02', 'Penerbitan invoice INV/202607/003', 'invoice', 3, 'posted', NULL, NULL, NULL, '2026-07-02 20:42:11', NULL, '2026-07-02 13:42:11', '2026-07-02 13:42:11', NULL),
(16, 'AR-RCP-3-3', '2026-07-02', 'Penerimaan pembayaran invoice INV/202607/003', 'invoice_payment', 3, 'posted', NULL, NULL, NULL, '2026-07-02 20:42:13', NULL, '2026-07-02 13:42:13', '2026-07-02 13:42:13', NULL),
(17, 'AP-BIL-2', '2026-07-02', 'Penerbitan tagihan 999 dari hkjjkjk', 'bill', 2, 'posted', NULL, NULL, NULL, '2026-07-02 20:43:09', NULL, '2026-07-02 13:43:09', '2026-07-02 13:43:09', NULL),
(18, 'AP-PAY-2-2', '2026-07-02', 'Pembayaran tagihan 999 ke hkjjkjk', 'bill_payment', 2, 'posted', NULL, NULL, NULL, '2026-07-02 20:43:13', NULL, '2026-07-02 13:43:13', '2026-07-02 13:43:13', NULL),
(19, 'VAT-CLOSE-202607', '2026-07-02', 'Penutupan PPN Masa 2026-07', 'vat_closing', 1, 'posted', NULL, NULL, NULL, '2026-07-02 20:59:47', NULL, '2026-07-02 13:59:47', '2026-07-02 13:59:47', NULL),
(20, 'TAX-PAY-8', '2026-07-02', 'Setoran PPN periode 2026-07', 'tax_payment', 8, 'posted', NULL, NULL, NULL, '2026-07-02 21:00:10', NULL, '2026-07-02 14:00:10', '2026-07-02 14:00:10', NULL),
(21, 'TAX-OBL-7', '2026-07-02', 'Kewajiban PPh Final periode 2026-07', 'tax_record', 7, 'posted', NULL, NULL, NULL, '2026-07-02 21:00:18', NULL, '2026-07-02 14:00:18', '2026-07-02 14:00:18', NULL),
(22, 'AST-1-20260703', '2026-07-03', 'Perolehan aset Laptop Operasional (L900)', 'asset_acquisition', 1, 'posted', NULL, NULL, NULL, '2026-07-03 09:34:10', NULL, '2026-07-03 02:34:10', '2026-07-03 02:34:10', NULL),
(23, 'PRL-202607-1', '2026-07-06', 'Payroll Pegawai Finance Test periode 2026-07', 'payroll', 1, 'posted', NULL, NULL, NULL, '2026-07-06 10:49:23', NULL, '2026-07-06 03:49:23', '2026-07-06 03:49:23', NULL),
(24, 'PRL-202607-3', '2026-07-06', 'Payroll aiinin periode 2026-07', 'payroll', 2, 'posted', NULL, NULL, NULL, '2026-07-06 14:18:08', NULL, '2026-07-06 07:18:08', '2026-07-06 07:18:08', NULL),
(25, 'DUM26-JV-AST-001', '2026-01-10', 'Perolehan aset dummy Laptop Developer Dell Latitude', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(26, 'DUM26-JV-AST-002', '2026-01-15', 'Perolehan aset dummy Laptop Designer ASUS ProArt', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(27, 'DUM26-JV-AST-003', '2026-02-02', 'Perolehan aset dummy Monitor Ultrawide 34 Inch', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(28, 'DUM26-JV-AST-004', '2026-02-12', 'Perolehan aset dummy Printer Multifungsi Laser', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(29, 'DUM26-JV-AST-005', '2026-02-20', 'Perolehan aset dummy Server NAS Backup', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(30, 'DUM26-JV-AST-006', '2026-03-01', 'Perolehan aset dummy Router Enterprise', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(31, 'DUM26-JV-BIL-001', '2026-05-02', 'Penerbitan tagihan dummy DUM26-BIL-001', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(32, 'DUM26-JV-BIL-002', '2026-05-04', 'Penerbitan tagihan dummy DUM26-BIL-002', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(33, 'DUM26-JV-BIL-003', '2026-05-06', 'Penerbitan tagihan dummy DUM26-BIL-003', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(34, 'DUM26-JV-BIL-004', '2026-05-08', 'Penerbitan tagihan dummy DUM26-BIL-004', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(35, 'DUM26-JV-BIL-005', '2026-05-10', 'Penerbitan tagihan dummy DUM26-BIL-005', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(36, 'DUM26-JV-BIL-006', '2026-05-12', 'Penerbitan tagihan dummy DUM26-BIL-006', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(37, 'DUM26-JV-BIL-007', '2026-05-14', 'Penerbitan tagihan dummy DUM26-BIL-007', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(38, 'DUM26-JV-BIL-008', '2026-05-16', 'Penerbitan tagihan dummy DUM26-BIL-008', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(39, 'DUM26-JV-BIL-009', '2026-05-18', 'Penerbitan tagihan dummy DUM26-BIL-009', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(40, 'DUM26-JV-BIL-010', '2026-05-20', 'Penerbitan tagihan dummy DUM26-BIL-010', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(41, 'DUM26-JV-BIL-011', '2026-05-22', 'Penerbitan tagihan dummy DUM26-BIL-011', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(42, 'DUM26-JV-BIL-012', '2026-05-24', 'Penerbitan tagihan dummy DUM26-BIL-012', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(43, 'DUM26-JV-BIL-013', '2026-05-26', 'Penerbitan tagihan dummy DUM26-BIL-013', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(44, 'DUM26-JV-BIL-014', '2026-05-28', 'Penerbitan tagihan dummy DUM26-BIL-014', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(45, 'DUM26-JV-BIL-015', '2026-05-30', 'Penerbitan tagihan dummy DUM26-BIL-015', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(46, 'DUM26-JV-BIL-016', '2026-06-01', 'Penerbitan tagihan dummy DUM26-BIL-016', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(47, 'DUM26-JV-BIL-017', '2026-06-03', 'Penerbitan tagihan dummy DUM26-BIL-017', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(48, 'DUM26-JV-BIL-018', '2026-06-05', 'Penerbitan tagihan dummy DUM26-BIL-018', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(49, 'DUM26-JV-BIL-019', '2026-06-07', 'Penerbitan tagihan dummy DUM26-BIL-019', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(50, 'DUM26-JV-BIL-020', '2026-06-09', 'Penerbitan tagihan dummy DUM26-BIL-020', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(51, 'DUM26-JV-BIL-021', '2026-06-11', 'Penerbitan tagihan dummy DUM26-BIL-021', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(52, 'DUM26-JV-BIL-022', '2026-06-13', 'Penerbitan tagihan dummy DUM26-BIL-022', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(53, 'DUM26-JV-BIL-023', '2026-06-15', 'Penerbitan tagihan dummy DUM26-BIL-023', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(54, 'DUM26-JV-BIL-024', '2026-06-17', 'Penerbitan tagihan dummy DUM26-BIL-024', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(55, 'DUM26-JV-INV-001', '2026-05-01', 'Penerbitan invoice dummy DUM26-INV-001', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(56, 'DUM26-JV-INV-002', '2026-05-03', 'Penerbitan invoice dummy DUM26-INV-002', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(57, 'DUM26-JV-INV-003', '2026-05-05', 'Penerbitan invoice dummy DUM26-INV-003', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(58, 'DUM26-JV-INV-004', '2026-05-07', 'Penerbitan invoice dummy DUM26-INV-004', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(59, 'DUM26-JV-INV-005', '2026-05-09', 'Penerbitan invoice dummy DUM26-INV-005', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(60, 'DUM26-JV-INV-006', '2026-05-11', 'Penerbitan invoice dummy DUM26-INV-006', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(61, 'DUM26-JV-INV-007', '2026-05-13', 'Penerbitan invoice dummy DUM26-INV-007', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(62, 'DUM26-JV-INV-008', '2026-05-15', 'Penerbitan invoice dummy DUM26-INV-008', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(63, 'DUM26-JV-INV-009', '2026-05-17', 'Penerbitan invoice dummy DUM26-INV-009', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(64, 'DUM26-JV-INV-010', '2026-05-19', 'Penerbitan invoice dummy DUM26-INV-010', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(65, 'DUM26-JV-INV-011', '2026-05-21', 'Penerbitan invoice dummy DUM26-INV-011', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(66, 'DUM26-JV-INV-012', '2026-05-23', 'Penerbitan invoice dummy DUM26-INV-012', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(67, 'DUM26-JV-INV-013', '2026-05-25', 'Penerbitan invoice dummy DUM26-INV-013', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(68, 'DUM26-JV-INV-014', '2026-05-27', 'Penerbitan invoice dummy DUM26-INV-014', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(69, 'DUM26-JV-INV-015', '2026-05-29', 'Penerbitan invoice dummy DUM26-INV-015', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(70, 'DUM26-JV-INV-016', '2026-05-31', 'Penerbitan invoice dummy DUM26-INV-016', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(71, 'DUM26-JV-INV-017', '2026-06-02', 'Penerbitan invoice dummy DUM26-INV-017', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(72, 'DUM26-JV-INV-018', '2026-06-04', 'Penerbitan invoice dummy DUM26-INV-018', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(73, 'DUM26-JV-INV-019', '2026-06-06', 'Penerbitan invoice dummy DUM26-INV-019', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(74, 'DUM26-JV-INV-020', '2026-06-08', 'Penerbitan invoice dummy DUM26-INV-020', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(75, 'DUM26-JV-INV-021', '2026-06-10', 'Penerbitan invoice dummy DUM26-INV-021', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(76, 'DUM26-JV-INV-022', '2026-06-12', 'Penerbitan invoice dummy DUM26-INV-022', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(77, 'DUM26-JV-INV-023', '2026-06-14', 'Penerbitan invoice dummy DUM26-INV-023', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(78, 'DUM26-JV-INV-024', '2026-06-16', 'Penerbitan invoice dummy DUM26-INV-024', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(79, 'DUM26-JV-INV-025', '2026-06-18', 'Penerbitan invoice dummy DUM26-INV-025', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(80, 'DUM26-JV-INV-026', '2026-06-20', 'Penerbitan invoice dummy DUM26-INV-026', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(81, 'DUM26-JV-INV-027', '2026-06-22', 'Penerbitan invoice dummy DUM26-INV-027', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(82, 'DUM26-JV-INV-028', '2026-06-24', 'Penerbitan invoice dummy DUM26-INV-028', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(83, 'DUM26-JV-INV-029', '2026-06-26', 'Penerbitan invoice dummy DUM26-INV-029', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(84, 'DUM26-JV-INV-030', '2026-06-28', 'Penerbitan invoice dummy DUM26-INV-030', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(85, 'DUM26-JV-PAY-001', '2026-05-12', 'Pembayaran tagihan dummy DUM26-BIL-001', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(86, 'DUM26-JV-PAY-002', '2026-05-14', 'Pembayaran tagihan dummy DUM26-BIL-002', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(87, 'DUM26-JV-PAY-004', '2026-05-18', 'Pembayaran tagihan dummy DUM26-BIL-004', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(88, 'DUM26-JV-PAY-005', '2026-05-20', 'Pembayaran tagihan dummy DUM26-BIL-005', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(89, 'DUM26-JV-PAY-007', '2026-05-24', 'Pembayaran tagihan dummy DUM26-BIL-007', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(90, 'DUM26-JV-PAY-009', '2026-05-28', 'Pembayaran tagihan dummy DUM26-BIL-009', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(91, 'DUM26-JV-PAY-010', '2026-05-30', 'Pembayaran tagihan dummy DUM26-BIL-010', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(92, 'DUM26-JV-PAY-012', '2026-06-03', 'Pembayaran tagihan dummy DUM26-BIL-012', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(93, 'DUM26-JV-PAY-013', '2026-06-05', 'Pembayaran tagihan dummy DUM26-BIL-013', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(94, 'DUM26-JV-PAY-015', '2026-06-09', 'Pembayaran tagihan dummy DUM26-BIL-015', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(95, 'DUM26-JV-PAY-016', '2026-06-11', 'Pembayaran tagihan dummy DUM26-BIL-016', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(96, 'DUM26-JV-PAY-019', '2026-06-17', 'Pembayaran tagihan dummy DUM26-BIL-019', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(97, 'DUM26-JV-PAY-020', '2026-06-19', 'Pembayaran tagihan dummy DUM26-BIL-020', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(98, 'DUM26-JV-PAY-022', '2026-06-23', 'Pembayaran tagihan dummy DUM26-BIL-022', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(99, 'DUM26-JV-PAY-023', '2026-06-25', 'Pembayaran tagihan dummy DUM26-BIL-023', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(100, 'DUM26-JV-RCP-001', '2026-05-08', 'Penerimaan pembayaran dummy DUM26-INV-001', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(101, 'DUM26-JV-RCP-002', '2026-05-10', 'Penerimaan pembayaran dummy DUM26-INV-002', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(102, 'DUM26-JV-RCP-003', '2026-05-12', 'Penerimaan pembayaran dummy DUM26-INV-003', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(103, 'DUM26-JV-RCP-005', '2026-05-16', 'Penerimaan pembayaran dummy DUM26-INV-005', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(104, 'DUM26-JV-RCP-006', '2026-05-18', 'Penerimaan pembayaran dummy DUM26-INV-006', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(105, 'DUM26-JV-RCP-009', '2026-05-24', 'Penerimaan pembayaran dummy DUM26-INV-009', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(106, 'DUM26-JV-RCP-010', '2026-05-26', 'Penerimaan pembayaran dummy DUM26-INV-010', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(107, 'DUM26-JV-RCP-012', '2026-05-30', 'Penerimaan pembayaran dummy DUM26-INV-012', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(108, 'DUM26-JV-RCP-013', '2026-06-01', 'Penerimaan pembayaran dummy DUM26-INV-013', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(109, 'DUM26-JV-RCP-015', '2026-06-05', 'Penerimaan pembayaran dummy DUM26-INV-015', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(110, 'DUM26-JV-RCP-017', '2026-06-09', 'Penerimaan pembayaran dummy DUM26-INV-017', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(111, 'DUM26-JV-RCP-019', '2026-06-13', 'Penerimaan pembayaran dummy DUM26-INV-019', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(112, 'DUM26-JV-RCP-020', '2026-06-15', 'Penerimaan pembayaran dummy DUM26-INV-020', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(113, 'DUM26-JV-RCP-022', '2026-06-19', 'Penerimaan pembayaran dummy DUM26-INV-022', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(114, 'DUM26-JV-RCP-023', '2026-06-21', 'Penerimaan pembayaran dummy DUM26-INV-023', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(115, 'DUM26-JV-RCP-025', '2026-06-25', 'Penerimaan pembayaran dummy DUM26-INV-025', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(116, 'DUM26-JV-RCP-026', '2026-06-27', 'Penerimaan pembayaran dummy DUM26-INV-026', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(117, 'DUM26-JV-RCP-028', '2026-07-01', 'Penerimaan pembayaran dummy DUM26-INV-028', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(118, 'DUM26-JV-RCP-029', '2026-07-03', 'Penerimaan pembayaran dummy DUM26-INV-029', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(119, 'DUM26-JV-SUB-001', '2026-08-01', 'Pembayaran langganan dummy Figma Professional', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(120, 'DUM26-JV-SUB-002', '2026-08-01', 'Pembayaran langganan dummy Google Workspace Business', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(121, 'DUM26-JV-SUB-003', '2026-08-01', 'Pembayaran langganan dummy GitHub Team', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(122, 'DUM26-JV-SUB-004', '2026-08-01', 'Pembayaran langganan dummy Cloud VPS Starter', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(123, 'DUM26-JV-SUB-005', '2026-08-01', 'Pembayaran langganan dummy Canva Teams', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(124, 'DUM26-JV-SUB-006', '2026-08-01', 'Pembayaran langganan dummy Zoom Workplace', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(125, 'DUM26-JV-SUB-007', '2026-08-01', 'Pembayaran langganan dummy Notion Business', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(126, 'DUM26-JV-SUB-008', '2026-08-01', 'Pembayaran langganan dummy Mailchimp Standard', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(127, 'DUM26-JV-SUB-009', '2026-08-01', 'Pembayaran langganan dummy Sentry Team', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(128, 'DUM26-JV-SUB-010', '2026-08-01', 'Pembayaran langganan dummy Jira Software', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(129, 'DUM26-JV-SUB-011', '2026-08-01', 'Pembayaran langganan dummy Miro Business', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(130, 'DUM26-JV-SUB-012', '2027-01-01', 'Pembayaran langganan dummy Adobe Creative Cloud', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(131, 'DUM26-JV-SUB-013', '2027-01-01', 'Pembayaran langganan dummy Domain finstart-demo.test', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(132, 'DUM26-JV-SUB-014', '2027-02-01', 'Pembayaran langganan dummy Antivirus Endpoint', 'dummy_seed', NULL, 'posted', NULL, NULL, NULL, '2026-07-06 16:41:17', NULL, '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL),
(133, 'TAX-OBL-21', '2026-07-07', 'Kewajiban PPh 21 periode 2026-07', 'tax_record', 21, 'posted', NULL, NULL, NULL, '2026-07-07 13:07:27', NULL, '2026-07-07 06:07:27', '2026-07-07 06:07:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `journal_lines`
--

CREATE TABLE `journal_lines` (
  `id` bigint UNSIGNED NOT NULL,
  `journal_entry_id` bigint UNSIGNED NOT NULL,
  `account_id` bigint UNSIGNED NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `credit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `journal_lines`
--

INSERT INTO `journal_lines` (`id`, `journal_entry_id`, `account_id`, `description`, `debit`, `credit`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 'Penerimaan modal tunai', 10000000.00, 0.00, '2026-07-02 04:36:30', '2026-07-02 04:36:30'),
(2, 1, 15, 'Modal pemilik', 0.00, 10000000.00, '2026-07-02 04:36:30', '2026-07-02 04:36:30'),
(3, 2, 4, NULL, 1000000.00, 0.00, '2026-07-02 05:59:16', '2026-07-02 05:59:16'),
(4, 2, 18, NULL, 0.00, 1000000.00, '2026-07-02 05:59:16', '2026-07-02 05:59:16'),
(5, 3, 22, NULL, 5000000.00, 0.00, '2026-07-02 07:14:36', '2026-07-02 07:14:36'),
(6, 3, 4, NULL, 0.00, 5000000.00, '2026-07-02 07:14:36', '2026-07-02 07:14:36'),
(7, 4, 5, 'Piutang inv99909090', 800000.00, 0.00, '2026-07-02 07:44:22', '2026-07-02 07:44:22'),
(8, 4, 18, 'Pendapatan inv99909090', 0.00, 800000.00, '2026-07-02 07:44:22', '2026-07-02 07:44:22'),
(9, 5, 4, 'Penerimaan inv99909090', 800000.00, 0.00, '2026-07-02 07:46:18', '2026-07-02 07:46:18'),
(10, 5, 5, 'Pelunasan piutang inv99909090', 0.00, 800000.00, '2026-07-02 07:46:18', '2026-07-02 07:46:18'),
(11, 6, 5, 'Piutang ffevfrvf', 80000000.00, 0.00, '2026-07-02 08:27:05', '2026-07-02 08:27:05'),
(12, 6, 18, 'Pendapatan ffevfrvf', 0.00, 80000000.00, '2026-07-02 08:27:05', '2026-07-02 08:27:05'),
(13, 7, 4, 'Penerimaan ffevfrvf', 80000000.00, 0.00, '2026-07-02 08:27:08', '2026-07-02 08:27:08'),
(14, 7, 5, 'Pelunasan piutang ffevfrvf', 0.00, 80000000.00, '2026-07-02 08:27:08', '2026-07-02 08:27:08'),
(15, 8, 21, 'Beban hjkjj', 700000.00, 0.00, '2026-07-02 08:58:01', '2026-07-02 08:58:01'),
(16, 8, 11, 'Utang hjkjj', 0.00, 700000.00, '2026-07-02 08:58:01', '2026-07-02 08:58:01'),
(17, 9, 11, 'Pelunasan utang hjkjj', 700000.00, 0.00, '2026-07-02 08:58:06', '2026-07-02 08:58:06'),
(18, 9, 4, 'Pembayaran hjkjj', 0.00, 700000.00, '2026-07-02 08:58:06', '2026-07-02 08:58:06'),
(19, 10, 21, 'Beban PPN', 90000.00, 0.00, '2026-07-02 09:20:59', '2026-07-02 09:20:59'),
(20, 10, 12, 'Utang PPN', 0.00, 90000.00, '2026-07-02 09:20:59', '2026-07-02 09:20:59'),
(21, 11, 12, 'Pelunasan utang PPN', 90000.00, 0.00, '2026-07-02 09:21:04', '2026-07-02 09:21:04'),
(22, 11, 4, 'Setoran PPN', 0.00, 90000.00, '2026-07-02 09:21:04', '2026-07-02 09:21:04'),
(23, 12, 21, 'Beban PPh 21', 1636000.00, 0.00, '2026-07-02 09:31:34', '2026-07-02 09:31:34'),
(24, 12, 12, 'Utang PPh 21', 0.00, 1636000.00, '2026-07-02 09:31:34', '2026-07-02 09:31:34'),
(25, 13, 12, 'Pelunasan utang PPh 21', 1636000.00, 0.00, '2026-07-02 09:31:45', '2026-07-02 09:31:45'),
(26, 13, 4, 'Setoran PPh 21', 0.00, 1636000.00, '2026-07-02 09:31:45', '2026-07-02 09:31:45'),
(27, 14, 21, 'Beban gaji yu', 90000000.00, 0.00, '2026-07-02 09:57:51', '2026-07-02 09:57:51'),
(28, 14, 4, 'Gaji bersih yu', 0.00, 68400000.00, '2026-07-02 09:57:51', '2026-07-02 09:57:51'),
(29, 14, 12, 'Utang PPh 21 yu', 0.00, 21600000.00, '2026-07-02 09:57:51', '2026-07-02 09:57:51'),
(30, 15, 5, 'Piutang INV/202607/003', 6300000.00, 0.00, '2026-07-02 13:42:11', '2026-07-02 13:42:11'),
(31, 15, 18, 'Pendapatan INV/202607/003', 0.00, 6000000.00, '2026-07-02 13:42:11', '2026-07-02 13:42:11'),
(32, 15, 30, 'PPN Keluaran INV/202607/003', 0.00, 300000.00, '2026-07-02 13:42:11', '2026-07-02 13:42:11'),
(33, 16, 4, 'Penerimaan INV/202607/003', 6300000.00, 0.00, '2026-07-02 13:42:13', '2026-07-02 13:42:13'),
(34, 16, 5, 'Pelunasan piutang INV/202607/003', 0.00, 6300000.00, '2026-07-02 13:42:13', '2026-07-02 13:42:13'),
(35, 17, 21, 'Beban 999', 500000.00, 0.00, '2026-07-02 13:43:09', '2026-07-02 13:43:09'),
(36, 17, 28, 'PPN Masukan 999', 25000.00, 0.00, '2026-07-02 13:43:09', '2026-07-02 13:43:09'),
(37, 17, 11, 'Utang vendor 999', 0.00, 515000.00, '2026-07-02 13:43:09', '2026-07-02 13:43:09'),
(38, 17, 31, 'Utang PPh 23 999', 0.00, 10000.00, '2026-07-02 13:43:09', '2026-07-02 13:43:09'),
(39, 18, 11, 'Pelunasan utang 999', 515000.00, 0.00, '2026-07-02 13:43:13', '2026-07-02 13:43:13'),
(40, 18, 4, 'Pembayaran 999', 0.00, 515000.00, '2026-07-02 13:43:13', '2026-07-02 13:43:13'),
(41, 19, 30, 'Penutupan PPN Keluaran masa 2026-07', 300000.00, 0.00, '2026-07-02 13:59:47', '2026-07-02 13:59:47'),
(42, 19, 28, 'Kredit PPN Masukan masa 2026-07', 0.00, 25000.00, '2026-07-02 13:59:47', '2026-07-02 13:59:47'),
(43, 19, 12, 'Utang PPN masa 2026-07', 0.00, 275000.00, '2026-07-02 13:59:47', '2026-07-02 13:59:47'),
(44, 20, 12, 'Pelunasan PPN', 275000.00, 0.00, '2026-07-02 14:00:10', '2026-07-02 14:00:10'),
(45, 20, 4, 'Setoran PPN', 0.00, 275000.00, '2026-07-02 14:00:10', '2026-07-02 14:00:10'),
(46, 21, 21, 'Beban PPh Final', 4390000.00, 0.00, '2026-07-02 14:00:18', '2026-07-02 14:00:18'),
(47, 21, 12, 'Utang PPh Final', 0.00, 4390000.00, '2026-07-02 14:00:18', '2026-07-02 14:00:18'),
(48, 22, 8, 'Perolehan Laptop Operasional', 9000000.00, 0.00, '2026-07-03 02:34:10', '2026-07-03 02:34:10'),
(49, 22, 4, 'Sumber dana Bank', 0.00, 9000000.00, '2026-07-03 02:34:10', '2026-07-03 02:34:10'),
(50, 23, 21, 'Beban gaji Pegawai Finance Test periode 2026-07', 5000000.00, 0.00, '2026-07-06 03:49:23', '2026-07-06 03:49:23'),
(51, 23, 4, 'Pembayaran gaji bersih Pegawai Finance Test periode 2026-07', 0.00, 5000000.00, '2026-07-06 03:49:23', '2026-07-06 03:49:23'),
(52, 24, 21, 'Beban gaji aiinin periode 2026-07', 10000000.00, 0.00, '2026-07-06 07:18:08', '2026-07-06 07:18:08'),
(53, 24, 34, 'Beban BPJS perusahaan aiinin periode 2026-07', 10000000.00, 0.00, '2026-07-06 07:18:08', '2026-07-06 07:18:08'),
(54, 24, 3, 'Pembayaran gaji bersih aiinin periode 2026-07', 0.00, 100000.00, '2026-07-06 07:18:08', '2026-07-06 07:18:08'),
(55, 24, 33, 'Utang BPJS aiinin periode 2026-07', 0.00, 19900000.00, '2026-07-06 07:18:08', '2026-07-06 07:18:08'),
(56, 55, 5, 'Piutang invoice DUM26-INV-001', 12500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(57, 55, 18, 'Pendapatan invoice DUM26-INV-001', 0.00, 12500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(58, 100, 4, 'Penerimaan DUM26-INV-001', 12500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(59, 100, 5, 'Pelunasan piutang DUM26-INV-001', 0.00, 12500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(60, 56, 5, 'Piutang invoice DUM26-INV-002', 18000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(61, 56, 18, 'Pendapatan invoice DUM26-INV-002', 0.00, 18000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(62, 101, 4, 'Penerimaan DUM26-INV-002', 18000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(63, 101, 5, 'Pelunasan piutang DUM26-INV-002', 0.00, 18000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(64, 57, 5, 'Piutang invoice DUM26-INV-003', 9600000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(65, 57, 18, 'Pendapatan invoice DUM26-INV-003', 0.00, 9600000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(66, 102, 4, 'Penerimaan DUM26-INV-003', 4800000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(67, 102, 5, 'Pelunasan piutang DUM26-INV-003', 0.00, 4800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(68, 58, 5, 'Piutang invoice DUM26-INV-004', 14500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(69, 58, 18, 'Pendapatan invoice DUM26-INV-004', 0.00, 14500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(70, 59, 5, 'Piutang invoice DUM26-INV-005', 11250000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(71, 59, 18, 'Pendapatan invoice DUM26-INV-005', 0.00, 11250000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(72, 103, 4, 'Penerimaan DUM26-INV-005', 11250000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(73, 103, 5, 'Pelunasan piutang DUM26-INV-005', 0.00, 11250000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(74, 60, 5, 'Piutang invoice DUM26-INV-006', 20000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(75, 60, 18, 'Pendapatan invoice DUM26-INV-006', 0.00, 20000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(76, 104, 4, 'Penerimaan DUM26-INV-006', 10000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(77, 104, 5, 'Pelunasan piutang DUM26-INV-006', 0.00, 10000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(78, 61, 5, 'Piutang invoice DUM26-INV-007', 8500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(79, 61, 18, 'Pendapatan invoice DUM26-INV-007', 0.00, 8500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(80, 62, 5, 'Piutang invoice DUM26-INV-008', 17500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(81, 62, 18, 'Pendapatan invoice DUM26-INV-008', 0.00, 17500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(82, 63, 5, 'Piutang invoice DUM26-INV-009', 13200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(83, 63, 18, 'Pendapatan invoice DUM26-INV-009', 0.00, 13200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(84, 105, 4, 'Penerimaan DUM26-INV-009', 13200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(85, 105, 5, 'Pelunasan piutang DUM26-INV-009', 0.00, 13200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(86, 64, 5, 'Piutang invoice DUM26-INV-010', 22000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(87, 64, 18, 'Pendapatan invoice DUM26-INV-010', 0.00, 22000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(88, 106, 4, 'Penerimaan DUM26-INV-010', 11000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(89, 106, 5, 'Pelunasan piutang DUM26-INV-010', 0.00, 11000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(90, 65, 5, 'Piutang invoice DUM26-INV-011', 7800000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(91, 65, 18, 'Pendapatan invoice DUM26-INV-011', 0.00, 7800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(92, 66, 5, 'Piutang invoice DUM26-INV-012', 10500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(93, 66, 18, 'Pendapatan invoice DUM26-INV-012', 0.00, 10500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(94, 107, 4, 'Penerimaan DUM26-INV-012', 10500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(95, 107, 5, 'Pelunasan piutang DUM26-INV-012', 0.00, 10500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(96, 67, 5, 'Piutang invoice DUM26-INV-013', 9200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(97, 67, 18, 'Pendapatan invoice DUM26-INV-013', 0.00, 9200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(98, 108, 4, 'Penerimaan DUM26-INV-013', 4600000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(99, 108, 5, 'Pelunasan piutang DUM26-INV-013', 0.00, 4600000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(100, 68, 5, 'Piutang invoice DUM26-INV-014', 11800000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(101, 68, 18, 'Pendapatan invoice DUM26-INV-014', 0.00, 11800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(102, 69, 5, 'Piutang invoice DUM26-INV-015', 16000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(103, 69, 18, 'Pendapatan invoice DUM26-INV-015', 0.00, 16000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(104, 109, 4, 'Penerimaan DUM26-INV-015', 16000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(105, 109, 5, 'Pelunasan piutang DUM26-INV-015', 0.00, 16000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(106, 70, 5, 'Piutang invoice DUM26-INV-016', 7300000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(107, 70, 18, 'Pendapatan invoice DUM26-INV-016', 0.00, 7300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(108, 71, 5, 'Piutang invoice DUM26-INV-017', 12800000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(109, 71, 18, 'Pendapatan invoice DUM26-INV-017', 0.00, 12800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(110, 110, 4, 'Penerimaan DUM26-INV-017', 6400000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(111, 110, 5, 'Pelunasan piutang DUM26-INV-017', 0.00, 6400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(112, 72, 5, 'Piutang invoice DUM26-INV-018', 9700000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(113, 72, 18, 'Pendapatan invoice DUM26-INV-018', 0.00, 9700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(114, 73, 5, 'Piutang invoice DUM26-INV-019', 11000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(115, 73, 18, 'Pendapatan invoice DUM26-INV-019', 0.00, 11000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(116, 111, 4, 'Penerimaan DUM26-INV-019', 11000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(117, 111, 5, 'Pelunasan piutang DUM26-INV-019', 0.00, 11000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(118, 74, 5, 'Piutang invoice DUM26-INV-020', 15000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(119, 74, 18, 'Pendapatan invoice DUM26-INV-020', 0.00, 15000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(120, 112, 4, 'Penerimaan DUM26-INV-020', 7500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(121, 112, 5, 'Pelunasan piutang DUM26-INV-020', 0.00, 7500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(122, 75, 5, 'Piutang invoice DUM26-INV-021', 8700000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(123, 75, 18, 'Pendapatan invoice DUM26-INV-021', 0.00, 8700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(124, 76, 5, 'Piutang invoice DUM26-INV-022', 14200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(125, 76, 18, 'Pendapatan invoice DUM26-INV-022', 0.00, 14200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(126, 113, 4, 'Penerimaan DUM26-INV-022', 14200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(127, 113, 5, 'Pelunasan piutang DUM26-INV-022', 0.00, 14200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(128, 77, 5, 'Piutang invoice DUM26-INV-023', 10400000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(129, 77, 18, 'Pendapatan invoice DUM26-INV-023', 0.00, 10400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(130, 114, 4, 'Penerimaan DUM26-INV-023', 5200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(131, 114, 5, 'Pelunasan piutang DUM26-INV-023', 0.00, 5200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(132, 78, 5, 'Piutang invoice DUM26-INV-024', 8900000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(133, 78, 18, 'Pendapatan invoice DUM26-INV-024', 0.00, 8900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(134, 79, 5, 'Piutang invoice DUM26-INV-025', 16500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(135, 79, 18, 'Pendapatan invoice DUM26-INV-025', 0.00, 16500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(136, 115, 4, 'Penerimaan DUM26-INV-025', 16500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(137, 115, 5, 'Pelunasan piutang DUM26-INV-025', 0.00, 16500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(138, 80, 5, 'Piutang invoice DUM26-INV-026', 7600000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(139, 80, 18, 'Pendapatan invoice DUM26-INV-026', 0.00, 7600000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(140, 116, 4, 'Penerimaan DUM26-INV-026', 3800000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(141, 116, 5, 'Pelunasan piutang DUM26-INV-026', 0.00, 3800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(142, 81, 5, 'Piutang invoice DUM26-INV-027', 13300000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(143, 81, 18, 'Pendapatan invoice DUM26-INV-027', 0.00, 13300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(144, 82, 5, 'Piutang invoice DUM26-INV-028', 12000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(145, 82, 18, 'Pendapatan invoice DUM26-INV-028', 0.00, 12000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(146, 117, 4, 'Penerimaan DUM26-INV-028', 12000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(147, 117, 5, 'Pelunasan piutang DUM26-INV-028', 0.00, 12000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(148, 83, 5, 'Piutang invoice DUM26-INV-029', 9400000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(149, 83, 18, 'Pendapatan invoice DUM26-INV-029', 0.00, 9400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(150, 118, 4, 'Penerimaan DUM26-INV-029', 4700000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(151, 118, 5, 'Pelunasan piutang DUM26-INV-029', 0.00, 4700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(152, 84, 5, 'Piutang invoice DUM26-INV-030', 15500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(153, 84, 18, 'Pendapatan invoice DUM26-INV-030', 0.00, 15500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(154, 31, 25, 'Beban Perangkat kerja dan lisensi DUM26-BIL-001', 4200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(155, 31, 11, 'Utang tagihan DUM26-BIL-001', 0.00, 4200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(156, 85, 11, 'Pelunasan utang DUM26-BIL-001', 4200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(157, 85, 4, 'Pembayaran DUM26-BIL-001', 0.00, 4200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(158, 32, 24, 'Beban Layanan internet kantor DUM26-BIL-002', 3500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(159, 32, 11, 'Utang tagihan DUM26-BIL-002', 0.00, 3500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(160, 86, 11, 'Pelunasan utang DUM26-BIL-002', 1400000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(161, 86, 4, 'Pembayaran DUM26-BIL-002', 0.00, 1400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(162, 33, 22, 'Beban Cetak materi promosi DUM26-BIL-003', 2800000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(163, 33, 11, 'Utang tagihan DUM26-BIL-003', 0.00, 2800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(164, 34, 23, 'Beban Sewa ruang kerja DUM26-BIL-004', 9500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(165, 34, 11, 'Utang tagihan DUM26-BIL-004', 0.00, 9500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(166, 87, 11, 'Pelunasan utang DUM26-BIL-004', 9500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(167, 87, 4, 'Pembayaran DUM26-BIL-004', 0.00, 9500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(168, 35, 22, 'Beban Biaya kampanye digital DUM26-BIL-005', 6200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(169, 35, 11, 'Utang tagihan DUM26-BIL-005', 0.00, 6200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(170, 88, 11, 'Pelunasan utang DUM26-BIL-005', 2480000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(171, 88, 4, 'Pembayaran DUM26-BIL-005', 0.00, 2480000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(172, 36, 24, 'Beban Listrik dan utilitas DUM26-BIL-006', 3100000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(173, 36, 11, 'Utang tagihan DUM26-BIL-006', 0.00, 3100000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(174, 37, 22, 'Beban Produksi konten DUM26-BIL-007', 4800000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(175, 37, 11, 'Utang tagihan DUM26-BIL-007', 0.00, 4800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(176, 89, 11, 'Pelunasan utang DUM26-BIL-007', 4800000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(177, 89, 4, 'Pembayaran DUM26-BIL-007', 0.00, 4800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(178, 38, 26, 'Beban Perjalanan dinas DUM26-BIL-008', 2700000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(179, 38, 11, 'Utang tagihan DUM26-BIL-008', 0.00, 2700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(180, 39, 22, 'Beban ATK dan kebutuhan kantor DUM26-BIL-009', 1900000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(181, 39, 11, 'Utang tagihan DUM26-BIL-009', 0.00, 1900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(182, 90, 11, 'Pelunasan utang DUM26-BIL-009', 1900000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(183, 90, 4, 'Pembayaran DUM26-BIL-009', 0.00, 1900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(184, 40, 25, 'Beban Layanan cloud DUM26-BIL-010', 7600000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(185, 40, 11, 'Utang tagihan DUM26-BIL-010', 0.00, 7600000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(186, 91, 11, 'Pelunasan utang DUM26-BIL-010', 3040000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(187, 91, 4, 'Pembayaran DUM26-BIL-010', 0.00, 3040000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(188, 41, 22, 'Beban Jasa legal dan kontrak DUM26-BIL-011', 5400000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(189, 41, 11, 'Utang tagihan DUM26-BIL-011', 0.00, 5400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(190, 42, 22, 'Beban Asuransi aset DUM26-BIL-012', 3400000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(191, 42, 11, 'Utang tagihan DUM26-BIL-012', 0.00, 3400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(192, 92, 11, 'Pelunasan utang DUM26-BIL-012', 3400000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(193, 92, 4, 'Pembayaran DUM26-BIL-012', 0.00, 3400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(194, 43, 22, 'Beban Jasa kebersihan DUM26-BIL-013', 2200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(195, 43, 11, 'Utang tagihan DUM26-BIL-013', 0.00, 2200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(196, 93, 11, 'Pelunasan utang DUM26-BIL-013', 880000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(197, 93, 4, 'Pembayaran DUM26-BIL-013', 0.00, 880000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(198, 44, 22, 'Beban Keamanan perangkat DUM26-BIL-014', 5100000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(199, 44, 11, 'Utang tagihan DUM26-BIL-014', 0.00, 5100000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(200, 45, 22, 'Beban Kegiatan komunitas DUM26-BIL-015', 4300000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(201, 45, 11, 'Utang tagihan DUM26-BIL-015', 0.00, 4300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(202, 94, 11, 'Pelunasan utang DUM26-BIL-015', 4300000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(203, 94, 4, 'Pembayaran DUM26-BIL-015', 0.00, 4300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(204, 46, 24, 'Beban Telekomunikasi DUM26-BIL-016', 2900000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(205, 46, 11, 'Utang tagihan DUM26-BIL-016', 0.00, 2900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(206, 95, 11, 'Pelunasan utang DUM26-BIL-016', 1160000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(207, 95, 4, 'Pembayaran DUM26-BIL-016', 0.00, 1160000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(208, 47, 22, 'Beban Riset pasar DUM26-BIL-017', 6000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(209, 47, 11, 'Utang tagihan DUM26-BIL-017', 0.00, 6000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(210, 48, 26, 'Beban Pengiriman dan logistik DUM26-BIL-018', 3300000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(211, 48, 11, 'Utang tagihan DUM26-BIL-018', 0.00, 3300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(212, 49, 22, 'Beban Pelatihan tim DUM26-BIL-019', 4500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(213, 49, 11, 'Utang tagihan DUM26-BIL-019', 0.00, 4500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(214, 96, 11, 'Pelunasan utang DUM26-BIL-019', 4500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(215, 96, 4, 'Pembayaran DUM26-BIL-019', 0.00, 4500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(216, 50, 22, 'Beban Perabot kantor DUM26-BIL-020', 8700000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(217, 50, 11, 'Utang tagihan DUM26-BIL-020', 0.00, 8700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(218, 97, 11, 'Pelunasan utang DUM26-BIL-020', 3480000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(219, 97, 4, 'Pembayaran DUM26-BIL-020', 0.00, 3480000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(220, 51, 22, 'Beban Jasa pemasaran DUM26-BIL-021', 3900000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(221, 51, 11, 'Utang tagihan DUM26-BIL-021', 0.00, 3900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(222, 52, 25, 'Beban Pemeliharaan aplikasi DUM26-BIL-022', 6900000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(223, 52, 11, 'Utang tagihan DUM26-BIL-022', 0.00, 6900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(224, 98, 11, 'Pelunasan utang DUM26-BIL-022', 6900000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(225, 98, 4, 'Pembayaran DUM26-BIL-022', 0.00, 6900000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(226, 53, 22, 'Beban Jasa analitik DUM26-BIL-023', 4700000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(227, 53, 11, 'Utang tagihan DUM26-BIL-023', 0.00, 4700000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(228, 99, 11, 'Pelunasan utang DUM26-BIL-023', 1880000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(229, 99, 4, 'Pembayaran DUM26-BIL-023', 0.00, 1880000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(230, 54, 22, 'Beban Pemeliharaan fasilitas DUM26-BIL-024', 3200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(231, 54, 11, 'Utang tagihan DUM26-BIL-024', 0.00, 3200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(232, 25, 8, 'Perolehan aset DUM26-AST-001', 18500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(233, 25, 4, 'Pembayaran aset DUM26-AST-001', 0.00, 18500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(234, 26, 8, 'Perolehan aset DUM26-AST-002', 22000000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(235, 26, 4, 'Pembayaran aset DUM26-AST-002', 0.00, 22000000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(236, 27, 8, 'Perolehan aset DUM26-AST-003', 8500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(237, 27, 4, 'Pembayaran aset DUM26-AST-003', 0.00, 8500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(238, 28, 8, 'Perolehan aset DUM26-AST-004', 6200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(239, 28, 4, 'Pembayaran aset DUM26-AST-004', 0.00, 6200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(240, 29, 8, 'Perolehan aset DUM26-AST-005', 17500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(241, 29, 4, 'Pembayaran aset DUM26-AST-005', 0.00, 17500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(242, 30, 8, 'Perolehan aset DUM26-AST-006', 7300000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(243, 30, 4, 'Pembayaran aset DUM26-AST-006', 0.00, 7300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(244, 119, 25, 'Beban langganan Figma Professional', 2400000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(245, 119, 4, 'Pembayaran langganan Figma Professional', 0.00, 2400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(246, 120, 25, 'Beban langganan Google Workspace Business', 3600000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(247, 120, 4, 'Pembayaran langganan Google Workspace Business', 0.00, 3600000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(248, 121, 25, 'Beban langganan GitHub Team', 1800000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(249, 121, 4, 'Pembayaran langganan GitHub Team', 0.00, 1800000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(250, 122, 25, 'Beban langganan Cloud VPS Starter', 4200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(251, 122, 4, 'Pembayaran langganan Cloud VPS Starter', 0.00, 4200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(252, 123, 25, 'Beban langganan Canva Teams', 1500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(253, 123, 4, 'Pembayaran langganan Canva Teams', 0.00, 1500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(254, 124, 25, 'Beban langganan Zoom Workplace', 1200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(255, 124, 4, 'Pembayaran langganan Zoom Workplace', 0.00, 1200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(256, 125, 25, 'Beban langganan Notion Business', 1750000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(257, 125, 4, 'Pembayaran langganan Notion Business', 0.00, 1750000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(258, 126, 25, 'Beban langganan Mailchimp Standard', 2100000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(259, 126, 4, 'Pembayaran langganan Mailchimp Standard', 0.00, 2100000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(260, 127, 25, 'Beban langganan Sentry Team', 1300000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(261, 127, 4, 'Pembayaran langganan Sentry Team', 0.00, 1300000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(262, 128, 25, 'Beban langganan Jira Software', 2500000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(263, 128, 4, 'Pembayaran langganan Jira Software', 0.00, 2500000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(264, 129, 25, 'Beban langganan Miro Business', 1400000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(265, 129, 4, 'Pembayaran langganan Miro Business', 0.00, 1400000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(266, 130, 25, 'Beban langganan Adobe Creative Cloud', 9600000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(267, 130, 4, 'Pembayaran langganan Adobe Creative Cloud', 0.00, 9600000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(268, 131, 25, 'Beban langganan Domain finstart-demo.test', 450000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(269, 131, 4, 'Pembayaran langganan Domain finstart-demo.test', 0.00, 450000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(270, 132, 25, 'Beban langganan Antivirus Endpoint', 3200000.00, 0.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(271, 132, 4, 'Pembayaran langganan Antivirus Endpoint', 0.00, 3200000.00, '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(272, 133, 21, 'Beban PPh 21', 1756000.00, 0.00, '2026-07-07 06:07:27', '2026-07-07 06:07:27'),
(273, 133, 12, 'Utang PPh 21', 0.00, 1756000.00, '2026-07-07 06:07:27', '2026-07-07 06:07:27');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `reference_type`, `reference_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'Login berhasil', 'Sesi login baru telah dibuat untuk akun Anda.', 'info', 0, 'auth_session', 3, '2026-07-07 06:06:34', '2026-07-07 06:06:34');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `token_hash` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payroll_records`
--

CREATE TABLE `payroll_records` (
  `id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED NOT NULL,
  `payroll_period` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_date` date NOT NULL,
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_nik` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_position` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `base_salary` decimal(18,2) NOT NULL DEFAULT '0.00',
  `health_company_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `health_employee_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jht_company_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jht_employee_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jp_company_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `jp_employee_rate` decimal(8,4) NOT NULL DEFAULT '0.0000',
  `health_company_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `health_employee_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `jht_company_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `jht_employee_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `jp_company_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `jp_employee_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `employee_bpjs_deduction` decimal(18,2) NOT NULL DEFAULT '0.00',
  `employer_bpjs_contribution` decimal(18,2) NOT NULL DEFAULT '0.00',
  `net_pay` decimal(18,2) NOT NULL DEFAULT '0.00',
  `salary_expense_account_id` bigint UNSIGNED NOT NULL,
  `bpjs_expense_account_id` bigint UNSIGNED NOT NULL,
  `cash_account_id` bigint UNSIGNED NOT NULL,
  `bpjs_payable_account_id` bigint UNSIGNED NOT NULL,
  `journal_entry_id` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','posted','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `overtime_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `allowance_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `bonus_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `loan_deduction` decimal(15,2) NOT NULL DEFAULT '0.00',
  `other_deduction` decimal(15,2) NOT NULL DEFAULT '0.00',
  `pph21_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tax_record_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_records`
--

INSERT INTO `payroll_records` (`id`, `employee_id`, `payroll_period`, `payment_date`, `employee_code`, `employee_name`, `employee_nik`, `employee_position`, `base_salary`, `health_company_rate`, `health_employee_rate`, `jht_company_rate`, `jht_employee_rate`, `jp_company_rate`, `jp_employee_rate`, `health_company_amount`, `health_employee_amount`, `jht_company_amount`, `jht_employee_amount`, `jp_company_amount`, `jp_employee_amount`, `employee_bpjs_deduction`, `employer_bpjs_contribution`, `net_pay`, `salary_expense_account_id`, `bpjs_expense_account_id`, `cash_account_id`, `bpjs_payable_account_id`, `journal_entry_id`, `notes`, `status`, `created_at`, `updated_at`, `overtime_amount`, `allowance_amount`, `bonus_amount`, `loan_deduction`, `other_deduction`, `pph21_amount`, `tax_record_id`) VALUES
(1, 1, '2026-07', '2026-07-06', 'EMP/202607/001', 'Pegawai Finance Test', 'TEST-FIN-001', 'Finance Staff', 5000000.00, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5000000.00, 21, 34, 4, 33, 23, 'Uji payroll pegawai Finance', 'posted', '2026-07-06 03:49:23', '2026-07-06 03:49:23', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL),
(2, 3, '2026-07', '2026-07-06', 'EMP/202607/002', 'aiinin', '9000000000000000', 'Finance Staff', 10000000.00, 90.0000, 90.0000, 5.0000, 5.0000, 5.0000, 4.0000, 9000000.00, 9000000.00, 500000.00, 500000.00, 500000.00, 400000.00, 9900000.00, 10000000.00, 100000.00, 21, 34, 3, 33, 24, 'Payroll diproses dari workspace FinStart.', 'posted', '2026-07-06 07:18:08', '2026-07-06 07:18:08', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payroll_tax_calculations`
--

CREATE TABLE `payroll_tax_calculations` (
  `id` bigint UNSIGNED NOT NULL,
  `tax_record_id` bigint UNSIGNED NOT NULL,
  `employee_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_nik` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_position` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_period` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ptkp_status` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ter_category` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `allowance_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `gross_income` decimal(15,2) NOT NULL DEFAULT '0.00',
  `ter_rate` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `pph21_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `take_home_pay` decimal(15,2) NOT NULL DEFAULT '0.00',
  `payroll_date` date DEFAULT NULL,
  `salary_expense_account_id` bigint UNSIGNED DEFAULT NULL,
  `cash_account_id` bigint UNSIGNED DEFAULT NULL,
  `payroll_journal_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('draft','posted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_tax_calculations`
--

INSERT INTO `payroll_tax_calculations` (`id`, `tax_record_id`, `employee_name`, `employee_nik`, `employee_position`, `tax_period`, `ptkp_status`, `ter_category`, `base_salary`, `allowance_amount`, `gross_income`, `ter_rate`, `pph21_amount`, `take_home_pay`, `payroll_date`, `salary_expense_account_id`, `cash_account_id`, `payroll_journal_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 'yu', '90hj', 'uiux', '2026-07', 'TK/0', 'A', 90000000.00, 0.00, 90000000.00, 0.2400, 21600000.00, 68400000.00, '2026-07-02', 21, 4, 14, 'posted', '2026-07-02 09:56:59', '2026-07-02 09:57:51');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` bigint UNSIGNED NOT NULL,
  `division_id` bigint UNSIGNED DEFAULT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `division_id`, `code`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'POS-TECH-DEV', 'Developer', 'Pengembang aplikasi.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(2, 2, 'POS-DESIGN-UIUX', 'UI/UX Designer', 'Perancang pengalaman dan antarmuka pengguna.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(3, 3, 'POS-MKT-STAFF', 'Marketing Staff', 'Staf pemasaran.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(4, 4, 'POS-FIN-STAFF', 'Finance Staff', 'Staf keuangan.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(5, 5, 'POS-OPS-STAFF', 'Operations Staff', 'Staf operasional.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(6, 6, 'POS-HR-STAFF', 'HR Staff', 'Staf SDM.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(7, NULL, 'POS-MANAGER', 'Manager', 'Jabatan manajerial lintas divisi.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(8, NULL, 'POS-SUPERVISOR', 'Supervisor', 'Jabatan supervisor lintas divisi.', 'active', '2026-07-06 03:29:54', '2026-07-06 03:29:54'),
(9, 1, 'POS-TECH-QA', 'Quality Assurance Engineer', 'Pengujian kualitas aplikasi.', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 1, 'POS-TECH-DATA', 'Data Analyst', 'Analisis data operasional dan bisnis.', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 2, 'POS-DESIGN-GRAPHIC', 'Graphic Designer', 'Desain grafis dan materi visual.', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 3, 'POS-MKT-SOCMED', 'Social Media Specialist', 'Pengelolaan kanal media sosial.', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 4, 'POS-FIN-ACCOUNT', 'Accounting Staff', 'Pencatatan dan rekonsiliasi akuntansi.', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(14, 5, 'POS-OPS-CUSTOMER', 'Customer Support', 'Dukungan pelanggan dan operasional layanan.', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 6, 'POS-HR-RECRUITER', 'Recruiter', 'Rekrutmen dan administrasi SDM.', 'active', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 7, 'FIN-MGR', 'Finance Manager', 'Manajer keuangan.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(17, 7, 'FIN-STF', 'Staff Finance', 'Staf keuangan.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(18, 8, 'HR-MGR', 'HR Manager', 'Manajer SDM.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(19, 8, 'HR-STF', 'Staff HR', 'Staf SDM.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(20, 9, 'TAX-STF', 'Staff Pajak', 'Staf administrasi pajak.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(21, 10, 'PM', 'Project Manager', 'Pengelola proyek.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38'),
(22, 11, 'OPS-STF', 'Staff Operasional', 'Staf operasional.', 'active', '2026-07-07 06:03:38', '2026-07-07 06:03:38');

-- --------------------------------------------------------

--
-- Table structure for table `projection_scenarios`
--

CREATE TABLE `projection_scenarios` (
  `id` bigint UNSIGNED NOT NULL,
  `projection_year` smallint UNSIGNED NOT NULL,
  `scenario_key` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revenue_factor` decimal(8,4) NOT NULL DEFAULT '1.0000',
  `expense_factor` decimal(8,4) NOT NULL DEFAULT '1.0000',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projection_scenarios`
--

INSERT INTO `projection_scenarios` (`id`, `projection_year`, `scenario_key`, `revenue_factor`, `expense_factor`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2026, 'optimistic', 1.1500, 0.9500, 'Skenario Optimistis FinStart', '2026-07-07 06:06:34', '2026-07-07 06:06:34'),
(3, 2026, 'normal', 1.0000, 1.0000, 'Skenario Normal FinStart', '2026-07-07 06:06:35', '2026-07-07 06:06:35'),
(4, 2026, 'pessimistic', 0.8500, 1.1000, 'Skenario Pesimistis FinStart', '2026-07-07 06:06:35', '2026-07-07 06:06:35');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` bigint UNSIGNED NOT NULL,
  `client_id` bigint UNSIGNED NOT NULL,
  `project_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('planning','ongoing','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planning',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `budget_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `milestones_json` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `client_id`, `project_name`, `project_code`, `contract_value`, `status`, `start_date`, `end_date`, `description`, `created_at`, `updated_at`, `budget_amount`, `milestones_json`) VALUES
(3, 3, 'Implementasi ERP Keuangan', 'DUM26-PRJ-001', 85000000.00, 'completed', '2026-01-06', '2026-03-22', 'Data dummy proyek implementasi erp keuangan untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(4, 4, 'Dashboard Kinerja Operasional', 'DUM26-PRJ-002', 120000000.00, 'ongoing', '2026-01-11', '2026-04-11', 'Data dummy proyek dashboard kinerja operasional untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(5, 5, 'Pengembangan Portal Pelanggan', 'DUM26-PRJ-003', 65000000.00, 'planning', '2026-01-16', NULL, 'Data dummy proyek pengembangan portal pelanggan untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(6, 6, 'Sistem Manajemen Dokumen', 'DUM26-PRJ-004', 98000000.00, 'ongoing', '2026-01-21', '2026-05-21', 'Data dummy proyek sistem manajemen dokumen untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(7, 7, 'Otomasi Laporan Bulanan', 'DUM26-PRJ-005', 75000000.00, 'completed', '2026-01-26', '2026-03-27', 'Data dummy proyek otomasi laporan bulanan untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(8, 8, 'Integrasi API Pembayaran', 'DUM26-PRJ-006', 110000000.00, 'ongoing', '2026-01-31', '2026-04-16', 'Data dummy proyek integrasi api pembayaran untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(9, 9, 'Redesign Website Korporat', 'DUM26-PRJ-007', 70000000.00, 'planning', '2026-02-05', NULL, 'Data dummy proyek redesign website korporat untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(10, 10, 'Sistem Inventori Cabang', 'DUM26-PRJ-008', 135000000.00, 'ongoing', '2026-02-10', '2026-05-26', 'Data dummy proyek sistem inventori cabang untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(11, 11, 'Aplikasi Monitoring Proyek', 'DUM26-PRJ-009', 90000000.00, 'completed', '2026-02-15', '2026-06-15', 'Data dummy proyek aplikasi monitoring proyek untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(12, 12, 'Pengembangan Mobile Sales', 'DUM26-PRJ-010', 115000000.00, 'ongoing', '2026-02-20', '2026-04-21', 'Data dummy proyek pengembangan mobile sales untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(13, 13, 'Analitik Data Penjualan', 'DUM26-PRJ-011', 62000000.00, 'completed', '2026-02-25', '2026-05-11', 'Data dummy proyek analitik data penjualan untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(14, 14, 'Portal Vendor Digital', 'DUM26-PRJ-012', 88000000.00, 'ongoing', '2026-03-02', '2026-05-31', 'Data dummy proyek portal vendor digital untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(15, 15, 'Sistem Absensi Terintegrasi', 'DUM26-PRJ-013', 54000000.00, 'planning', '2026-03-07', NULL, 'Data dummy proyek sistem absensi terintegrasi untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(16, 16, 'Platform E-Learning Internal', 'DUM26-PRJ-014', 76000000.00, 'ongoing', '2026-03-12', '2026-07-10', 'Data dummy proyek platform e-learning internal untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(17, 17, 'Dashboard Supply Chain', 'DUM26-PRJ-015', 125000000.00, 'completed', '2026-03-17', '2026-05-16', 'Data dummy proyek dashboard supply chain untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(18, 18, 'Optimasi Proses Procurement', 'DUM26-PRJ-016', 68000000.00, 'ongoing', '2026-03-22', '2026-06-05', 'Data dummy proyek optimasi proses procurement untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(19, 19, 'Sistem CRM Pelanggan', 'DUM26-PRJ-017', 92000000.00, 'planning', '2026-03-27', NULL, 'Data dummy proyek sistem crm pelanggan untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(20, 20, 'Migrasi Data Operasional', 'DUM26-PRJ-018', 83000000.00, 'ongoing', '2026-04-01', '2026-07-15', 'Data dummy proyek migrasi data operasional untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(21, 21, 'Aplikasi Helpdesk Internal', 'DUM26-PRJ-019', 59000000.00, 'completed', '2026-04-06', '2026-08-04', 'Data dummy proyek aplikasi helpdesk internal untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(22, 22, 'Portal Mitra Bisnis', 'DUM26-PRJ-020', 72000000.00, 'ongoing', '2026-04-11', '2026-06-10', 'Data dummy proyek portal mitra bisnis untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(23, 23, 'Sistem Reservasi Layanan', 'DUM26-PRJ-021', 64000000.00, 'completed', '2026-04-16', '2026-06-30', 'Data dummy proyek sistem reservasi layanan untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(24, 24, 'Manajemen Kontrak Digital', 'DUM26-PRJ-022', 97000000.00, 'ongoing', '2026-04-21', '2026-07-20', 'Data dummy proyek manajemen kontrak digital untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(25, 25, 'Dashboard Marketing Performance', 'DUM26-PRJ-023', 81000000.00, 'planning', '2026-04-26', NULL, 'Data dummy proyek dashboard marketing performance untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(26, 26, 'Integrasi Chat Customer Service', 'DUM26-PRJ-024', 66000000.00, 'ongoing', '2026-05-01', '2026-08-29', 'Data dummy proyek integrasi chat customer service untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(27, 27, 'Aplikasi Audit Internal', 'DUM26-PRJ-025', 104000000.00, 'completed', '2026-05-06', '2026-07-05', 'Data dummy proyek aplikasi audit internal untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(28, 28, 'Portal Knowledge Base', 'DUM26-PRJ-026', 57000000.00, 'ongoing', '2026-05-11', '2026-07-25', 'Data dummy proyek portal knowledge base untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(29, 29, 'Sistem Pengajuan Anggaran', 'DUM26-PRJ-027', 89000000.00, 'planning', '2026-05-16', NULL, 'Data dummy proyek sistem pengajuan anggaran untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(30, 30, 'Monitoring SLA Layanan', 'DUM26-PRJ-028', 94000000.00, 'ongoing', '2026-05-21', '2026-09-03', 'Data dummy proyek monitoring sla layanan untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(31, 31, 'Aplikasi Rekonsiliasi Bank', 'DUM26-PRJ-029', 73000000.00, 'completed', '2026-05-26', '2026-09-23', 'Data dummy proyek aplikasi rekonsiliasi bank untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL),
(32, 32, 'Platform Kolaborasi Tim', 'DUM26-PRJ-030', 101000000.00, 'ongoing', '2026-05-31', '2026-07-30', 'Data dummy proyek platform kolaborasi tim untuk pengujian modul CRM dan proyek FinStart.', '2026-07-06 09:41:17', '2026-07-06 09:41:17', 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_members`
--

CREATE TABLE `project_members` (
  `id` bigint UNSIGNED NOT NULL,
  `project_id` bigint UNSIGNED NOT NULL,
  `employee_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `role_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allocation_percent` decimal(5,2) NOT NULL DEFAULT '100.00',
  `assigned_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `member_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimated_cost` decimal(18,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_members`
--

INSERT INTO `project_members` (`id`, `project_id`, `employee_id`, `user_id`, `role_name`, `allocation_percent`, `assigned_at`, `created_at`, `updated_at`, `member_name`, `estimated_cost`) VALUES
(1, 3, 4, NULL, 'Project Lead', 100.00, '2026-01-06', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(2, 4, 5, NULL, 'Developer', 80.00, '2026-01-11', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(3, 5, 6, NULL, 'Designer', 60.00, '2026-01-16', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(4, 6, 7, NULL, 'Finance Support', 50.00, '2026-01-21', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(5, 7, 8, NULL, 'Operations Support', 40.00, '2026-01-26', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(6, 8, 9, NULL, 'Project Lead', 100.00, '2026-01-31', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(7, 9, 10, NULL, 'Developer', 80.00, '2026-02-05', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(8, 10, 11, NULL, 'Designer', 60.00, '2026-02-10', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(9, 11, 12, NULL, 'Finance Support', 50.00, '2026-02-15', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(10, 12, 13, NULL, 'Operations Support', 40.00, '2026-02-20', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(11, 13, 14, NULL, 'Project Lead', 100.00, '2026-02-25', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(12, 14, 15, NULL, 'Developer', 80.00, '2026-03-02', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(13, 15, 16, NULL, 'Designer', 60.00, '2026-03-07', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(14, 16, 17, NULL, 'Finance Support', 50.00, '2026-03-12', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(15, 17, 18, NULL, 'Operations Support', 40.00, '2026-03-17', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(16, 18, 19, NULL, 'Project Lead', 100.00, '2026-03-22', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(17, 19, 20, NULL, 'Developer', 80.00, '2026-03-27', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(18, 20, 21, NULL, 'Designer', 60.00, '2026-04-01', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(19, 21, 22, NULL, 'Finance Support', 50.00, '2026-04-06', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(20, 22, 23, NULL, 'Operations Support', 40.00, '2026-04-11', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(21, 23, 24, NULL, 'Project Lead', 100.00, '2026-04-16', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(22, 24, 25, NULL, 'Developer', 80.00, '2026-04-21', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(23, 25, 26, NULL, 'Designer', 60.00, '2026-04-26', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(24, 26, 27, NULL, 'Finance Support', 50.00, '2026-05-01', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(25, 27, 28, NULL, 'Operations Support', 40.00, '2026-05-06', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(26, 28, 29, NULL, 'Project Lead', 100.00, '2026-05-11', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(27, 29, 30, NULL, 'Developer', 80.00, '2026-05-16', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(28, 30, 31, NULL, 'Designer', 60.00, '2026-05-21', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(29, 31, 32, NULL, 'Finance Support', 50.00, '2026-05-26', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00),
(30, 32, 33, NULL, 'Operations Support', 40.00, '2026-05-31', '2026-07-06 09:41:17', '2026-07-06 09:41:17', NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'finance_manager', 'Default FinStart finance manager role', '2026-07-07 04:02:04', '2026-07-07 04:02:04'),
(2, 'admin', 'Administrator sistem dengan akses penuh.', '2026-07-07 06:03:37', '2026-07-07 06:03:37'),
(3, 'finance', 'Staf keuangan untuk transaksi operasional dan sub-ledger.', '2026-07-07 06:03:37', '2026-07-07 06:03:37'),
(4, 'hr', 'Mengelola data SDM dan payroll.', '2026-07-07 06:03:37', '2026-07-07 06:03:37'),
(5, 'tax', 'Mengelola administrasi serta pelaporan pajak internal.', '2026-07-07 06:03:37', '2026-07-07 06:03:37'),
(6, 'project_manager', 'Mengelola klien, proyek, dan alokasi tim.', '2026-07-07 06:03:37', '2026-07-07 06:03:37'),
(7, 'director', 'Membaca ringkasan dan menyetujui/posting jurnal.', '2026-07-07 06:03:37', '2026-07-07 06:03:37'),
(8, 'auditor', 'Akses baca untuk audit dan pemeriksaan.', '2026-07-07 06:03:37', '2026-07-07 06:03:37');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint UNSIGNED NOT NULL,
  `subscription_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `billing_cycle` enum('monthly','quarterly','yearly') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `start_date` date DEFAULT NULL,
  `renewal_date` date DEFAULT NULL,
  `payment_terms_days` smallint UNSIGNED NOT NULL DEFAULT '0',
  `status` enum('active','inactive','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `subscription_name`, `provider_name`, `category`, `amount`, `billing_cycle`, `start_date`, `renewal_date`, `payment_terms_days`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'gpt', 'openai', 'Software', 1800000.00, 'monthly', '2026-07-03', '2026-08-03', 30, 'active', NULL, '2026-07-03 03:40:11', '2026-07-03 03:40:11'),
(2, 'Figma Professional', 'Figma', 'Design', 2400000.00, 'monthly', '2026-01-01', '2026-08-01', 0, 'active', 'Lisensi desain tim dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(3, 'Google Workspace Business', 'Google', 'Productivity', 3600000.00, 'monthly', '2026-01-01', '2026-08-01', 0, 'active', 'Email dan kolaborasi dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(4, 'GitHub Team', 'GitHub', 'Development', 1800000.00, 'monthly', '2026-01-01', '2026-08-01', 0, 'active', 'Repositori pengembangan dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(5, 'Cloud VPS Starter', 'CloudKita', 'Infrastructure', 4200000.00, 'monthly', '2026-02-01', '2026-08-01', 7, 'active', 'Server aplikasi dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(6, 'Canva Teams', 'Canva', 'Marketing', 1500000.00, 'monthly', '2026-02-01', '2026-08-01', 0, 'active', 'Konten pemasaran dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(7, 'Zoom Workplace', 'Zoom', 'Communication', 1200000.00, 'monthly', '2026-02-01', '2026-08-01', 0, 'active', 'Rapat daring dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(8, 'Notion Business', 'Notion', 'Productivity', 1750000.00, 'monthly', '2026-03-01', '2026-08-01', 0, 'active', 'Dokumentasi internal dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(9, 'Mailchimp Standard', 'Mailchimp', 'Marketing', 2100000.00, 'monthly', '2026-03-01', '2026-08-01', 0, 'active', 'Email marketing dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 'Sentry Team', 'Sentry', 'Development', 1300000.00, 'monthly', '2026-03-01', '2026-08-01', 0, 'active', 'Monitoring error dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 'Jira Software', 'Atlassian', 'Project Management', 2500000.00, 'monthly', '2026-04-01', '2026-08-01', 0, 'active', 'Manajemen proyek dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 'Miro Business', 'Miro', 'Collaboration', 1400000.00, 'monthly', '2026-04-01', '2026-08-01', 0, 'active', 'Kolaborasi visual dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 'Adobe Creative Cloud', 'Adobe', 'Design', 9600000.00, 'yearly', '2026-01-01', '2027-01-01', 0, 'active', 'Lisensi desain tahunan dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(14, 'Domain finstart-demo.test', 'Domainesia', 'Infrastructure', 450000.00, 'yearly', '2026-01-01', '2027-01-01', 0, 'active', 'Domain dummy internal.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 'Antivirus Endpoint', 'SecureTech', 'Security', 3200000.00, 'yearly', '2026-02-01', '2027-02-01', 0, 'active', 'Proteksi endpoint dummy.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 'Cloud Storage Archive', 'SimpanAman', 'Infrastructure', 2800000.00, 'monthly', '2026-05-01', '2026-08-01', 0, 'inactive', 'Arsip cloud dummy nonaktif.', '2026-07-06 09:41:17', '2026-07-06 09:41:17');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_bill_runs`
--

CREATE TABLE `subscription_bill_runs` (
  `id` bigint UNSIGNED NOT NULL,
  `subscription_id` bigint UNSIGNED NOT NULL,
  `bill_id` bigint UNSIGNED NOT NULL,
  `billing_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tax_records`
--

CREATE TABLE `tax_records` (
  `id` bigint UNSIGNED NOT NULL,
  `tax_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_period` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `due_date` date DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `status` enum('draft','unpaid','paid','overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tax_records`
--

INSERT INTO `tax_records` (`id`, `tax_type`, `tax_period`, `tax_number`, `amount`, `due_date`, `payment_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'PPN', '2026-07', '908', 90000.00, '2026-07-02', '2026-07-02', 'paid', 'ppn juli', '2026-07-02 09:20:52', '2026-07-02 09:21:04'),
(2, 'PPh 21', '2026-07', '654', 1636000.00, '2026-07-04', '2026-07-02', 'paid', 'Dibuat dari kalkulasi pajak FinStart. Dasar: Pendapatan Rp 81.800.000. Tarif dipilih Finance: 2%. Jurnal posted periode: Juli 2026.', '2026-07-02 09:31:18', '2026-07-02 09:31:45'),
(5, 'PPh 21', '2026-07', NULL, 21600000.00, '2026-07-04', NULL, 'overdue', 'PPh 21 pegawai: yu. PTKP TK/0 / TER A. Bruto 90000000. Tarif TER 24.00%.', '2026-07-02 09:56:59', '2026-07-06 02:51:26'),
(6, 'PPh 23', '2026-07', NULL, 10000.00, NULL, NULL, 'unpaid', 'Dibuat otomatis dari tagihan vendor 999. Vendor: hkjjkjk. Objek: Jasa. Tarif efektif: 2%.', '2026-07-02 13:43:09', '2026-07-02 13:43:09'),
(7, 'PPh Final', '2026-07', NULL, 4390000.00, '2026-07-25', NULL, 'unpaid', 'Dibuat dari kalkulasi pajak FinStart. Dasar: Pendapatan Rp 87.800.000. Tarif dipilih Finance: 5%. Jurnal posted periode: Juli 2026.', '2026-07-02 13:44:09', '2026-07-02 14:00:18'),
(8, 'PPN', '2026-07', '898', 275000.00, NULL, '2026-07-02', 'paid', 'Dibuat otomatis dari penutupan PPN Masa 2026-07. PPN Keluaran 300000. PPN Masukan 25000.', '2026-07-02 13:59:47', '2026-07-02 14:00:10'),
(9, 'PPN', '2026-01', 'DUM26-TAX-001', 1250000.00, '2026-07-08', NULL, 'unpaid', 'Data dummy PPN untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(10, 'PPh 21', '2026-02', 'DUM26-TAX-002', 860000.00, '2026-07-11', NULL, 'draft', 'Data dummy PPh 21 untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(11, 'PPh 23', '2026-03', 'DUM26-TAX-003', 430000.00, '2026-07-14', '2026-07-14', 'paid', 'Data dummy PPh 23 untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(12, 'PPh 25', '2026-04', 'DUM26-TAX-004', 975000.00, '2026-07-17', NULL, 'unpaid', 'Data dummy PPh 25 untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(13, 'PPN', '2026-05', 'DUM26-TAX-005', 1420000.00, '2026-07-20', NULL, 'draft', 'Data dummy PPN untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(14, 'PPh 21', '2026-06', 'DUM26-TAX-006', 920000.00, '2026-07-23', '2026-07-23', 'paid', 'Data dummy PPh 21 untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(15, 'PPh 23', '2026-07', 'DUM26-TAX-007', 510000.00, '2026-07-26', NULL, 'unpaid', 'Data dummy PPh 23 untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(16, 'PPh 25', '2026-08', 'DUM26-TAX-008', 1025000.00, '2026-07-29', NULL, 'draft', 'Data dummy PPh 25 untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(17, 'PPN', '2026-09', 'DUM26-TAX-009', 1350000.00, '2026-08-01', '2026-08-01', 'paid', 'Data dummy PPN untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(18, 'PPh 21', '2026-10', 'DUM26-TAX-010', 880000.00, '2026-08-04', NULL, 'unpaid', 'Data dummy PPh 21 untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(19, 'PPh 23', '2026-11', 'DUM26-TAX-011', 460000.00, '2026-08-07', NULL, 'draft', 'Data dummy PPh 23 untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(20, 'PPh 25', '2026-12', 'DUM26-TAX-012', 1100000.00, '2026-08-10', '2026-08-10', 'paid', 'Data dummy PPh 25 untuk pengujian modul perpajakan.', '2026-07-06 09:41:17', '2026-07-06 09:41:17'),
(21, 'PPh 21', '2026-07', NULL, 1756000.00, '2026-08-09', NULL, 'unpaid', 'Dibuat dari kalkulasi dengan dasar Pendapatan.', '2026-07-07 06:07:27', '2026-07-07 06:07:27');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_taxes`
--

CREATE TABLE `transaction_taxes` (
  `id` bigint UNSIGNED NOT NULL,
  `source_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_id` bigint UNSIGNED NOT NULL,
  `tax_type` enum('PPN_OUTPUT','PPN_INPUT','PPH23') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_period` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dpp_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tax_rate` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `tax_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `is_creditable` tinyint(1) NOT NULL DEFAULT '0',
  `pph23_object` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor_has_npwp` tinyint(1) DEFAULT NULL,
  `tax_record_id` bigint UNSIGNED DEFAULT NULL,
  `journal_entry_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('draft','posted','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction_taxes`
--

INSERT INTO `transaction_taxes` (`id`, `source_type`, `source_id`, `tax_type`, `tax_period`, `dpp_amount`, `tax_rate`, `tax_amount`, `is_creditable`, `pph23_object`, `vendor_has_npwp`, `tax_record_id`, `journal_entry_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'invoice', 3, 'PPN_OUTPUT', '2026-07', 6000000.00, 5.0000, 300000.00, 0, NULL, NULL, NULL, 15, 'closed', '2026-07-02 13:42:04', '2026-07-02 13:59:47'),
(2, 'bill', 2, 'PPN_INPUT', '2026-07', 500000.00, 5.0000, 25000.00, 1, NULL, NULL, NULL, 17, 'closed', '2026-07-02 13:43:01', '2026-07-02 13:59:47'),
(3, 'bill', 2, 'PPH23', '2026-07', 500000.00, 2.0000, 10000.00, 0, 'Jasa', 1, 6, 17, 'posted', '2026-07-02 13:43:01', '2026-07-02 13:43:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `name`, `email`, `password_hash`, `phone`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'Finance Manager', 'finance@kedata.id', 'pbkdf2_sha256$120000$a6ee4dccf35406aa0827bf5bb7be6060$06015caeb3b5f2ccf6e68a892c0071b4035c676fdc3dc1d3a28167ec8487cdc4', NULL, 'active', '2026-07-07 13:06:34', '2026-07-07 04:02:04', '2026-07-07 06:06:34');

-- --------------------------------------------------------

--
-- Table structure for table `user_security_settings`
--

CREATE TABLE `user_security_settings` (
  `user_id` bigint UNSIGNED NOT NULL,
  `login_alerts` tinyint(1) NOT NULL DEFAULT '1',
  `session_alerts` tinyint(1) NOT NULL DEFAULT '1',
  `mfa_status` enum('not_configured','pending','enabled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_configured',
  `mfa_secret` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mfa_pending_secret` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_security_settings`
--

-- Data runtime tabel `user_security_settings` sengaja tidak disertakan pada repository.

-- --------------------------------------------------------

--
-- Table structure for table `vat_period_closings`
--

CREATE TABLE `vat_period_closings` (
  `id` bigint UNSIGNED NOT NULL,
  `tax_period` char(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `output_vat` decimal(15,2) NOT NULL DEFAULT '0.00',
  `input_vat` decimal(15,2) NOT NULL DEFAULT '0.00',
  `net_vat` decimal(15,2) NOT NULL DEFAULT '0.00',
  `due_date` date DEFAULT NULL,
  `status` enum('payable','credit','paid') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_record_id` bigint UNSIGNED DEFAULT NULL,
  `closing_journal_id` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `closed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vat_period_closings`
--

INSERT INTO `vat_period_closings` (`id`, `tax_period`, `output_vat`, `input_vat`, `net_vat`, `due_date`, `status`, `tax_record_id`, `closing_journal_id`, `notes`, `closed_at`, `created_at`, `updated_at`) VALUES
(1, '2026-07', 300000.00, 25000.00, 275000.00, NULL, 'paid', 8, 19, NULL, '2026-07-02 20:59:47', '2026-07-02 13:59:47', '2026-07-02 14:00:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `fk_accounts_parent` (`parent_id`),
  ADD KEY `idx_accounts_type` (`type`),
  ADD KEY `idx_accounts_status` (`status`);

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_logs_user` (`user_id`),
  ADD KEY `idx_activity_logs_module` (`module`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_code` (`asset_code`),
  ADD KEY `idx_assets_status` (`status`);

--
-- Indexes for table `asset_depreciations`
--
ALTER TABLE `asset_depreciations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_asset_depreciation_period` (`asset_id`,`depreciation_period`),
  ADD KEY `idx_asset_depreciation_period` (`depreciation_period`),
  ADD KEY `idx_asset_depreciation_journal` (`journal_entry_id`);

--
-- Indexes for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_auth_sessions_user` (`user_id`),
  ADD KEY `idx_auth_sessions_expiry` (`expires_at`);

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bill_number` (`bill_number`),
  ADD KEY `idx_bills_project` (`project_id`),
  ADD KEY `idx_bills_status` (`status`);

--
-- Indexes for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bill_items_bill` (`bill_id`);

--
-- Indexes for table `bill_payments`
--
ALTER TABLE `bill_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bill_payments_journal` (`journal_entry_id`),
  ADD KEY `idx_bill_payments_bill` (`bill_id`);

--
-- Indexes for table `bpjs_configurations`
--
ALTER TABLE `bpjs_configurations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `budget_allocations`
--
ALTER TABLE `budget_allocations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_budget_allocations_period` (`budget_year`,`budget_month`,`scenario_key`),
  ADD KEY `idx_budget_allocations_account` (`account_id`),
  ADD KEY `idx_budget_allocations_division` (`division_id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_clients_status` (`status`),
  ADD KEY `idx_clients_name` (`company_name`);

--
-- Indexes for table `company_settings`
--
ALTER TABLE `company_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `divisions`
--
ALTER TABLE `divisions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_divisions_code` (`code`),
  ADD UNIQUE KEY `uq_divisions_name` (`name`),
  ADD KEY `idx_divisions_status` (`status`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_employees_employee_code` (`employee_code`),
  ADD UNIQUE KEY `uq_employees_nik` (`nik`),
  ADD KEY `idx_employees_status` (`employment_status`),
  ADD KEY `idx_employees_division_id` (`division_id`),
  ADD KEY `idx_employees_position_id` (`position_id`),
  ADD KEY `idx_employees_employment_status` (`employment_status`);

--
-- Indexes for table `financial_projections`
--
ALTER TABLE `financial_projections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_financial_projection_month` (`projection_year`,`projection_month`),
  ADD KEY `idx_financial_projection_year` (`projection_year`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `idx_invoices_client` (`client_id`),
  ADD KEY `idx_invoices_project` (`project_id`),
  ADD KEY `idx_invoices_status` (`status`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_invoice_items_invoice` (`invoice_id`);

--
-- Indexes for table `invoice_payments`
--
ALTER TABLE `invoice_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_payments_journal` (`journal_entry_id`),
  ADD KEY `idx_invoice_payments_invoice` (`invoice_id`);

--
-- Indexes for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `voucher_number` (`voucher_number`),
  ADD KEY `fk_journal_created_by` (`created_by`),
  ADD KEY `fk_journal_approved_by` (`approved_by`),
  ADD KEY `idx_journal_status` (`status`),
  ADD KEY `idx_journal_date` (`transaction_date`),
  ADD KEY `idx_journal_entries_division` (`division_id`);

--
-- Indexes for table `journal_lines`
--
ALTER TABLE `journal_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_journal_lines_entry` (`journal_entry_id`),
  ADD KEY `idx_journal_lines_account` (`account_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user` (`user_id`),
  ADD KEY `idx_notifications_read` (`is_read`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_password_reset_user` (`user_id`),
  ADD KEY `idx_password_reset_expiry` (`expires_at`);

--
-- Indexes for table `payroll_records`
--
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

--
-- Indexes for table `payroll_tax_calculations`
--
ALTER TABLE `payroll_tax_calculations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_payroll_tax_record` (`tax_record_id`),
  ADD KEY `idx_payroll_tax_period` (`tax_period`),
  ADD KEY `idx_payroll_employee_nik` (`employee_nik`),
  ADD KEY `fk_payroll_salary_expense` (`salary_expense_account_id`),
  ADD KEY `fk_payroll_cash_account` (`cash_account_id`),
  ADD KEY `fk_payroll_journal` (`payroll_journal_id`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_positions_code` (`code`),
  ADD KEY `idx_positions_division_id` (`division_id`),
  ADD KEY `idx_positions_status` (`status`);

--
-- Indexes for table `projection_scenarios`
--
ALTER TABLE `projection_scenarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_projection_scenario_year` (`projection_year`,`scenario_key`),
  ADD KEY `idx_projection_scenario_year` (`projection_year`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `project_code` (`project_code`),
  ADD KEY `idx_projects_client` (`client_id`),
  ADD KEY `idx_projects_status` (`status`);

--
-- Indexes for table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_project_members_employee` (`employee_id`),
  ADD KEY `fk_project_members_user` (`user_id`),
  ADD KEY `idx_project_members_project` (`project_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscriptions_status` (`status`);

--
-- Indexes for table `subscription_bill_runs`
--
ALTER TABLE `subscription_bill_runs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_subscription_billing_date` (`subscription_id`,`billing_date`),
  ADD UNIQUE KEY `uq_subscription_bill` (`bill_id`),
  ADD KEY `idx_subscription_bill_runs_subscription` (`subscription_id`),
  ADD KEY `idx_subscription_bill_runs_billing_date` (`billing_date`);

--
-- Indexes for table `tax_records`
--
ALTER TABLE `tax_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tax_status` (`status`);

--
-- Indexes for table `transaction_taxes`
--
ALTER TABLE `transaction_taxes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_transaction_tax` (`source_type`,`source_id`,`tax_type`),
  ADD KEY `idx_transaction_taxes_period` (`tax_period`),
  ADD KEY `idx_transaction_taxes_record` (`tax_record_id`),
  ADD KEY `idx_transaction_taxes_status` (`status`),
  ADD KEY `fk_transaction_taxes_journal` (`journal_entry_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--
-- Indexes for table `user_security_settings`
--
ALTER TABLE `user_security_settings`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `vat_period_closings`
--
ALTER TABLE `vat_period_closings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_vat_period` (`tax_period`),
  ADD UNIQUE KEY `uq_vat_tax_record` (`tax_record_id`),
  ADD KEY `idx_vat_closing_status` (`status`),
  ADD KEY `fk_vat_period_journal` (`closing_journal_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `asset_depreciations`
--
ALTER TABLE `asset_depreciations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bills`
--
ALTER TABLE `bills`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `bill_items`
--
ALTER TABLE `bill_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `bill_payments`
--
ALTER TABLE `bill_payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `budget_allocations`
--
ALTER TABLE `budget_allocations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `company_settings`
--
ALTER TABLE `company_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `divisions`
--
ALTER TABLE `divisions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `financial_projections`
--
ALTER TABLE `financial_projections`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `invoice_payments`
--
ALTER TABLE `invoice_payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `journal_entries`
--
ALTER TABLE `journal_entries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT for table `journal_lines`
--
ALTER TABLE `journal_lines`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payroll_records`
--
ALTER TABLE `payroll_records`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payroll_tax_calculations`
--
ALTER TABLE `payroll_tax_calculations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `projection_scenarios`
--
ALTER TABLE `projection_scenarios`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `project_members`
--
ALTER TABLE `project_members`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `subscription_bill_runs`
--
ALTER TABLE `subscription_bill_runs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tax_records`
--
ALTER TABLE `tax_records`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `transaction_taxes`
--
ALTER TABLE `transaction_taxes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vat_period_closings`
--
ALTER TABLE `vat_period_closings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `fk_accounts_parent` FOREIGN KEY (`parent_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_activity_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `asset_depreciations`
--
ALTER TABLE `asset_depreciations`
  ADD CONSTRAINT `fk_asset_depreciation_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asset_depreciation_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  ADD CONSTRAINT `fk_auth_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `fk_bills_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD CONSTRAINT `fk_bill_items_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bill_payments`
--
ALTER TABLE `bill_payments`
  ADD CONSTRAINT `fk_bill_payments_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bill_payments_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoices_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invoices_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `fk_invoice_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice_payments`
--
ALTER TABLE `invoice_payments`
  ADD CONSTRAINT `fk_invoice_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invoice_payments_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD CONSTRAINT `fk_journal_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_journal_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `journal_lines`
--
ALTER TABLE `journal_lines`
  ADD CONSTRAINT `fk_journal_lines_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_journal_lines_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payroll_records`
--
ALTER TABLE `payroll_records`
  ADD CONSTRAINT `fk_payroll_records_bpjs_expense` FOREIGN KEY (`bpjs_expense_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_bpjs_payable` FOREIGN KEY (`bpjs_payable_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_cash_account` FOREIGN KEY (`cash_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_payroll_records_salary_expense` FOREIGN KEY (`salary_expense_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `payroll_tax_calculations`
--
ALTER TABLE `payroll_tax_calculations`
  ADD CONSTRAINT `fk_payroll_cash_account` FOREIGN KEY (`cash_account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payroll_journal` FOREIGN KEY (`payroll_journal_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payroll_salary_expense` FOREIGN KEY (`salary_expense_account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payroll_tax_record` FOREIGN KEY (`tax_record_id`) REFERENCES `tax_records` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `positions`
--
ALTER TABLE `positions`
  ADD CONSTRAINT `fk_positions_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `fk_project_members_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_project_members_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_project_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `subscription_bill_runs`
--
ALTER TABLE `subscription_bill_runs`
  ADD CONSTRAINT `fk_subscription_bill_runs_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_subscription_bill_runs_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaction_taxes`
--
ALTER TABLE `transaction_taxes`
  ADD CONSTRAINT `fk_transaction_taxes_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transaction_taxes_record` FOREIGN KEY (`tax_record_id`) REFERENCES `tax_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_security_settings`
--
ALTER TABLE `user_security_settings`
  ADD CONSTRAINT `fk_user_security_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vat_period_closings`
--
ALTER TABLE `vat_period_closings`
  ADD CONSTRAINT `fk_vat_period_journal` FOREIGN KEY (`closing_journal_id`) REFERENCES `journal_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vat_period_record` FOREIGN KEY (`tax_record_id`) REFERENCES `tax_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
