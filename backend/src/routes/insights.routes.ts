import { Router } from 'express';
import { getDashboardStats } from '../controllers/insights.controller';

const router = Router();

router.get('/dashboard/:userId', getDashboardStats);

export default router;
