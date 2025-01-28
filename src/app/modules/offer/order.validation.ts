import { z } from "zod";
import mongoose from "mongoose";
import { STATUS } from "../../../enums/status";

// Custom validator for MongoDB ObjectId
const objectIdValidator = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid MongoDB ID",
});

const offerValidationSchema = z.object({
    body: z.object({
        userId: objectIdValidator,
        orderId: objectIdValidator,
        status: z.enum(Object.values(STATUS) as [STATUS, ...STATUS[]], {
            required_error: "Status is required",
        }),
    }),
});

export default offerValidationSchema;

