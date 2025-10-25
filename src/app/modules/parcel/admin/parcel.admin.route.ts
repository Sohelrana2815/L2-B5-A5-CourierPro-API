import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { Role } from "../../user/user.interface";
import { ParcelAdminControllers } from "./parcel.admin.controller";
import { validateRequest } from "../../../middlewares/validateRequest";
import { blockUnblockParcelZodSchema } from "../parcel.validation";

const router = Router();

// GET DASHBOARD OVERVIEW - Admin only
router.get(
  "/admin/dashboard-overview",
  checkAuth(Role.ADMIN, "Only ADMIN can view dashboard overview"),
  ParcelAdminControllers.getDashboardOverview
);

// GET FINAL STATUS COUNTS - Admin only (DELIVERED, CANCELLED, RETURNED with success rate)
router.get(
  "/admin/final-status-counts",
  checkAuth(Role.ADMIN, "Only ADMIN can view final status counts"),
  ParcelAdminControllers.getFinalStatusCounts
);

// GET PARCEL TRENDS - Admin only (New parcel creation trends over time)
router.get(
  "/admin/parcel-trends",
  checkAuth(Role.ADMIN, "Only ADMIN can view parcel trends"),
  ParcelAdminControllers.getParcelTrends
);

// GET COMPREHENSIVE PARCEL TRENDS - Admin only (Both 7 and 30 day trends with comparison)
router.get(
  "/admin/parcel-trends/comprehensive",
  checkAuth(Role.ADMIN, "Only ADMIN can view comprehensive parcel trends"),
  ParcelAdminControllers.getComprehensiveParcelTrends
);

// GET ALL PARCELS - Admin only
router.get(
  "/admin/all-parcels",
  checkAuth(Role.ADMIN, "Only ADMIN can view all parcels"),
  ParcelAdminControllers.getAllParcels
);

// GET PARCEL BY ID - Admin only
router.get(
  "/admin/:id",
  checkAuth(Role.ADMIN, "Only ADMIN can view parcel details"),
  ParcelAdminControllers.getParcelById
);

// BLOCK PARCEL - Admin only
router.patch(
  "/admin/block/:id",
  checkAuth(Role.ADMIN, "Only ADMIN can block parcels"),
  validateRequest(blockUnblockParcelZodSchema),
  ParcelAdminControllers.blockParcel
);

// UNBLOCK PARCEL - Admin only
router.patch(
  "/admin/unblock/:id",
  checkAuth(Role.ADMIN, "Only ADMIN can unblock parcels"),
  validateRequest(blockUnblockParcelZodSchema),
  ParcelAdminControllers.unblockParcel
);

// PICK UP PARCEL - Admin only (APPROVED → PICKED_UP)
router.patch(
  "/admin/pickup/:id",
  checkAuth(Role.ADMIN, "Only ADMIN can pick up parcels"),
  ParcelAdminControllers.pickUpParcel
);

// START TRANSIT - Admin only (PICKED_UP → IN_TRANSIT)
router.patch(
  "/admin/start-transit/:id",
  checkAuth(Role.ADMIN, "Only ADMIN can start parcel transit"),
  ParcelAdminControllers.startTransit
);

// DELIVER PARCEL - Admin only (IN_TRANSIT → DELIVERED)
router.patch(
  "/admin/deliver/:id",
  checkAuth(Role.ADMIN, "Only ADMIN can deliver parcels"),
  ParcelAdminControllers.deliverParcel
);

// RETURN PARCEL - Admin only
router.patch(
  "/admin/return/:id",
  checkAuth(Role.ADMIN, "Only ADMIN can return parcels"),
  ParcelAdminControllers.returnParcel
);

// HOLD PARCEL - Admin only
router.patch(
  "/admin/hold/:id",
  checkAuth(Role.ADMIN, "Only ADMIN can put parcels on hold"),
  ParcelAdminControllers.holdParcel
);

export const ParcelAdminRoutes = router;
