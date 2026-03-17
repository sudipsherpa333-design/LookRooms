import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String },
  targetType: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object },
  ipAddress: { type: String },
}, { timestamps: true });
export const AdminLog = mongoose.models.AdminLog || mongoose.model("AdminLog", adminLogSchema);
