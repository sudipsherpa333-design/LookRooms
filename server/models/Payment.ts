import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  application: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  method: 'esewa' | 'khalti';
  transactionId?: string;
  merchantTransactionId: string;
  signature?: string;
}

const paymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NPR' },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  method: { type: String, enum: ['esewa', 'khalti'], required: true },
  transactionId: { type: String },
  merchantTransactionId: { type: String, required: true, unique: true },
  signature: { type: String }
}, {
  timestamps: true
});

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
