import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  // Name
  name: z
    .string({ error: "Name must be string and required!" })
    .min(3, { error: "Name is too short. Minimum 3 characters long" })
    .max(50, { error: "Name is too long. Maximum 50 characters" }),
  // Email
  email: z
    .email()
    .min(6, { error: "Email must be at least 6 characters long" })
    .max(50, { error: "Email cannot exceed 50 characters" }),
  // Password

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    // Must have at least 1 uppercase letter
    .regex(/^(?=.*[A-Z]).+$/, {
      message: "Password must contain at least 1 uppercase letter",
    })
    // Must have at least 1 digit
    .regex(/^(?=.*\d).+$/, {
      message: "Password must contain at least one digit",
    })
    // Must have at least 1 special character (!@#$%^&*)
    .regex(/^(?=.*[!@#$%^&*]).+$/, {
      message:
        "Password must contain at least one special character (!@#$%^&*)",
    })
    .optional(), // Keep optional to align with IUser

  phone: z
    .string()
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
      error: "Invalid Bangladeshi mobile number",
    })
    .optional(),
  // Address
  address: z
    .string({ error: "Address must be string" })
    .max(200, {
      error: "Address cannot exceed 200 characters",
    })
    .optional(),
  // Role - Required for registration, only SENDER or RECEIVER allowed
  role: z.enum([Role.SENDER, Role.RECEIVER], {
    message: "Role must be either SENDER or RECEIVER",
  }),
});

export const updateUserZodSchema = z.object({
  // Name
  name: z
    .string({ error: "Name must be string" })
    .min(3, { error: "Name is too short. Minimum 3 characters long" })
    .max(50, { error: "Name is too long. Maximum 50 characters" }),
  // Password

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    // Must have at least 1 uppercase letter
    .regex(/^(?=.*[A-Z]).+$/, {
      message: "Password must contain at least 1 uppercase letter",
    })
    // Must have at least 1 digit
    .regex(/^(?=.*\d).+$/, {
      message: "Password must contain at least one digit",
    })
    // Must have at least 1 special character (!@#$%^&*)
    .regex(/^(?=.*[!@#$%^&*]).+$/, {
      message:
        "Password must contain at least one special character (!@#$%^&*)",
    })
    .optional(), // Keep optional to align with IUser
  // Phone
  phone: z
    .string()
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
      error: "Invalid Bangladeshi mobile number",
    })
    .optional(),
  // Address
  address: z
    .string({ error: "Address must be string" })
    .max(200, {
      error: "Address cannot exceed 200 characters",
    })
    .optional(),

  // Role

  role: z.enum(Object.values(Role) as [string]).optional(),
  // Is Active
  accountStatus: z.enum(Object.values(IsActive) as [string]).optional(),

  // Is verified

  isVerified: z.boolean({ error: "isVerified must be boolean" }).optional(),
});
