import mongoose, { Schema } from "mongoose";

const bookingStatusSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  landlordId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currentStatus: {
    type: String,
    enum: [
      'inquiry_sent', 'in_discussion', 'visit_scheduled', 'visit_done',
      'deal_in_progress', 'booked', 'not_interested', 'no_deal',
      'room_not_available', 'scam_reported', 'admin_hold',
      'completed', 'vacated', 'cancelled'
    ],
    default: 'inquiry_sent'
  },
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedRole: { type: String, enum: ['tenant', 'landlord', 'admin'] },
  statusReason: { type: String },
  statusHistory: [{
    status: String,
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['tenant', 'landlord', 'admin'] },
    reason: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  visitScheduledAt: Date,
  visitCompletedAt: Date,
  visitNotes: String,
  scamReportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  scamReportReason: String,
  scamReportedAt: Date,
  isFlagged: { type: Boolean, default: false },
  flagReason: String,
  adminNote: String,
  adminActionAt: Date,
  trustImpact: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'refund_pending'],
    default: 'pending'
  }
}, { timestamps: true });

export const BookingStatus = mongoose.models.BookingStatus || mongoose.model("BookingStatus", bookingStatusSchema);
