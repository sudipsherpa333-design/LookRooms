import cron from 'node-cron';
import { Listing } from '../models.js';
import { BookingRequest } from '../models/BookingRequest.js';
import { ServiceFeePayment } from '../models/ServiceFeePayment.js';
import { emitToUser } from '../utils/socketEmitter.js';

export const setupCronJobs = () => {
  // Job 1 — expireUnpaidFees (runs every 5 minutes)
  cron.schedule('*/5 * * * *', async () => {
    const expired = await BookingRequest.find({ 
      status: 'pending_fee', 
      paymentDeadline: { $lt: new Date() } 
    });
    for (const req of expired) {
      req.status = 'cancelled';
      await req.save();
      await ServiceFeePayment.findOneAndUpdate({ bookingRequestId: req._id }, { status: 'failed' });
      await Listing.findByIdAndUpdate(req.listingId, { lockStatus: 'available' });
      emitToUser(req.tenantId.toString(), 'paymentDeadline', { message: "Payment window expired. Try again." });
    }
  });

  // Job 2 — expireLandlordResponse (runs every 30 minutes)
  cron.schedule('*/30 * * * *', async () => {
    const expired = await BookingRequest.find({ 
      status: 'fee_paid', 
      landlordDeadline: { $lt: new Date() } 
    });
    for (const req of expired) {
      req.status = 'expired';
      await req.save();
      // Trigger full refund logic here
      emitToUser(req.tenantId.toString(), 'bookingExpired', { message: "Landlord didn't respond. Full refund initiated." });
    }
  });

  // Job 3 — expireTenantConfirmation (runs every hour)
  cron.schedule('0 * * * *', async () => {
    const expired = await BookingRequest.find({ 
      status: 'accepted', 
      confirmDeadline: { $lt: new Date() } 
    });
    for (const req of expired) {
      req.status = 'expired';
      await req.save();
      await Listing.findByIdAndUpdate(req.listingId, { lockStatus: 'available' });
    }
  });
};
