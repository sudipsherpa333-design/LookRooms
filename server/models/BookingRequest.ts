import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingRequest extends Document {
  listingId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  landlordId: mongoose.Types.ObjectId;
  roomType: string;
  monthlyRent: number;
  roomAddress: string;
  status: 'pending_fee' | 'fee_paid' | 'landlord_reviewing' | 'accepted' | 'rejected' | 'expired' | 'confirmed' | 'cancelled' | 'completed';
  moveInDate: Date;
  stayDuration: string;
  occupants: number;
  tenantMessage: string;
  landlordResponse: string;
  landlordRespondedAt: Date;
  rejectionReason: string;
  feePaymentId: mongoose.Types.ObjectId;
  paymentDeadline: Date;
  landlordDeadline: Date;
  confirmDeadline: Date;
  contactShared: boolean;
  contactSharedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingRequestSchema = new Schema({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  landlordId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomType: { type: String },
  monthlyRent: { type: Number },
  roomAddress: { type: String },
  status: {
    type: String,
    enum: ['pending_fee', 'fee_paid', 'landlord_reviewing', 'accepted', 'rejected', 'expired', 'confirmed', 'cancelled', 'completed'],
    default: 'pending_fee'
  },
  moveInDate: { type: Date, required: true },
  stayDuration: { type: String },
  occupants: { type: Number, default: 1 },
  tenantMessage: { type: String },
  landlordResponse: { type: String },
  landlordRespondedAt: { type: Date },
  rejectionReason: { type: String },
  feePaymentId: { type: Schema.Types.ObjectId, ref: 'ServiceFeePayment' },
  paymentDeadline: { type: Date },
  landlordDeadline: { type: Date },
  confirmDeadline: { type: Date },
  contactShared: { type: Boolean, default: false },
  contactSharedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export const BookingRequest = mongoose.model<IBookingRequest>('BookingRequest', BookingRequestSchema);
