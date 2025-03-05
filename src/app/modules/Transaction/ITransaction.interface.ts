export interface ITransaction {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    customerEmail: string;
    paymentMethod: string;
    transactionDate: Date;
}
