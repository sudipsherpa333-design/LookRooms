import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  amount: { type: Number, required: true },
  serviceFee: { type: Number },
  totalAmount: { type: Number },
  paymentMethod: { type: String, enum: ['esewa', 'khalti'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String, unique: true, sparse: true },
  pidx: { type: String },
  refId: { type: String },
  gatewayResponse: { type: Object },
  idempotencyKey: { type: String, unique: true, sparse: true },
  retryCount: { type: Number, default: 0 },
  retryExpiry: { type: Date },
  retryHistory: [{ timestamp: Date, status: String, gateway: String }],
  oneTapToken: { type: String },
  refund: {
    status: { type: String, enum: ['none', 'pending', 'processed', 'failed'], default: 'none' },
    reason: { type: String },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    refundDate: { type: Date },
    refundTxnId: { type: String },
    gatewayRefundResponse: { type: Object }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
