import z from "zod";
import { ParcelStatus } from "./parcel.interface";

// // Receiver Info Schema
const receiverInfoSchema = z.object({
  name: z
    .string({ error: "Receiver name is required" })
    .min(3, {
      error: "Receiver name must be at least 3 characters",
    })
    .max(50, {
      error: "Receiver name cannot exceed 50 characters",
    })
    .trim(),

  phone: z
    .string({ error: "Receiver phone is required" })
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
      error: "Invalid Bangladeshi mobile number",
    })
    .trim(),

  address: z
    .string({
      error: "Receiver address is required",
    })
    .min(10, { error: "Address must be at least 10 characters" })
    .max(200, { error: "Address cannot exceed 200 characters" })
    .trim(),
  city: z
    .string({ error: "City is required" })
    .min(2, { error: "City name must be at least 2 characters" })
    .max(50, { error: "City name cannot exceed 50 characters" })
    .trim(),
});

// // Parcel Details Schema

const parcelDetailsSchema = z.object({
  type: z
    .string({ error: "Parcel type is required" })
    .min(2, { error: "Parcel type must be at least 2 characters" })
    .max(50, { error: "Parcel type cannot exceed 50 characters" })
    .trim(),

  weightKg: z
    .number({ error: "Weight is required" })
    .min(0.1, { error: "Weight must be at least 0.1 kg" })
    .max(1000, { error: "Weight cannot exceed 1000 kg" }),

  description: z
    .string({ error: "Description is required" })
    .min(5, { error: "Description must be at least 5 characters" })
    .max(500, { error: "Description cannot exceed 500 characters" })
    .trim(),
});

// // Create Parcel Schema

export const createParcelZodSchema = z.object({
  receiverInfo: receiverInfoSchema,
  parcelDetails: parcelDetailsSchema,
  expectedDeliveryDate: z.iso
    .datetime({ error: "Invalid date format" })
    .optional(),
});

// // Update Parcel Status Schema (for admin/manager)

export const updateParcelStatusZodSchema = z.object({
  status: z.enum(Object.values(ParcelStatus) as [string, ...string[]], {
    error: "Status is required",
  }),
  location: z.string().trim().optional(),
  note: z.string().trim().max(500).optional(),
});

// // Update Parcel Schema (for admin)

export const updateParcelZodSchema = z.object({
  receiverInfo: receiverInfoSchema.partial().optional(),
  parcelDetails: parcelDetailsSchema.partial().optional(),
  fee: z.number().min(0).optional(),
  expectedDeliveryDate: z.iso.datetime({ error: "Invalid date format" }),
  isBlocked: z.boolean().optional(),
});

// // Cancel Parcel Schema (for sender)

export const cancelParcelZodSchema = z.object({
  note: z
    .string()
    .max(500, { error: "Note cannot exceed 500 characters" })
    .trim()
    .optional(),
});

// // Get Parcel by Tracking ID and Phone Schema (for guest receivers)

export const getParcelByTrackingIdAndPhoneZodSchema = z.object({
  phone: z
    .string({ error: "Receiver phone is required" })
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
      error: "Invalid Bangladeshi mobile number",
    })
    .trim(),
});

// // Receiver Approve Parcel Schema
export const approveParcelByReceiverZodSchema = z.object({
  // For guest receivers - phone is required if not authenticated
  phone: z
    .string()
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
      error: "Invalid Bangladeshi mobile number",
    })
    .optional(), // Optional for registered receivers
});

// // Receiver Cancel Parcel Schema
export const cancelParcelByReceiverZodSchema = z.object({
  // For guest receivers - phone is required if not authenticated
  phone: z
    .string()
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
      error: "Invalid Bangladeshi mobile number",
    })
    .optional(), // Optional for registered receivers
  note: z
    .string()
    .max(500, { error: "Note cannot exceed 500 characters" })
    .trim()
    .optional(),
});
export const getIncomingParcelsByPhoneZodSchema = z.object({
  phone: z
    .string({ error: "Receiver phone is required" })
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, {
      error: "Invalid Bangladeshi mobile number",
    })
    .trim(),
});
