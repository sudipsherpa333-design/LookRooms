import { Request, Response } from 'express';
import { Notification } from '../../../models/Notification.js';
import { NotificationPreference } from '../../../models/NotificationPreference.js';

export const getNotifications = async (req: Request, res: Response) => {
  const { page = 1, limit = 20, category, isRead } = req.query;
  const userId = (req as any).user._id;

  const query: any = { userId };
  if (category) query.category = category;
  if (isRead !== undefined) query['channels.inApp.read'] = isRead === 'true';

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const unreadCount = await Notification.countDocuments({ userId, 'channels.inApp.read': false });

  res.json({ notifications, unreadCount });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  await Notification.findOneAndUpdate(
    { _id: id, userId },
    { 'channels.inApp.read': true, 'channels.inApp.readAt': new Date() }
  );

  res.json({ success: true });
};

export const getPreferences = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const pref = await NotificationPreference.findOne({ userId });
  res.json(pref);
};

export const updatePreferences = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const pref = await NotificationPreference.findOneAndUpdate(
    { userId },
    { $set: req.body },
    { new: true, upsert: true }
  );
  res.json(pref);
};
