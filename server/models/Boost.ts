import mongoose from "mongoose";

const boostSchema = new mongoose.Schema({
  listingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tier:        { type: String, enum: ['basic', 'premium', 'superboost'], required: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  cost:        Number,
  paymentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  impressions: { type: Number, default: 0 },
  extraViews:  { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

export const Boost = mongoose.models.Boost || mongoose.model("Boost", boostSchema);
