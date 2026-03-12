import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'locked', 'confirmed', 'rejected', 'expired', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  moveInDate: Date,
  stayDuration: Number,
  serviceFeePaid: { type: Boolean, default: false },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  agreementUrl: String,
  tenantSignature: String,
  landlordSignature: String,
  idempotencyKey: { type: String, unique: true, sparse: true }
}, { timestamps: true });

bookingSchema.index({ listingId: 1, tenantId: 1, status: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
