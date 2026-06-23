import { query } from '../config/db.js';

export async function getDashboardOverview() {
  const [metrics] = await query(`
    SELECT
      (SELECT COUNT(*) FROM customers) AS totalCustomers,
      (SELECT COALESCE(SUM(total_amount - paid_amount), 0) FROM invoices WHERE status IN ('open', 'overdue', 'partial')) AS totalOutstanding,
      (SELECT COALESCE(SUM(total_amount - paid_amount), 0) FROM invoices WHERE due_date < CURRENT_DATE AND status IN ('open', 'overdue', 'partial')) AS totalOverdue,
      (SELECT COUNT(*) FROM invoices WHERE status IN ('open', 'overdue', 'partial')) AS pendingInvoices,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_date::date = CURRENT_DATE) AS todaysCollections
  `);

  const revenueData = await query(`
    SELECT TO_CHAR(payment_date, 'Mon') AS month, SUM(amount) AS collections
    FROM payments
    WHERE payment_date >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY EXTRACT(YEAR FROM payment_date), EXTRACT(MONTH FROM payment_date), TO_CHAR(payment_date, 'Mon')
    ORDER BY MIN(payment_date)
  `);
  const revenue = revenueData.map(item => ({ ...item, collections: Number(item.collections) }));

  const agingData = await query(`
    SELECT bucket, SUM(balance) AS value
    FROM aging_reports
    GROUP BY bucket
    ORDER BY CASE bucket WHEN 'Current' THEN 1 WHEN '0-30 Days' THEN 2 WHEN '31-60 Days' THEN 3 WHEN '61-90 Days' THEN 4 WHEN '90+ Days' THEN 5 ELSE 6 END
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
