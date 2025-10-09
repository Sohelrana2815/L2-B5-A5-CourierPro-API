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
exports.ParcelControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const parcel_service_1 = require("./parcel.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
// CREATE PARCEL (Sender Role)
const createParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const senderId = user.userId;
    const parcel = yield parcel_service_1.ParcelServices.createParcel(senderId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Parcel created successfully✅",
        data: parcel,
    });
}));
// GET ALL PARCELS BY SENDER
const getParcelsBySender = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const senderId = user.userId;
    const result = yield parcel_service_1.ParcelServices.getParcelsBySender(senderId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcels retrieved successfully✅",
        data: result.data,
        meta: result.meta,
    });
}));
// GET SINGLE PARCEL BY ID
const getParcelById = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const userId = user.userId;
    const parcel = yield parcel_service_1.ParcelServices.getParcelById(parcelId, userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel retrieved successfully✅",
        data: parcel,
    });
}));
// GET PARCEL BY TRACKING ID - Guest only (no auth required but checks for authenticated users)
const getParcelByTrackingId = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const isAuthenticated = !!req.user; // Check if user is authenticated
    const parcel = yield parcel_service_1.ParcelServices.getParcelByTrackingId(trackingId, isAuthenticated);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel retrieved successfully✅",
        data: parcel,
    });
}));
// GET PARCEL BY TRACKING ID AND RECEIVER PHONE (for guest receivers)
const getParcelByTrackingIdAndPhone = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const { phone } = req.body;
    if (!phone) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Receiver phone number is required!");
    }
    const parcel = yield parcel_service_1.ParcelServices.getParcelByTrackingIdAndPhone(trackingId, phone);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel retrieved successfully✅",
        data: parcel,
    });
}));
// GET INCOMING PARCELS BY RECEIVER PHONE (for guest receivers)
const getIncomingParcelsByPhone = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    if (!phone) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Receiver phone number is required!");
    }
    const result = yield parcel_service_1.ParcelServices.getIncomingParcelsByPhone(phone);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Incoming parcels retrieved successfully✅",
        data: result.data,
        meta: result.meta,
    });
}));
// GET INCOMING PARCELS BY RECEIVER ID (for registered receivers)
const getIncomingParcelsByReceiverId = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const receiverId = user.userId;
    const result = yield parcel_service_1.ParcelServices.getIncomingParcelsByReceiverId(receiverId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Incoming parcels retrieved successfully✅",
        data: result.data,
        meta: result.meta,
    });
}));
// GET ALL PARCELS (Admin Role)
const getAllParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_service_1.ParcelServices.getAllParcels();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "All parcels retrieved successfully✅",
        data: result.data,
        meta: result.meta,
    });
}));
// CANCEL PARCEL (Sender Role)
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const senderId = user.userId;
    const { note } = req.body;
    const parcel = yield parcel_service_1.ParcelServices.cancelParcel(parcelId, senderId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel cancelled successfully✅",
        data: parcel,
    });
}));
// RECEIVER APPROVE PARCEL (Registered receiver, auth required)
const approveParcelByReceiver = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const receiverIdentifier = { userId: user.userId };
    const parcel = yield parcel_service_1.ParcelServices.approveParcelByReceiver(parcelId, receiverIdentifier);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel approved successfully by receiver✅",
        data: parcel,
    });
}));
// RECEIVER CANCEL PARCEL (Registered receiver, auth required)
const cancelParcelByReceiver = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const { note } = req.body;
    const receiverIdentifier = { userId: user.userId };
    const parcel = yield parcel_service_1.ParcelServices.cancelParcelByReceiver(parcelId, receiverIdentifier, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel cancelled successfully by receiver✅",
        data: parcel,
    });
}));
// GUEST APPROVE PARCEL (No auth required)
const guestApproveParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const { phone } = req.body;
    if (!phone) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Receiver phone number is required!");
    }
    const receiverIdentifier = { phone };
    const parcel = yield parcel_service_1.ParcelServices.approveParcelByReceiver(parcelId, receiverIdentifier);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel approved successfully by guest receiver✅",
        data: parcel,
    });
}));
// GUEST CANCEL PARCEL (No auth required)
const guestCancelParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const { phone, note } = req.body;
    if (!phone) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Receiver phone number is required!");
    }
    const receiverIdentifier = { phone };
    const parcel = yield parcel_service_1.ParcelServices.cancelParcelByReceiver(parcelId, receiverIdentifier, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel cancelled successfully by guest receiver✅",
        data: parcel,
    });
}));
// BLOCK PARCEL (Admin Role)
const blockParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const adminId = user.userId;
    const { note } = req.body;
    const parcel = yield parcel_service_1.ParcelServices.blockParcel(parcelId, adminId, note);
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
    const parcel = yield parcel_service_1.ParcelServices.unblockParcel(parcelId, adminId, note);
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
    const parcel = yield parcel_service_1.ParcelServices.pickUpParcel(parcelId, adminId, note);
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
    const parcel = yield parcel_service_1.ParcelServices.startTransit(parcelId, adminId, note);
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
    const parcel = yield parcel_service_1.ParcelServices.deliverParcel(parcelId, adminId, note);
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
    const parcel = yield parcel_service_1.ParcelServices.returnParcel(parcelId, adminId, note);
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
    const parcel = yield parcel_service_1.ParcelServices.holdParcel(parcelId, adminId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel put on hold successfully✅",
        data: parcel,
    });
}));
exports.ParcelControllers = {
    createParcel,
    getParcelsBySender,
    getParcelById,
    getParcelByTrackingId,
    getParcelByTrackingIdAndPhone,
    getIncomingParcelsByPhone,
    getIncomingParcelsByReceiverId,
    getAllParcels,
    cancelParcel,
    approveParcelByReceiver,
    cancelParcelByReceiver,
    guestApproveParcel,
    guestCancelParcel,
    blockParcel,
    unblockParcel,
    pickUpParcel,
    startTransit,
    deliverParcel,
    returnParcel,
    holdParcel,
};
