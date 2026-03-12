import express from 'express';
import { 
  createTicket, 
  getUserTickets, 
  getAdminTickets, 
  replyToTicket, 
  updateTicketStatus 
} from '../controllers/supportController.js';
import { authMiddleware, adminMiddleware } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/contact', authMiddleware, createTicket);
router.get('/tickets', authMiddleware, getUserTickets);

// Admin routes
router.get('/admin/tickets', authMiddleware, adminMiddleware, getAdminTickets);
router.put('/admin/tickets/:ticketId/reply', authMiddleware, adminMiddleware, replyToTicket);
router.put('/admin/tickets/:ticketId/status', authMiddleware, adminMiddleware, updateTicketStatus);

export default router;
