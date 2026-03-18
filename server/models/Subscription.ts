import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:         { type: String, enum: ['tenant_premium', 'landlord_premium'], required: true },
  status:       { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate:    { type: Date, default: Date.now },
  endDate:      { type: Date, required: true },
  autoRenew:    { type: Boolean, default: true },
  paymentMethod:{ type: String },
  amount:       { type: Number },
  invoices:     [{ date: Date, amount: Number, url: String }]
}, { timestamps: true });

export const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
