import { Schema, model } from 'mongoose';
import { IPayment, PaymentModel } from './payment.interface'; 

const paymentSchema = new Schema<IPayment, PaymentModel>({
  // Define schema fields here
});

export const Payment = model<IPayment, PaymentModel>('Payment', paymentSchema);
