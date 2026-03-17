import mongoose from "mongoose";

const contactLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  contactMethod: { type: String, default: "whatsapp" },
  platform: { type: String, default: "whatsapp" },
  timestamp: { type: Date, default: Date.now },
});

export const ContactLog = mongoose.models.ContactLog || mongoose.model("ContactLog", contactLogSchema);
