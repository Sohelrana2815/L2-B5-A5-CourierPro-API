import { Router } from "express";
import { ParcelControllers } from "./parcel.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { createParcelZodSchema } from "./parcel.validation";

const router = Router();

// CREATE PARCEL - Sender only
router.post(
  "/create",
  checkAuth(Role.SENDER, "Only SENDER can create a parcel"),
  validateRequest(createParcelZodSchema),
  ParcelControllers.createParcel
);

// GET ALL PARCELS BY SENDER - Sender only
router.get(
  "/my-parcels",
  checkAuth(Role.SENDER, "Only SENDER can view their own parcels"),
  ParcelControllers.getParcelsBySender
);

// GET SINGLE PARCEL BY ID - Sender only
router.get(
  "/:id", 
  checkAuth(Role.SENDER, "Only SENDER can view parcel details"), 
  ParcelControllers.getParcelById
);

// GET PARCEL BY TRACKING ID - Public route (anyone can track)
router.get("/track/:trackingId", ParcelControllers.getParcelByTrackingId);

export const ParcelRoutes = router;
