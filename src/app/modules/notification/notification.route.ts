import express from 'express';
import { NotificationController } from './notification.controller';

const router = express.Router();

router.get('/', NotificationController.getNotifications);

export const NotificationRoutes = router;
