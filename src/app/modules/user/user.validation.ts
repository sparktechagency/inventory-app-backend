import { z } from 'zod';
import { BUSINESS_CATEGORY, USER_ROLES } from '../../../enums/user';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(4, { message: "Password must be at least 4 characters long" }),
    confirmPassword: z.string().min(4, { message: "Confirm password must be at least 4 characters long" }),
    role: z.enum(Object.values(USER_ROLES) as [USER_ROLES, ...USER_ROLES[]]),
    verified: z.boolean().optional(),
    image: z.string().optional(),
    status: z.enum(['active', 'delete']).optional(),
  }).refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email", "phone"],
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
