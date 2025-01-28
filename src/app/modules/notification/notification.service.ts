import { INotification } from './notification.interface';
import { NotificationModel } from './notification.model';

const createNotification = async (payload: INotification) => {
    const notification = await NotificationModel.create(payload);
    return notification;
};

const getNotificationsByUserId = async (userId: string) => {
    return await NotificationModel.find({ userId }).sort({ createdAt: -1 });
};

export const NotificationServices = {
    createNotification,
    getNotificationsByUserId,
};
