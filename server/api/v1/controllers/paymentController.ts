import { Request, Response } from 'express';
import { Payment, Listing, User, FeeRule, Notification } from '../../../models/index.js';
import { initiateKhaltiPayment, verifyKhaltiPayment } from '../../../utils/khaltiHelper.js';
import { generateEsewaSignature, verifyEsewaSignature } from '../../../utils/esewaHelper.js';
import { calculateServiceFee } from '../../../utils/feeCalculator.js';
import { emitToUser } from '../../../utils/socketEmitter.js';
import { sendEmail } from '../../../utils/emailService.js';
import mongoose from 'mongoose';

const ESEWA_SCD = process.env.ESEWA_SCD || 'EPAYTEST';
const ESEWA_SECRET = process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q';
const ESEWA_URL = process.env.NODE_ENV === 'production' 
  ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
  : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export const initiatePayment = async (req: any, res: Response) => {
  const { listingId, paymentMethod, useSavedToken } = req.body;
  const userId = req.user.userId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const listing = await Listing.findById(listingId).session(session);
    if (!listing) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.lockStatus !== 'available') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Listing is currently locked or booked' });
    }

    const serviceFee = await calculateServiceFee(listing.propertyType || listing.roomType);
    const totalAmount = serviceFee; // Only charge service fee

    // Lock listing
    listing.lockStatus = 'locked';
    listing.lockedBy = userId;
    listing.lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await listing.save({ session });

    const payment = new Payment({
      userId,
      listingId,
      amount: 0, // Rent is 0 for now
      serviceFee,
      totalAmount,
      paymentMethod,
      status: 'pending',
    });

    let gatewayData: any = {};

    if (paymentMethod === 'khalti') {
      const user = await User.findById(userId).session(session);
      const khaltiResponse = await initiateKhaltiPayment({
        return_url: `${APP_URL}/payment/verify?gateway=khalti`,
        website_url: APP_URL,
        amount: totalAmount * 100, // paisa
        purchase_order_id: payment._id.toString(),
        purchase_order_name: `Room Booking - ${listing.title}`,
        customer_info: {
          name: user?.name || 'Guest',
          email: user?.email || 'guest@example.com',
          phone: user?.phone || '9800000000',
        },
      });

      payment.pidx = khaltiResponse.pidx;
      gatewayData = { 
        payment_url: khaltiResponse.payment_url,
        pidx: khaltiResponse.pidx 
      };
    } else if (paymentMethod === 'esewa') {
      const signature = generateEsewaSignature(totalAmount, payment._id.toString(), ESEWA_SCD, ESEWA_SECRET);
      gatewayData = {
        url: ESEWA_URL,
        formData: {
          amount: 0, // Rent is 0
          tax_amount: 0,
          total_amount: totalAmount,
          transaction_uuid: payment._id.toString(),
          product_code: ESEWA_SCD,
          product_service_charge: serviceFee,
          product_delivery_charge: 0,
          success_url: `${APP_URL}/payment/verify?gateway=esewa`,
          failure_url: `${APP_URL}/payment-status?status=failed`,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature: signature,
        }
      };
    }

    await payment.save({ session });
    await session.commitTransaction();

    res.json({ 
      paymentId: payment._id, 
      gateway: paymentMethod,
      ...gatewayData 
    });

  } catch (error: any) {
    await session.abortTransaction();
    console.error('Payment Initiation Error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  } finally {
    session.endSession();
  }
};

export const verifyPayment = async (req: any, res: Response) => {
  const { pidx, data, gateway } = req.body; // data is base64 for esewa v2
  const userId = req.user.userId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let paymentId = '';
    let success = false;
    let transactionId = '';
    let refId = '';

    if (gateway === 'khalti') {
      const verification = await verifyKhaltiPayment(pidx);
      if (verification.status === 'Completed') {
        paymentId = verification.purchase_order_id;
        transactionId = verification.transaction_id;
        success = true;
      }
    } else if (gateway === 'esewa') {
      // eSewa v2 sends data in base64
      const decodedData = JSON.parse(Buffer.from(data, 'base64').toString());
      paymentId = decodedData.transaction_uuid;
      refId = decodedData.transaction_code;
      
      const { signed_field_names, signature } = decodedData;
      
      if (signed_field_names && signature) {
        const fields = signed_field_names.split(',');
        const dataString = fields.map((field: string) => `${field}=${decodedData[field]}`).join(',');
        
        const isValidSignature = verifyEsewaSignature(dataString, signature, ESEWA_SECRET);
        
        if (isValidSignature && decodedData.status === 'COMPLETE') {
          success = true;
        } else {
          console.error('eSewa signature verification failed or status not COMPLETE');
        }
      }
    }

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const listing = await Listing.findById(payment.listingId).session(session);

    if (success) {
      payment.status = 'success';
      payment.transactionId = transactionId || refId;
      payment.refId = refId;
      await payment.save({ session });

      if (listing) {
        listing.lockStatus = 'booked';
        await listing.save({ session });
      }

      // Create notification
      const notification = new Notification({
        userId: payment.userId,
        type: 'payment_success',
        message: `Payment of Rs. ${payment.totalAmount} for ${listing?.title} was successful.`,
        link: `/listing/${listing?._id}`
      });
      await notification.save({ session });

      await session.commitTransaction();

      emitToUser(payment.userId.toString(), 'paymentSuccess', { paymentId: payment._id });
      
      const user = await User.findById(payment.userId);
      if (user?.email) {
        await sendEmail(user.email, 'Booking Successful', `<h1>Payment Successful</h1><p>Your booking for ${listing?.title} is confirmed.</p>`);
      }

      res.json({ success: true, transactionId: payment.transactionId });
    } else {
      payment.status = 'failed';
      payment.retryExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await payment.save({ session });

      if (listing) {
        listing.lockStatus = 'available';
        await listing.save({ session });
      }

      await session.commitTransaction();

      emitToUser(payment.userId.toString(), 'paymentFailed', { paymentId: payment._id });
      res.json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    await session.abortTransaction();
    console.error('Payment Verification Error:', error);
    res.status(500).json({ error: 'Verification failed' });
  } finally {
    session.endSession();
  }
};

export const retryPayment = async (req: any, res: Response) => {
  const { paymentId } = req.params;
  const userId = req.user.userId;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.status !== 'failed') {
      return res.status(400).json({ error: 'Only failed payments can be retried' });
    }

    if (payment.retryCount >= 3) {
      return res.status(400).json({ error: 'Maximum retry attempts reached' });
    }

    if (new Date() > payment.retryExpiry!) {
      return res.status(400).json({ error: 'Retry window expired' });
    }

    payment.retryCount += 1;
    payment.retryHistory.push({
      timestamp: new Date(),
      status: 'retry_initiated',
      gateway: payment.paymentMethod
    });
    
    // Re-initiate logic (simplified: return data for frontend to re-initiate)
    // In a real app, you might want to call the initiate logic again
    await payment.save();
    
    // For simplicity, we'll just tell the frontend it can try again
    res.json({ success: true, message: 'Retry allowed', retryCount: payment.retryCount });
  } catch (error) {
    res.status(500).json({ error: 'Retry failed' });
  }
};

export const getFeePreview = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  try {
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const serviceFee = await calculateServiceFee(listing.propertyType || listing.roomType);
    res.json({
      listingPrice: listing.price,
      serviceFee,
      totalAmount: listing.price + serviceFee,
      feeLabel: 'Service Fee',
      note: 'Fee charged only if booking accepted'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fee preview' });
  }
};

export const getPaymentHistory = async (req: any, res: Response) => {
  const userId = req.user.userId;
  const { page = 1, limit = 10, status } = req.query;

  try {
    const query: any = { userId };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('listingId', 'title images');

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      total,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const getOneTapStatus = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user?.savedPaymentTokens || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch one-tap status' });
  }
};

export const deleteOneTapToken = async (req: any, res: Response) => {
  const { gateway } = req.params;
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { savedPaymentTokens: { gateway } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete token' });
  }
};
