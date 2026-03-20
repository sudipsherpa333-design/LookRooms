import express from 'express';
import * as chatController from '../controllers/ChatController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/conversations', chatController.getConversations);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.patch('/messages/:conversationId/read', chatController.markAsRead);

export default router;
