import cron from "node-cron";
import { logger } from "./logger";
import { paymentVerificationModel } from "../app/modules/multiPaymentMethod/multiPaymentMethod.model";


const deleteSubscriptionAfterOneMonth = () => {
    cron.schedule("*/5 * * * *", () => {
        logger.info("🕒 Running payment cleanup job...");

        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

        try {
            const result = paymentVerificationModel.deleteMany({
                createdAt: { $lte: thirtyMinutesAgo },
            });
            logger.info(`💸 Deleted ${result?.deletedCount} old payment records`);
        } catch (error) {
            logger.error("💣 Error deleting old payments:", error);
        }
    });
}


export default deleteSubscriptionAfterOneMonth;