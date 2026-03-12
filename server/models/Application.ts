import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  homeowner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "under_review", "accepted", "rejected", "cancelled", "completed"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "paid", "failed"],
    default: "unpaid",
  },
  message: String,
  personalInfo: {
    fullName: String,
    phone: String,
    email: String,
    currentAddress: String,
    occupation: String,
    workplace: String,
    idType: String,
    idNumber: String,
  },
  preferences: {
    moveInDate: Date,
    stayDuration: String,
    numberOfOccupants: Number,
    vehicleInfo: { hasBike: Boolean, hasCar: Boolean, hasCycle: Boolean },
  },
  screeningAnswers: [{ questionId: String, question: String, answer: String }],
  documents: [{ type: String, url: String, verified: Boolean }],
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  respondedAt: Date,
  viewingScheduled: Date,
  viewingConfirmed: Boolean,
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  lastMessageAt: Date,
  decisionReason: String,
  decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  decisionAt: Date,
});

export const Application = mongoose.model("Application", applicationSchema);
