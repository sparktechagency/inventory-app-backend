import { StatusCodes } from "http-status-codes";
import { flutterWaveService } from "../app/modules/flutterwavePackage/flutterwavePackage.service";
import ApiError from "../errors/ApiError";
import axios from "axios";
import config from "../config";
import { User } from "../app/modules/user/user.model";
import { flutterWaveModel } from "../app/modules/flutterwavePackage/flutterwavePackage.model";
import { paymentVerificationModel } from "../app/modules/multiPaymentMethod/multiPaymentMethod.model";

const FLW_SECRET_KEY = config.FLUTTER_WAVE.SECRETKEY;
const FLW_API_URL = "https://api.flutterwave.com/v3/payments";

export const initiateSubscriptionPayment = async (
  userEmail: string,
  amount: number
) => {
  try {
    const userExist = await User.findOne({ email: userEmail });
    if (!userExist) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "User not found in the database."
      );
    }
    const activeSubscription = await flutterWaveModel.findOne({
      userEmail,
      status: "successful",
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() },
    });

    const activeSubscriberEndDate =
      activeSubscription?.endTime &&
      activeSubscription.endTime.toLocaleDateString();
    const activeSubscriptionVarify = await paymentVerificationModel.find({
      email: userEmail,
    });
    const endDateMessage = activeSubscriptionVarify.length
      ? activeSubscriptionVarify[
          activeSubscriptionVarify.length - 1
        ].endTime?.toLocaleDateString() || activeSubscriberEndDate
      : activeSubscriberEndDate;

    if (activeSubscription) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `${
          userExist.storeInformation?.businessName || "User"
        } you are already subscribed. Please try again after ${endDateMessage}`
      );
    }

    const tx_ref = `tx_${Date.now()}`;
    const redirect_url = `${config.FLUTTER_WAVE.payment_url}/flutter-wave-package/payment-success`;

    const response = await axios.post(
      FLW_API_URL,
      {
        tx_ref,
        amount,
        currency: "NGN",
        redirect_url,
        payment_options: "card, banktransfer, ussd, barter, mobilemoney",
        customer: { email: userEmail },
        customizations: {
          title: "Monthly Subscription",
          description: "1 Month Access",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Store subscription in the database
    const subscription = await flutterWaveService.createSubscriptionPackage(
      userEmail,
      tx_ref,
      amount,
      "pending",
      response.data.data.link,
      new Date(),
      new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
    );

    return {
      message: "Payment initiated successfully!",
      data: {
        link: response.data.data.link,
        tx_ref,
        amount,
        email: userEmail,
        redirect_url: response.data.data.link,
        status: "pending",
        subscriptionId: subscription._id,
      },
    };
  } catch (error: any) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `${error.message}`);
  }
};
