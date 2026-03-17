import mongoose from "mongoose";

const shareTrackingSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  platform: { type: String, enum: ['whatsapp','facebook','messenger','twitter','copy_link','instagram'] },
  ipAddress: { type: String },
  userAgent: { type: String },
  clickCount: { type: Number, default: 0 },
}, { timestamps: true });
export const ShareTracking = mongoose.models.ShareTracking || mongoose.model("ShareTracking", shareTrackingSchema);
