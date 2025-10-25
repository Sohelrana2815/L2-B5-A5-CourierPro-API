"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelSenderRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../../middlewares/checkAuth");
const user_interface_1 = require("../../user/user.interface");
const parcel_validation_1 = require("../parcel.validation");
const parcel_sender_controller_1 = require("./parcel.sender.controller");
const validateRequest_1 = require("../../../middlewares/validateRequest");
const router = (0, express_1.Router)();
// CREATE PARCEL - Sender only
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can create a parcel"), (0, validateRequest_1.validateRequest)(parcel_validation_1.createParcelZodSchema), parcel_sender_controller_1.ParcelSenderControllers.createParcel);
// GET MY PARCELS - Sender only (get all parcels created by the sender)
router.get("/sender/my-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can view their own parcels"), parcel_sender_controller_1.ParcelSenderControllers.getParcelsBySender);
// CANCEL PARCEL - Sender only
router.patch("/sender/cancel/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can cancel their parcel"), (0, validateRequest_1.validateRequest)(parcel_validation_1.cancelParcelZodSchema), parcel_sender_controller_1.ParcelSenderControllers.cancelParcel);
// GET SINGLE PARCEL BY ID - Sender only
router.get("/sender/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, "Only SENDER can view parcel details"), parcel_sender_controller_1.ParcelSenderControllers.getParcelById);
exports.ParcelSenderRoutes = router;
