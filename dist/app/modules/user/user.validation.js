"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkSoftDeleteUsersZodSchema = exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    // Name
    name: zod_1.default
        .string({ error: "Name must be string and required!" })
        .min(3, { error: "Name is too short. Minimum 3 characters long" })
        .max(50, { error: "Name is too long. Maximum 50 characters" }),
    // Email
    email: zod_1.default
        .email()
        .min(6, { error: "Email must be at least 6 characters long" })
        .max(50, { error: "Email cannot exceed 50 characters" }),
    // Password
    password: zod_1.default
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
        message: "Password must contain at least one special character (!@#$%^&*)",
    })
        .optional(), // Keep optional to align with IUser
    phone: zod_1.default
        .string()
        .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
        error: "Invalid Bangladeshi mobile number",
    })
        .optional(),
    // Address
    address: zod_1.default
        .string({ error: "Address must be string" })
        .max(200, {
        error: "Address cannot exceed 200 characters",
    })
        .optional(),
    // City
    city: zod_1.default
        .string({ error: "City must be string" })
        .min(2, { error: "City name must be at least 2 characters" })
        .max(50, { error: "City name cannot exceed 50 characters" })
        .optional(),
    // Role - Required for registration, only SENDER or RECEIVER allowed
    role: zod_1.default.enum([user_interface_1.Role.SENDER, user_interface_1.Role.RECEIVER], {
        message: "Role must be either SENDER or RECEIVER",
    }),
});
exports.updateUserZodSchema = zod_1.default.object({
    // Name
    name: zod_1.default
        .string({ error: "Name must be string" })
        .min(3, { error: "Name is too short. Minimum 3 characters long" })
        .max(50, { error: "Name is too long. Maximum 50 characters" }),
    // Password
    password: zod_1.default
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
        message: "Password must contain at least one special character (!@#$%^&*)",
    })
        .optional(), // Keep optional to align with IUser
    // Phone
    phone: zod_1.default
        .string()
        .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
        error: "Invalid Bangladeshi mobile number",
    })
        .optional(),
    // Address
    address: zod_1.default
        .string({ error: "Address must be string" })
        .max(200, {
        error: "Address cannot exceed 200 characters",
    })
        .optional(),
    // Role
    role: zod_1.default.enum(Object.values(user_interface_1.Role)).optional(),
    // Is verified
    isVerified: zod_1.default.boolean({ error: "isVerified must be boolean" }).optional(),
});
exports.bulkSoftDeleteUsersZodSchema = zod_1.default.object({
    userIds: zod_1.default
        .array(zod_1.default.string({ error: "Each user ID must be a string" }))
        .min(1, { error: "At least one user ID is required" }),
});
