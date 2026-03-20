import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeRule extends Document {
  roomType: 'single' | 'double' | 'triple' | 'quad';
  fee: number;
  isActive: boolean;
}

const feeRuleSchema = new Schema<IFeeRule>({
  roomType: { type: String, enum: ['single', 'double', 'triple', 'quad'], required: true, unique: true },
  fee: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

export const FeeRule = mongoose.model<IFeeRule>('FeeRule', feeRuleSchema);
