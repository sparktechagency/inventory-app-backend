import express from "express"
import { flutterWaveController } from "./flutterwavePackage.controller"
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
const router = express.Router()
router.post("/pay", flutterWaveController.createPackage)
router.get("/verify", flutterWaveController.verifySubscriptionPayment);
router.get("/transactions", auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), flutterWaveController.getAllTransactions);
router.get("/total-earnings", auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), flutterWaveController.totalEarnings);


router.get("/total-user-subscription", auth(USER_ROLES.Wholesaler, USER_ROLES.SUPER_ADMIN), flutterWaveController.totalUserSubscription)


export const flutterWaveRouter = router