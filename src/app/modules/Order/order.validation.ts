import { z } from "zod";
import { UNIT } from "../../../enums/units";

const createProductZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Product name is required" }),
        unit: z.enum(Object.values(UNIT) as [UNIT, ...UNIT[]], {
            required_error: "Unit is required",
        }),
        quantity: z
            .number({ required_error: "Quantity is required" })
            .min(0, { message: "Quantity must be a positive number" }),
        additionalInfo: z.string().optional(),
    }),
});

export { createProductZodSchema };
