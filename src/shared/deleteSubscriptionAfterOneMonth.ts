import cron from "node-cron";
import { logger } from "./logger";
import { paymentVerificationModel } from "../app/modules/multiPaymentMethod/multiPaymentMethod.model";


const deleteSubscriptionAfterOneMonth = () => {
    // Nigeria midnight = UTC 23:00 (server must be UTC)
    cron.schedule("0 23 * * *", async () => {
        logger.info("🕒 Running payment cleanup job for Nigeria midnight...");

        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

        try {
            const result = await paymentVerificationModel.deleteMany({
                createdAt: { $lte: thirtyMinutesAgo },
            });

            logger.info(`💸 Deleted ${result.deletedCount || 0} old payment records`);
        } catch (error) {
            logger.error("💣 Error deleting old payments:", error);
        }
    });
};


export default deleteSubscriptionAfterOneMonth;