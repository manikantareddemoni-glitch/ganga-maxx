import { pool } from './config/db.js';

async function runMigration() {
  console.log('Running MFA DB migration...');
  const connection = await pool.getConnection();
  try {
    const queries = [
      "ALTER TABLE users ADD COLUMN company_name VARCHAR(255) NULL;",
      "ALTER TABLE users ADD COLUMN mobile_number VARCHAR(50) NULL UNIQUE;",
      "ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE users ADD COLUMN mobile_verified BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE users ADD COLUMN email_otp VARCHAR(10) NULL;",
      "ALTER TABLE users ADD COLUMN email_otp_expiry TIMESTAMP NULL;",
      "ALTER TABLE users ADD COLUMN mobile_otp VARCHAR(10) NULL;",
      "ALTER TABLE users ADD COLUMN mobile_otp_expiry TIMESTAMP NULL;",
      "ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0;",
      "ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL;"
    ];

    for (let q of queries) {
      try {
        await connection.query(q);
        console.log(`Executed: ${q}`);
      } catch (err) {
        // Ignore duplicate column errors (errno 1060)
        if (err.errno === 1060) {
          console.log(`Column already exists, skipping: ${q}`);
        } else {
          console.error(`Error executing ${q}:`, err.message);
        }
      }
    }
    
    // Auto-verify existing demo users for convenience
    await connection.query("UPDATE users SET email_verified = TRUE WHERE email = 'admin@gangamaxx.com' OR email = 'demo@gangamaxx.com'");

    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
