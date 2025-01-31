
import Stripe from "stripe";
import { IPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import { User } from "../user/user.model";
import { stripe } from "../../../config/stripe";
import config from "../../../config";



const createPaymentService = async (payload: IPayment) => {
    const { user, package: packageId, price } = payload;

    // Fetch user details
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

    // ✅ Create Stripe Checkout Session (Replaces Payment Intent)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer: customerId,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Your Package Name",
                    },
                    unit_amount: price * 100,
                },
                quantity: 1,
            },
        ],
        success_url: `${config.stripe.paymentSuccess}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: "https://localhost:500/cancel",
    });
    // console.log("Redirect user to:", session.url);

    // Save payment details in the database (Status: Pending)
    const payment = await Payment.create({
        customerId,
        price,
        user,
        package: packageId,
        trxId: session.id,
        subscriptionId: "",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date().toISOString(),
        remaining: price,
        status: "pending",
    });

    return { payment, checkoutUrl: session.url };
};

export const PaymentService = {
    createPaymentService,
};