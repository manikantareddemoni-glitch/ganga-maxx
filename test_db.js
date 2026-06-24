import { query } from './backend/src/config/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function test() {
  try {
    const res = await query('SELECT * FROM users WHERE email = ? AND status = "active"', ['admin@gangamaxx.com']);
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
