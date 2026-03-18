import cron from 'node-cron';
import { User } from '../models/User';
import { emailQueue } from '../queues/emailQueue';

// Every Monday at 9AM
cron.schedule('0 9 * * 1', async () => {
  const landlords = await User.find({ role: 'landlord', 'emailDigest.enabled': true });
  
  for (const landlord of landlords) {
    // Fetch stats (mocked for now)
    const stats = { views: 247, inquiries: 18, bookings: 3 };
    
    try {
      if (emailQueue) {
        await emailQueue.add('sendEmail', {
          to: landlord.email,
          subject: '📊 Your Weekly Room Performance',
          templateName: 'weekly-digest',
          templateData: { name: landlord.name, stats }
        });
      }
    } catch (err) {
      console.error('Failed to add weekly digest email to queue:', err);
    }
  }
});
