import mongoose, { Schema, Document } from 'mongoose';

export interface IListingBoost extends Document {
  listing: mongoose.Types.ObjectId;
  level: 'basic' | 'premium' | 'featured';
  expiresAt: Date;
  createdAt: Date;
}

const listingBoostSchema = new Schema<IListingBoost>({
  listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, unique: true },
  level: { type: String, enum: ['basic', 'premium', 'featured'], required: true },
  expiresAt: { type: Date, required: true, index: true },
}, {
  timestamps: true
});

export const ListingBoost = mongoose.model<IListingBoost>('ListingBoost', listingBoostSchema);
