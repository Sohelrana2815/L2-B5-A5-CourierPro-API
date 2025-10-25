import AppError from "../../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import Parcel from "../parcel.model";

const trackParcelByTRKId = async (trackingId: string) => {
  const parcel = await Parcel.findOne(
    { trackingId },
    {
      "parcelDetails.type": 1,
      "receiverInfo.city": 1,
      currentStatus: 1,
      statusHistory: 1,
      isBlocked: 1,
      createdAt: 1,
      trackingId: 1,
    }
  );

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found!");
  }

  if (parcel.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel is blocked!");
  }

  // Return only the public fields
  return {
    parcelType: parcel.parcelDetails?.type,
    destinationCity: parcel.receiverInfo?.city,
    currentStatus: parcel.currentStatus,
    statusLogs: parcel.statusHistory || [],
    trackingId: parcel.trackingId,
    createdAt: parcel.createdAt,
    isBlocked: parcel.isBlocked,
  };
};

const ParcelPublicServices = {
  trackParcelByTRKId,
};

export default ParcelPublicServices;
