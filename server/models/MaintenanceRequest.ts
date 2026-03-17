import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  homeownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'emergency'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  images: [String],
  category: { type: String, enum: ['plumbing', 'electrical', 'appliance', 'structural', 'other'], default: 'other' },
  adminNotes: { type: String },
  resolvedAt: { type: Date },
}, { timestamps: true });

export const MaintenanceRequest = mongoose.models.MaintenanceRequest || mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
