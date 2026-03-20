import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentReview extends Document {
  agent: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

const agentReviewSchema = new Schema<IAgentReview>({
  agent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, {
  timestamps: true
});

export const AgentReview = mongoose.model<IAgentReview>('AgentReview', agentReviewSchema);
