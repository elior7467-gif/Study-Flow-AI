import { Router } from 'express';
import { handleSolverCritic, handleAuditTopic, handleChatStream } from '../controllers/ai.controller';
import { getHealth } from '../controllers/health.controller';
import dbRoutes from './db.routes';

const router = Router();

router.get('/health', getHealth);
router.post('/solver-critic', handleSolverCritic);
router.post('/audit-topic', handleAuditTopic);
router.post('/chat-stream', handleChatStream);
router.use('/db', dbRoutes);

export default router;
