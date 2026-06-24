import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// Middleware to ensure user is an actual admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }
  next();
}

// Get all pending role requests
router.get('/role-requests', requireAdmin, async (req, res, next) => {
  try {
    const users = await query(`
      SELECT id, name, email, role, requested_role, status, created_at 
      FROM users 
      WHERE requested_role IS NOT NULL 
      AND status = 'active'
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Approve a role request
router.post('/approve-role/:id', requireAdmin, async (req, res, next) => {
  try {
    const userId = req.params.id;
    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.requested_role) return res.status(400).json({ message: 'No pending role request' });

    await query('UPDATE users SET role = ?, requested_role = NULL WHERE id = ?', [user.requested_role, userId]);
    
    res.json({ success: true, message: 'Role approved successfully' });
  } catch (error) {
    next(error);
  }
});

// Reject a role request
router.post('/reject-role/:id', requireAdmin, async (req, res, next) => {
  try {
    const userId = req.params.id;
    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await query('UPDATE users SET requested_role = NULL WHERE id = ?', [userId]);
    
    res.json({ success: true, message: 'Role request rejected' });
  } catch (error) {
    next(error);
  }
});

export default router;
