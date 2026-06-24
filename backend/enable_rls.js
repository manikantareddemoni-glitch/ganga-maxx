import { query } from './src/config/db.js';

async function enableRLS() {
  try {
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`Found ${tables.length} tables in the public schema.`);
    
    for (const row of tables) {
      const tableName = row.table_name;
      console.log(`Enabling RLS on table: ${tableName}`);
      await query(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;`);
    }
    
    console.log('Successfully enabled RLS on all tables!');
    process.exit(0);
  } catch (error) {
    console.error('Error enabling RLS:', error);
    process.exit(1);
  }
}

enableRLS();
