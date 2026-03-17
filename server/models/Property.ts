import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true },
  address:     String,
  totalRooms:  Number,
  sharedPhotos:[String],
  amenities:   [String],
  rooms:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }]
}, { timestamps: true });

export const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);
