import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeRule extends Document {
  roomType: 'single_room' | 'two_room_flat' | '1bhk' | '2bhk' | 'studio_office';
  roomTypeLabel: string;
  serviceFee: number;
  feeLabel: string;
  isActive: boolean;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const FeeRuleSchema = new Schema({
  roomType: {
    type: String,
    enum: ['single_room', 'two_room_flat', '1bhk', '2bhk', 'studio_office'],
    unique: true,
    required: true
  },
  roomTypeLabel: { type: String },
  serviceFee: { type: Number, required: true },
  feeLabel: { type: String },
  isActive: { type: Boolean, default: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

export const FeeRule = mongoose.model<IFeeRule>('FeeRule', FeeRuleSchema);
