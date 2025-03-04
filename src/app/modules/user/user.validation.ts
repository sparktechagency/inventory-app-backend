import { z } from 'zod';
import { BUSINESS_CATEGORY, USER_ROLES } from '../../../enums/user';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email format" }).optional(),

    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(8, { message: "Confirm password must be at least 8 characters long" }),
    // businessName: z.string({ required_error: "Business name is required" }),
    role: z.enum(Object.values(USER_ROLES) as [USER_ROLES, ...USER_ROLES[]], {
      required_error: "Role is required",
    }),
    // businessCategory: z.enum(
    //   Object.values(BUSINESS_CATEGORY) as [BUSINESS_CATEGORY, ...BUSINESS_CATEGORY[]],
    //   {
    //     required_error: "Business category is required",
    //   }
    // ),
    // location: z.string({ required_error: "Location is required" }),
    verified: z.boolean({ required_error: "Verified is required" }),
    image: z.string().optional(),
    status: z.enum(['active', 'delete'], { required_error: "Status is required" }),

    authentication: z
      .object({
        isResetPassword: z.boolean().optional(),
        oneTimeCode: z.number().optional(),
        expireAt: z
          .preprocess((arg) => (typeof arg === "string" ? new Date(arg) : arg), z.date())
          .optional(),
      })
      .optional(),
  }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
