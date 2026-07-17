-- Fix journal_entries.status enum to include 'cancelled'
ALTER TABLE journal_entries 
MODIFY COLUMN status 
ENUM('draft','approved','posted','rejected','cancelled') 
COLLATE utf8mb4_unicode_ci 
NOT NULL DEFAULT 'draft';