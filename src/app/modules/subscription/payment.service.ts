// import { JwtPayload } from "jsonwebtoken";
// import { IPayment } from "./payment.interface";
// import { Payment } from "./payment.model";
// import { User } from "../user/user.model";

// const subscriptionDetailsFromDB = async (user: JwtPayload): Promise<{ payment: IPayment | {} }> => {
//     const subscription = await Payment.findOne({ user: user.id }).populate("package");
//     if (!subscription) {
//         return { payment: {} };
//     }

//     const subscriptionFromStrip = await Payment.subscription.retrieve(subscription.subscriptionId);
//     if (subscriptionFromStrip?.status !== "active") {
//         await Promise.all([
//             User.findByIdAndUpdate(user.id, {
//                 isSubscribed: false
//             }, { new: true }),
//             Payment.findOneAndUpdate({
//                 user: user.id
//             }, { status: "expired" }, { new: true })
//         ]);
//     }
//     return { payment: subscription };
// };



// // export this function to use it in the controller
// export const subscriptionService = {
//     subscriptionDetailsFromDB
// }