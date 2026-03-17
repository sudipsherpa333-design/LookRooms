import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  reviewerRole: { type: String, enum: ['tenant', 'landlord'] },
  ratings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    ownerResponse: { type: Number, min: 1, max: 5 },
    waterSupply: { type: Number, min: 1, max: 5 },
    electricity: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
    security: { type: Number, min: 1, max: 5 },
    overallExperience: { type: Number, min: 1, max: 5 }
  },
  tenantRatings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    rentPaymentTime: { type: Number, min: 1, max: 5 },
    behaviour: { type: Number, min: 1, max: 5 },
    propertyCaretaking: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 }
  },
  comment: { type: String, maxLength: 1000 },
  isPublic: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending','published','flagged','removed'], default: 'pending' },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ownerReply: { type: String },
  ownerRepliedAt: { type: Date },
  flaggedReason: { type: String },
  averageRating: { type: Number },
  
  // Advanced Review Features
  photoUrls:      [{ type: String }],
  stayDuration:   { type: Number },
  isPhotoVerified:{ type: Boolean, default: false },
  aiSummaryUsed:  { type: Boolean, default: false },
  dispute: {
    status:     { type: String, enum: ['none', 'pending', 'resolved', 'dismissed'], default: 'none' },
    reason:     String,
    evidence:   [String],
    resolution: String,
    resolvedAt: Date
  },
  incentiveGiven: { type: Boolean, default: false },
  incentiveAmount:{ type: Number }
}, { timestamps: true });
export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
