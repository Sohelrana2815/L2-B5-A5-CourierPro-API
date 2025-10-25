"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelAdminRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../../middlewares/checkAuth");
const user_interface_1 = require("../../user/user.interface");
const parcel_admin_controller_1 = require("./parcel.admin.controller");
const validateRequest_1 = require("../../../middlewares/validateRequest");
const parcel_validation_1 = require("../parcel.validation");
const router = (0, express_1.Router)();
// GET DASHBOARD OVERVIEW - Admin only
router.get("/admin/dashboard-overview", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can view dashboard overview"), parcel_admin_controller_1.ParcelAdminControllers.getDashboardOverview);
// GET FINAL STATUS COUNTS - Admin only (DELIVERED, CANCELLED, RETURNED with success rate)
router.get("/admin/final-status-counts", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can view final status counts"), parcel_admin_controller_1.ParcelAdminControllers.getFinalStatusCounts);
// GET PARCEL TRENDS - Admin only (New parcel creation trends over time)
router.get("/admin/parcel-trends", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can view parcel trends"), parcel_admin_controller_1.ParcelAdminControllers.getParcelTrends);
// GET COMPREHENSIVE PARCEL TRENDS - Admin only (Both 7 and 30 day trends with comparison)
router.get("/admin/parcel-trends/comprehensive", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can view comprehensive parcel trends"), parcel_admin_controller_1.ParcelAdminControllers.getComprehensiveParcelTrends);
// GET ALL PARCELS - Admin only
router.get("/admin/all-parcels", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can view all parcels"), parcel_admin_controller_1.ParcelAdminControllers.getAllParcels);
// GET PARCEL BY ID - Admin only
router.get("/admin/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can view parcel details"), parcel_admin_controller_1.ParcelAdminControllers.getParcelById);
// BLOCK PARCEL - Admin only
router.patch("/admin/block/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can block parcels"), (0, validateRequest_1.validateRequest)(parcel_validation_1.blockUnblockParcelZodSchema), parcel_admin_controller_1.ParcelAdminControllers.blockParcel);
// UNBLOCK PARCEL - Admin only
router.patch("/admin/unblock/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can unblock parcels"), (0, validateRequest_1.validateRequest)(parcel_validation_1.blockUnblockParcelZodSchema), parcel_admin_controller_1.ParcelAdminControllers.unblockParcel);
// PICK UP PARCEL - Admin only (APPROVED → PICKED_UP)
router.patch("/admin/pickup/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can pick up parcels"), parcel_admin_controller_1.ParcelAdminControllers.pickUpParcel);
// START TRANSIT - Admin only (PICKED_UP → IN_TRANSIT)
router.patch("/admin/start-transit/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can start parcel transit"), parcel_admin_controller_1.ParcelAdminControllers.startTransit);
// DELIVER PARCEL - Admin only (IN_TRANSIT → DELIVERED)
router.patch("/admin/deliver/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can deliver parcels"), parcel_admin_controller_1.ParcelAdminControllers.deliverParcel);
// RETURN PARCEL - Admin only
router.patch("/admin/return/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can return parcels"), parcel_admin_controller_1.ParcelAdminControllers.returnParcel);
// HOLD PARCEL - Admin only
router.patch("/admin/hold/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, "Only ADMIN can put parcels on hold"), parcel_admin_controller_1.ParcelAdminControllers.holdParcel);
exports.ParcelAdminRoutes = router;
