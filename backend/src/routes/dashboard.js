import { Router } from 'express';
import { getDashboardOverview } from '../services/dashboardService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await getDashboardOverview());
  } catch (error) {
    next(error);
  }
});

export default router;
