USE finstart_db;

CREATE TABLE IF NOT EXISTS projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    client_id BIGINT UNSIGNED NOT NULL,

    project_name VARCHAR(150) NOT NULL,
    project_code VARCHAR(50) NOT NULL UNIQUE,

    contract_value DECIMAL(15,2) NOT NULL DEFAULT 0.00,

    status ENUM(
        'planning',
        'ongoing',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'planning',

    start_date DATE NULL,
    end_date DATE NULL,

    description TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_client
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_projects_dates
        CHECK (
            end_date IS NULL
            OR start_date IS NULL
            OR end_date >= start_date
        )
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;