export interface IPaymentVerification {
    email: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: "successful" | "failed";
    // verifiedAt: Date;
}
