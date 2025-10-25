"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelReceiverRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../../middlewares/checkAuth");
const parcel_receiver_controller_1 = require("./parcel.receiver.controller");
const user_interface_1 = require("../../user/user.interface");
const validateRequest_1 = require("../../../middlewares/validateRequest");
const parcel_validation_1 = require("../parcel.validation");
const router = (0, express_1.Router)();
// GET ALL REGISTERED RECEIVERS - Sender only
router.get("/all-receivers", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDERS can view all registered receivers"), parcel_receiver_controller_1.ParcelReceiverControllers.getAllRegisteredReceivers);
// GET MY PARCELS - Registered receiver only
router.get("/receiver/incoming-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER, "Only Registered RECEIVERS can view this route"), parcel_receiver_controller_1.ParcelReceiverControllers.getIncomingParcelsByReceiverId);
// GET MY DELIVERY HISTORY - Registered receiver only
router.get("/receiver/delivery-history", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER, "Only Registered RECEIVERS can view their delivery history"), parcel_receiver_controller_1.ParcelReceiverControllers.getDeliveryHistoryByReceiverId);
// RECEIVER APPROVE PARCEL - Registered receiver (auth required)
router.patch("/receiver/approve/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER, "Only RECEIVER can approve parcels"), (0, validateRequest_1.validateRequest)(parcel_validation_1.approveParcelByReceiverZodSchema), parcel_receiver_controller_1.ParcelReceiverControllers.approveParcelByReceiver);
// RECEIVER CANCEL PARCEL - Registered receiver (auth required)
router.patch("/receiver/decline/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER, "Only RECEIVER can cancel parcels"), (0, validateRequest_1.validateRequest)(parcel_validation_1.cancelParcelByReceiverZodSchema), parcel_receiver_controller_1.ParcelReceiverControllers.declineParcelByReceiver);
// UPDATE RECEIVER PROFILE - Registered receiver (auth required)
router.patch("/receiver/update-profile", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER, "Only RECEIVER can update their profile"), (0, validateRequest_1.validateRequest)(parcel_validation_1.updateReceiverProfileZodSchema), parcel_receiver_controller_1.ParcelReceiverControllers.updateReceiverProfile);
exports.ParcelReceiverRoutes = router;
