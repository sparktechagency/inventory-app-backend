import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { flutterWaveModel } from "./flutterwavePackage.model";

import { verifyPaymentTransaction } from "../../../helpers/paymentVerificationHelper";
import { User } from "../user/user.model";

const createSubscriptionPackage = async (
  userEmail: string,
  tx_ref: string,
  amount: number,
  status: "successful" | "failed",
  redirect_url: string,
  startTime: Date
) => {
  try {
    const subscription = await flutterWaveModel.create({
      userEmail,
      transactionId: tx_ref,
      amount,
      status,
      tx_ref,
      redirect_url,
      startTime,
    });
    return subscription;
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      "Failed to store subscription in the database."
    );
  }
};

const SubscriptionPackageVerify = async (
  transaction_id: string,
  userEmail: string
) => {
  const res = await verifyPaymentTransaction(transaction_id, userEmail);
  // user find by user email
  const user = await User.findOne({ email: userEmail });
  await User.findByIdAndUpdate(user?._id, { isSubscribed: true });
  return res;
};

// get all
const allPackageData = async () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentYear = new Date().getFullYear();
  const results = await Promise.all(
    months.map(async (month, index) => {
      const startDate = new Date(currentYear, index, 1);
      const endDate = new Date(currentYear, index + 1, 0);

      const total = await flutterWaveModel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      });

      return { month, total };
    })
  );
  return results;
};

// total earnings
const totalEarnings = async () => {
  const total = await flutterWaveModel.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return total;
};

// get total user subscription
const totalUserSubscription = async (name: string, email: string) => {
  const total = await flutterWaveModel.find();
  if (!total || total.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No subscription found");
  }

  const subscriberEmails = total.map((subscriber) => subscriber.userEmail);
  let userQuery: any = { email: { $in: subscriberEmails } };
  if (name) {
    userQuery.name = { $regex: name, $options: "i" };
  }
  if (email) {
    userQuery.email = email;
  }
  const users = await User.find(userQuery);
  if (users.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No matching users found");
  }
  const userDataWithSubscription = users.map((user) => {
    const userSubscription = total.find(
      (subscription) => subscription.userEmail === user.email
    );

    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      subscriptionDetails: userSubscription,
    };
  });

  return { userDataWithSubscription };
};

export const flutterWaveService = {
  createSubscriptionPackage,
  SubscriptionPackageVerify,
  allPackageData,
  totalEarnings,
  totalUserSubscription,
};
