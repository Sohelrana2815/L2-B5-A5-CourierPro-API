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
exports.ParcelReceiverControllers = void 0;
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const parcel_receiver_service_1 = require("./parcel.receiver.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// GET INCOMING PARCELS BY RECEIVER ID (for registered receivers)
const getIncomingParcelsByReceiverId = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const receiverId = user.userId;
    const result = yield parcel_receiver_service_1.ParcelReceiverServices.getIncomingParcelsByReceiverId(receiverId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Incoming parcels retrieved successfully✅",
        data: result.data,
        meta: result.meta,
    });
}));
// RECEIVER APPROVE PARCEL (Registered receiver, auth required)
const approveParcelByReceiver = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const receiverId = user.userId;
    const parcel = yield parcel_receiver_service_1.ParcelReceiverServices.approveParcelByReceiver(parcelId, receiverId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel approved successfully by receiver✅",
        data: parcel,
    });
}));
// RECEIVER CANCEL PARCEL (Registered receiver, auth required)
const declineParcelByReceiver = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const user = req.user;
    const { note } = req.body;
    const receiverId = user.userId;
    const parcel = yield parcel_receiver_service_1.ParcelReceiverServices.declineParcelByReceiver(parcelId, receiverId, note);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel cancelled successfully by receiver✅",
        data: parcel,
    });
}));
// UPDATE RECEIVER PROFILE (Registered receiver, auth required)
const updateReceiverProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const receiverId = user.userId;
    const updateData = req.body;
    const updatedUser = yield parcel_receiver_service_1.ParcelReceiverServices.updateReceiverProfile(receiverId, updateData);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Receiver profile updated successfully✅",
        data: updatedUser,
    });
}));
// GET ALL REGISTERED RECEIVERS (For senders only)
const getAllRegisteredReceivers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_receiver_service_1.ParcelReceiverServices.getAllRegisteredReceivers();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "All registered receivers retrieved successfully✅",
        data: result.data,
        meta: result.meta,
    });
}));
// GET DELIVERY HISTORY BY RECEIVER ID (for registered receivers)
const getDeliveryHistoryByReceiverId = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const receiverId = user.userId;
    const result = yield parcel_receiver_service_1.ParcelReceiverServices.getDeliveryHistoryByReceiverId(receiverId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Delivery history retrieved successfully✅",
        data: result.data,
        meta: result.meta,
    });
}));
exports.ParcelReceiverControllers = {
    getIncomingParcelsByReceiverId,
    approveParcelByReceiver,
    declineParcelByReceiver,
    updateReceiverProfile,
    getAllRegisteredReceivers,
    getDeliveryHistoryByReceiverId,
};
