import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Agency identity
  agencyName: { type: String, required: true },
  agencySlug: { type: String, unique: true, required: true },
  agencyLogo: { type: String },
  agencyBio: { type: String, maxLength: 500 },
  agencyAddress: { type: String },
  agencyCity: { type: String },
  agencyPhone: { type: String },
  agencyEmail: { type: String },
  website: { type: String },
  socialLinks: {
    facebook: String,
    instagram: String,
    whatsapp: String
  },

  // Verification
  licenseNumber: { type: String },
  licenseDocUrl: { type: String },
  licenseExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Agent fee config
  defaultServiceFee: { type: Number, default: 1500 },
  feeStructure: [{
    roomType: { 
      type: String,
      enum: ['Single Room', 'Double Room', 'Triple Room', 'Studio Apartment', '1BHK', '2BHK', '3BHK', 'Whole House', 'Flat/Apartment', 'Hostel Bed', 'Commercial Space', 'Office Space'] 
    },
    serviceFee: { type: Number, min: 500, max: 10000 },
    feeLabel: { type: String },
    feeNote: { type: String }
  }],

  // Stats
  stats: {
    totalListings: { type: Number, default: 0 },
    activeListings: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    completedDeals: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }
  },

  // Trust
  trustBadge: { 
    type: String,
    enum: ['new', 'trusted', 'verified_agent', 'premium_agent', 'top_agent'],
    default: 'new'
  },
  trustScore: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },

  // Subscription
  plan: { 
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free' 
  },
  planExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Agent = mongoose.model('Agent', agentSchema);
