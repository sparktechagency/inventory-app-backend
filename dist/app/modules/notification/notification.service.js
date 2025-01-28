"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationServices = void 0;
const notification_model_1 = require("./notification.model");
const createNotification = async (payload) => {
    const notification = await notification_model_1.NotificationModel.create(payload);
    return notification;
};
const getNotificationsByUserId = async (userId) => {
    return await notification_model_1.NotificationModel.find({ userId }).sort({ createdAt: -1 });
};
exports.NotificationServices = {
    createNotification,
    getNotificationsByUserId,
};
