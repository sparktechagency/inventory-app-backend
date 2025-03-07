export interface IPaymentVerification {
    userEmail: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: "successful" | "failed";
    // verifiedAt: Date;
}
