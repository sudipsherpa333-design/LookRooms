import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  owner: mongoose.Types.ObjectId;
  address: string;
  city: string;
  area: string;
  type: 'apartment' | 'house' | 'hostel';
  totalUnits: number;
  amenities: string[];
}

const propertySchema = new Schema<IProperty>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  type: { type: String, enum: ['apartment', 'house', 'hostel'], required: true },
  totalUnits: { type: Number, default: 1 },
  amenities: [{ type: String }],
}, {
  timestamps: true
});

export const Property = mongoose.model<IProperty>('Property', propertySchema);
