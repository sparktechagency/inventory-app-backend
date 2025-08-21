import cron from "node-cron";
import { SendOfferModelForRetailer } from "../app/modules/sendOrder/sendOffer.model";

const deleteProductAtMidnightNigeria = () => {
  // Runs every day at 00:00 Nigeria time (UTC+1)
  cron.schedule("0 0 * * *", async () => {
    // Current time in Nigeria
    const nowUtc = new Date();
    const nowNigeria = new Date(nowUtc.getTime() + 1 * 60 * 60 * 1000);

    // 30 days ago from Nigeria time
    const oneMonthAgo = new Date(nowNigeria.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      const result = await SendOfferModelForRetailer.deleteMany({
        createdAt: { $lte: oneMonthAgo },
        status: true,
      });
      console.log(`💸 [Nigeria] Deleted ${result.deletedCount} old product records at midnight`);
    } catch (error) {
      console.log("💣 [Nigeria] Error deleting old products:", error);
    }
  }, {
    scheduled: true,
    timezone: "Africa/Lagos"
  });
};

export default deleteProductAtMidnightNigeria;
