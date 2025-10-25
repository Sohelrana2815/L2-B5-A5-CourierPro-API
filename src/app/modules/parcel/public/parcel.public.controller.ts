import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import ParcelPublicServices from "./parcel.public.service";

const trackParcel = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;

  const result = await ParcelPublicServices.trackParcelByTRKId(trackingId);

  res.status(200).json({
    success: true,
    message: "Parcel tracking information retrieved successfully",
    data: result,
  });
});

const ParcelPublicControllers = {
  trackParcel,
};

export default ParcelPublicControllers;
