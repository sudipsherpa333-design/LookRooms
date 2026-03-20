import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  reviewer: mongoose.Types.ObjectId;
  target: mongoose.Types.ObjectId; // User (landlord/tenant) or Listing
  targetType: 'User' | 'Listing';
  rating: number;
  comment: string;
  cleanliness?: number;
  communication?: number;
  location?: number;
  behavior?: number;
}

const reviewSchema = new Schema<IReview>({
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  target: { type: Schema.Types.ObjectId, required: true, refPath: 'targetType', index: true },
  targetType: { type: String, required: true, enum: ['User', 'Listing'] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  cleanliness: { type: Number, min: 1, max: 5 },
  communication: { type: Number, min: 1, max: 5 },
  location: { type: Number, min: 1, max: 5 },
  behavior: { type: Number, min: 1, max: 5 }
}, {
  timestamps: true
});

export const Review = mongoose.model<IReview>('Review', reviewSchema);
