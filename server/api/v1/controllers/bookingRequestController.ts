import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Listing } from '../../../models/index.js';
import { BookingRequest } from '../../../models/BookingRequest.js';
import { ServiceFeePayment } from '../../../models/ServiceFeePayment.js';
import { calculateServiceFee } from '../../../utils/feeCalculator.js';
import { FeeRule } from '../../../models/FeeRule.js';

export const createBookingRequest = async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { listingId, moveInDate, stayDuration, occupants, tenantMessage, idempotencyKey } = req.body;
  const tenantId = req.user.userId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Atomic Locking
    const listing = await (Listing as any).findOneAndUpdate(
      { _id: listingId, lockStatus: 'available', status: 'active' },
      { $set: { lockStatus: 'locked', lockedBy: tenantId, lockExpiresAt: new Date(Date.now() + 30 * 60 * 1000) } },
      { session, new: true }
    );

    if (!listing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Room already being booked or not available' });
    }

    // 2. Idempotency Check
    if (idempotencyKey) {
      const existingPayment = await (ServiceFeePayment as any).findOne({ idempotencyKey }).session(session);
      if (existingPayment) {
        await session.abortTransaction();
        session.endSession();
        return res.json({ cached: true, feePaymentId: existingPayment._id });
      }
    }

    // 3. Check for existing active request
    const existing = await (BookingRequest as any).findOne({
      tenantId,
      listingId,
      status: { $nin: ['rejected', 'expired', 'cancelled', 'completed'] }
    }).session(session);

    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'You already have an active request for this room' });
    }

    const serviceFee = await calculateServiceFee(listing.propertyType || listing.roomType);

    const bookingRequest = new BookingRequest({
      listingId,
      tenantId,
      landlordId: listing.landlordId,
      roomType: listing.propertyType || listing.roomType,
      monthlyRent: listing.price,
      roomAddress: (listing as any).address || (listing.location && listing.location.address) || "",
      moveInDate,
      stayDuration,
      occupants,
      tenantMessage,
      status: 'pending_fee',
      paymentDeadline: new Date(Date.now() + 30 * 60 * 1000)
    });
    await bookingRequest.save({ session });

    const payment = new ServiceFeePayment({
      bookingRequestId: bookingRequest._id,
      listingId,
      tenantId,
      landlordId: listing.landlordId,
      roomType: listing.propertyType || listing.roomType,
      roomTypeLabel: listing.propertyType || listing.roomType,
      monthlyRent: listing.price,
      depositAmount: listing.securityDeposit || 0,
      rentPaidTo: 'landlord_directly',
      serviceFee,
      feeLabel: 'Platform connection fee',
      feeDescription: 'One-time fee to connect with the landlord and secure the room.',
      paymentDeadline: bookingRequest.paymentDeadline,
      idempotencyKey
    });
    await payment.save({ session });

    bookingRequest.feePaymentId = payment._id;
    await bookingRequest.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      bookingRequestId: bookingRequest._id,
      feePaymentId: payment._id,
      roomType: listing.propertyType || listing.roomType,
      serviceFee,
      feeLabel: 'Platform connection fee',
      monthlyRent: listing.price,
      paymentDeadline: bookingRequest.paymentDeadline,
      message: `Pay Rs ${serviceFee.toLocaleString()} service fee to send your booking request`
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Booking error:", error);
    res.status(500).json({ error: 'Failed to create booking request' });
  }
};
