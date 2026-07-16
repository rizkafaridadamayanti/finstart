ALTER TABLE journal_entries
  MODIFY COLUMN status
    enum('draft','approved','posted','rejected','cancelled')
    COLLATE utf8mb4_unicode_ci
    NOT NULL DEFAULT 'draft';
