import { Model } from 'mongoose';

export type IPayment = {
  // Define the interface for Payment here
};

export type PaymentModel = Model<IPayment>;
