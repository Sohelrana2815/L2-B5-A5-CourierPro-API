import { Router } from "express";
// import { checkAuth } from "../../../middlewares/checkAuth";
// import { Role } from "../../user/user.interface";
import ParcelPublicControllers from "./parcel.public.controller";

const router = Router();

router.get("/public/track-parcel/:trackingId", ParcelPublicControllers.trackParcel);

export const ParcelPublicRoutes = router;
