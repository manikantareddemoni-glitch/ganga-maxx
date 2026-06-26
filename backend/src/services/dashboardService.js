import { query } from '../config/db.js';

export async function getDashboardOverview() {
  const [rawMetrics] = await query(`
    SELECT
      (SELECT COUNT(*) FROM customers) AS totalCustomers,
      (SELECT COALESCE(SUM(total_amount - paid_amount), 0) FROM invoices WHERE status IN ('open', 'overdue', 'partial')) AS totalOutstanding,
      (SELECT COALESCE(SUM(total_amount - paid_amount), 0) FROM invoices WHERE due_date < CURRENT_DATE AND status IN ('open', 'overdue', 'partial')) AS totalOverdue,
      (SELECT COUNT(*) FROM invoices WHERE status IN ('open', 'overdue', 'partial')) AS pendingInvoices,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_date::date = CURRENT_DATE) AS todaysCollections
  `);

  const metrics = {
    totalCustomers: Number(rawMetrics.totalCustomers || rawMetrics.totalcustomers || 0),
    totalOutstanding: Number(rawMetrics.totalOutstanding || rawMetrics.totaloutstanding || 0),
    totalOverdue: Number(rawMetrics.totalOverdue || rawMetrics.totaloverdue || 0),
    pendingInvoices: Number(rawMetrics.pendingInvoices || rawMetrics.pendinginvoices || 0),
    todaysCollections: Number(rawMetrics.todaysCollections || rawMetrics.todayscollections || 0)
  };

  const revenueData = await query(`
    SELECT TO_CHAR(payment_date, 'Mon') AS month, SUM(amount) AS collections
    FROM payments
    WHERE payment_date >= CURRENT_DATE - INTERVAL '11 months'
    GROUP BY EXTRACT(YEAR FROM payment_date), EXTRACT(MONTH FROM payment_date), TO_CHAR(payment_date, 'Mon')
    ORDER BY MIN(payment_date)
  `);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const last12Months = [];
  for (let i = 11; i >= 0; i--) {
    let d = new Date();
    d.setMonth(d.getMonth() - i);
    last12Months.push(monthNames[d.getMonth()]);
  }
  
  const revenue = last12Months.map(monthName => {
    const found = revenueData.find(item => item.month === monthName);
    return {
      month: monthName,
      collections: found ? Number(found.collections) : 0
    };
  });

  const agingData = await query(`
    SELECT bucket, SUM(balance) AS value
    FROM aging_reports
    GROUP BY bucket
    ORDER BY CASE bucket WHEN 'Current' THEN 1 WHEN '0-30 Days' THEN 2 WHEN '31-60 Days' THEN 3 WHEN '61-90 Days' THEN 4 WHEN '90+ Days' THEN 5 ELSE 6 END
  `);
  const aging = agingData.map(item => ({ ...item, value: Number(item.value) }));

  const activitiesRaw = await query(`
    SELECT id, type, title, message, created_at AS createdAt
    FROM notifications
    WHERE type != 'customer'
    ORDER BY created_at DESC
    LIMIT 8
  `);
  const activities = activitiesRaw.map(item => ({...item, createdAt: item.createdAt || item.createdat}));

  const collectionActionsRaw = await query(`
    SELECT
      ar.id,
      c.company_name AS customer,
      ar.invoice_no,
      ar.days_overdue,
      ar.balance AS amount,
      ar.priority,
      CASE 
        WHEN ar.priority = 'Critical' THEN 'Block further credit and request settlement'
        WHEN ar.priority = 'High' THEN 'Call finance team and confirm payment date'
        ELSE 'Send reminder with latest statement'
      END AS action,
      'Accounts Manager' AS owner
    FROM aging_reports ar
    JOIN customers c ON c.id = ar.customer_id
    WHERE ar.days_overdue > 0
    ORDER BY ar.days_overdue DESC
    LIMIT 4
  `);
  
  const collectionActions = collectionActionsRaw.map(item => ({...item, amount: Number(item.amount)}));

  return { metrics, revenue, aging, activities, collectionActions };
}
