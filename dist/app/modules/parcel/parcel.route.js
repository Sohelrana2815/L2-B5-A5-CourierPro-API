"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const parcel_controller_1 = require("./parcel.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const parcel_validation_1 = require("./parcel.validation");
const router = (0, express_1.Router)();
// GET ALL PARCELS - Admin only
router.get("/admin/all", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can view all parcels"), parcel_controller_1.ParcelControllers.getAllParcels);
// CREATE PARCEL - Sender only
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can create a parcel"), (0, validateRequest_1.validateRequest)(parcel_validation_1.createParcelZodSchema), parcel_controller_1.ParcelControllers.createParcel);
// GET ALL PARCELS BY SENDER - Sender only
router.get("/my-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can view their own parcels"), parcel_controller_1.ParcelControllers.getParcelsBySender);
// CANCEL PARCEL - Sender only
router.patch("/:id/cancel", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can cancel their parcel"), (0, validateRequest_1.validateRequest)(parcel_validation_1.cancelParcelZodSchema), parcel_controller_1.ParcelControllers.cancelParcel);
// GET SINGLE PARCEL BY ID - Sender only
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can view parcel details"), parcel_controller_1.ParcelControllers.getParcelById);
// GET PARCEL BY TRACKING ID - Public route (anyone can track)
router.get("/track/:trackingId", parcel_controller_1.ParcelControllers.getParcelByTrackingId);
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
exports.ParcelRoutes = router;
