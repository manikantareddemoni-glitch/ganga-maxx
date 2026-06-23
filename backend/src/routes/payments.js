import { Router } from 'express';
import { z } from 'zod';
import { query } from '../config/db.js';
import { emitEvent } from '../socket/index.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const body = z.object({
      customer_id: z.number().int().positive(),
      invoice_id: z.number().int().positive().optional(),
      amount: z.number().positive(),
      method: z.string().min(2),
      reference_no: z.string().min(2),
      payment_date: z.string()
    }).parse(req.body);

    const result = await query(
      'INSERT INTO payments (customer_id, invoice_id, amount, method, reference_no, payment_date) VALUES (?, ?, ?, ?, ?, ?)',
      [body.customer_id, body.invoice_id || null, body.amount, body.method, body.reference_no, body.payment_date]
    );
    if (body.invoice_id) {
      await query("UPDATE invoices SET paid_amount = paid_amount + ?, status = CASE WHEN paid_amount + ? >= total_amount THEN 'paid' ELSE 'partial' END WHERE id = ?", [
        body.amount,
        body.amount,
        body.invoice_id
      ]);
    }
    await query('INSERT INTO notifications (type, title, message) VALUES (?, ?, ?)', [
      'payment',
      'Payment received',
      `Payment of ${body.amount} received.`
    ]);
    emitEvent('payment:created', { id: result.insertId, ...body });
    emitEvent('notification:new', { type: 'payment', title: 'Payment received', message: `Payment of ${body.amount} received.` });
    res.status(201).json({ id: result.insertId, ...body });
  } catch (error) {
    next(error);
  }
});

export default router;
