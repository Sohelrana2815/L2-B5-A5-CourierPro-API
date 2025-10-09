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
  blockUnblockParcelZodSchema,
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

// GET MY PARCELS - Sender only (get all parcels created by the sender)
router.get(
  "/sender/my-parcels",
  checkAuth(Role.SENDER, "Only SENDER can view their own parcels"),
  ParcelControllers.getParcelsBySender
);

// GET MY PARCELS - Registered receiver only
router.get(
  "/my-parcels",
  checkAuth(Role.RECEIVER, "Only Registered RECEIVERS can view this route"),
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

// BLOCK PARCEL - Admin only
router.patch(
  "/admin/:id/block",
  checkAuth(Role.ADMIN, "Only ADMIN can block parcels"),
  validateRequest(blockUnblockParcelZodSchema),
  ParcelControllers.blockParcel
);

// UNBLOCK PARCEL - Admin only
router.patch(
  "/admin/:id/unblock",
  checkAuth(Role.ADMIN, "Only ADMIN can unblock parcels"),
  validateRequest(blockUnblockParcelZodSchema),
  ParcelControllers.unblockParcel
);

// PICK UP PARCEL - Admin only (APPROVED → PICKED_UP)
router.patch(
  "/admin/:id/pickup",
  checkAuth(Role.ADMIN, "Only ADMIN can pick up parcels"),
  ParcelControllers.pickUpParcel
);

// START TRANSIT - Admin only (PICKED_UP → IN_TRANSIT)
router.patch(
  "/admin/:id/start-transit",
  checkAuth(Role.ADMIN, "Only ADMIN can start parcel transit"),
  ParcelControllers.startTransit
);

// DELIVER PARCEL - Admin only (IN_TRANSIT → DELIVERED)
router.patch(
  "/admin/:id/deliver",
  checkAuth(Role.ADMIN, "Only ADMIN can deliver parcels"),
  ParcelControllers.deliverParcel
);

// RETURN PARCEL - Admin only
router.patch(
  "/admin/:id/return",
  checkAuth(Role.ADMIN, "Only ADMIN can return parcels"),
  ParcelControllers.returnParcel
);

// HOLD PARCEL - Admin only
router.patch(
  "/admin/:id/hold",
  checkAuth(Role.ADMIN, "Only ADMIN can put parcels on hold"),
  ParcelControllers.holdParcel
);

export const ParcelRoutes = router;
