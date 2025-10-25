"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const parcel_admin_route_1 = require("./admin/parcel.admin.route");
const parcel_receiver_route_1 = require("./receiver/parcel.receiver.route");
const parcel_sender_route_1 = require("./sender/parcel.sender.route");
const parcel_public_route_1 = require("./public/parcel.public.route");
const router = (0, express_1.Router)();
// Register all role-based parcel routes
router.use("/", parcel_admin_route_1.ParcelAdminRoutes); // Admin routes: /parcel/admin/*
router.use("/", parcel_receiver_route_1.ParcelReceiverRoutes); // Receiver routes: /parcel/my-parcels, /parcel/receiver/*
router.use("/", parcel_sender_route_1.ParcelSenderRoutes); // Sender routes: /parcel/create, /parcel/sender/*, /parcel/:id
router.use("/", parcel_public_route_1.ParcelPublicRoutes);
exports.ParcelRoutes = router;
