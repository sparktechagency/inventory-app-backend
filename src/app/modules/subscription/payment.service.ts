
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { IPayment } from "./payment.interface";
import { Payment } from "./payment.model";
import { stripe } from "../../../config/stripe";
import { Package } from "../package/package.model";

const subscriptionDetailsFromDB = async (user: JwtPayload): Promise<{ subscription: IPayment | {} }> => {

    const subscription = await Payment.findOne({ user: user?.id }).populate("package").lean()
    // if not found any subscription for the user, return an empty object
    if (!subscription) {
        return { subscription: {} }
    }
    const subscriptionFromStripe = await stripe.subscriptions.retrieve(subscription.subscriptionId);
    if (subscriptionFromStripe?.status !== 'active') {
        await Promise.all([
            User.findByIdAndUpdate(user.id), { isSubscribed: false }, { new: true },
            Payment.findOneAndUpdate({
                user: user.id
            }, { status: "expired" }, { new: true })
        ])
    }
    return { subscription }
}


const companySubscriptionDetailsFromDB = async (id: string): Promise<{ subscription: IPayment | {} }> => {

    const subscription = await Payment.findOne({ user: id }).populate("package").lean();
    if (!subscription) {
        return { subscription: {} }; // Return empty object if no subscription found
    }

    const subscriptionFromStripe = await stripe.subscriptions.retrieve(subscription.subscriptionId);

    // Check subscription status and update database accordingly
    if (subscriptionFromStripe?.status !== "active") {
        await Promise.all([
            User.findByIdAndUpdate(id, { isSubscribed: false }, { new: true }),
            Payment.findOneAndUpdate({ user: id }, { status: "expired" }, { new: true }),
        ]);
    }

    return { subscription };
};

const subscriptionsFromDB = async (query: Record<string, unknown>): Promise<IPayment[]> => {
    const anyConditions: any[] = [];

    const { search, limit, page, paymentType } = query;

    if (search) {
        const matchingPackageIds = await Package.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { paymentType: { $regex: search, $options: "i" } },
            ]
        }).distinct("_id");

        if (matchingPackageIds.length) {
            anyConditions.push({
                package: { $in: matchingPackageIds }
            });
        }
    }



    if (paymentType) {
        anyConditions.push({
            package: { $in: await Package.find({ paymentType: paymentType }).distinct("_id") }
        })
    }

    const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};
    const pages = parseInt(page as string) || 1;
    const size = parseInt(limit as string) || 10;
    const skip = (pages - 1) * size;

    const result = await Payment.find(whereConditions).populate([
        {
            path: "package",
            select: "title paymentType credit description"
        },
        {
            path: "user",
            select: "email name linkedIn contact company website "
        },
    ])
        .select("user package price trxId currentPeriodStart currentPeriodEnd status")
        .skip(skip)
        .limit(size);

    const count = await Payment.countDocuments(whereConditions);

    const data: any = {
        data: result,
        meta: {
            page: pages,
            total: count
        }
    }

    return data;
}


export const SubscriptionService = {
    subscriptionDetailsFromDB,
    subscriptionsFromDB,
    companySubscriptionDetailsFromDB
}