import { Types } from "mongoose";
import AppError from "../../../errorHelpers/AppError";
import { handleValidateReceiverInfo } from "../../../helpers/handleValidateReceiverInfo";
import { calculateFee } from "../../../utils/fee-calculator";
import { IParcel, ParcelStatus } from "../parcel.interface";
import httpStatus from "http-status-codes";
import Parcel from "../parcel.model";

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
  const parcels = await Parcel.find({ senderId }).populate('statusHistory.updatedBy', 'name role').sort({ createdAt: -1 });
  const total = await Parcel.countDocuments({ senderId });

  return {
    data: parcels,
    meta: { total },
  };
};

// GET SINGLE PARCEL BY ID
const getParcelById = async (parcelId: string, userId: string) => {
  const parcel = await Parcel.findById(parcelId).populate('statusHistory.updatedBy', 'name role');

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

// CANCEL PARCEL (Sender Role)
const cancelParcel = async (
  parcelId: string,
  senderId: string,
  note: string
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
    note: note,
  };

  parcel.statusHistory.push(cancelStatusLog);

  // Save the updated parcel
  await parcel.save();

  return parcel;
};

export const ParcelSenderServices = {
  createParcel,
  getParcelsBySender,
  getParcelById,
  cancelParcel,
};
