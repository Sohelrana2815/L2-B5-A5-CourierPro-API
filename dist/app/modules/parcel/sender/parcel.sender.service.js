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
exports.ParcelSenderServices = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../../errorHelpers/AppError"));
const handleValidateReceiverInfo_1 = require("../../../helpers/handleValidateReceiverInfo");
const fee_calculator_1 = require("../../../utils/fee-calculator");
const parcel_interface_1 = require("../parcel.interface");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const parcel_model_1 = __importDefault(require("../parcel.model"));
// CREATE PARCEL (Sender Role)
const createParcel = (senderId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverInfo, parcelDetails, expectedDeliveryDate } = payload;
    // Validate required fields
    if (!receiverInfo || !parcelDetails) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Receiver info and parcel details are required!");
    }
    // Validate receiver information against registered users
    const receiverValidation = yield (0, handleValidateReceiverInfo_1.handleValidateReceiverInfo)(receiverInfo);
    // Calculate delivery fee based on weight
    const fee = (0, fee_calculator_1.calculateFee)(parcelDetails.weightKg);
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
        receiverId: receiverValidation.receiverId,
        receiverInfo: receiverValidation.validatedReceiverInfo,
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
    const parcels = yield parcel_model_1.default.find({ senderId }).populate('statusHistory.updatedBy', 'name role').sort({ createdAt: -1 });
    const total = yield parcel_model_1.default.countDocuments({ senderId });
    return {
        data: parcels,
        meta: { total },
    };
});
// GET SINGLE PARCEL BY ID
const getParcelById = (parcelId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.default.findById(parcelId).populate('statusHistory.updatedBy', 'name role');
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Check if the user is the sender
    if (parcel.senderId.toString() !== userId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to view this parcel!");
    }
    return parcel;
});
// CANCEL PARCEL (Sender Role)
const cancelParcel = (parcelId, senderId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    if (parcel.senderId.toString() !== senderId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to cancel this parcel!");
    }
    // Check if the parcel is already cancelled
    if (parcel.currentStatus === parcel_interface_1.ParcelStatus.CANCELLED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is already cancelled!");
    }
    // Check if the parcel can be cancelled (only REQUESTED or APPROVED status)
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.REQUESTED &&
        parcel.currentStatus !== parcel_interface_1.ParcelStatus.APPROVED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot cancel parcel with status: ${parcel.currentStatus}. Only parcels with REQUESTED or APPROVED status can be cancelled.`);
    }
    // Update the parcel status to CANCELLED
    parcel.currentStatus = parcel_interface_1.ParcelStatus.CANCELLED;
    // Add status log entry
    const cancelStatusLog = {
        status: parcel_interface_1.ParcelStatus.CANCELLED,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(senderId),
        note: note,
    };
    parcel.statusHistory.push(cancelStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
exports.ParcelSenderServices = {
    createParcel,
    getParcelsBySender,
    getParcelById,
    cancelParcel,
};
