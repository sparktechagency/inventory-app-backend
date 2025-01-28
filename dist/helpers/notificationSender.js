"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationSender = void 0;
const notification_service_1 = require("../app/modules/notification/notification.service");
const notificationSender = async (io, channel, data) => {
    try {
        // Emit the notification through Socket.IO
        io.emit(channel, data);
        console.log(`Notification sent to channel: ${channel}`, data);
        // Save the notification in the database
        const notificationPayload = {
            userId: data.userId,
            title: data.title,
            message: data.message,
            isRead: false,
        };
        await notification_service_1.NotificationServices.createNotification(notificationPayload);
        console.log('Notification stored in the database successfully.');
    }
    catch (error) {
        console.error("Error sending or storing notification:", error);
    }
};
exports.notificationSender = notificationSender;
