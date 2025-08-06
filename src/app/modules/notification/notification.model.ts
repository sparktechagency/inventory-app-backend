import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    sender: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    receiver: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = model<INotification>('Notification', notificationSchema);
