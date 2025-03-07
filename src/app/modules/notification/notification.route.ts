import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// 🔹 Fetch notifications for the logged-in user
router.get('/', auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler, USER_ROLES.Admin), NotificationController.getNotifications);

// 🔹 Admin can fetch notifications for a specific user
router.get('/:userId', auth(USER_ROLES.Admin), NotificationController.getNotificationsForUser);

router.patch('/:notificationId', auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler, USER_ROLES.Admin), NotificationController.markNotificationAsRead);
export const NotificationRoutes = router;
