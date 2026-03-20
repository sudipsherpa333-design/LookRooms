import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  propertyType: 'room' | 'apartment' | 'house' | 'hostel';
  roomType: 'single' | 'double' | 'triple' | 'quad';
  amenities: string[];
  location: {
    city: string;
    area: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  owner: mongoose.Types.ObjectId;
  status: 'available' | 'occupied' | 'hidden';
  views: number;
  applicationCount: number;
  rating: number;
  numReviews: number;
  listingVector?: number[];
  boost?: {
    level: 'none' | 'basic' | 'premium' | 'featured';
    expiresAt?: Date;
  };
}

const listingSchema = new Schema<IListing>({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, index: true },
  propertyType: { type: String, enum: ['room', 'apartment', 'house', 'hostel'], required: true },
  roomType: { type: String, enum: ['single', 'double', 'triple', 'quad'], required: true },
  amenities: [{ type: String }],
  location: {
    city: { type: String, required: true, index: true },
    area: { type: String, required: true, index: true },
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  images: [{ type: String }],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'occupied', 'hidden'], default: 'available' },
  views: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  listingVector: { type: [Number], index: true },
  boost: {
    level: { type: String, enum: ['none', 'basic', 'premium', 'featured'], default: 'none' },
    expiresAt: { type: Date }
  }
}, {
  timestamps: true
});

listingSchema.index({ 'location.coordinates': '2dsphere' });

export const Listing = mongoose.model<IListing>('Listing', listingSchema);
