import { Model, Types } from "mongoose"

export type IMultiPaymentMethod = {
    customerId: string,
    price: number,
    user: Types.ObjectId,
    trxId: string,
    subscriptionId: string,
    status: 'expired' | 'active' | 'cancel';
    currentPeriodStart: string,
    currentPeriodEnd: string,
    paymentMethod: 'flutterwave' | 'paystack'
}

export type multiPaymentMethodModel = Model<IMultiPaymentMethod, Record<string, never>>