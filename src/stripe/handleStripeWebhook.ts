import { Request, Response } from 'express';
import config from '../config';
import Stripe from 'stripe';
import colors from 'colors';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../shared/logger';
import ApiError from '../errors/ApiError';
import { stripe } from '../config/stripe';
import { Payment } from '../app/modules/subscription/payment.model';







export const handleStripeWebhook = async (req: Request, res: Response) => {
    console.log("Received webhook:", req.body); // Log the raw body
    console.log("Headers:", req.headers); // Log the headers (especially the stripe-signature)

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
        console.log("Event not found");
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid event received!");
    }

    console.log("Verified event:", event);

    const eventType = event.type;
    console.log("Event type:", eventType); // Log event type

    // Handle the event
    try {
        switch (eventType) {
            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                console.log("Webhook connected");
                break;
            default:
                console.log(`Unhandled event type ${eventType}`);
        }
    } catch (error) {
        console.error("Error handling event:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `An error occurred while handling a webhook event: ${error}`);
    }

    res.sendStatus(200); // Send acknowledgment to Stripe
};
