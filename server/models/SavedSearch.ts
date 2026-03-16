import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  filters: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const SavedSearch = mongoose.models.SavedSearch || mongoose.model("SavedSearch", savedSearchSchema);
