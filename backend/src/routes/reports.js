import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/ledger/:customerId', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, customer_id, transaction_date, type, reference_no, description, debit, credit,
        SUM(debit - credit) OVER (PARTITION BY customer_id ORDER BY transaction_date, id) AS running_balance
       FROM account_statements
       WHERE customer_id = ?
       ORDER BY transaction_date DESC, id DESC`,
      [req.params.customerId]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/statement/:customerId', async (req, res, next) => {
  try {
    const from = req.query.from || '2000-01-01';
    const to = req.query.to || '2099-12-31';
    const rows = await query(
      `SELECT * FROM account_statements
       WHERE customer_id = ? AND transaction_date BETWEEN ? AND ?
       ORDER BY transaction_date, id`,
      [req.params.customerId, from, to]
    );
    const [customer] = await query('SELECT * FROM customers WHERE id = ?', [req.params.customerId]);
    res.json({ customer, from, to, transactions: rows });
  } catch (error) {
    next(error);
  }
});

router.get('/aging', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT ar.bucket, ar.customer_id, c.company_name, ar.invoice_id, ar.invoice_no, ar.due_date, ar.days_overdue, ar.priority, ar.balance
      FROM aging_reports ar
      JOIN customers c ON c.id = ar.customer_id
      ORDER BY FIELD(ar.bucket, 'Current', '0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'), ar.balance DESC
    `);
    const summary = rows.reduce((acc, row) => {
      acc[row.bucket] = (acc[row.bucket] || 0) + Number(row.balance);
      return acc;
    }, {});
    res.json({ summary, rows });
  } catch (error) {
    next(error);
  }
});

export default router;
