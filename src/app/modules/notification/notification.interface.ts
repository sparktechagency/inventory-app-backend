
export interface INotification {
  userId: string;   // reference to the user
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
}


