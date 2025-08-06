import { Types } from "mongoose";

export interface INotification {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt?: Date;
}


