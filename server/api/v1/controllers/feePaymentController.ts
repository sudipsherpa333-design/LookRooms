import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Listing } from '../../../models/index.js';
import { ServiceFeePayment } from '../../../models/ServiceFeePayment.js';
import { BookingRequest } from '../../../models/BookingRequest.js';
import { calculateServiceFee } from '../../../utils/feeCalculator.js';
import { initiateKhaltiPayment, verifyKhaltiPayment } from '../../../utils/khaltiHelper.js';
import { generateEsewaSignature, verifyEsewaSignature } from '../../../utils/esewaHelper.js';
import axios from 'axios';
import { nanoid } from 'nanoid';

const ESEWA_SCD = process.env.ESEWA_SCD || 'EPAYTEST';
const ESEWA_SECRET = process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export const initiatePayment = async (req: any, res: Response) => {
  const { feePaymentId, paymentMethod } = req.body;
  const tenantId = req.user.userId;

  try {
    const payment = await ServiceFeePayment.findOne({ _id: feePaymentId, tenantId, status: 'pending' });
    if (!payment) return res.status(404).json({ error: 'Payment not found or already processed' });
    if (new Date() > payment.paymentDeadline) return res.status(400).json({ error: 'Payment deadline expired' });

    payment.paymentStatus = 'processing';
    payment.paymentMethod = paymentMethod;
    await payment.save();

    if (paymentMethod === 'khalti') {
      const khaltiResponse = await initiateKhaltiPayment({
        return_url: `${APP_URL}/payment/verify`,
        website_url: APP_URL,
        amount: payment.serviceFee * 100,
        purchase_order_id: payment._id.toString(),
        purchase_order_name: `LookRooms - ${payment.feeLabel}`,
        customer_info: { name: 'Tenant', email: 'tenant@example.com', phone: '9800000000' }
      });
      payment.pidx = khaltiResponse.pidx;
      await payment.save();
      res.json({ paymentUrl: khaltiResponse.payment_url, pidx: khaltiResponse.pidx, gateway: 'khalti' });
    } else {
      // eSewa
      const signature = generateEsewaSignature(payment.serviceFee, payment._id.toString(), ESEWA_SCD, ESEWA_SECRET);
      res.json({
        gatewayUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        formFields: {
          amt: payment.serviceFee,
          psc: 0,
          pdc: 0,
          txAmt: 0,
          tAmt: payment.serviceFee,
          pid: payment._id.toString(),
          scd: ESEWA_SCD,
          su: `${APP_URL}/payment/verify`,
          fu: `${APP_URL}/payment/failed`,
          signature: signature
        },
        gateway: 'esewa'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const { feePaymentId, pidx, refId, gateway } = req.body;
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await ServiceFeePayment.findById(feePaymentId).session(session);
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Payment not found' });
    }

    let verified = false;
    let transactionId = '';

    if (gateway === 'khalti') {
      const lookup = await verifyKhaltiPayment(pidx);
      if (lookup.status === 'Completed') {
        verified = true;
        transactionId = lookup.transaction_id;
      }
    } else {
      // eSewa verification
      const encodedData = Buffer.from(refId, 'base64').toString('utf-8');
      const decodedData = JSON.parse(encodedData);
      
      const { signed_field_names, signature } = decodedData;
      
      if (signed_field_names && signature) {
        const fields = signed_field_names.split(',');
        const dataString = fields.map((field: string) => `${field}=${decodedData[field]}`).join(',');
        
        const isValidSignature = verifyEsewaSignature(dataString, signature, ESEWA_SECRET);
        
        if (isValidSignature && decodedData.status === 'COMPLETE') {
          verified = true;
          transactionId = decodedData.transaction_code || refId;
        } else {
          console.error('eSewa signature verification failed or status not COMPLETE');
        }
      }
    }

    if (verified) {
      payment.paymentStatus = 'paid';
      payment.paidAt = new Date();
      payment.transactionId = transactionId;
      payment.receiptNumber = `LR-FEE-${new Date().getFullYear()}-${nanoid(6)}`;
      await payment.save({ session });

      await BookingRequest.findByIdAndUpdate(payment.bookingRequestId, { status: 'fee_paid', landlordDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000) }, { session });
      
      await session.commitTransaction();
      res.json({ success: true, receiptNumber: payment.receiptNumber });
    } else {
      payment.paymentStatus = 'failed';
      await payment.save({ session });
      await session.commitTransaction();
      res.json({ success: false, message: 'Verification failed' });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Verification failed' });
  } finally {
    session.endSession();
  }
};
