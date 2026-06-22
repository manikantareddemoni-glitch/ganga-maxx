import { pool } from './config/db.js';

async function runMigration() {
  console.log('Running Enterprise Auth DB migration...');
  const connection = await pool.getConnection();
  try {
    const queries = [
      "ALTER TABLE users ADD COLUMN gst_number VARCHAR(100) NULL;",
      "ALTER TABLE users ADD COLUMN industry_type VARCHAR(100) NULL;",
      "ALTER TABLE users ADD COLUMN designation VARCHAR(100) NULL;"
    ];

    for (let q of queries) {
      try {
        await connection.query(q);
        console.log(`Executed: ${q}`);
      } catch (err) {
        if (err.errno === 1060) {
          console.log(`Column already exists, skipping: ${q}`);
        } else {
          console.error(`Error executing ${q}:`, err.message);
        }
      }
    }

    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
