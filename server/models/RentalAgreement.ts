import mongoose, { Schema, Document } from 'mongoose';

export interface IRentalAgreement extends Document {
  application: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  landlord: mongoose.Types.ObjectId;
  content: string;
  tenantSignature?: string;
  landlordSignature?: string;
  status: 'draft' | 'signed' | 'expired';
  pdfUrl?: string;
}

const rentalAgreementSchema = new Schema<IRentalAgreement>({
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
  tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  landlord: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  tenantSignature: { type: String },
  landlordSignature: { type: String },
  status: { type: String, enum: ['draft', 'signed', 'expired'], default: 'draft' },
  pdfUrl: { type: String },
}, {
  timestamps: true
});

export const RentalAgreement = mongoose.model<IRentalAgreement>('RentalAgreement', rentalAgreementSchema);
