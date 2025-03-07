export interface IFlutterWave {
    userEmail: string;
    transactionId: string;
    amount: number;
    status: string;
    tx_ref?: string;
    redirect_url?: string,
}