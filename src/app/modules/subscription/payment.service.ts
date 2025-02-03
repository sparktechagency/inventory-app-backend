import { Request, Response } from "express";
import { User } from "../user/user.model";

const createPayment = async (userId: string, packageId: string, paymentMethodId: string) => {
    const user = await User.findById(userId);

}