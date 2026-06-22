import { Router } from 'express';
import { z } from 'zod';
import { query } from '../config/db.js';
import { emitEvent } from '../socket/index.js';

const router = Router();

const customerSchema = z.object({
  company_name: z.string().min(2),
  contact_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  credit_limit: z.number().nonnegative(),
  payment_terms: z.number().int().positive(),
  status: z.enum(['active', 'paused', 'blocked']).default('active')
});

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
    const offset = (page - 1) * limit;
    const search = `%${req.query.search || ''}%`;
    const status = req.query.status || '%';

    const rows = await query(
      `SELECT c.*, ca.credit_limit, COALESCE(SUM(i.total_amount - i.paid_amount), 0) AS outstanding
       FROM customers c
       LEFT JOIN credit_accounts ca ON ca.customer_id = c.id
       LEFT JOIN invoices i ON i.customer_id = c.id AND i.status IN ('open', 'overdue', 'partial')
       WHERE (c.company_name LIKE ? OR c.contact_name LIKE ? OR c.email LIKE ?) AND c.status LIKE ?
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [search, search, search, status]
    );
    const [count] = await query(
      'SELECT COUNT(*) AS total FROM customers WHERE (company_name LIKE ? OR contact_name LIKE ? OR email LIKE ?) AND status LIKE ?',
      [search, search, search, status]
    );
    res.json({ data: rows, total: count.total, page, limit });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = customerSchema.parse(req.body);
    const result = await query(
      `INSERT INTO customers (company_name, contact_name, email, phone, status)
       VALUES (?, ?, ?, ?, ?)`,
      [body.company_name, body.contact_name, body.email, body.phone, body.status]
    );
    await query(
      `INSERT INTO credit_accounts (customer_id, credit_limit) VALUES (?, ?)`,
      [result.insertId, body.credit_limit || 0]
    );
    const [customer] = await query('SELECT c.*, ca.credit_limit FROM customers c LEFT JOIN credit_accounts ca ON ca.customer_id = c.id WHERE c.id = ?', [result.insertId]);
    await query('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)', [
      req.user ? req.user.id : 1,
      'customer',
      'New customer added',
      `${customer.company_name} has been added to credit accounts.`
    ]);
    emitEvent('customer:created', customer);
    emitEvent('notification:new', { type: 'customer', title: 'New customer added', message: customer.company_name });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = customerSchema.partial().parse(req.body);
    const { credit_limit, payment_terms, ...customerFields } = body;
    const fields = Object.keys(customerFields);
    if (fields.length) {
      await query(
        `UPDATE customers SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`,
        [...fields.map((field) => customerFields[field]), req.params.id]
      );
    }
    if (credit_limit !== undefined) {
      await query(`UPDATE credit_accounts SET credit_limit = ? WHERE customer_id = ?`, [credit_limit, req.params.id]);
    }
    const [customer] = await query('SELECT c.*, ca.credit_limit FROM customers c LEFT JOIN credit_accounts ca ON ca.customer_id = c.id WHERE c.id = ?', [req.params.id]);
    emitEvent('customer:updated', customer);
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const customerId = Number(req.params.id);
    
    // Delete from child tables first to avoid foreign key constraint errors
    await query('DELETE FROM follow_ups WHERE customer_id = ?', [customerId]);
    await query('DELETE FROM aging_reports WHERE customer_id = ?', [customerId]);
    await query('DELETE FROM account_statements WHERE customer_id = ?', [customerId]);
    await query('DELETE FROM payments WHERE customer_id = ?', [customerId]);
    await query('DELETE FROM invoices WHERE customer_id = ?', [customerId]);
    await query('DELETE FROM credit_accounts WHERE customer_id = ?', [customerId]);
    
    // Finally delete the customer
    await query('DELETE FROM customers WHERE id = ?', [customerId]);
    
    emitEvent('customer:deleted', { id: customerId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
