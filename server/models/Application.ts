import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  tenant: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  landlord: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  moveInDate?: Date;
  serviceFeePaid: boolean;
  paymentTransactionId?: string;
  paymentMethod?: 'esewa' | 'khalti';
}

const applicationSchema = new Schema<IApplication>({
  tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
  landlord: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
  message: { type: String },
  moveInDate: { type: Date },
  serviceFeePaid: { type: Boolean, default: false },
  paymentTransactionId: { type: String },
  paymentMethod: { type: String, enum: ['esewa', 'khalti'] }
}, {
  timestamps: true
});

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
