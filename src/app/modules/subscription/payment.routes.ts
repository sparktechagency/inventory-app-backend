import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { SubscriptionController } from "./payment.controller";



const router = express.Router();
router.get("/",
    auth(USER_ROLES.Admin),
    SubscriptionController.subscriptions
)


router.get("/details",
    // auth()
    SubscriptionController.subscriptionDetails
)

router.get("/:",
    SubscriptionController.companySubscriptionDetails
)

export const paymentRoutes = router;