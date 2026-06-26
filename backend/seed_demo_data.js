import { query } from './src/config/db.js';

async function seedDemoData() {
  console.log("Starting DB Seed for Presentation...");

  try {
    // 1. Truncate tables to ensure a clean slate
    await query(`TRUNCATE TABLE payments, invoices, customers, aging_reports, notifications, account_statements RESTART IDENTITY CASCADE`);
    console.log("Cleared existing data.");

    // 2. Insert Customers
    const customers = [
      ['Metro Fresh Retail', 'contact@metrofresh.in', '9876543210', '10000000', '1500000'],
      ['Deccan Wholesale Co.', 'finance@deccan.in', '9876543211', '8000000', '500000'],
      ['Krishna Super Mart', 'accounts@krishna.in', '9876543212', '12000000', '2500000'],
      ['Global Foods Ltd', 'payable@globalfoods.in', '9876543213', '20000000', '0'],
      ['City Mart Hyper', 'billing@citymart.in', '9876543214', '5000000', '200000'],
    ];

    for (let c of customers) {
      await query(`INSERT INTO customers (company_name, email, phone, credit_limit, current_balance) VALUES (?, ?, ?, ?, ?)`, c);
    }
    console.log("Inserted Customers.");

    // 3. Insert Invoices (mix of Open, Overdue, Paid)
    const today = new Date();

    const invoices = [
      // Customer 1
      [1, 'INV-2026-001', '800000', '800000', 'open', new Date(today.getTime() - 10 * 86400000).toISOString().split('T')[0], new Date(today.getTime() + 20 * 86400000).toISOString().split('T')[0]],
      [1, 'INV-2026-002', '500000', '0', 'overdue', new Date(today.getTime() - 45 * 86400000).toISOString().split('T')[0], new Date(today.getTime() - 15 * 86400000).toISOString().split('T')[0]],
      // Customer 2
      [2, 'INV-2026-003', '1200000', '1200000', 'open', new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0], new Date(today.getTime() + 25 * 86400000).toISOString().split('T')[0]],
      [2, 'INV-2026-004', '600000', '0', 'overdue', new Date(today.getTime() - 80 * 86400000).toISOString().split('T')[0], new Date(today.getTime() - 50 * 86400000).toISOString().split('T')[0]],
      [2, 'INV-2026-005', '900000', '0', 'overdue', new Date(today.getTime() - 120 * 86400000).toISOString().split('T')[0], new Date(today.getTime() - 90 * 86400000).toISOString().split('T')[0]],
      // Customer 3
      [3, 'INV-2026-006', '2500000', '0', 'overdue', new Date(today.getTime() - 65 * 86400000).toISOString().split('T')[0], new Date(today.getTime() - 35 * 86400000).toISOString().split('T')[0]],
      // Customer 4
      [4, 'INV-2026-007', '1800000', '1800000', 'paid', new Date(today.getTime() - 90 * 86400000).toISOString().split('T')[0], new Date(today.getTime() - 60 * 86400000).toISOString().split('T')[0]],
      // Customer 5
      [5, 'INV-2026-008', '400000', '200000', 'partial', new Date(today.getTime() - 40 * 86400000).toISOString().split('T')[0], new Date(today.getTime() - 10 * 86400000).toISOString().split('T')[0]],
    ];

    for (let i of invoices) {
      await query(`INSERT INTO invoices (customer_id, invoice_no, total_amount, paid_amount, status, invoice_date, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)`, i);
    }
    console.log("Inserted Invoices.");

    // 4. Insert Past Payments to populate the Bar Chart perfectly (12 months trend)
    const monthPayments = [];
    for (let i = 11; i >= 0; i--) {
      let d = new Date();
      d.setMonth(d.getMonth() - i);
      d.setDate(15);

      let amt = 0;
      if (i > 6) amt = 400000 + Math.random() * 300000;
      else if (i > 3) amt = 800000 + Math.random() * 500000;
      else amt = 1500000 + Math.random() * 800000;

      monthPayments.push([1, null, amt.toFixed(2), 'Bank Transfer', 'GMX-PAY-HIST-' + i, d.toISOString().split('T')[0]]);
    }

    // Today's collections
    monthPayments.push([4, 7, '1800000', 'Bank Transfer', 'GMX-PAY-TODAY-01', new Date().toISOString().split('T')[0]]);
    monthPayments.push([5, 8, '200000', 'Credit Card', 'GMX-PAY-TODAY-02', new Date().toISOString().split('T')[0]]);

    for (let p of monthPayments) {
      await query(`INSERT INTO payments (customer_id, invoice_id, amount, payment_method, reference_no, payment_date) VALUES (?, ?, ?, ?, ?, ?)`, p);
    }
    console.log("Inserted Payments.");

    // 5. Insert Aging Reports
    const agingData = [
      [1, 2, 'INV-2026-002', '0-30 Days', 15, '500000', 'Low'],
      [2, 4, 'INV-2026-004', '31-60 Days', 50, '600000', 'High'],
      [3, 6, 'INV-2026-006', '31-60 Days', 35, '2500000', 'High'],
      [2, 5, 'INV-2026-005', '90+ Days', 90, '900000', 'Critical'],
      [5, 8, 'INV-2026-008', '0-30 Days', 10, '200000', 'Low'],
    ];

    for (let a of agingData) {
      const invRow = await query(`SELECT due_date FROM invoices WHERE invoice_no = ?`, [a[2]]);
      await query(`INSERT INTO aging_reports (customer_id, invoice_id, invoice_no, due_date, bucket, days_overdue, balance, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [a[0], a[1], a[2], invRow[0].due_date, a[3], a[4], a[5], a[6]]);
    }
    console.log("Inserted Aging Reports.");

    // 6. Insert Notifications
    const notifs = [
      ['payment', 'Payment Received', '₹18,00,000 received from Global Foods Ltd', new Date(today.getTime() - 1000 * 60 * 30).toISOString()],
      ['invoice', 'New Invoice Generated', 'INV-2026-001 created for Metro Fresh', new Date(today.getTime() - 1000 * 60 * 120).toISOString()],
      ['aging', 'Aging Escalation', 'Deccan Wholesale crossed 90+ days threshold', new Date(today.getTime() - 1000 * 60 * 60 * 5).toISOString()],
      ['alert', 'Credit Limit Warning', 'Krishna Super Mart approaching credit limit', new Date(today.getTime() - 1000 * 60 * 60 * 24).toISOString()]
    ];

    for (let n of notifs) {
      await query(`INSERT INTO notifications (type, title, message, created_at) VALUES (?, ?, ?, ?)`, n);
    }
    console.log("Inserted Notifications.");

    console.log("SUCCESS! Demo data has been perfectly seeded.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding DB:", error);
    process.exit(1);
  }
}

seedDemoData();
