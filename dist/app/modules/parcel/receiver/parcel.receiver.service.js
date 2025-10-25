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
exports.ParcelReceiverServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const parcel_model_1 = __importDefault(require("../parcel.model"));
const parcel_interface_1 = require("../parcel.interface");
const AppError_1 = __importDefault(require("../../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = __importDefault(require("../../user/user.model"));
const user_interface_1 = require("../../user/user.interface");
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
    })
        .populate("senderId", "name")
        .sort({ createdAt: -1 });
    // Transform the data to include sender name and other useful info
    const transformedData = parcels.map((parcel) => ({
        _id: parcel._id,
        trackingId: parcel.trackingId,
        senderName: parcel.senderId ? parcel.senderId.name : "Unknown",
        parcelType: parcel.parcelDetails.type,
        weightKg: parcel.parcelDetails.weightKg,
        description: parcel.parcelDetails.description,
        fee: parcel.fee,
        currentStatus: parcel.currentStatus,
        createdAt: parcel.createdAt,
        expectedDeliveryDate: parcel.expectedDeliveryDate,
    }));
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
        data: transformedData,
        meta: { total },
    };
});
// RECEIVER APPROVE PARCEL (For registered receivers only)
const approveParcelByReceiver = (parcelId, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the parcel
    const parcel = yield parcel_model_1.default.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found!");
    }
    // Check if parcel can be approved (only REQUESTED status)
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.REQUESTED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cannot approve parcel with status: ${parcel.currentStatus}. Only parcels with REQUESTED status can be approved.`);
    }
    // Validate receiver authorization - only for registered receivers
    if (!parcel.receiverId || parcel.receiverId.toString() !== receiverId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to approve this parcel!");
    }
    // Update the parcel status to APPROVED
    parcel.currentStatus = parcel_interface_1.ParcelStatus.APPROVED;
    // Add status log entry
    const approveStatusLog = {
        status: parcel_interface_1.ParcelStatus.APPROVED,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(receiverId),
        note: "Parcel approved by receiver",
    };
    parcel.statusHistory.push(approveStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// RECEIVER CANCEL PARCEL (For registered receivers only)
const declineParcelByReceiver = (parcelId, receiverId, note) => __awaiter(void 0, void 0, void 0, function* () {
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
    // Validate receiver authorization - only for registered receivers
    if (!parcel.receiverId || parcel.receiverId.toString() !== receiverId) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to cancel this parcel!");
    }
    // Update the parcel status to CANCELLED
    parcel.currentStatus = parcel_interface_1.ParcelStatus.CANCELLED;
    // Add status log entry
    const cancelStatusLog = {
        status: parcel_interface_1.ParcelStatus.CANCELLED,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(receiverId),
        note: note || "Parcel cancelled by receiver",
    };
    parcel.statusHistory.push(cancelStatusLog);
    // Save the updated parcel
    yield parcel.save();
    return parcel;
});
// Update Receiver Profile in order to receive parcels
const updateReceiverProfile = (receiverId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if at least one field is provided
    if (!updateData.phone && !updateData.address && !updateData.city) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "At least one field (phone, address, or city) must be provided!");
    }
    // Find the user
    const user = yield user_model_1.default.findById(receiverId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Receiver not found!");
    }
    // Prepare update object
    const updateFields = {};
    // Check if phone number is already taken by another user (if phone is being updated)
    if (updateData.phone) {
        const existingUser = yield user_model_1.default.findOne({
            phone: updateData.phone,
            _id: { $ne: new mongoose_1.Types.ObjectId(receiverId) } // Exclude current user
        });
        if (existingUser) {
            throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Phone number is already registered to another user!");
        }
        updateFields.phone = updateData.phone;
    }
    if (updateData.address) {
        updateFields.address = updateData.address;
    }
    if (updateData.city) {
        updateFields.city = updateData.city;
    }
    // Update the receiver profile
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(receiverId, { $set: updateFields }, { new: true, runValidators: true }).select("-password");
    return updatedUser;
});
// GET ALL REGISTERED RECEIVERS (for senders only)
const getAllRegisteredReceivers = () => __awaiter(void 0, void 0, void 0, function* () {
    const receivers = yield user_model_1.default.find({
        role: user_interface_1.Role.RECEIVER,
        isDeleted: false,
        accountStatus: "ACTIVE",
    })
        .select("name email phone address city picture createdAt")
        .sort({ createdAt: -1 });
    const total = yield user_model_1.default.countDocuments({
        role: user_interface_1.Role.RECEIVER,
        isDeleted: false,
        accountStatus: "ACTIVE",
    });
    return {
        data: receivers,
        meta: { total },
    };
});
// Helper function to get user display info for status updates
const getUserDisplayInfo = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId).select('name role').lean();
    if (!user)
        return { displayName: 'Unknown', role: 'unknown' };
    // Determine display based on role
    if (user.role === user_interface_1.Role.ADMIN) {
        return { displayName: 'Admin', role: 'admin' };
    }
    else if (user.role === user_interface_1.Role.SENDER) {
        return { displayName: 'Sender', role: 'sender' };
    }
    else if (user.role === user_interface_1.Role.RECEIVER) {
        return { displayName: 'Receiver', role: 'receiver' };
    }
    return { displayName: user.name || 'Unknown', role: 'unknown' };
});
// GET DELIVERY HISTORY BY RECEIVER ID (for registered receivers)
const getDeliveryHistoryByReceiverId = (receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcels = yield parcel_model_1.default.find({
        receiverId: new mongoose_1.Types.ObjectId(receiverId),
        currentStatus: {
            $in: [
                parcel_interface_1.ParcelStatus.DELIVERED,
                parcel_interface_1.ParcelStatus.CANCELLED,
                parcel_interface_1.ParcelStatus.RETURNED,
            ],
        },
    })
        .populate("senderId", "name")
        .select('trackingId currentStatus senderId parcelDetails.type fee statusHistory')
        .sort({ createdAt: -1 })
        .lean();
    // Transform the data to include lastUpdatedAt, sender name, and recent status history
    const transformedData = yield Promise.all(parcels.map((parcel) => __awaiter(void 0, void 0, void 0, function* () {
        // Get recent status history with user info
        const recentStatusHistory = yield Promise.all(parcel.statusHistory
            .slice(-5) // Get last 5 status entries for better tracking
            .map((log) => __awaiter(void 0, void 0, void 0, function* () {
            const userInfo = yield getUserDisplayInfo(log.updatedBy);
            return {
                status: log.status,
                timestamp: log.timestamp,
                updatedBy: {
                    id: log.updatedBy,
                    displayName: userInfo.displayName,
                    role: userInfo.role
                },
                location: log.location,
                note: log.note
            };
        })));
        return {
            trackingId: parcel.trackingId,
            currentStatus: parcel.currentStatus,
            senderName: parcel.senderId ? parcel.senderId.name : "Unknown",
            parcelType: parcel.parcelDetails.type,
            fee: parcel.fee,
            lastUpdatedAt: parcel.statusHistory.length > 0
                ? parcel.statusHistory[parcel.statusHistory.length - 1].timestamp
                : new Date(),
            // Add recent status history for tracking with user-friendly display names
            statusHistory: recentStatusHistory.reverse() // Show most recent first
        };
    })));
    const total = yield parcel_model_1.default.countDocuments({
        receiverId: new mongoose_1.Types.ObjectId(receiverId),
        currentStatus: {
            $in: [
                parcel_interface_1.ParcelStatus.DELIVERED,
                parcel_interface_1.ParcelStatus.CANCELLED,
                parcel_interface_1.ParcelStatus.RETURNED,
            ],
        },
    });
    return {
        data: transformedData,
        meta: { total },
    };
});
exports.ParcelReceiverServices = {
    getIncomingParcelsByReceiverId,
    approveParcelByReceiver,
    declineParcelByReceiver,
    updateReceiverProfile,
    getAllRegisteredReceivers,
    getDeliveryHistoryByReceiverId,
};
