import { Router } from 'express';
import { handleSolverCritic, handleAuditTopic } from '../controllers/ai.controller';
import { getHealth } from '../controllers/health.controller';

const router = Router();

router.get('/health', getHealth);
router.post('/solver-critic', handleSolverCritic);
router.post('/audit-topic', handleAuditTopic);

export default router;
