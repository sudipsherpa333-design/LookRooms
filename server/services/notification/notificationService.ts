import { Notification } from '../../models/Notification';
import { NotificationPreference } from '../../models/NotificationPreference';
import { User } from '../../models/User';
import { NOTIFICATION_CONFIGS } from './notificationConfigs';
import { emailQueue } from '../../queues/emailQueue';
import { pushQueue } from '../../queues/pushQueue';
import { smsQueue } from '../../queues/smsQueue';
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
      emailQueue.add('sendEmail', {
        notificationId: notification._id,
        userId,
        to: user.email,
        subject: config.emailSubject(data),
        templateName: config.emailTemplate,
        templateData: { ...data, userName: user.name }
      });
    }

    // Push
    if (pref.channels.push && pref.pushToken) {
      pushQueue.add('sendPush', {
        token: pref.pushToken,
        title,
        body: message,
        data: { type, actionUrl: config.actionUrl },
      });
    }

    // SMS
    if (pref.channels.sms && pref.categories[config.category as keyof typeof pref.categories].sms) {
      const smsText = Handlebars.compile(config.smsTemplate)(data);
      smsQueue.add('sendSMS', {
        to: user.phone,
        text: smsText
      });
    }

    return notification._id;
  }
};
