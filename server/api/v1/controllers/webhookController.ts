import { Request, Response } from 'express';
import { EmailLog } from '../../../models/EmailLog';
import { Notification } from '../../../models/Notification';
import { NotificationPreference } from '../../../models/NotificationPreference';

export const handleSendGridWebhook = async (req: Request, res: Response) => {
  const events = req.body;
  
  for (const event of events) {
    const { email, event: eventType, sg_message_id } = event;
    
    if (eventType === 'delivered') {
      await EmailLog.findOneAndUpdate({ messageId: sg_message_id }, { status: 'delivered' });
    } else if (eventType === 'opened') {
      await EmailLog.findOneAndUpdate({ messageId: sg_message_id }, { status: 'opened', openedAt: new Date() });
      await Notification.updateOne({ 'channels.email.messageId': sg_message_id }, { 'channels.email.opened': true, 'channels.email.openedAt': new Date() });
    } else if (eventType === 'bounced') {
      await EmailLog.findOneAndUpdate({ messageId: sg_message_id }, { status: 'bounced', bouncedAt: new Date() });
      await NotificationPreference.updateOne({ userId: event.userId }, { emailBounced: true });
    }
  }
  
  res.status(200).send('OK');
};
