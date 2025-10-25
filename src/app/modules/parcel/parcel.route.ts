import { Router } from "express";
import { ParcelAdminRoutes } from "./admin/parcel.admin.route";
import { ParcelReceiverRoutes } from "./receiver/parcel.receiver.route";
import { ParcelSenderRoutes } from "./sender/parcel.sender.route";
import { ParcelPublicRoutes } from "./public/parcel.public.route";

const router = Router();

// Register all role-based parcel routes
router.use("/", ParcelAdminRoutes); // Admin routes: /parcel/admin/*
router.use("/", ParcelReceiverRoutes); // Receiver routes: /parcel/my-parcels, /parcel/receiver/*
router.use("/", ParcelSenderRoutes); // Sender routes: /parcel/create, /parcel/sender/*, /parcel/:id
router.use("/", ParcelPublicRoutes);

export const ParcelRoutes = router;
