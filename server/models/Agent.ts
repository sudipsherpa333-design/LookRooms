import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  user: mongoose.Types.ObjectId;
  bio: string;
  specialties: string[];
  rating: number;
  numReviews: number;
  feeRules: {
    roomType: 'single' | 'double' | 'triple' | 'quad';
    fee: number;
  }[];
}

const agentSchema = new Schema<IAgent>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, required: true },
  specialties: [{ type: String }],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  feeRules: [{
    roomType: { type: String, enum: ['single', 'double', 'triple', 'quad'], required: true },
    fee: { type: Number, required: true }
  }]
}, {
  timestamps: true
});

export const Agent = mongoose.model<IAgent>('Agent', agentSchema);
