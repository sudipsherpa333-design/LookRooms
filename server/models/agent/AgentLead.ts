import mongoose from 'mongoose';

const agentLeadSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingRequest' },

  status: { 
    type: String,
    enum: ['new', 'contacted', 'visit_scheduled', 'visited', 'negotiating', 'deal_done', 'lost', 'inactive'],
    default: 'new'
  },

  source: { 
    type: String,
    enum: ['platform', 'whatsapp', 'phone', 'walk_in', 'referral', 'social'],
    default: 'platform'
  },

  tenantNotes: { type: String },
  followUpDate: { type: Date },
  followUpDone: { type: Boolean, default: false },
  dealValue: { type: Number },
  feeCollected: { type: Number },
  lostReason: { type: String },

  timeline: [{
    action: String,
    note: String,
    doneAt: { type: Date, default: Date.now },
    doneBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

export const AgentLead = mongoose.model('AgentLead', agentLeadSchema);
