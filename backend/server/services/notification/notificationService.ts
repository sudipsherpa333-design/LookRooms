import { Notification } from '../../models/Notification.js';
import { NotificationPreference } from '../../models/NotificationPreference.js';
import { User } from '../../models/User.js';
import { NOTIFICATION_CONFIGS } from './notificationConfigs.js';
import { emailQueue } from '../../queues/emailQueue.js';
import { pushQueue } from '../../queues/pushQueue.js';
import { smsQueue } from '../../queues/smsQueue.js';
import Handlebars from 'handlebars';

export const notificationService = {
  async send(userId: string, type: string, data: any) {
    const user = await User.findById(userId);
    const pref = await NotificationPreference.findOne({ userId });
    
    if (!user || !pref) return;

    const config = NOTIFICATION_CONFIGS[type];
    if (!config) return;

    const title = Handlebars.compile(config.title)(data);
    const message = Handlebars.compile(config.message)(data);

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      category: config.category,
      priority: config.priority
    });

    // In-App
    if (pref.channels.inApp) {
      // Emit via Socket.IO (assuming io is available globally or injected)
      // io.to(`user:${userId}`).emit('notification', notification);
    }

    // Email
    if (pref.channels.email && pref.categories[config.category as keyof typeof pref.categories].email) {
      try {
        if (emailQueue) {
          await emailQueue.add('sendEmail', {
            notificationId: notification._id,
            userId,
            to: user.email,
            subject: config.emailSubject(data),
            templateName: config.emailTemplate,
            templateData: { ...data, userName: user.name }
          });
        }
      } catch (err) {
        console.error('Failed to add email job to queue:', err);
      }
    }

    // Push
    if (pref.channels.push && pref.pushToken) {
      try {
        if (pushQueue) {
          await pushQueue.add('sendPush', {
            token: pref.pushToken,
            title,
            body: message,
            data: { type, actionUrl: config.actionUrl },
          });
        }
      } catch (err) {
        console.error('Failed to add push job to queue:', err);
      }
    }

    // SMS
    if (pref.channels.sms && pref.categories[config.category as keyof typeof pref.categories].sms) {
      try {
        const smsText = Handlebars.compile(config.smsTemplate)(data);
        if (smsQueue) {
          await smsQueue.add('sendSMS', {
            to: user.phone,
            text: smsText
          });
        }
      } catch (err) {
        console.error('Failed to add sms job to queue:', err);
      }
    }

    return notification._id;
  }
};
