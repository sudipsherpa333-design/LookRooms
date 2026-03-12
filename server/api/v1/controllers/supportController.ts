import { Request, Response } from 'express';
import { SupportTicket, User } from '../../../models/index.js';
import { sendEmail } from '../../../utils/emailService.js';
import { emitToUser } from '../../../utils/socketEmitter.js';

export const createTicket = async (req: any, res: Response) => {
  const { name, email, subject, message, category, paymentId } = req.body;
  const userId = req.user?.userId;

  try {
    const ticket = new SupportTicket({
      userId,
      name,
      email,
      subject,
      message,
      category,
      paymentId
    });

    await ticket.save();

    // Notify admin
    await sendEmail(process.env.ADMIN_EMAIL || 'admin@roomfinder.com.np', 'New Support Ticket', `
      <h1>New Support Ticket</h1>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
    `);

    res.json({ ticketId: ticket._id, message: 'Support ticket created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

export const getUserTickets = async (req: any, res: Response) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const getAdminTickets = async (req: Request, res: Response) => {
  const { status, priority, category, page = 1, limit = 10 } = req.query;

  try {
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('userId', 'name email');

    const total = await SupportTicket.countDocuments(query);

    res.json({
      tickets,
      total,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const replyToTicket = async (req: any, res: Response) => {
  const { ticketId } = req.params;
  const { reply } = req.body;
  const adminId = req.user.userId;

  try {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    ticket.adminReply = reply;
    ticket.repliedAt = new Date();
    ticket.repliedBy = adminId;
    ticket.status = 'in-progress';
    await ticket.save();

    // Notify user
    if (ticket.email) {
      await sendEmail(ticket.email, 'Support Ticket Reply', `
        <h1>Reply to your ticket: ${ticket.subject}</h1>
        <p>${reply}</p>
      `);
    }

    if (ticket.userId) {
      emitToUser(ticket.userId.toString(), 'newSupportReply', { ticketId: ticket._id });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reply to ticket' });
  }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { status } = req.body;

  try {
    await SupportTicket.findByIdAndUpdate(ticketId, { status });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};
