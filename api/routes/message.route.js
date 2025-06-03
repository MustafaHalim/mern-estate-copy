import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
  createMessage, 
  getMessages, 
  getConversations, 
  markAsRead,
  deleteMessage,
  deleteConversation
} from '../controllers/message.controller.js';

const router = express.Router();

router.post('/create', verifyToken, createMessage);
router.get('/conversations', verifyToken, getConversations);
router.get('/:conversationId', verifyToken, getMessages);
router.put('/read/:conversationId', verifyToken, markAsRead);
router.delete('/delete/:messageId', verifyToken, deleteMessage);
router.delete('/conversation/:conversationId', verifyToken, deleteConversation);

export default router; 