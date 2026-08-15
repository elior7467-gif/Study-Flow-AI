import { Router } from 'express';
import { handleSolverCritic, handleAuditTopic, handleChatStream } from '../controllers/ai.controller';
import { getHealth } from '../controllers/health.controller';
import dbRoutes from './db.routes';

import adminRoutes from './admin.routes';

import { solverCriticRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/health', getHealth);
router.post('/solver-critic', solverCriticRateLimiter, handleSolverCritic);
router.post('/audit-topic', solverCriticRateLimiter, handleAuditTopic);
router.post('/chat-stream', solverCriticRateLimiter, handleChatStream);
router.use('/db', dbRoutes);
router.use('/admin', adminRoutes);

export default router;
