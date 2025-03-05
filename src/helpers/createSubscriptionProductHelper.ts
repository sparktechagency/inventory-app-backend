import { StatusCodes } from "http-status-codes";
import { IPackage } from "../app/modules/package/package.interface";
import config from "../config";
import { stripe } from "../config/stripe";
import ApiError from "../errors/ApiError";

export const createSubscriptionProductHelper = async (payload: Partial<IPackage>) => {
    // create product in stripe
    const product = await stripe.products.create({
        name: payload.name as string,
        description: payload.description as string,
    })
    let interval: "month" | "year" = "month"; //default for monthly
    let intervalCount = 1 //default to every month

    // switch (payload.duration) {
    //     case "1 month":
    //         interval = "month";
    //         intervalCount = 1;
    //     case "3 months":
    //         interval = "month";
    //         intervalCount = 3;
    //     case "6 months":
    //         interval = "month";
    //         intervalCount = 6;
    //         break;
    //     case "1 year":
    //         interval = "year";
    //         intervalCount = 1;
    //         break;
    //     default:
    //         interval = "month";
    //         intervalCount = 1;
    // }
    switch (payload.duration) {
        case "1 month":
            interval = "month";
            intervalCount = 1;
            break;
        case "3 months":
            interval = "month";
            intervalCount = 3;
            break;
        case "6 months":
            interval = "month";
            intervalCount = 6;
            break;
        case "1 year":
            interval = "year";
            intervalCount = 1;
            break;
        default:
            interval = "month";
            intervalCount = 1;
    }


    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Number(payload.price) * 100,
        currency: "usd",
        recurring: {
            interval,
            interval_count: intervalCount
        }
    })


    if (!price) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create price in stripe")
    }

    // create payment link
    const paymentLink = await stripe.paymentLinks.create({
        line_items: [
            {
                price: price.id,
                quantity: 1
            }
        ],
        after_completion: {
            type: "redirect",
            redirect: {
                url: `${config.stripe.paymentSuccess}`
            }
        },
        metadata: {
            productId: product.id
        }
    })

    // if not found paymentUrl
    if (!paymentLink) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create payment link in stripe")
    }

    return { productId: product.id, paymentLink: paymentLink.url }
}