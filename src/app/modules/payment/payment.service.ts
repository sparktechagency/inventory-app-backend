
import Stripe from "stripe";
import { IPaymentModel } from "./payment.interface";
import { PaymentModel } from "./payment.model";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2023-10-16" as any, // Force TypeScript to accept the API version
});
const CreatePaymentServices = async (payload: IPaymentModel) => {
    try {
        // Create a Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: payload.price * 100,
            currency: payload.section === "premium" ? "usd" : "eur",
            payment_method_types: ["card"],
        });

        // Store Payment Data in MongoDB
        const payment = new PaymentModel({
            ...payload,
            paymentIntentId: paymentIntent.id,
            status: "pending",
        });

        await payment.save();
        return { clientSecret: paymentIntent.client_secret, payment };
    } catch (error) {
        throw new Error((error as Error).message);
    }
};


export const PaymentService = {
    CreatePaymentServices
}
