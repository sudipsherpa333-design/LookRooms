import mongoose, { Schema } from "mongoose";

const userTrustScoreSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
  trustScore: { type: Number, default: 100, min: 0, max: 100 },
  trustLevel: {
    type: String,
    enum: ['new', 'trusted', 'verified', 'suspicious', 'blacklisted'],
    default: 'new'
  },
  completedBookings: { type: Number, default: 0 },
  cancelledBookings: { type: Number, default: 0 },
  noDeals: { type: Number, default: 0 },
  scamReportsReceived: { type: Number, default: 0 },
  scamReportsGiven: { type: Number, default: 0 },
  positiveReviews: { type: Number, default: 0 },
  negativeReviews: { type: Number, default: 0 },
  responseRate: { type: Number, default: 0 },
  avgResponseTime: { type: Number, default: 0 },
  scoreHistory: [{
    change: Number,
    reason: String,
    triggeredBy: String,
    timestamp: { type: Date, default: Date.now }
  }],
  lastCalculatedAt: Date
}, { timestamps: true });

export const UserTrustScore = mongoose.models.UserTrustScore || mongoose.model("UserTrustScore", userTrustScoreSchema);
