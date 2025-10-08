import { Router } from "express";
import { ParcelControllers } from "./parcel.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { guestOnly } from "../../middlewares/guestOnly";
import { Role } from "../user/user.interface";
import {
  createParcelZodSchema,
  cancelParcelZodSchema,
  getParcelByTrackingIdAndPhoneZodSchema,
  getIncomingParcelsByPhoneZodSchema,
  approveParcelByReceiverZodSchema,
  cancelParcelByReceiverZodSchema,
} from "./parcel.validation";

const router = Router();

// GET ALL PARCELS - Admin only
router.get(
  "/admin/all",
  checkAuth(Role.ADMIN, "Only ADMIN can view all parcels"),
  ParcelControllers.getAllParcels
);

// CREATE PARCEL - Sender only
router.post(
  "/create",
  checkAuth(Role.SENDER, "Only SENDER can create a parcel"),
  validateRequest(createParcelZodSchema),
  ParcelControllers.createParcel
);

// GET MY PARCELS - Registered receiver only
router.get(
  "/my-parcels",
  checkAuth(Role.RECEIVER, "Only Registered RECEIVER'S can view this route"),
  ParcelControllers.getIncomingParcelsByReceiverId
);

// CANCEL PARCEL - Sender only
router.patch(
  "/:id/cancel",
  checkAuth(Role.SENDER, "Only SENDER can cancel their parcel"),
  validateRequest(cancelParcelZodSchema),
  ParcelControllers.cancelParcel
);

// GET SINGLE PARCEL BY ID - Sender only
router.get(
  "/:id",
  checkAuth(Role.SENDER, "Only SENDER can view parcel details"),
  ParcelControllers.getParcelById
);

// GET PARCEL BY TRACKING ID - Guest only (no auth required but checks for authenticated users)
router.get(
  "/track/:trackingId",
  guestOnly,
  ParcelControllers.getParcelByTrackingId
);

// GET PARCEL BY TRACKING ID AND PHONE - For guest receivers (no auth required)
router.post(
  "/track/:trackingId/verify",
  validateRequest(getParcelByTrackingIdAndPhoneZodSchema),
  ParcelControllers.getParcelByTrackingIdAndPhone
);

// GET INCOMING PARCELS BY PHONE - For guest receivers (no auth required)
router.post(
  "/incoming",
  validateRequest(getIncomingParcelsByPhoneZodSchema),
  ParcelControllers.getIncomingParcelsByPhone
);

// RECEIVER APPROVE PARCEL - For registered receivers (requires RECEIVER role auth)

// RECEIVER APPROVE PARCEL - Registered receiver (auth required)
router.patch(
  "/receiver/:id/approve",
  checkAuth(Role.RECEIVER, "Only RECEIVER can approve parcels"),
  validateRequest(approveParcelByReceiverZodSchema),
  ParcelControllers.approveParcelByReceiver
);

// RECEIVER CANCEL PARCEL - Registered receiver (auth required)
router.patch(
  "/receiver/:id/cancel",
  checkAuth(Role.RECEIVER, "Only RECEIVER can cancel parcels"),
  validateRequest(cancelParcelByReceiverZodSchema),
  ParcelControllers.cancelParcelByReceiver
);

// GUEST APPROVE PARCEL - No auth required
router.patch(
  "/guest/:id/approve",
  validateRequest(approveParcelByReceiverZodSchema),
  ParcelControllers.guestApproveParcel
);

// GUEST CANCEL PARCEL - No auth required
router.patch(
  "/guest/:id/cancel",
  validateRequest(cancelParcelByReceiverZodSchema),
  ParcelControllers.guestCancelParcel
);

export const ParcelRoutes = router;
