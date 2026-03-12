import { Router } from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.js';
import homeownerRoutes from './routes/homeowner.js';
import adminRoutes from './routes/admin.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import paymentRoutes from './routes/payment.js';
import feeRoutes from './routes/feeRoutes.js';
import bookingRequestRoutes from './routes/bookingRequestRoutes.js';
import feePaymentRoutes from './routes/feePaymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import supportRoutes from './routes/support.js';
import notificationRoutes from './routes/notification.js';
import webhookRoutes from './routes/webhook.js';
import * as advancedSearch from './controllers/advancedSearchController.js';
import * as listingQuality from './controllers/listingQualityController.js';
import * as pricingEngine from './controllers/pricingEngineController.js';
import * as landlordTools from './controllers/landlordToolsController.js';
import * as tenantJourney from './controllers/tenantJourneyController.js';
import * as adminSuperPowers from './controllers/adminSuperPowersController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Feature Routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/homeowner', homeownerRoutes);
router.use('/admin', adminRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/payment', paymentRoutes);
router.use('/support', supportRoutes);
router.use('/fee', feeRoutes);
router.use('/booking', bookingRequestRoutes);
router.use('/fee-payment', feePaymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/webhooks', webhookRoutes);

// Advanced Feature Routes
router.get('/search/advanced', advancedSearch.advancedSearch);
router.get('/search/autocomplete', advancedSearch.autocomplete);
router.post('/listings/:id/quality-check', authMiddleware, listingQuality.checkListingQuality);
router.get('/pricing/market-intelligence', pricingEngine.getMarketPriceIntelligence);
router.post('/landlord/properties', authMiddleware, landlordTools.createProperty);
router.get('/landlord/properties', authMiddleware, landlordTools.getMyProperties);
router.post('/maintenance/request', authMiddleware, landlordTools.createMaintenanceRequest);
router.put('/maintenance/request/:id', authMiddleware, landlordTools.updateMaintenanceStatus);
router.get('/tenant/neighborhood-guide', tenantJourney.getNeighborhoodGuide);
router.get('/tenant/compare', tenantJourney.compareRooms);
router.post('/admin/assistant', authMiddleware, adminSuperPowers.adminAiAssistant);
router.get('/admin/fraud-detection', authMiddleware, adminSuperPowers.fraudDetection);
router.get('/admin/revenue-intelligence', authMiddleware, adminSuperPowers.revenueIntelligence);

export default router;
