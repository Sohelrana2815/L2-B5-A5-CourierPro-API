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
exports.ParcelServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const parcel_interface_1 = require("./parcel.interface");
const parcel_model_1 = __importDefault(require("./parcel.model"));
const mongoose_1 = require("mongoose");
// Calculate fee based on weight (simple pricing logic)
const calculateFee = (weightKg) => {
    const basePrice = 50; // Base price in BDT
    const pricePerKg = 20; // Price per kg in BDT
    if (weightKg <= 1) {
        return basePrice;
    }
    else {
        return basePrice + Math.ceil(weightKg - 1) * pricePerKg;
    }
};
// CREATE PARCEL (Sender Role)
const createParcel = (senderId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverInfo, parcelDetails, expectedDeliveryDate } = payload;
    // Validate required fields
    if (!receiverInfo || !parcelDetails) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Receiver info and parcel details are required!");
    }
    // Calculate delivery fee based on weight
    const fee = calculateFee(parcelDetails.weightKg);
    // Create initial status log
    const initialStatusLog = {
        status: parcel_interface_1.ParcelStatus.REQUESTED,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(senderId),
        note: "Parcel request created by sender",
    };
    // Create the parcel
    const newParcel = yield parcel_model_1.default.create({
        senderId: new mongoose_1.Types.ObjectId(senderId),
        receiverInfo,
        parcelDetails,
        fee,
        currentStatus: parcel_interface_1.ParcelStatus.REQUESTED,
        statusHistory: [initialStatusLog],
        expectedDeliveryDate: expectedDeliveryDate
            ? new Date(expectedDeliveryDate)
            : undefined,
    });
    return newParcel;
});
// GET ALL PARCELS BY SENDER
const getParcelsBySender = (senderId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcels = yield parcel_model_1.default.find({ senderId }).sort({ createdAt: -1 });
    const total = yield parcel_model_1.default.countDocuments({ senderId });
    return {
        data: parcels,
        meta: { total },
    };
});
// GET SINGLE PARCEL BY ID
const getParcelById = (parcelId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Check if the user is the sender
    if (parcel.senderId.toString() !== userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to view this parcel!");
    }
    return parcel;
});
// GET PARCEL BY TRACKING ID
const getParcelByTrackingId = (trackingId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.default.findOne({ trackingId });
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    return parcel;
});
exports.ParcelServices = {
    createParcel,
    getParcelsBySender,
    getParcelById,
    getParcelByTrackingId,
};
