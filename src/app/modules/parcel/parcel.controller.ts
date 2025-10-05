/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ParcelServices } from "./parcel.service";
import { JwtPayload } from "jsonwebtoken";

// CREATE PARCEL (Sender Role)
const createParcel = 
catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const senderId = user.userId;

    const parcel = await ParcelServices.createParcel(senderId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Parcel created successfully✅",
      data: parcel,
    });
  }
);

// GET ALL PARCELS BY SENDER
const getParcelsBySender = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const senderId = user.userId;

    const result = await ParcelServices.getParcelsBySender(senderId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcels retrieved successfully✅",
      data: result.data,
      meta: result.meta,
    });
  }
);

// GET SINGLE PARCEL BY ID
const getParcelById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const userId = user.userId;

    const parcel = await ParcelServices.getParcelById(parcelId, userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel retrieved successfully✅",
      data: parcel,
    });
  }
);

// GET PARCEL BY TRACKING ID
const getParcelByTrackingId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { trackingId } = req.params;

    const parcel = await ParcelServices.getParcelByTrackingId(trackingId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel retrieved successfully✅",
      data: parcel,
    });
  }
);

export const ParcelControllers = {
  createParcel,
  getParcelsBySender,
  getParcelById,
  getParcelByTrackingId,
};
