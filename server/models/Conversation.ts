import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  roomListing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);
