import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentLead extends Document {
  agent: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  listing?: mongoose.Types.ObjectId;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  notes?: string;
}

const agentLeadSchema = new Schema<IAgentLead>({
  agent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
  tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: Schema.Types.ObjectId, ref: 'Listing' },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'lost'], default: 'new' },
  notes: { type: String },
}, {
  timestamps: true
});

export const AgentLead = mongoose.model<IAgentLead>('AgentLead', agentLeadSchema);
