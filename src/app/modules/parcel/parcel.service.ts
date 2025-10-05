import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IParcel, ParcelStatus } from "./parcel.interface";
import Parcel from "./parcel.model";
import { Types } from "mongoose";

// Calculate fee based on weight (simple pricing logic)
const calculateFee = (weightKg: number): number => {
  const basePrice = 50; // Base price  in BDT
  const pricePerKg = 20; // Price will increase per kg in BDT

  if (typeof weightKg !== "number" || !isFinite(weightKg)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid weight");
  }
  if (weightKg < 0.1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Weight must be at least 0.1 kg"
    );
  }

  if (weightKg <= 1) {
    return basePrice;
  } else {
    const extra = Math.max(0, weightKg - 1);
    const fee = basePrice + extra * pricePerKg;
    return Math.round(fee * 100) / 100;
  }
};


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
    receiverInfo,
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

// GET PARCEL BY TRACKING ID
const getParcelByTrackingId = async (trackingId: string) => {
  const parcel = await Parcel.findOne({ trackingId });

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found!");
  }

  return parcel;
};

export const ParcelServices = {
  createParcel,
  getParcelsBySender,
  getParcelById,
  getParcelByTrackingId,
};
