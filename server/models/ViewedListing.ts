import mongoose from "mongoose";

const viewedListingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
  viewedAt: { type: Date, default: Date.now },
});
viewedListingSchema.index({ userId: 1, viewedAt: -1 });
export const ViewedListing = mongoose.models.ViewedListing || mongoose.model("ViewedListing", viewedListingSchema);
