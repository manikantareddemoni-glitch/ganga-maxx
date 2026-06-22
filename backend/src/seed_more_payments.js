import { query } from './config/db.js';

async function seed() {
  try {
    await query("INSERT INTO payments (customer_id, invoice_id, amount, method, reference_no, payment_date) VALUES (1, NULL, 150000, 'Bank Transfer', 'REF-JAN-1', '2026-01-15'), (2, NULL, 210000, 'Check', 'REF-FEB-1', '2026-02-18'), (3, NULL, 185000, 'Card', 'REF-MAR-1', '2026-03-22'), (1, NULL, 250000, 'Bank Transfer', 'REF-APR-1', '2026-04-10')");
    console.log('Inserted additional mock payments for Jan-Apr');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
seed();
