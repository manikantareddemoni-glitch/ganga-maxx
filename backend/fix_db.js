import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ganga_maxx_credit'
  });

  try {
    await connection.query("ALTER TABLE users MODIFY COLUMN status ENUM('active', 'disabled', 'pending') NOT NULL DEFAULT 'active'");
    await connection.query("ALTER TABLE users ADD COLUMN mobile_number VARCHAR(40) NULL");
    await connection.query("ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE");
    await connection.query("ALTER TABLE users ADD COLUMN mobile_verified BOOLEAN NOT NULL DEFAULT FALSE");
    await connection.query("ALTER TABLE users ADD COLUMN email_otp VARCHAR(10) NULL");
    await connection.query("ALTER TABLE users ADD COLUMN email_otp_expiry DATETIME NULL");
    await connection.query("ALTER TABLE users ADD COLUMN mobile_otp VARCHAR(10) NULL");
    await connection.query("ALTER TABLE users ADD COLUMN mobile_otp_expiry DATETIME NULL");
    await connection.query("ALTER TABLE users ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0");
    await connection.query("ALTER TABLE users ADD COLUMN locked_until DATETIME NULL");
    console.log('Columns added successfully.');
  } catch(e) {
    console.error('Error adding columns:', e.message);
  }
  process.exit();
}
fix();
