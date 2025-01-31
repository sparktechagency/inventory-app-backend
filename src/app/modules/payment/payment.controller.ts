import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";

const createPaymentController = catchAsync(async (req: Request, res: Response) => {
    const { user, price, duration, features, description, section } = req.body;

    if (!user || !price || !duration || !features || !description || !section) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const paymentData = await PaymentService.CreatePaymentServices({
        user,
        price,
        duration,
        features,
        description,
        section,
        status: "pending",
    });

    res.status(201).json(paymentData);
});


export const PaymentController = {
    createPaymentController,
};
