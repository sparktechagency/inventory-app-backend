import { Request, Response } from 'express';
import { NotificationServices } from './notification.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getNotifications = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const notifications = await NotificationServices.getNotificationsByUserId(userId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications,
    });
});

export const NotificationController = {
    getNotifications,
};
