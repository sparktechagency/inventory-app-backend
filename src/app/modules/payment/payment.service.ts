
import Stripe from "stripe";
import { IPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import { User } from "../user/user.model";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2023-10-16" as any, // Force TypeScript to accept the API version
});
const createPaymentService = async (payload: IPayment) => {
    const { user, package: packageId, price } = payload;

    // Fetch user and package details
    const existingUser = await User.findById(user);
    if (!existingUser) {
        throw new Error("User not found");
    }

    // Create Stripe customer (if not exists)
    let customerId = existingUser?.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: existingUser.email,
            name: existingUser.name,
        });
        customerId = customer.id;
        existingUser?.stripeCustomerId = customer.id;
        await existingUser.save();
    }

    // Create a payment intent for one-time payment
    const paymentIntent = await stripe.paymentIntents.create({
        amount: price * 100,
        currency: "usd",
        customer: customerId,
        payment_method_types: ["card"],
    });

    // Save payment details in the database
    const payment = await Payment.create({
        customerId,
        price,
        user,
        package: packageId,
        trxId: paymentIntent.id,
        subscriptionId: "",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date().toISOString(),
        remaining: price,
        status: "active",
    });

    return { payment, clientSecret: paymentIntent.client_secret };
};

export const PaymentService = {
    createPaymentService,
};