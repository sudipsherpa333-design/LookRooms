import { Request, Response } from 'express';
import { Payment, User, Listing } from '../../../models/index.js';
import { emitToUser } from '../../../utils/socketEmitter.js';
import mongoose from 'mongoose';

export const getAllPayments = async (req: Request, res: Response) => {
  const { status, gateway, page = 1, limit = 10, dateFrom, dateTo } = req.query;

  try {
    const query: any = {};
    if (status) query.status = status;
    if (gateway) query.paymentMethod = gateway;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('userId', 'name phone email')
      .populate('listingId', 'title price');

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      total,
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const processRefund = async (req: any, res: Response) => {
  const { paymentId } = req.params;
  const { reason } = req.body;
  const adminId = req.user.userId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Atomically update to pending to prevent double refund
    const payment = await Payment.findOneAndUpdate(
      { 
        _id: paymentId, 
        status: 'success', 
        'refund.status': { $ne: 'processed' } 
      },
      { 
        $set: { 
          'refund.status': 'pending',
          'refund.reason': reason,
          'refund.processedBy': adminId,
          'refund.refundDate': new Date()
        } 
      },
      { new: true, session }
    );

    if (!payment) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Payment not eligible for refund or already processed' });
    }

    // In a real app, call eSewa/Khalti refund API here
    // For demo, we'll simulate success
    const refundSuccess = true; 
    const refundTxnId = 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    if (refundSuccess) {
      payment.status = 'refunded';
      payment.refund.status = 'processed';
      payment.refund.refundTxnId = refundTxnId;
      await payment.save({ session });

      // Release listing if it was booked (optional business logic)
      await Listing.findByIdAndUpdate(payment.listingId, { lockStatus: 'available' }, { session });

      await session.commitTransaction();

      emitToUser(payment.userId.toString(), 'refundProcessed', { paymentId: payment._id, refundTxnId });
      
      res.json({ success: true, refundTxnId });
    } else {
      payment.refund.status = 'failed';
      await payment.save({ session });
      await session.abortTransaction();
      res.status(500).json({ error: 'Gateway refund failed' });
    }

  } catch (error) {
    await session.abortTransaction();
    console.error('Refund Error:', error);
    res.status(500).json({ error: 'Refund processing failed' });
  } finally {
    session.endSession();
  }
};

export const getPaymentAnalytics = async (req: Request, res: Response) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const successPayments = await Payment.countDocuments({ status: 'success' });
    const totalRefunds = await Payment.countDocuments({ status: 'refunded' });
    
    const revenueByGateway = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$totalAmount' } } }
    ]);

    const dailyStats = await Payment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json({
      totalPayments,
      successRate: totalPayments > 0 ? (successPayments / totalPayments) * 100 : 0,
      totalRefunds,
      revenueByGateway,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
