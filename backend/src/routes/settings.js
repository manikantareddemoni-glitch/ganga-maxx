import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../config/db.js';

const router = Router();

router.put('/profile', async (req, res, next) => {
  try {
    const body = z.object({ name: z.string().min(2), theme_preference: z.enum(['light', 'dark', 'system']) }).parse(req.body);
    await query('UPDATE users SET name = ?, theme_preference = ? WHERE id = ?', [body.name, body.theme_preference, req.user.id]);
    res.json({ message: 'Profile updated.' });
  } catch (error) {
    next(error);
  }
});

router.put('/password', async (req, res, next) => {
  try {
    const body = z.object({ password: z.string().min(8) }).parse(req.body);
    const hash = await bcrypt.hash(body.password, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password updated.' });
  } catch (error) {
    next(error);
  }
});

export default router;
