import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  otpHash: string;
  channel: 'email' | 'phone';
  identifier: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  ipAddress: string;
  createdAt: Date;
}

const PasswordResetSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  otpHash: { type: String, required: true },
  channel: { type: String, enum: ['email', 'phone'], required: true },
  identifier: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  isUsed: { type: Boolean, default: false },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// TTL index — auto delete after expiry
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordReset = mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
