
export type IPaymentPaystack = {
    name: String;
    description: String;
    price?: number;
    duration: '1 month' | '3 months' | '6 months' | '1 year';
    paymentType: 'Monthly' | 'Yearly';
    productId?: String;
    features?: string[];
    paymentLink?: string
}