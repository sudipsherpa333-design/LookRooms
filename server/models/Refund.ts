import mongoose, { Schema, Document } from 'mongoose';

export interface IRefund extends Document {
  payment: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  gatewayResponse?: any;
}

const refundSchema = new Schema<IRefund>({
  payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
  gatewayResponse: { type: Schema.Types.Mixed },
}, {
  timestamps: true
});

export const Refund = mongoose.model<IRefund>('Refund', refundSchema);
