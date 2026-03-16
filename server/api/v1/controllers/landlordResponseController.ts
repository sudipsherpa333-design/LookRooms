import { Request, Response } from 'express';
import { Listing } from '../../../models/index.js';
import { BookingRequest } from '../../../models/BookingRequest.js';
import { ServiceFeePayment } from '../../../models/ServiceFeePayment.js';
import { emitToUser } from '../../../utils/socketEmitter.js';

export const respondToBooking = async (req: any, res: Response) => {
  const { bookingRequestId } = req.params;
  const { action, response, rejectionReason } = req.body;
  const landlordId = req.user.userId;

  try {
    const booking = await BookingRequest.findOne({ _id: bookingRequestId, landlordId });
    if (!booking) return res.status(404).json({ error: 'Booking request not found' });

    if (action === 'accept') {
      booking.status = 'accepted';
      booking.contactShared = true;
      booking.contactSharedAt = new Date();
      booking.confirmDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await booking.save();

      await Listing.findByIdAndUpdate(booking.listingId, { lockStatus: 'locked' });
      
      emitToUser(booking.tenantId.toString(), 'bookingAccepted', { bookingRequestId });
      res.json({ success: true });
    } else if (action === 'reject') {
      booking.status = 'rejected';
      booking.rejectionReason = rejectionReason;
      await booking.save();

      // Trigger refund logic
      const payment = await ServiceFeePayment.findOne({ bookingRequestId: booking._id });
      if (payment && payment.paymentStatus === 'paid') {
        payment.refundStatus = 'initiated';
        payment.refundReason = 'landlord_rejected';
        await payment.save();
        // Call refund API
        console.log(`[REFUND] Initiated for payment ${payment._id} due to landlord rejection`);
      }

      await Listing.findByIdAndUpdate(booking.listingId, { lockStatus: 'available' });
      
      emitToUser(booking.tenantId.toString(), 'bookingRejected', { bookingRequestId });
      res.json({ success: true, refundInitiated: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to booking' });
  }
};
