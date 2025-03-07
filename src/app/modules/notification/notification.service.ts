import { INotification } from './notification.interface';
import { NotificationModel } from './notification.model';

const createNotification = async (payload: INotification) => {
    const notification = await NotificationModel.create(payload);
    return notification;
};

const getNotificationsByUserId = async (userId: string) => {
    return await NotificationModel.find({ userId }).sort({ createdAt: -1 });
};

const updateNotification = async (notificationId: string) => {
    return await NotificationModel.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    );
};


export const NotificationServices = {
    createNotification,
    getNotificationsByUserId,
    updateNotification
};
