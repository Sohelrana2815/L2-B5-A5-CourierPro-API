"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelAdminControllers = void 0;
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const parcel_admin_service_1 = require("./parcel.admin.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// GET ULTIMATE CURRENT STATUS OF PARCEL (Admin Role)
// GET ALL PARCELS (Admin Role)
const getAllParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Read query params and pass to service
    const { page = undefined, limit = undefined, search = undefined } = req.query;
    const result = yield parcel_admin_service_1.ParcelAdminServices.getAllParcels(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: search && search.trim()
            ? `Parcels matching "${search.trim()}" retrieved successfully✅`
            : "All parcels retrieved successfully✅",
        data: result.data,
        meta: result.meta,
    });
}));
// GET PARCEL BY ID (Admin Role)
const getParcelById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield parcel_admin_service_1.ParcelAdminServices.getParcelById(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel details retrieved successfully✅",
        data: result,
    });
}));
// BLOCK PARCEL (Admin Role)
const blockParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const adminId = user.userId;
    const { note } = req.body;
    const parcel = yield parcel_admin_service_1.ParcelAdminServices.blockParcel(parcelId, adminId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel blocked successfully✅",
        data: parcel,
    });
}));
// UNBLOCK PARCEL (Admin Role)
const unblockParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const adminId = user.userId;
    const { note } = req.body;
    const parcel = yield parcel_admin_service_1.ParcelAdminServices.unblockParcel(parcelId, adminId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel unblocked successfully✅",
        data: parcel,
    });
}));
// PICK UP PARCEL (Admin Role) - APPROVED → PICKED_UP
const pickUpParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const adminId = user.userId;
    const { note } = req.body;
    const parcel = yield parcel_admin_service_1.ParcelAdminServices.pickUpParcel(parcelId, adminId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel picked up successfully✅",
        data: parcel,
    });
}));
// START TRANSIT (Admin Role) - PICKED_UP → IN_TRANSIT
const startTransit = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const adminId = user.userId;
    const { note } = req.body;
    const parcel = yield parcel_admin_service_1.ParcelAdminServices.startTransit(parcelId, adminId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel transit started successfully✅",
        data: parcel,
    });
}));
// DELIVER PARCEL (Admin Role) - IN_TRANSIT → DELIVERED
const deliverParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const adminId = user.userId;
    const { note } = req.body;
    const parcel = yield parcel_admin_service_1.ParcelAdminServices.deliverParcel(parcelId, adminId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel delivered successfully✅",
        data: parcel,
    });
}));
// RETURN PARCEL (Admin Role)
const returnParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const adminId = user.userId;
    const { note } = req.body;
    const parcel = yield parcel_admin_service_1.ParcelAdminServices.returnParcel(parcelId, adminId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel returned successfully✅",
        data: parcel,
    });
}));
// HOLD PARCEL (Admin Role)
const holdParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const adminId = user.userId;
    const { note } = req.body;
    const parcel = yield parcel_admin_service_1.ParcelAdminServices.holdParcel(parcelId, adminId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel put on hold successfully✅",
        data: parcel,
    });
}));
// GET DASHBOARD OVERVIEW (Admin Role)
const getDashboardOverview = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_admin_service_1.ParcelAdminServices.getDashboardOverview();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Dashboard overview retrieved successfully✅",
        data: result,
    });
}));
// GET FINAL STATUS COUNTS (Admin Role) - Get counts for ultimate statuses only
const getFinalStatusCounts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_admin_service_1.ParcelAdminServices.getFinalStatusCounts();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Final status counts retrieved successfully✅",
        data: result,
    });
}));
// GET PARCEL TRENDS (Admin Role) - Get new parcel creation trends over time
const getParcelTrends = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { days = "7" } = req.query;
    const daysNumber = Math.min(30, Math.max(1, Number(days) || 7)); // Default 7 days, max 30 days
    const result = yield parcel_admin_service_1.ParcelAdminServices.getParcelTrends(daysNumber);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: `Parcel trends for last ${daysNumber} days retrieved successfully✅`,
        data: result,
    });
}));
// GET COMPREHENSIVE PARCEL TRENDS (Admin Role) - Get both 7 and 30 day trends with comparison
const getComprehensiveParcelTrends = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_admin_service_1.ParcelAdminServices.getComprehensiveParcelTrends();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Comprehensive parcel trends retrieved successfully✅",
        data: result,
    });
}));
exports.ParcelAdminControllers = {
    getAllParcels,
    getParcelById,
    blockParcel,
    unblockParcel,
    pickUpParcel,
    startTransit,
    deliverParcel,
    returnParcel,
    holdParcel,
    getDashboardOverview,
    getFinalStatusCounts,
    getParcelTrends,
    getComprehensiveParcelTrends,
};
