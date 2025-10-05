"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParcelZodSchema = exports.updateParcelStatusZodSchema = exports.createParcelZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const parcel_interface_1 = require("./parcel.interface");
// // Receiver Info Schema
const receiverInfoSchema = zod_1.default.object({
    name: zod_1.default
        .string({ error: "Receiver name is required" })
        .min(3, {
        error: "Receiver name must be at least 3 characters",
    })
        .max(50, {
        error: "Receiver name cannot exceed 50 characters",
    })
        .trim(),
    phone: zod_1.default
        .string({ error: "Receiver phone is required" })
        .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
        error: "Invalid Bangladeshi mobile number",
    })
        .trim(),
    address: zod_1.default
        .string({
        error: "Receiver address is required",
    })
        .min(10, { error: "Address must be at least 10 characters" })
        .max(200, { error: "Address cannot exceed 200 characters" })
        .trim(),
    city: zod_1.default
        .string({ error: "City is required" })
        .min(2, { error: "City name must be at least 2 characters" })
        .max(50, { error: "City name cannot exceed 50 characters" })
        .trim(),
});
// // Parcel Details Schema
const parcelDetailsSchema = zod_1.default.object({
    type: zod_1.default
        .string({ error: "Parcel type is required" })
        .min(2, { error: "Parcel type must be at least 2 characters" })
        .max(50, { error: "Parcel type cannot exceed 50 characters" })
        .trim(),
    weightKg: zod_1.default
        .number({ error: "Weight is required" })
        .min(0.1, { error: "Weight must be at least 0.1 kg" })
        .max(1000, { error: "Weight cannot exceed 1000 kg" }),
    description: zod_1.default
        .string({ error: "Description is required" })
        .min(5, { error: "Description must be at least 5 characters" })
        .max(500, { error: "Description cannot exceed 500 characters" })
        .trim(),
});
// // Create Parcel Schema
exports.createParcelZodSchema = zod_1.default.object({
    receiverInfo: receiverInfoSchema,
    parcelDetails: parcelDetailsSchema,
    expectedDeliveryDate: zod_1.default.iso
        .datetime({ error: "Invalid date format" })
        .optional(),
});
// // Update Parcel Status Schema (for admin/manager)
exports.updateParcelStatusZodSchema = zod_1.default.object({
    status: zod_1.default.enum(Object.values(parcel_interface_1.ParcelStatus), {
        error: "Status is required",
    }),
    location: zod_1.default.string().trim().optional(),
    note: zod_1.default.string().trim().max(500).optional(),
});
// // Update Parcel Schema (for admin)
exports.updateParcelZodSchema = zod_1.default.object({
    receiverInfo: receiverInfoSchema.partial().optional(),
    parcelDetails: parcelDetailsSchema.partial().optional(),
    fee: zod_1.default.number().min(0).optional(),
    expectedDeliveryDate: zod_1.default.iso.datetime({ error: "Invalid date format" }),
    isBlocked: zod_1.default.boolean().optional(),
});
