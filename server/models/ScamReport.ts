import mongoose, { Schema, Document } from 'mongoose';

export interface IScamReport extends Document {
  reporter: mongoose.Types.ObjectId;
  reportedUser: mongoose.Types.ObjectId;
  listing?: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  evidence: string[];
}

const scamReportSchema = new Schema<IScamReport>({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: Schema.Types.ObjectId, ref: 'Listing' },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'investigating', 'resolved', 'dismissed'], default: 'pending' },
  evidence: [{ type: String }],
}, {
  timestamps: true
});

export const ScamReport = mongoose.model<IScamReport>('ScamReport', scamReportSchema);
