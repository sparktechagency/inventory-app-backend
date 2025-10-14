export interface IPaymentVerification {
  email: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: "successful" | "failed";
  startTime: Date;
  endTime: Date;
  // verifiedAt: Date;
}
