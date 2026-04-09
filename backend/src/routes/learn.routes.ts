import { Router } from 'express';
import { getQuestions, submitAttempt, getPrinciples } from '../controllers/learn.controller';

const router = Router();

// Middleware to verify token should be added here in production
router.get('/questions', getQuestions);
router.post('/attempt', submitAttempt);
router.get('/principles/:id', getPrinciples);

export default router;
