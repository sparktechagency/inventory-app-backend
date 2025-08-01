import { Request, Response } from 'express';
import config from '../config';
import Stripe from 'stripe';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../errors/ApiError';
import { stripe } from '../config/stripe';
import { handleSubscriptionCreated } from '../helpers/handleSubscriptionCreated';







export const handleStripeWebhook = async (req: Request, res: Response) => {


    let event: Stripe.Event | undefined;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"] as string,
            config.stripe.webhookSecret as string
        );
    } catch (error) {
        console.error("Error verifying webhook:", error);
        throw new ApiError(StatusCodes.BAD_REQUEST, `Webhook Error: ${error}`);
    }

    if (!event) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid event received!");
    }


    const eventType = event.type;

    // Handle the event
    try {
        switch (eventType) {
            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                break;
            default:
                console.log(`Unhandled event type ${eventType}`);
        }
    } catch (error) {
        console.error("Error handling event:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `An error occurred while handling a webhook event: ${error}`);
    }

    res.sendStatus(200);
};
