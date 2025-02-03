import { StatusCodes } from "http-status-codes"
import { User } from "../app/modules/user/user.model"
import ApiError from "../errors/ApiError"
import { Package } from "../app/modules/package/package.model"
import { ObjectId } from "mongoose"
import { Payment } from "../app/modules/subscription/payment.model"
import Stripe from "stripe"
import { stripe } from "../config/stripe"
import { sendNotifications } from "./notificationsHelper"


// helper function to find and validate user

const getUserByEmail = async (email: string) => {
    const user = await User.findOne({
        email
    })
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found")
    }
    return user
}

// helper function to find and validate pricing plan

const getPackageByProductId = async (productId: string) => {
    const plan = await Package.findOne({ productId })
    if (!plan) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Plan not found")
    }
}

// helper function to create new subscription in database

const createNewSubscription = async (user: ObjectId,
    customerId: string,
    packageId: ObjectId,
    amountPaid: number,
    trxId: string,
    subscriptionId: string,
    currentPeriodStart: string,
    currentPeriodEnd: string,
    remaining: number
) => {
    const isExistSubscription = await Payment.findOne({ user: user })
    if (isExistSubscription) {
        const payload = {
            customerId,
            price: amountPaid,
            user,
            package: packageId,
            trxId,
            subscriptionId,
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
            remaining
        }
        await Payment.findByIdAndUpdate(
            { _id: isExistSubscription._id },
            payload,
            { new: true }
        )
    } else {
        const newSubscription = new Payment({
            customerId,
            price: amountPaid,
            user,
            package: packageId,
            trxId,
            subscriptionId,
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
            remaining
        });
        await newSubscription.save();
    }

}


// export this helper function
export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
    try {
        // Retrieve subscription details from stripe

        const subscription = await stripe.subscriptions.retrieve(data.id)
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
        const productId = subscription.items.data[0]?.price?.product as string
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string)

        const trxId = invoice.payment_intent as string;
        const amountPaid = (invoice.total || 0) / 100;

        // find user and pricing plan

        const user: any = await getUserByEmail(customer.email as string)
        const packageID: any = await getPackageByProductId(productId)

        // get the current period start and end dates (unix time stamps)

        const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString() //convert to human-readable date
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()

        console.log("subscription data==>>>>", subscription);
        console.log("customer data==>>>>", customer);
        console.log("productId data==>>>>", productId);
        console.log("invoice data==>>>>", invoice);
        console.log("trxId data==>>>>", trxId);
        console.log("amountPaid data==>>>>", amountPaid);
        console.log("user data==>>>>", user);
        console.log("packageID data==>>>>", packageID);
        console.log("currentPeriodStart data==>>>>", currentPeriodStart);
        console.log("currentPeriodEnd data==>>>>", currentPeriodEnd);

        // create new subscription and update suer status


        await createNewSubscription(
            user._id,
            customer.id,
            packageID._id,
            amountPaid,
            trxId,
            subscription.id,
            currentPeriodStart,
            currentPeriodEnd,
            packageID.credit,
        )

        await User.findByIdAndUpdate(
            { _id: user._id },
            { isSubscribed: true },
            { new: true }
        )

        const notifications = {
            text: `${user.company} has arrived`,
            link: `/subscription-earning?id=${user?._id}`
        }

        // send notifications to user
        sendNotifications(notifications)

    } catch (error) {
        console.log("Error handling subscription creation:", error);
        throw error;
    }
}
