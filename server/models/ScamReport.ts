import mongoose, { Schema } from "mongoose";

const scamReportSchema = new Schema({
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing' },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  reportType: {
    type: String,
    enum: [
      'fake_listing', 'payment_outside_app', 'fake_landlord', 'no_show',
      'wrong_information', 'harassment', 'ghost_after_payment', 'double_booking', 'other'
    ]
  },
  description: { type: String, required: true },
  evidenceUrls: [String],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminReviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  adminDecision: String,
  adminActionTaken: {
    type: String,
    enum: ['none', 'warning_issued', 'account_suspended', 'account_banned', 'listing_removed', 'refund_initiated']
  },
  resolvedAt: Date
}, { timestamps: true });

export const ScamReport = mongoose.models.ScamReport || mongoose.model("ScamReport", scamReportSchema);
