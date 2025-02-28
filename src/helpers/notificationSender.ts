import { Server } from "socket.io";
import { NotificationServices } from "../app/modules/notification/notification.service";

export const notificationSender = async (
    io: Server,
    channel: string,
    data: { userId: string; title: string; message: string; type: string }
) => {
    try {
        // Emit the notification through Socket.IO
        io.emit(channel, data);

        // Save the notification in the database
        const notificationPayload = {
            userId: data.userId,
            title: data.title,
            message: data.message,
            isRead: false,
        };

        await NotificationServices.createNotification(notificationPayload);

    } catch (error) {
        console.error("Error sending or storing notification:", error);
    }
};
