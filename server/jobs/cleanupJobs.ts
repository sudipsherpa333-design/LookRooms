import cron from 'node-cron';
import { Application } from '../models/Application';

// Mark pending applications older than 30 days as rejected
export const startJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cleanup jobs...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const result = await Application.updateMany(
        { status: 'pending', createdAt: { $lt: thirtyDaysAgo } },
        { $set: { status: 'rejected' } }
      );
      console.log(`Cleaned up ${result.modifiedCount} old pending applications.`);
    } catch (error) {
      console.error('Error running cleanup jobs:', error);
    }
  });
};
