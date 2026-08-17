import { Router } from 'express';
import { 
  getUserChats, createChat, getChatMessages, 
  getUserMastery, getCohortAnalytics, getPersonalCohortAnalytics, getRecommendations,
  deleteChat, renameChat, toggleMessagePin, flagForReview
} from '../controllers/db.controller';

const router = Router();

router.get('/chats/user/:userId', getUserChats);
router.post('/chats', createChat);
router.get('/chats/:chatId/messages', getChatMessages);
router.delete('/chats/:chatId', deleteChat);
router.put('/chats/:chatId', renameChat);
router.put('/messages/:messageId/pin', toggleMessagePin);
router.get('/mastery/:userId', getUserMastery);
router.get('/analytics/cohorts/me', getPersonalCohortAnalytics);
router.get('/analytics/cohorts', getCohortAnalytics);
router.get('/recommendations/:userId', getRecommendations);
router.post('/flag-for-review', flagForReview);

export default router;
