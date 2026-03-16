import { Request, Response } from 'express';
import { Agent, AgentLead, AgentReview, Listing, User } from '../../../../server/models.js';

// --- AGENT AUTH & SETUP ---

export const registerAgent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existingAgent = await Agent.findOne({ userId });
    if (existingAgent) {
      return res.status(400).json({ error: 'Agent profile already exists' });
    }

    const { agencyName, agencySlug, agencyPhone, agencyAddress, agencyCity, licenseNumber } = req.body;

    // Check if slug is unique
    const slugExists = await Agent.findOne({ agencySlug });
    if (slugExists) {
      return res.status(400).json({ error: 'Agency slug is already taken' });
    }

    const newAgent = new Agent({
      userId,
      agencyName,
      agencySlug,
      agencyPhone,
      agencyAddress,
      agencyCity,
      licenseNumber,
      // other fields can be added here
    });

    await newAgent.save();

    // Update user role to agent
    await User.findByIdAndUpdate(userId, { role: 'agent' });

    res.status(201).json({ message: 'Agent registration submitted successfully', agent: newAgent });
  } catch (error) {
    console.error('Error registering agent:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAgentProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const agent = await Agent.findOne({ userId });
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    res.json({ agent });
  } catch (error) {
    console.error('Error fetching agent profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAgentProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const updates = req.body;

    // Prevent updating sensitive fields directly
    delete updates.isVerified;
    delete updates.verifiedAt;
    delete updates.verifiedBy;
    delete updates.trustBadge;
    delete updates.trustScore;
    delete updates.plan;

    const agent = await Agent.findOneAndUpdate({ userId }, updates, { new: true });
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    res.json({ message: 'Profile updated successfully', agent });
  } catch (error) {
    console.error('Error updating agent profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAgentStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const agent = await Agent.findOne({ userId }).select('isVerified isSuspended plan planExpiry');
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    let status = 'pending';
    if (agent.isSuspended) status = 'suspended';
    else if (agent.isVerified) status = 'verified';

    res.json({ status, isVerified: agent.isVerified, isSuspended: agent.isSuspended, plan: agent.plan });
  } catch (error) {
    console.error('Error fetching agent status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- LISTINGS ---

export const getAgentListings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const agent = await Agent.findOne({ userId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const listings = await Listing.find({ agentId: agent._id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) {
    console.error('Error fetching agent listings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createAgentListing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const agent = await Agent.findOne({ userId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (!agent.isVerified) return res.status(403).json({ error: 'Agent must be verified to create listings' });

    const listingData = {
      ...req.body,
      homeowner: userId, // The agent is the creator
      listedBy: 'agent',
      agentId: agent._id,
      isAgentListing: true
    };

    const newListing = new Listing(listingData);
    await newListing.save();

    // Update agent stats
    await Agent.findByIdAndUpdate(agent._id, { $inc: { 'stats.totalListings': 1, 'stats.activeListings': 1 } });

    res.status(201).json({ message: 'Listing created successfully', listing: newListing });
  } catch (error) {
    console.error('Error creating agent listing:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateAgentListing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const agent = await Agent.findOne({ userId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const { id } = req.params;
    const listing = await Listing.findOneAndUpdate(
      { _id: id, agentId: agent._id },
      req.body,
      { new: true }
    );

    if (!listing) return res.status(404).json({ error: 'Listing not found or unauthorized' });

    res.json({ message: 'Listing updated successfully', listing });
  } catch (error) {
    console.error('Error updating agent listing:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- FEE MANAGEMENT ---

export const getFeeStructure = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const agent = await Agent.findOne({ userId }).select('feeStructure defaultServiceFee');
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    res.json({ feeStructure: agent.feeStructure, defaultServiceFee: agent.defaultServiceFee });
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateFeeStructure = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { feeStructure, defaultServiceFee } = req.body;

    const agent = await Agent.findOneAndUpdate(
      { userId },
      { feeStructure, defaultServiceFee },
      { new: true }
    ).select('feeStructure defaultServiceFee');

    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    res.json({ message: 'Fee structure updated successfully', feeStructure: agent.feeStructure, defaultServiceFee: agent.defaultServiceFee });
  } catch (error) {
    console.error('Error updating fee structure:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- CRM LEADS ---

export const getAgentLeads = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const agent = await Agent.findOne({ userId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const leads = await AgentLead.find({ agentId: agent._id })
      .populate('tenantId', 'name email phone avatar')
      .populate('listingId', 'title price location images')
      .sort({ updatedAt: -1 });

    res.json({ leads });
  } catch (error) {
    console.error('Error fetching agent leads:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const agent = await Agent.findOne({ userId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const { id } = req.params;
    const { status } = req.body;

    const lead = await AgentLead.findOneAndUpdate(
      { _id: id, agentId: agent._id },
      { status },
      { new: true }
    );

    if (!lead) return res.status(404).json({ error: 'Lead not found or unauthorized' });

    res.json({ message: 'Lead status updated successfully', lead });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- ANALYTICS ---

export const getAgentAnalyticsOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const agent = await Agent.findOne({ userId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // In a real app, you'd aggregate data based on date ranges here.
    // For now, returning the cached stats from the agent model.
    res.json({ stats: agent.stats });
  } catch (error) {
    console.error('Error fetching agent analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- PUBLIC PROFILE ---

export const getPublicAgentProfile = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const agent = await Agent.findOne({ agencySlug: slug, isVerified: true })
      .select('-licenseNumber -licenseDocUrl -plan -planExpiry'); // Hide sensitive info

    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const listings = await Listing.find({ agentId: agent._id, status: 'active' })
      .select('title price location images propertyType')
      .limit(10);

    const reviews = await AgentReview.find({ agentId: agent._id, status: 'published' })
      .populate('reviewerId', 'name avatar')
      .limit(5);

    res.json({ agent, listings, reviews });
  } catch (error) {
    console.error('Error fetching public agent profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllAgents = async (req: Request, res: Response) => {
  try {
    const agents = await Agent.find({ isVerified: true, isActive: true })
      .select('agencyName agencySlug agencyLogo agencyCity stats trustBadge')
      .sort({ 'stats.totalDeals': -1 })
      .limit(20);

    res.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
