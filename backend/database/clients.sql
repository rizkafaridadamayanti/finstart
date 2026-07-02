USE finstart_db;

CREATE TABLE IF NOT EXISTS clients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    company_name VARCHAR(150) NOT NULL,
    pic_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NULL,
    phone VARCHAR(30) NULL,

    industry VARCHAR(100) NULL,
    category VARCHAR(100) NULL,
    location VARCHAR(150) NULL,
    address TEXT NULL,

    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;