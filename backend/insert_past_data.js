import { query } from './src/config/db.js';

async function insertPastPayments() {
  const pastPayments = [
    // Jan
    { c_id: 1, i_id: 2, amt: 1650000, date: '2026-01-15', ref: 'GMX-PAY-JAN-01' },
    // Feb
    { c_id: 2, i_id: 3, amt: 1820000, date: '2026-02-14', ref: 'GMX-PAY-FEB-01' },
    // Mar
    { c_id: 3, i_id: 4, amt: 1585000, date: '2026-03-20', ref: 'GMX-PAY-MAR-01' },
    // Apr
    { c_id: 4, i_id: 5, amt: 2140000, date: '2026-04-10', ref: 'GMX-PAY-APR-01' }
  ];

  try {
    for (const p of pastPayments) {
      await query(
        `INSERT INTO payments (customer_id, invoice_id, amount, payment_method, reference_no, payment_date) 
         VALUES (?, ?, ?, 'Bank Transfer', ?, ?) 
         ON CONFLICT (reference_no) DO NOTHING`,
        [p.c_id, p.i_id, p.amt, p.ref, p.date]
      );
      console.log(`Inserted payment ${p.ref}`);
    }
    console.log("Done inserting past payments.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

insertPastPayments();
