import { Request, Response } from 'express';
import { EmailLog } from '../../../models/EmailLog.js';
import { Notification } from '../../../models/Notification.js';
import { NotificationPreference } from '../../../models/NotificationPreference.js';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.SENDGRID_WEBHOOK_SECRET;

export const handleSendGridWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-twilio-email-event-webhook-signature'] as string;
  const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'] as string;

  if (!signature || !timestamp || !WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Missing signature or secret' });
  }

  // Verify signature
  const payload = timestamp + JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('base64');

  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isValid) return res.status(401).json({ error: 'Invalid signature' });
  } catch (e) {
    return res.status(401).json({ error: 'Verification failed' });
  }

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
