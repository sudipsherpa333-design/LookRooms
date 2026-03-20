import { Request, Response } from 'express';
import { Conversation, Message } from '../models/Chat';
import asyncHandler from 'express-async-handler';

export const getConversations = asyncHandler(async (req: any, res: Response) => {
  const conversations = await Conversation.find({ participants: req.user.id })
    .populate('participants', 'name avatar')
    .populate('lastMessage')
    .populate('listing', 'title price images')
    .sort('-updatedAt');

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: {
      conversations
    }
  });
});

export const getMessages = asyncHandler(async (req: any, res: Response) => {
  const messages = await Message.find({ conversation: req.params.conversationId })
    .populate('sender', 'name avatar')
    .sort('createdAt');

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      messages
    }
  });
});

export const sendMessage = asyncHandler(async (req: any, res: Response) => {
  const { conversationId, text, receiverId, listingId } = req.body;

  let conversation;

  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
  } else if (receiverId) {
    // Check if conversation already exists between these two users for this listing
    conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
      listing: listingId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId],
        listing: listingId
      });
    }
  }

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  const newMessage = await Message.create({
    conversation: conversation._id,
    sender: req.user.id,
    text
  });

  conversation.lastMessage = newMessage._id;
  await conversation.save();

  res.status(201).json({
    status: 'success',
    data: {
      message: newMessage
    }
  });
});

export const markAsRead = asyncHandler(async (req: any, res: Response) => {
  await Message.updateMany(
    { conversation: req.params.conversationId, sender: { $ne: req.user.id }, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    status: 'success',
    data: null
  });
});
