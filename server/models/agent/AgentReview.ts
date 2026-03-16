import mongoose from 'mongoose';

const agentReviewSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingRequest' },
  
  ratings: {
    communication: { type: Number, min: 1, max: 5, required: true },
    professionalism: { type: Number, min: 1, max: 5, required: true },
    accuracy: { type: Number, min: 1, max: 5, required: true },
    responsiveness: { type: Number, min: 1, max: 5, required: true },
    overallService: { type: Number, min: 1, max: 5, required: true }
  },
  
  comment: { type: String },
  isVerified: { type: Boolean, default: true },
  
  status: { 
    type: String,
    enum: ['published', 'flagged', 'removed'],
    default: 'published'
  }
}, { timestamps: true });

export const AgentReview = mongoose.models.AgentReview || mongoose.model('AgentReview', agentReviewSchema);
