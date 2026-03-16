import express from 'express';
import { authMiddleware as authenticateToken } from '../../../middleware/authMiddleware.js';
import * as agentController from '../controllers/agentController.js';

const router = express.Router();

export const authorizeRoles = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// --- PUBLIC ROUTES ---
router.get('/agents', agentController.getAllAgents);
router.get('/agents/:slug', agentController.getPublicAgentProfile);

// --- AGENT AUTH & SETUP ---
router.post('/agent/register', authenticateToken, agentController.registerAgent);
router.get('/agent/profile', authenticateToken, authorizeRoles('agent'), agentController.getAgentProfile);
router.put('/agent/profile', authenticateToken, authorizeRoles('agent'), agentController.updateAgentProfile);
router.get('/agent/status', authenticateToken, agentController.getAgentStatus);

// --- LISTINGS ---
router.get('/agent/listings', authenticateToken, authorizeRoles('agent'), agentController.getAgentListings);
router.post('/agent/listings', authenticateToken, authorizeRoles('agent'), agentController.createAgentListing);
router.put('/agent/listings/:id', authenticateToken, authorizeRoles('agent'), agentController.updateAgentListing);

// --- FEE MANAGEMENT ---
router.get('/agent/fee-structure', authenticateToken, authorizeRoles('agent'), agentController.getFeeStructure);
router.put('/agent/fee-structure', authenticateToken, authorizeRoles('agent'), agentController.updateFeeStructure);

// --- CRM LEADS ---
router.get('/agent/leads', authenticateToken, authorizeRoles('agent'), agentController.getAgentLeads);
router.put('/agent/leads/:id/status', authenticateToken, authorizeRoles('agent'), agentController.updateLeadStatus);

// --- ANALYTICS ---
router.get('/agent/analytics/overview', authenticateToken, authorizeRoles('agent'), agentController.getAgentAnalyticsOverview);

export default router;
