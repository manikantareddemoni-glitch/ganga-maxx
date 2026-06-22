import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// Use DATABASE_URL environment variable for Supabase/Render connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || env.db.connectionString,
  ssl: { rejectUnauthorized: false } // Required for Supabase / Render
});

export async function query(sql, params = []) {
  // Convert MySQL '?' to PostgreSQL '$1', '$2', etc.
  // Also replace double quotes with single quotes to fix Postgres syntax errors for string literals
  let index = 1;
  const pgSql = sql.replace(/\?/g, () => `$${index++}`).replace(/"/g, "'");
  
  try {
    // Determine if query is an INSERT/UPDATE/DELETE
    const isModification = pgSql.trim().toUpperCase().startsWith('INSERT') || 
                           pgSql.trim().toUpperCase().startsWith('UPDATE') || 
                           pgSql.trim().toUpperCase().startsWith('DELETE');

    // If it is an INSERT and does not have a RETURNING clause, add one to mock MySQL's insertId
    let finalQuery = pgSql;
    if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
        finalQuery += ' RETURNING id';
    }

    const result = await pool.query(finalQuery, params);
    
    if (isModification) {
      // Mock MySQL result object which code expects
      return {
        affectedRows: result.rowCount,
        insertId: result.rows[0]?.id || null,
        rows: result.rows
      };
    }
    
    // For SELECT queries, return the rows array
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export { pool };
