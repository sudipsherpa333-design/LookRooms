import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceFeePayment extends Document {
  bookingRequestId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  landlordId: mongoose.Types.ObjectId;
  roomType: string;
  roomTypeLabel: string;
  monthlyRent: number;
  serviceFee: number;
  feeLabel: string;
  paymentMethod: 'esewa' | 'khalti';
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'refund_pending';
  transactionId: string;
  pidx: string;
  refId: string;
  gatewayResponse: any;
  paidAt: Date;
  paymentDeadline: Date;
  retryCount: number;
  retryExpiry: Date;
  retryHistory: any[];
  refundStatus: 'none' | 'pending' | 'processed' | 'failed';
  refundReason: string;
  refundAmount: number;
  refundedAt: Date;
  refundTxnId: string;
  refundTriggeredBy: 'landlord_rejected' | 'expired' | 'admin' | 'system';
  receiptNumber: string;
  receiptUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceFeePaymentSchema = new Schema({
  bookingRequestId: { type: Schema.Types.ObjectId, ref: 'BookingRequest', required: true },
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  landlordId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomType: { type: String },
  roomTypeLabel: { type: String },
  monthlyRent: { type: Number },
  serviceFee: { type: Number, required: true },
  feeLabel: { type: String },
  paymentMethod: { type: String, enum: ['esewa', 'khalti'] },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'refund_pending'],
    default: 'pending'
  },
  transactionId: { type: String },
  pidx: { type: String },
  refId: { type: String },
  gatewayResponse: { type: Object },
  paidAt: { type: Date },
  paymentDeadline: { type: Date },
  retryCount: { type: Number, default: 0 },
  retryExpiry: { type: Date },
  retryHistory: [{
    attemptedAt: { type: Date },
    method: { type: String },
    status: { type: String },
    failReason: { type: String }
  }],
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processed', 'failed'],
    default: 'none'
  },
  refundReason: { type: String },
  refundAmount: { type: Number },
  refundedAt: { type: Date },
  refundTxnId: { type: String },
  refundTriggeredBy: {
    type: String,
    enum: ['landlord_rejected', 'expired', 'admin', 'system']
  },
  receiptNumber: { type: String, unique: true },
  receiptUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export const ServiceFeePayment = mongoose.model<IServiceFeePayment>('ServiceFeePayment', ServiceFeePaymentSchema);
