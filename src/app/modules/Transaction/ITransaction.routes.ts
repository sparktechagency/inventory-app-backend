
import express from "express";
import { TransactionController } from "./ITransaction.controller";
const router = express.Router();

router.get("/verify/:reference", TransactionController.verifyPayment);

export const TransactionRoutes = router