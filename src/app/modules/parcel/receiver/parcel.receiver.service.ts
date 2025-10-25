/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import Parcel from "../parcel.model";
import { IParcel, ParcelStatus } from "../parcel.interface";
import AppError from "../../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import User from "../../user/user.model";
import { Role } from "../../user/user.interface";

// GET INCOMING PARCELS BY RECEIVER ID (for registered receivers)
const getIncomingParcelsByReceiverId = async (receiverId: string) => {
  const parcels = await Parcel.find({
    receiverId: new Types.ObjectId(receiverId),
    currentStatus: {
      $in: [
        ParcelStatus.REQUESTED,
        ParcelStatus.APPROVED,
        ParcelStatus.PICKED_UP,
        ParcelStatus.IN_TRANSIT,
      ],
    },
  })
    .populate("senderId", "name")
    .sort({ createdAt: -1 });

  // Transform the data to include sender name and other useful info
  const transformedData = parcels.map((parcel) => ({
    _id: parcel._id,
    trackingId: parcel.trackingId,
    senderName: parcel.senderId ? (parcel.senderId as any).name : "Unknown",
    parcelType: parcel.parcelDetails.type,
    weightKg: parcel.parcelDetails.weightKg,
    description: parcel.parcelDetails.description,
    fee: parcel.fee,
    currentStatus: parcel.currentStatus,
    createdAt: parcel.createdAt,
    expectedDeliveryDate: parcel.expectedDeliveryDate,
  }));

  const total = await Parcel.countDocuments({
    receiverId: new Types.ObjectId(receiverId),
    currentStatus: {
      $in: [
        ParcelStatus.REQUESTED,
        ParcelStatus.APPROVED,
        ParcelStatus.PICKED_UP,
        ParcelStatus.IN_TRANSIT,
      ],
    },
  });

  return {
    data: transformedData,
    meta: { total },
  };
};

// RECEIVER APPROVE PARCEL (For registered receivers only)
const approveParcelByReceiver = async (
  parcelId: string,
  receiverId: string
): Promise<IParcel> => {
  // Find the parcel
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found!");
  }

  // Check if parcel can be approved (only REQUESTED status)
  if (parcel.currentStatus !== ParcelStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot approve parcel with status: ${parcel.currentStatus}. Only parcels with REQUESTED status can be approved.`
    );
  }

  // Validate receiver authorization - only for registered receivers
  if (!parcel.receiverId || parcel.receiverId.toString() !== receiverId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to approve this parcel!"
    );
  }

  // Update the parcel status to APPROVED
  parcel.currentStatus = ParcelStatus.APPROVED;

  // Add status log entry
  const approveStatusLog = {
    status: ParcelStatus.APPROVED,
    timestamp: new Date(),
    updatedBy: new Types.ObjectId(receiverId),
    note: "Parcel approved by receiver",
  };

  parcel.statusHistory.push(approveStatusLog);

  // Save the updated parcel
  await parcel.save();

  return parcel;
};

// RECEIVER CANCEL PARCEL (For registered receivers only)
const declineParcelByReceiver = async (
  parcelId: string,
  receiverId: string,
  note?: string
): Promise<IParcel> => {
  // Find the parcel
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found!");
  }

  // Check if parcel can be cancelled (only REQUESTED or APPROVED status)
  if (
    parcel.currentStatus !== ParcelStatus.REQUESTED &&
    parcel.currentStatus !== ParcelStatus.APPROVED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel parcel with status: ${parcel.currentStatus}. Only parcels with REQUESTED or APPROVED status can be cancelled.`
    );
  }

  // Validate receiver authorization - only for registered receivers
  if (!parcel.receiverId || parcel.receiverId.toString() !== receiverId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to cancel this parcel!"
    );
  }

  // Update the parcel status to CANCELLED
  parcel.currentStatus = ParcelStatus.CANCELLED;

  // Add status log entry
  const cancelStatusLog = {
    status: ParcelStatus.CANCELLED,
    timestamp: new Date(),
    updatedBy: new Types.ObjectId(receiverId),
    note: note || "Parcel cancelled by receiver",
  };

  parcel.statusHistory.push(cancelStatusLog);

  // Save the updated parcel
  await parcel.save();

  return parcel;
};

// Update Receiver Profile in order to receive parcels

const updateReceiverProfile = async (
  receiverId: string,
  updateData: {
    phone?: string;
    address?: string;
    city?: string;
  }
) => {
  // Check if at least one field is provided
  if (!updateData.phone && !updateData.address && !updateData.city) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least one field (phone, address, or city) must be provided!"
    );
  }

  // Find the user
  const user = await User.findById(receiverId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver not found!");
  }

  // Prepare update object
  const updateFields: Partial<typeof updateData> = {};

  // Check if phone number is already taken by another user (if phone is being updated)
  if (updateData.phone) {
    const existingUser = await User.findOne({
      phone: updateData.phone,
      _id: { $ne: new Types.ObjectId(receiverId) } // Exclude current user
    });

    if (existingUser) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Phone number is already registered to another user!"
      );
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
  const updatedUser = await User.findByIdAndUpdate(
    receiverId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password");

  return updatedUser;
};

// GET ALL REGISTERED RECEIVERS (for senders only)
const getAllRegisteredReceivers = async () => {
  const receivers = await User.find({
    role: Role.RECEIVER,
    isDeleted: false,
    accountStatus: "ACTIVE",
  })
    .select("name email phone address city picture createdAt")
    .sort({ createdAt: -1 });

  const total = await User.countDocuments({
    role: Role.RECEIVER,
    isDeleted: false,
    accountStatus: "ACTIVE",
  });

  return {
    data: receivers,
    meta: { total },
  };
};

// Helper function to get user display info for status updates
const getUserDisplayInfo = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId).select('name role').lean();

  if (!user) return { displayName: 'Unknown', role: 'unknown' };

  // Determine display based on role
  if (user.role === Role.ADMIN) {
    return { displayName: 'Admin', role: 'admin' };
  } else if (user.role === Role.SENDER) {
    return { displayName: 'Sender', role: 'sender' };
  } else if (user.role === Role.RECEIVER) {
    return { displayName: 'Receiver', role: 'receiver' };
  }

  return { displayName: user.name || 'Unknown', role: 'unknown' };
};

// GET DELIVERY HISTORY BY RECEIVER ID (for registered receivers)
const getDeliveryHistoryByReceiverId = async (receiverId: string) => {
  const parcels = await Parcel.find({
    receiverId: new Types.ObjectId(receiverId),
    currentStatus: {
      $in: [
        ParcelStatus.DELIVERED,
        ParcelStatus.CANCELLED,
        ParcelStatus.RETURNED,
      ],
    },
  })
    .populate("senderId", "name")
    .select('trackingId currentStatus senderId parcelDetails.type fee statusHistory')
    .sort({ createdAt: -1 })
    .lean();

  // Transform the data to include lastUpdatedAt, sender name, and recent status history
  const transformedData = await Promise.all(parcels.map(async (parcel) => {
    // Get recent status history with user info
    const recentStatusHistory = await Promise.all(
      parcel.statusHistory
        .slice(-5) // Get last 5 status entries for better tracking
        .map(async (log) => {
          const userInfo = await getUserDisplayInfo(log.updatedBy);
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
        })
    );

    return {
      trackingId: parcel.trackingId,
      currentStatus: parcel.currentStatus,
      senderName: parcel.senderId ? (parcel.senderId as any).name : "Unknown",
      parcelType: parcel.parcelDetails.type,
      fee: parcel.fee,
      lastUpdatedAt:
        parcel.statusHistory.length > 0
          ? parcel.statusHistory[parcel.statusHistory.length - 1].timestamp
          : new Date(),
      // Add recent status history for tracking with user-friendly display names
      statusHistory: recentStatusHistory.reverse() // Show most recent first
    };
  }));

  const total = await Parcel.countDocuments({
    receiverId: new Types.ObjectId(receiverId),
    currentStatus: {
      $in: [
        ParcelStatus.DELIVERED,
        ParcelStatus.CANCELLED,
        ParcelStatus.RETURNED,
      ],
    },
  });

  return {
    data: transformedData,
    meta: { total },
  };
};

export const ParcelReceiverServices = {
  getIncomingParcelsByReceiverId,
  approveParcelByReceiver,
  declineParcelByReceiver,
  updateReceiverProfile,
  getAllRegisteredReceivers,
  getDeliveryHistoryByReceiverId,
};
