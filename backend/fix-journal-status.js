const db = require('./config/db');

async function fixJournalStatus() {
  try {
    console.log('Checking journal_entries status column...');
    
    // First, check the current column definition
    const [columns] = await db.query(`
      SHOW COLUMNS FROM journal_entries LIKE 'status'
    `);
    
    console.log('Current status column:', columns);
    
    // Now, modify the column to have 'cancelled'
    console.log('Updating status column enum...');
    await db.query(`
      ALTER TABLE journal_entries
      MODIFY COLUMN status
        enum('draft','approved','posted','rejected','cancelled')
        COLLATE utf8mb4_unicode_ci
        NOT NULL DEFAULT 'draft'
    `);
    
    console.log('Successfully updated journal_entries.status column!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing journal status:', error);
    process.exit(1);
  }
}

fixJournalStatus();