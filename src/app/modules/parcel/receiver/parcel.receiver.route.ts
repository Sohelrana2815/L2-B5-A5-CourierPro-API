import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { ParcelReceiverControllers } from "./parcel.receiver.controller";
import { Role } from "../../user/user.interface";
import { validateRequest } from "../../../middlewares/validateRequest";
import {
  approveParcelByReceiverZodSchema,
  cancelParcelByReceiverZodSchema,
  updateReceiverProfileZodSchema,
} from "../parcel.validation";

const router = Router();

// GET ALL REGISTERED RECEIVERS - Sender only
router.get(
  "/all-receivers",
  checkAuth(Role.SENDER, "Only SENDERS can view all registered receivers"),
  ParcelReceiverControllers.getAllRegisteredReceivers
);

// GET MY PARCELS - Registered receiver only
router.get(
  "/receiver/incoming-parcels",
  checkAuth(Role.RECEIVER, "Only Registered RECEIVERS can view this route"),
  ParcelReceiverControllers.getIncomingParcelsByReceiverId
);

// GET MY DELIVERY HISTORY - Registered receiver only
router.get(
  "/receiver/delivery-history",
  checkAuth(
    Role.RECEIVER,
    "Only Registered RECEIVERS can view their delivery history"
  ),
  ParcelReceiverControllers.getDeliveryHistoryByReceiverId
);

// RECEIVER APPROVE PARCEL - Registered receiver (auth required)
router.patch(
  "/receiver/approve/:id",
  checkAuth(Role.RECEIVER, "Only RECEIVER can approve parcels"),
  validateRequest(approveParcelByReceiverZodSchema),
  ParcelReceiverControllers.approveParcelByReceiver
);

// RECEIVER CANCEL PARCEL - Registered receiver (auth required)
router.patch(
  "/receiver/decline/:id",
  checkAuth(Role.RECEIVER, "Only RECEIVER can cancel parcels"),
  validateRequest(cancelParcelByReceiverZodSchema),
  ParcelReceiverControllers.declineParcelByReceiver
);

// UPDATE RECEIVER PROFILE - Registered receiver (auth required)
router.patch(
  "/receiver/update-profile",
  checkAuth(Role.RECEIVER, "Only RECEIVER can update their profile"),
  validateRequest(updateReceiverProfileZodSchema),
  ParcelReceiverControllers.updateReceiverProfile
);

export const ParcelReceiverRoutes = router;
