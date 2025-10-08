/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ParcelServices } from "./parcel.service";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";

// CREATE PARCEL (Sender Role)
const createParcel = catchAsync(
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

// GET PARCEL BY TRACKING ID - Guest only (no auth required but checks for authenticated users)
const getParcelByTrackingId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { trackingId } = req.params;
    const isAuthenticated = !!req.user; // Check if user is authenticated

    const parcel = await ParcelServices.getParcelByTrackingId(
      trackingId,
      isAuthenticated
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel retrieved successfully✅",
      data: parcel,
    });
  }
);

// GET PARCEL BY TRACKING ID AND RECEIVER PHONE (for guest receivers)
const getParcelByTrackingIdAndPhone = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { trackingId } = req.params;
    const { phone } = req.body;

    if (!phone) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver phone number is required!"
      );
    }
    const parcel = await ParcelServices.getParcelByTrackingIdAndPhone(
      trackingId,
      phone
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel retrieved successfully✅",
      data: parcel,
    });
  }
);
// GET INCOMING PARCELS BY RECEIVER PHONE (for guest receivers)
const getIncomingParcelsByPhone = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body;

    if (!phone) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver phone number is required!"
      );
    }

    const result = await ParcelServices.getIncomingParcelsByPhone(phone);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Incoming parcels retrieved successfully✅",
      data: result.data,
      meta: result.meta,
    });
  }
);

// GET INCOMING PARCELS BY RECEIVER ID (for registered receivers)
const getIncomingParcelsByReceiverId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const receiverId = user.userId;

    const result = await ParcelServices.getIncomingParcelsByReceiverId(
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

// GET ALL PARCELS (Admin Role)
const getAllParcels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelServices.getAllParcels();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All parcels retrieved successfully✅",
      data: result.data,
      meta: result.meta,
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

    const parcel = await ParcelServices.cancelParcel(parcelId, senderId, note);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel cancelled successfully✅",
      data: parcel,
    });
  }
);

// RECEIVER APPROVE PARCEL (Registered receiver, auth required)
const approveParcelByReceiver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const receiverIdentifier = { userId: user.userId };
    const parcel = await ParcelServices.approveParcelByReceiver(
      parcelId,
      receiverIdentifier
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
const cancelParcelByReceiver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const { note } = req.body;
    const receiverIdentifier = { userId: user.userId };
    const parcel = await ParcelServices.cancelParcelByReceiver(
      parcelId,
      receiverIdentifier,
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

// GUEST APPROVE PARCEL (No auth required)
const guestApproveParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const { phone } = req.body;
    if (!phone) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver phone number is required!"
      );
    }
    const receiverIdentifier = { phone };
    const parcel = await ParcelServices.approveParcelByReceiver(
      parcelId,
      receiverIdentifier
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel approved successfully by guest receiver✅",
      data: parcel,
    });
  }
);

// GUEST CANCEL PARCEL (No auth required)
const guestCancelParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const { phone, note } = req.body;
    if (!phone) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver phone number is required!"
      );
    }
    const receiverIdentifier = { phone };
    const parcel = await ParcelServices.cancelParcelByReceiver(
      parcelId,
      receiverIdentifier,
      note
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel cancelled successfully by guest receiver✅",
      data: parcel,
    });
  }
);

// BLOCK PARCEL (Admin Role)
const blockParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const adminId = user.userId;
    const { note } = req.body;

    const parcel = await ParcelServices.blockParcel(parcelId, adminId, note);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel blocked successfully✅",
      data: parcel,
    });
  }
);

// UNBLOCK PARCEL (Admin Role)
const unblockParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const adminId = user.userId;
    const { note } = req.body;

    const parcel = await ParcelServices.unblockParcel(parcelId, adminId, note);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel unblocked successfully✅",
      data: parcel,
    });
  }
);

export const ParcelControllers = {
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
  guestApproveParcel,
  guestCancelParcel,
  blockParcel,
  unblockParcel,
};
