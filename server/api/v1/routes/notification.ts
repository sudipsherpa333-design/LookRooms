import { Router } from 'express';
import { getNotifications, markAsRead, getPreferences, updatePreferences } from '../controllers/notificationController';
import { authMiddleware } from '../../../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.put('/read/:id', markAsRead);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

export default router;
