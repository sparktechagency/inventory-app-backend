import cron from "node-cron";
import { User } from "../app/modules/user/user.model";
import { logger } from "../shared/logger";

export const deleteUnverifiedAccount = () => {
    const GRACE_PERIOD_MINUTES = 5;

    logger.info("Unverified account cleanup job scheduled to run every minute. 🕒");

    cron.schedule("*/10 * * * *", async () => {
        try {
            const cutoffDate = new Date(Date.now() - GRACE_PERIOD_MINUTES * 60 * 1000);

            // Delete unverified accounts older than the grace period
            const result = await User.deleteMany({
                verified: false,
                createdAt: { $lt: cutoffDate }, // Only delete accounts created before the cutoff date
            });

            logger.info(`Deleted ${result.deletedCount} unverified accounts. 👍`);
        } catch (error) {
            logger.error("Error during unverified account cleanup:", error);
        }
    });
};