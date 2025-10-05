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
// GET PARCEL BY TRACKING ID
const getParcelByTrackingId = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const parcel = yield parcel_service_1.ParcelServices.getParcelByTrackingId(trackingId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Parcel retrieved successfully✅",
        data: parcel,
    });
}));
exports.ParcelControllers = {
    createParcel,
    getParcelsBySender,
    getParcelById,
    getParcelByTrackingId,
};
