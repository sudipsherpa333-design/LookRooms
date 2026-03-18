import cron from 'node-cron';
import { Listing, BookingRequest, ServiceFeePayment } from '../models/index.js';
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
      
      // Trigger full refund logic
      const payment = await ServiceFeePayment.findOne({ bookingRequestId: req._id });
      if (payment && payment.paymentStatus === 'paid') {
        payment.refundStatus = 'initiated';
        payment.refundReason = 'landlord_timeout';
        await payment.save();
        // In a real app, you'd call the gateway's refund API here
        console.log(`[REFUND] Initiated for payment ${payment._id} due to landlord timeout`);
      }

      await Listing.findByIdAndUpdate(req.listingId, { lockStatus: 'available' });
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
