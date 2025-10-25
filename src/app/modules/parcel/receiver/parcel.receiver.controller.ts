/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { ParcelReceiverServices } from "./parcel.receiver.service";
import httpStatus from "http-status-codes";
// GET INCOMING PARCELS BY RECEIVER ID (for registered receivers)
const getIncomingParcelsByReceiverId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const receiverId = user.userId;

    const result = await ParcelReceiverServices.getIncomingParcelsByReceiverId(
      receiverId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Incoming parcels retrieved successfully✅",
      data: result.data,
      meta: result.meta,
    });
  }
);

// RECEIVER APPROVE PARCEL (Registered receiver, auth required)
const approveParcelByReceiver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const receiverId = user.userId;
    const parcel = await ParcelReceiverServices.approveParcelByReceiver(
      parcelId,
      receiverId
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel approved successfully by receiver✅",
      data: parcel,
    });
  }
);

// RECEIVER CANCEL PARCEL (Registered receiver, auth required)
const declineParcelByReceiver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const { note } = req.body;
    const receiverId = user.userId;
    const parcel = await ParcelReceiverServices.declineParcelByReceiver(
      parcelId,
      receiverId,
      note
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel cancelled successfully by receiver✅",
      data: parcel,
    });
  }
);

// UPDATE RECEIVER PROFILE (Registered receiver, auth required)
const updateReceiverProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const receiverId = user.userId;
    const updateData = req.body;

    const updatedUser = await ParcelReceiverServices.updateReceiverProfile(
      receiverId,
      updateData
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Receiver profile updated successfully✅",
      data: updatedUser,
    });
  }
);

// GET ALL REGISTERED RECEIVERS (For senders only)
const getAllRegisteredReceivers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelReceiverServices.getAllRegisteredReceivers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All registered receivers retrieved successfully✅",
      data: result.data,
      meta: result.meta,
    });
  }
);

// GET DELIVERY HISTORY BY RECEIVER ID (for registered receivers)
const getDeliveryHistoryByReceiverId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const receiverId = user.userId;

    const result = await ParcelReceiverServices.getDeliveryHistoryByReceiverId(
      receiverId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Delivery history retrieved successfully✅",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const ParcelReceiverControllers = {
  getIncomingParcelsByReceiverId,
  approveParcelByReceiver,
  declineParcelByReceiver,
  updateReceiverProfile,
  getAllRegisteredReceivers,
  getDeliveryHistoryByReceiverId,
};
