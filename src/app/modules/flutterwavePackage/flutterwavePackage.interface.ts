export interface IFlutterWave {
    userEmail: string;
    transactionId: string;
    amount: number;
    status: "successful" | "failed";
    tx_ref?: string;
    redirect_url?: string,
    startTime?: Date,
    email?: string
}