"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const parcel_controller_1 = require("./parcel.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkAuth_1 = require("../../middlewares/checkAuth");
const guestOnly_1 = require("../../middlewares/guestOnly");
const user_interface_1 = require("../user/user.interface");
const parcel_validation_1 = require("./parcel.validation");
const router = (0, express_1.Router)();
// GET ALL PARCELS - Admin only
router.get("/admin/all", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can view all parcels"), parcel_controller_1.ParcelControllers.getAllParcels);
// CREATE PARCEL - Sender only
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can create a parcel"), (0, validateRequest_1.validateRequest)(parcel_validation_1.createParcelZodSchema), parcel_controller_1.ParcelControllers.createParcel);
// GET MY PARCELS - Sender only (get all parcels created by the sender)
router.get("/sender/my-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can view their own parcels"), parcel_controller_1.ParcelControllers.getParcelsBySender);
// GET MY PARCELS - Registered receiver only
router.get("/my-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER, "Only Registered RECEIVERS can view this route"), parcel_controller_1.ParcelControllers.getIncomingParcelsByReceiverId);
// CANCEL PARCEL - Sender only
router.patch("/:id/cancel", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can cancel their parcel"), (0, validateRequest_1.validateRequest)(parcel_validation_1.cancelParcelZodSchema), parcel_controller_1.ParcelControllers.cancelParcel);
// GET SINGLE PARCEL BY ID - Sender only
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can view parcel details"), parcel_controller_1.ParcelControllers.getParcelById);
// GET PARCEL BY TRACKING ID - Guest only (no auth required but checks for authenticated users)
router.get("/track/:trackingId", guestOnly_1.guestOnly, parcel_controller_1.ParcelControllers.getParcelByTrackingId);
// GET PARCEL BY TRACKING ID AND PHONE - For guest receivers (no auth required)
router.post("/track/:trackingId/verify", (0, validateRequest_1.validateRequest)(parcel_validation_1.getParcelByTrackingIdAndPhoneZodSchema), parcel_controller_1.ParcelControllers.getParcelByTrackingIdAndPhone);
// GET INCOMING PARCELS BY PHONE - For guest receivers (no auth required)
router.post("/incoming", (0, validateRequest_1.validateRequest)(parcel_validation_1.getIncomingParcelsByPhoneZodSchema), parcel_controller_1.ParcelControllers.getIncomingParcelsByPhone);
// RECEIVER APPROVE PARCEL - For registered receivers (requires RECEIVER role auth)
// RECEIVER APPROVE PARCEL - Registered receiver (auth required)
router.patch("/receiver/:id/approve", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER, "Only RECEIVER can approve parcels"), (0, validateRequest_1.validateRequest)(parcel_validation_1.approveParcelByReceiverZodSchema), parcel_controller_1.ParcelControllers.approveParcelByReceiver);
// RECEIVER CANCEL PARCEL - Registered receiver (auth required)
router.patch("/receiver/:id/cancel", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER, "Only RECEIVER can cancel parcels"), (0, validateRequest_1.validateRequest)(parcel_validation_1.cancelParcelByReceiverZodSchema), parcel_controller_1.ParcelControllers.cancelParcelByReceiver);
// GUEST APPROVE PARCEL - No auth required
router.patch("/guest/:id/approve", (0, validateRequest_1.validateRequest)(parcel_validation_1.approveParcelByReceiverZodSchema), parcel_controller_1.ParcelControllers.guestApproveParcel);
// GUEST CANCEL PARCEL - No auth required
router.patch("/guest/:id/cancel", (0, validateRequest_1.validateRequest)(parcel_validation_1.cancelParcelByReceiverZodSchema), parcel_controller_1.ParcelControllers.guestCancelParcel);
// BLOCK PARCEL - Admin only
router.patch("/admin/:id/block", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can block parcels"), (0, validateRequest_1.validateRequest)(parcel_validation_1.blockUnblockParcelZodSchema), parcel_controller_1.ParcelControllers.blockParcel);
// UNBLOCK PARCEL - Admin only
router.patch("/admin/:id/unblock", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can unblock parcels"), (0, validateRequest_1.validateRequest)(parcel_validation_1.blockUnblockParcelZodSchema), parcel_controller_1.ParcelControllers.unblockParcel);
// PICK UP PARCEL - Admin only (APPROVED → PICKED_UP)
router.patch("/admin/:id/pickup", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can pick up parcels"), parcel_controller_1.ParcelControllers.pickUpParcel);
// START TRANSIT - Admin only (PICKED_UP → IN_TRANSIT)
router.patch("/admin/:id/start-transit", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can start parcel transit"), parcel_controller_1.ParcelControllers.startTransit);
// DELIVER PARCEL - Admin only (IN_TRANSIT → DELIVERED)
router.patch("/admin/:id/deliver", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can deliver parcels"), parcel_controller_1.ParcelControllers.deliverParcel);
// RETURN PARCEL - Admin only
router.patch("/admin/:id/return", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can return parcels"), parcel_controller_1.ParcelControllers.returnParcel);
// HOLD PARCEL - Admin only
router.patch("/admin/:id/hold", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can put parcels on hold"), parcel_controller_1.ParcelControllers.holdParcel);
exports.ParcelRoutes = router;
