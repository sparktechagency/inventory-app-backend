import express from "express"
import { flutterWaveController } from "./flutterwavePackage.controller"
const router = express.Router()
router.post("/pay", flutterWaveController.createPackage)
router.get("/verify", flutterWaveController.verifySubscriptionPayment);
router.get("/transactions", flutterWaveController.getAllTransactions);
export const flutterWaveRouter = router