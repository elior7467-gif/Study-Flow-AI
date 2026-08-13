import { Router } from 'express';
import { getUserChats, createChat, getChatMessages } from '../controllers/db.controller';

const router = Router();

router.get('/chats/user/:userId', getUserChats);
router.post('/chats', createChat);
router.get('/chats/:chatId/messages', getChatMessages);

export default router;
