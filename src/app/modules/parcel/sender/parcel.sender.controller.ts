/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { ParcelSenderServices } from "./parcel.sender.service";

// CREATE PARCEL (Sender Role)
const createParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const senderId = user.userId;

    const parcel = await ParcelSenderServices.createParcel(senderId, req.body);

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

    const result = await ParcelSenderServices.getParcelsBySender(senderId);

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

    const parcel = await ParcelSenderServices.getParcelById(parcelId, userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel retrieved successfully✅",
      data: parcel,
    });
  }
);

// CANCEL PARCEL (Sender Role)
const cancelParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const senderId = user.userId;
    const { note } = req.body;

    const parcel = await ParcelSenderServices.cancelParcel(
      parcelId,
      senderId,
      note
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel cancelled successfully✅",
      data: parcel,
    });
  }
);

export const ParcelSenderControllers = {
  createParcel,
  getParcelsBySender,
  getParcelById,
  cancelParcel,
};
