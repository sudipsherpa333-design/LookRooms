import { Router } from 'express';
import { handleSendGridWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/sendgrid', handleSendGridWebhook);

export default router;
