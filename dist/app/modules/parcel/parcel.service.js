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
const fee_calculator_1 = require("../../utils/fee-calculator");
const handleValidateReceiverInfo_1 = require("../../helpers/handleValidateReceiverInfo");
const user_model_1 = __importDefault(require("../user/user.model"));
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
// GET PARCEL BY TRACKING ID - Guest only
const getParcelByTrackingId = (trackingId, isAuthenticated) => __awaiter(void 0, void 0, void 0, function* () {
    // If user is authenticated, throw error directing them to use authenticated routes
    if (isAuthenticated) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This route is only for guest users. Please use your authenticated routes to view parcels.");
    }
    const parcel = yield parcel_model_1.default.findOne({ trackingId });
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    return {
        parcel,
    };
});
// GET PARCEL BY TRACKING ID AND RECEIVER PHONE (for guest receivers only)
const getParcelByTrackingIdAndPhone = (trackingId, receiverPhone) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the phone belongs to a registered receiver
    const registeredReceiver = yield user_model_1.default.findOne({
        phone: receiverPhone,
        role: "RECEIVER",
        isDeleted: { $ne: true },
        accountStatus: { $ne: "BLOCKED" },
    });
    if (registeredReceiver) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This route is only for guest receivers. Registered receivers should log in to view their parcels.");
    }
    const parcel = yield parcel_model_1.default.findOne({
        trackingId,
        "receiverInfo.phone": receiverPhone,
    });
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found or phone number doesn't match!");
    }
    return parcel;
});
// GET INCOMING PARCELS BY RECEIVER PHONE (for guest receivers)
const getIncomingParcelsByPhone = (receiverPhone) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the phone belongs to a registered receiver
    const registeredReceiver = yield user_model_1.default.findOne({
        phone: receiverPhone,
        role: "RECEIVER",
        isDeleted: { $ne: true },
        accountStatus: { $ne: "BLOCKED" },
    });
    if (registeredReceiver) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This route is only for guest receivers. Registered receivers should log in to view their parcels.");
    }
    const parcels = yield parcel_model_1.default.find({
        "receiverInfo.phone": receiverPhone,
        currentStatus: {
            $in: [
                parcel_interface_1.ParcelStatus.REQUESTED,
                parcel_interface_1.ParcelStatus.APPROVED,
                parcel_interface_1.ParcelStatus.PICKED_UP,
                parcel_interface_1.ParcelStatus.IN_TRANSIT,
            ],
        },
    }).sort({ createdAt: -1 });
    const total = yield parcel_model_1.default.countDocuments({
        "receiverInfo.phone": receiverPhone,
        currentStatus: {
            $in: [
                parcel_interface_1.ParcelStatus.REQUESTED,
                parcel_interface_1.ParcelStatus.APPROVED,
                parcel_interface_1.ParcelStatus.PICKED_UP,
                parcel_interface_1.ParcelStatus.IN_TRANSIT,
            ],
        },
    });
    return {
        data: parcels,
        meta: { total },
    };
});
// GET INCOMING PARCELS BY RECEIVER ID (for registered receivers)
const getIncomingParcelsByReceiverId = (receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcels = yield parcel_model_1.default.find({
        receiverId: new mongoose_1.Types.ObjectId(receiverId),
        currentStatus: {
            $in: [
                parcel_interface_1.ParcelStatus.REQUESTED,
                parcel_interface_1.ParcelStatus.APPROVED,
                parcel_interface_1.ParcelStatus.PICKED_UP,
                parcel_interface_1.ParcelStatus.IN_TRANSIT,
            ],
        },
    }).sort({ createdAt: -1 });
    const total = yield parcel_model_1.default.countDocuments({
        receiverId: new mongoose_1.Types.ObjectId(receiverId),
        currentStatus: {
            $in: [
                parcel_interface_1.ParcelStatus.REQUESTED,
                parcel_interface_1.ParcelStatus.APPROVED,
                parcel_interface_1.ParcelStatus.PICKED_UP,
                parcel_interface_1.ParcelStatus.IN_TRANSIT,
            ],
        },
    });
    return {
        data: parcels,
        meta: { total },
    };
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
        note: note || "Parcel cancelled by sender",
    };
    parcel.statusHistory.push(cancelStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// GET ALL PARCELS (Admin Role)
const getAllParcels = () => __awaiter(void 0, void 0, void 0, function* () {
    const parcels = yield parcel_model_1.default.find({})
        .populate("senderId", "name email phone")
        .populate("receiverId", "name email phone")
        .sort({ createdAt: -1 });
    const total = yield parcel_model_1.default.countDocuments();
    return {
        data: parcels,
        meta: { total },
    };
});
// RECEIVER APPROVE PARCEL (For both registered and guest receivers)
const approveParcelByReceiver = (parcelId, receiverIdentifier) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Check if parcel can be approved (only REQUESTED status)
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.REQUESTED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot approve parcel with status: ${parcel.currentStatus}. Only parcels with REQUESTED status can be approved.`);
    }
    // Validate receiver authorization
    let isAuthorizedReceiver = false;
    if (receiverIdentifier.userId) {
        // For registered receivers - check receiverId matches
        if (parcel.receiverId &&
            parcel.receiverId.toString() === receiverIdentifier.userId) {
            isAuthorizedReceiver = true;
        }
    }
    else if (receiverIdentifier.phone) {
        // For guest receivers - check phone matches
        if (parcel.receiverInfo.phone === receiverIdentifier.phone) {
            isAuthorizedReceiver = true;
        }
    }
    if (!isAuthorizedReceiver) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to approve this parcel!");
    }
    // Update the parcel status to APPROVED
    parcel.currentStatus = parcel_interface_1.ParcelStatus.APPROVED;
    // Add status log entry
    const approveStatusLog = {
        status: parcel_interface_1.ParcelStatus.APPROVED,
        timestamp: new Date(),
        updatedBy: receiverIdentifier.userId
            ? new mongoose_1.Types.ObjectId(receiverIdentifier.userId)
            : new mongoose_1.Types.ObjectId(), // For guest users, we'll use a default ObjectId
        note: "Parcel approved by receiver",
    };
    parcel.statusHistory.push(approveStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// RECEIVER CANCEL PARCEL (For both registered and guest receivers)
const cancelParcelByReceiver = (parcelId, receiverIdentifier, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Check if parcel can be cancelled (only REQUESTED or APPROVED status)
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.REQUESTED &&
        parcel.currentStatus !== parcel_interface_1.ParcelStatus.APPROVED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot cancel parcel with status: ${parcel.currentStatus}. Only parcels with REQUESTED or APPROVED status can be cancelled.`);
    }
    // Validate receiver authorization
    let isAuthorizedReceiver = false;
    if (receiverIdentifier.userId) {
        // For registered receivers - check receiverId matches
        if (parcel.receiverId &&
            parcel.receiverId.toString() === receiverIdentifier.userId) {
            isAuthorizedReceiver = true;
        }
    }
    else if (receiverIdentifier.phone) {
        // For guest receivers - check phone matches
        if (parcel.receiverInfo.phone === receiverIdentifier.phone) {
            isAuthorizedReceiver = true;
        }
    }
    if (!isAuthorizedReceiver) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to cancel this parcel!");
    }
    // Update the parcel status to CANCELLED
    parcel.currentStatus = parcel_interface_1.ParcelStatus.CANCELLED;
    // Add status log entry
    const cancelStatusLog = {
        status: parcel_interface_1.ParcelStatus.CANCELLED,
        timestamp: new Date(),
        updatedBy: receiverIdentifier.userId
            ? new mongoose_1.Types.ObjectId(receiverIdentifier.userId)
            : new mongoose_1.Types.ObjectId(), // For guest users, we'll use a default ObjectId
        note: note || "Parcel cancelled by receiver",
    };
    parcel.statusHistory.push(cancelStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// BLOCK PARCEL (Admin Role)
const blockParcel = (parcelId, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Check if the parcel is already blocked
    if (parcel.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is already blocked!");
    }
    // Update the parcel to blocked status
    parcel.isBlocked = true;
    // Add status log entry for blocking
    const blockStatusLog = {
        status: parcel_interface_1.ParcelStatus.ON_HOLD,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Parcel blocked by admin",
    };
    parcel.statusHistory.push(blockStatusLog);
    // If parcel was in transit or approved, set status to ON_HOLD
    if (parcel.currentStatus === parcel_interface_1.ParcelStatus.APPROVED ||
        parcel.currentStatus === parcel_interface_1.ParcelStatus.PICKED_UP ||
        parcel.currentStatus === parcel_interface_1.ParcelStatus.IN_TRANSIT) {
        parcel.currentStatus = parcel_interface_1.ParcelStatus.ON_HOLD;
    }
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// UNBLOCK PARCEL (Admin Role)
const unblockParcel = (parcelId, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Check if the parcel is not blocked
    if (!parcel.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Parcel is not blocked!");
    }
    // Update the parcel to unblocked status
    parcel.isBlocked = false;
    // Add status log entry for unblocking
    const unblockStatusLog = {
        status: parcel.currentStatus, // Keep the current status
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Parcel unblocked by admin",
    };
    parcel.statusHistory.push(unblockStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
exports.ParcelServices = {
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
    blockParcel,
    unblockParcel,
};
