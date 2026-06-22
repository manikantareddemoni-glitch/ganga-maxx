import { query } from '../config/db.js';

export async function getDashboardOverview() {
  const [metrics] = await query(`
    SELECT
      (SELECT COUNT(*) FROM customers) AS totalCustomers,
      (SELECT COALESCE(SUM(total_amount - paid_amount), 0) FROM invoices WHERE status IN ('open', 'overdue', 'partial')) AS totalOutstanding,
      (SELECT COALESCE(SUM(total_amount - paid_amount), 0) FROM invoices WHERE due_date < CURDATE() AND status IN ('open', 'overdue', 'partial')) AS totalOverdue,
      (SELECT COUNT(*) FROM invoices WHERE status IN ('open', 'overdue', 'partial')) AS pendingInvoices,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE DATE(payment_date) = CURDATE()) AS todaysCollections
  `);

  const revenueData = await query(`
    SELECT DATE_FORMAT(payment_date, '%b') AS month, SUM(amount) AS collections
    FROM payments
    WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY YEAR(payment_date), MONTH(payment_date), DATE_FORMAT(payment_date, '%b')
    ORDER BY MIN(payment_date)
  `);
  const revenue = revenueData.map(item => ({ ...item, collections: Number(item.collections) }));

  const agingData = await query(`
    SELECT bucket, SUM(balance) AS value
    FROM aging_reports
    GROUP BY bucket
    ORDER BY FIELD(bucket, 'Current', '0-30 Days', '31-60 Days', '61-90 Days', '90+ Days')
  `);
  const aging = agingData.map(item => ({ ...item, value: Number(item.value) }));

  const activities = await query(`
    SELECT id, type, title, message, created_at AS createdAt
    FROM notifications
    WHERE type != 'customer'
    ORDER BY created_at DESC
    LIMIT 8
  `);

  return { metrics, revenue, aging, activities };
}
