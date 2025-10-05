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
// CREATE PARCEL - Sender only
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), (0, validateRequest_1.validateRequest)(parcel_validation_1.createParcelZodSchema), parcel_controller_1.ParcelControllers.createParcel);
// GET ALL PARCELS BY SENDER - Sender only
router.get("/my-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), parcel_controller_1.ParcelControllers.getParcelsBySender);
// GET SINGLE PARCEL BY ID - Sender only
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), parcel_controller_1.ParcelControllers.getParcelById);
// GET PARCEL BY TRACKING ID - Public route (anyone can track)
router.get("/track/:trackingId", parcel_controller_1.ParcelControllers.getParcelByTrackingId);
exports.ParcelRoutes = router;
