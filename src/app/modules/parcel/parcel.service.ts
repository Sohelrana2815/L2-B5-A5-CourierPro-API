import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IParcel, ParcelStatus } from "./parcel.interface";
import Parcel from "./parcel.model";
import { Types } from "mongoose";
import { calculateFee } from "../../utils/fee-calculator";
import { handleValidateReceiverInfo } from "../../helpers/handleValidateReceiverInfo";
import User from "../user/user.model";

// CREATE PARCEL (Sender Role)
const createParcel = async (
  senderId: string,
  payload: Partial<IParcel>
): Promise<IParcel> => {
  const { receiverInfo, parcelDetails, expectedDeliveryDate } = payload;

  // Validate required fields
  if (!receiverInfo || !parcelDetails) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Receiver info and parcel details are required!"
    );
  }

  // Validate receiver information against registered users
  const receiverValidation = await handleValidateReceiverInfo(receiverInfo);

  // Calculate delivery fee based on weight
  const fee = calculateFee(parcelDetails.weightKg);

  // Create initial status log
  const initialStatusLog = {
    status: ParcelStatus.REQUESTED,
    timestamp: new Date(),
    updatedBy: new Types.ObjectId(senderId),
    note: "Parcel request created by sender",
  };

  // Create the parcel
  const newParcel = await Parcel.create({
    senderId: new Types.ObjectId(senderId),
    receiverId: receiverValidation.receiverId,
    receiverInfo: receiverValidation.validatedReceiverInfo,
    parcelDetails,
    fee,
    currentStatus: ParcelStatus.REQUESTED,
    statusHistory: [initialStatusLog],
    expectedDeliveryDate: expectedDeliveryDate
      ? new Date(expectedDeliveryDate)
      : undefined,
  });

  return newParcel;
};

// GET ALL PARCELS BY SENDER
const getParcelsBySender = async (senderId: string) => {
  const parcels = await Parcel.find({ senderId }).sort({ createdAt: -1 });
  const total = await Parcel.countDocuments({ senderId });

  return {
    data: parcels,
    meta: { total },
  };
};

// GET SINGLE PARCEL BY ID
const getParcelById = async (parcelId: string, userId: string) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found!");
  }

  // Check if the user is the sender
  if (parcel.senderId.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view this parcel!"
    );
  }

  return parcel;
};

// GET PARCEL BY TRACKING ID - Guest only
const getParcelByTrackingId = async (
  trackingId: string,
  isAuthenticated: boolean
) => {
  // If user is authenticated, throw error directing them to use authenticated routes
  if (isAuthenticated) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This route is only for guest users. Please use your authenticated routes to view parcels."
    );
  }

  const parcel = await Parcel.findOne({ trackingId });

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found!");
  }

  return {
    parcel,
  };
};

// GET PARCEL BY TRACKING ID AND RECEIVER PHONE (for guest receivers only)
const getParcelByTrackingIdAndPhone = async (
  trackingId: string,
  receiverPhone: string
) => {
  // Check if the phone belongs to a registered receiver
  const registeredReceiver = await User.findOne({
    phone: receiverPhone,
    role: "RECEIVER",
    isDeleted: { $ne: true },
    accountStatus: { $ne: "BLOCKED" },
  });
  if (registeredReceiver) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This route is only for guest receivers. Registered receivers should log in to view their parcels."
    );
  }
  const parcel = await Parcel.findOne({
    trackingId,
    "receiverInfo.phone": receiverPhone,
  });
  if (!parcel) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Parcel not found or phone number doesn't match!"
    );
  }
  return parcel;
};

// GET INCOMING PARCELS BY RECEIVER PHONE (for guest receivers)
const getIncomingParcelsByPhone = async (receiverPhone: string) => {
  // Check if the phone belongs to a registered receiver
  const registeredReceiver = await User.findOne({
    phone: receiverPhone,
    role: "RECEIVER",
    isDeleted: { $ne: true },
    accountStatus: { $ne: "BLOCKED" },
  });
  if (registeredReceiver) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This route is only for guest receivers. Registered receivers should log in to view their parcels."
    );
  }

  const parcels = await Parcel.find({
    "receiverInfo.phone": receiverPhone,
    currentStatus: {
      $in: [
        ParcelStatus.REQUESTED,
        ParcelStatus.APPROVED,
        ParcelStatus.PICKED_UP,
        ParcelStatus.IN_TRANSIT,
      ],
    },
  }).sort({ createdAt: -1 });

  const total = await Parcel.countDocuments({
    "receiverInfo.phone": receiverPhone,
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
    data: parcels,
    meta: { total },
  };
};

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
  }).sort({ createdAt: -1 });

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
    data: parcels,
    meta: { total },
  };
};

// CANCEL PARCEL (Sender Role)
const cancelParcel = async (
  parcelId: string,
  senderId: string,
  note?: string
): Promise<IParcel> => {
  // Find the parcel
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found!");
  }

  if (parcel.senderId.toString() !== senderId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to cancel this parcel!"
    );
  }

  // Check if the parcel is already cancelled
  if (parcel.currentStatus === ParcelStatus.CANCELLED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel is already cancelled!");
  }

  // Check if the parcel can be cancelled (only REQUESTED or APPROVED status)
  if (
    parcel.currentStatus !== ParcelStatus.REQUESTED &&
    parcel.currentStatus !== ParcelStatus.APPROVED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel parcel with status: ${parcel.currentStatus}. Only parcels with REQUESTED or APPROVED status can be cancelled.`
    );
  }

  // Update the parcel status to CANCELLED
  parcel.currentStatus = ParcelStatus.CANCELLED;

  // Add status log entry
  const cancelStatusLog = {
    status: ParcelStatus.CANCELLED,
    timestamp: new Date(),
    updatedBy: new Types.ObjectId(senderId),
    note: note || "Parcel cancelled by sender",
  };

  parcel.statusHistory.push(cancelStatusLog);

  // Save the updated parcel
  await parcel.save();

  return parcel;
};

// GET ALL PARCELS (Admin Role)
const getAllParcels = async () => {
  const parcels = await Parcel.find({})
    .populate("senderId", "name email phone")
    .populate("receiverId", "name email phone")
    .sort({ createdAt: -1 });

  const total = await Parcel.countDocuments();

  return {
    data: parcels,
    meta: { total },
  };
};

// RECEIVER APPROVE PARCEL (For both registered and guest receivers)
const approveParcelByReceiver = async (
  parcelId: string,
  receiverIdentifier: { userId?: string; phone?: string }
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

  // Validate receiver authorization
  let isAuthorizedReceiver = false;

  if (receiverIdentifier.userId) {
    // For registered receivers - check receiverId matches
    if (
      parcel.receiverId &&
      parcel.receiverId.toString() === receiverIdentifier.userId
    ) {
      isAuthorizedReceiver = true;
    }
  } else if (receiverIdentifier.phone) {
    // For guest receivers - check phone matches
    if (parcel.receiverInfo.phone === receiverIdentifier.phone) {
      isAuthorizedReceiver = true;
    }
  }

  if (!isAuthorizedReceiver) {
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
    updatedBy: receiverIdentifier.userId
      ? new Types.ObjectId(receiverIdentifier.userId)
      : new Types.ObjectId(), // For guest users, we'll use a default ObjectId
    note: "Parcel approved by receiver",
  };

  parcel.statusHistory.push(approveStatusLog);

  // Save the updated parcel
  await parcel.save();

  return parcel;
};

// RECEIVER CANCEL PARCEL (For both registered and guest receivers)
const cancelParcelByReceiver = async (
  parcelId: string,
  receiverIdentifier: { userId?: string; phone?: string },
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

  // Validate receiver authorization
  let isAuthorizedReceiver = false;

  if (receiverIdentifier.userId) {
    // For registered receivers - check receiverId matches
    if (
      parcel.receiverId &&
      parcel.receiverId.toString() === receiverIdentifier.userId
    ) {
      isAuthorizedReceiver = true;
    }
  } else if (receiverIdentifier.phone) {
    // For guest receivers - check phone matches
    if (parcel.receiverInfo.phone === receiverIdentifier.phone) {
      isAuthorizedReceiver = true;
    }
  }

  if (!isAuthorizedReceiver) {
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
    updatedBy: receiverIdentifier.userId
      ? new Types.ObjectId(receiverIdentifier.userId)
      : new Types.ObjectId(), // For guest users, we'll use a default ObjectId
    note: note || "Parcel cancelled by receiver",
  };

  parcel.statusHistory.push(cancelStatusLog);

  // Save the updated parcel
  await parcel.save();

  return parcel;
};

// BLOCK PARCEL (Admin Role)
const blockParcel = async (
  parcelId: string,
  adminId: string,
  note?: string
): Promise<IParcel> => {
  // Find the parcel
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found!");
  }

  // Check if the parcel is already blocked
  if (parcel.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel is already blocked!");
  }

  // Update the parcel to blocked status
  parcel.isBlocked = true;

  // Add status log entry for blocking
  const blockStatusLog = {
    status: ParcelStatus.ON_HOLD,
    timestamp: new Date(),
    updatedBy: new Types.ObjectId(adminId),
    note: note || "Parcel blocked by admin",
  };

  parcel.statusHistory.push(blockStatusLog);

  // If parcel was in transit or approved, set status to ON_HOLD
  if (
    parcel.currentStatus === ParcelStatus.APPROVED ||
    parcel.currentStatus === ParcelStatus.PICKED_UP ||
    parcel.currentStatus === ParcelStatus.IN_TRANSIT
  ) {
    parcel.currentStatus = ParcelStatus.ON_HOLD;
  }

  // Save the updated parcel
  await parcel.save();

  return parcel;
};

// UNBLOCK PARCEL (Admin Role)
const unblockParcel = async (
  parcelId: string,
  adminId: string,
  note?: string
): Promise<IParcel> => {
  // Find the parcel
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found!");
  }

  // Check if the parcel is not blocked
  if (!parcel.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel is not blocked!");
  }

  // Update the parcel to unblocked status
  parcel.isBlocked = false;

  // Add status log entry for unblocking
  const unblockStatusLog = {
    status: parcel.currentStatus, // Keep the current status
    timestamp: new Date(),
    updatedBy: new Types.ObjectId(adminId),
    note: note || "Parcel unblocked by admin",
  };

  parcel.statusHistory.push(unblockStatusLog);

  // Save the updated parcel
  await parcel.save();

  return parcel;
};

export const ParcelServices = {
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
