import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { Role } from "../../user/user.interface";
import {
  cancelParcelZodSchema,
  createParcelZodSchema,
} from "../parcel.validation";
import { ParcelSenderControllers } from "./parcel.sender.controller";
import { validateRequest } from "../../../middlewares/validateRequest";

const router = Router();

// CREATE PARCEL - Sender only
router.post(
  "/create",
  checkAuth(Role.SENDER, "Only SENDER can create a parcel"),
  validateRequest(createParcelZodSchema),
  ParcelSenderControllers.createParcel
);

// GET MY PARCELS - Sender only (get all parcels created by the sender)
router.get(
  "/sender/my-parcels",
  checkAuth(Role.SENDER, "Only SENDER can view their own parcels"),
  ParcelSenderControllers.getParcelsBySender
);

// CANCEL PARCEL - Sender only
router.patch(
  "/sender/cancel/:id",
  checkAuth(Role.SENDER, "Only SENDER can cancel their parcel"),
  validateRequest(cancelParcelZodSchema),
  ParcelSenderControllers.cancelParcel
);

// GET SINGLE PARCEL BY ID - Sender only
router.get(
  "/sender/:id",
  checkAuth(Role.SENDER, "Only SENDER can view parcel details"),
  ParcelSenderControllers.getParcelById
);

export const ParcelSenderRoutes = router;
