import { Router } from 'express';
import { getUserChats, createChat, getChatMessages, getUserMastery, getCohortAnalytics } from '../controllers/db.controller';

const router = Router();

router.get('/chats/user/:userId', getUserChats);
router.post('/chats', createChat);
router.get('/chats/:chatId/messages', getChatMessages);
router.get('/mastery/:userId', getUserMastery);
router.get('/analytics/cohorts', getCohortAnalytics);

export default router;
