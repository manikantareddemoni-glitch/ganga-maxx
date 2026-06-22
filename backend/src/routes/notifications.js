import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

export default router;
