import { Request, Response } from 'express';
import { Payment } from '../models/Payment';
import { Application } from '../models/Application';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';

export const initiatePayment = asyncHandler(async (req: any, res: Response) => {
  const { applicationId, amount, method } = req.body;

  const application = await Application.findById(applicationId);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const merchantTransactionId = `TXN-${Date.now()}-${req.user.id}`;

  const payment = await Payment.create({
    user: req.user.id,
    application: applicationId,
    amount,
    method,
    merchantTransactionId
  });

  // Generate signature for eSewa if needed
  let signature = '';
  if (method === 'esewa') {
    const secret = process.env.ESEWA_SECRET_KEY || '8g8M898m86688c45';
    const data = `total_amount=${amount},transaction_uuid=${merchantTransactionId},product_code=EPAYTEST`;
    signature = crypto.createHmac('sha256', secret).update(data).digest('base64');
    payment.signature = signature;
    await payment.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment,
      signature
    }
  });
});

export const verifyPayment = asyncHandler(async (req: any, res: Response) => {
  const { merchantTransactionId, transactionId, status, method } = req.body;

  const payment = await Payment.findOne({ merchantTransactionId });

  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  if (status === 'success') {
    payment.status = 'success';
    payment.transactionId = transactionId;
    await payment.save();

    // Update application status
    const application = await Application.findById(payment.application);
    if (application) {
      application.serviceFeePaid = true;
      application.paymentTransactionId = transactionId;
      application.paymentMethod = method;
      await application.save();
    }
  } else {
    payment.status = 'failed';
    await payment.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});
