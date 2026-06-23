import { Router } from 'express';
import { z } from 'zod';
import { query } from '../config/db.js';
import { emitEvent } from '../socket/index.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const body = z.object({
      customer_id: z.number().int().positive(),
      total_amount: z.number().positive(),
      due_date: z.string(),
      status: z.enum(['pending', 'partially_paid', 'paid', 'overdue', 'cancelled']).default('pending')
    }).parse(req.body);

    const invoiceNo = `GMX-INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      'INSERT INTO invoices (customer_id, invoice_no, invoice_date, due_date, total_amount, paid_amount, status) VALUES (?, ?, CURRENT_DATE, ?, ?, 0, ?)',
      [body.customer_id, invoiceNo, body.due_date, body.total_amount, body.status]
    );

    const [invoice] = await query('SELECT * FROM invoices WHERE id = ?', [result.insertId]);
    
    emitEvent('invoice:created', invoice);
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

export default router;
