/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { ParcelAdminServices } from "./parcel.admin.service";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

// GET ULTIMATE CURRENT STATUS OF PARCEL (Admin Role)

// GET ALL PARCELS (Admin Role)
const getAllParcels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Read query params and pass to service
    const { page = undefined, limit = undefined, search = undefined } = req.query as {
      page?: string | undefined;
      limit?: string | undefined;
      search?: string | undefined;
    };
    const result = await ParcelAdminServices.getAllParcels(page, limit, search);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: search && search.trim()
        ? `Parcels matching "${search.trim()}" retrieved successfully✅`
        : "All parcels retrieved successfully✅",
      data: result.data,
      meta: result.meta,
    });
  }
);

// GET PARCEL BY ID (Admin Role)
const getParcelById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await ParcelAdminServices.getParcelById(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel details retrieved successfully✅",
      data: result,
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

    const parcel = await ParcelAdminServices.blockParcel(
      parcelId,
      adminId,
      note
    );

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

    const parcel = await ParcelAdminServices.unblockParcel(
      parcelId,
      adminId,
      note
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel unblocked successfully✅",
      data: parcel,
    });
  }
);

// PICK UP PARCEL (Admin Role) - APPROVED → PICKED_UP
const pickUpParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const adminId = user.userId;
    const { note } = req.body;

    const parcel = await ParcelAdminServices.pickUpParcel(
      parcelId,
      adminId,
      note
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel picked up successfully✅",
      data: parcel,
    });
  }
);

// START TRANSIT (Admin Role) - PICKED_UP → IN_TRANSIT
const startTransit = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const adminId = user.userId;
    const { note } = req.body;

    const parcel = await ParcelAdminServices.startTransit(
      parcelId,
      adminId,
      note
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel transit started successfully✅",
      data: parcel,
    });
  }
);

// DELIVER PARCEL (Admin Role) - IN_TRANSIT → DELIVERED
const deliverParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const adminId = user.userId;
    const { note } = req.body;

    const parcel = await ParcelAdminServices.deliverParcel(
      parcelId,
      adminId,
      note
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel delivered successfully✅",
      data: parcel,
    });
  }
);

// RETURN PARCEL (Admin Role)
const returnParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const adminId = user.userId;
    const { note } = req.body;

    const parcel = await ParcelAdminServices.returnParcel(
      parcelId,
      adminId,
      note
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel returned successfully✅",
      data: parcel,
    });
  }
);

// HOLD PARCEL (Admin Role)
const holdParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const user = req.user as JwtPayload;
    const adminId = user.userId;
    const { note } = req.body;

    const parcel = await ParcelAdminServices.holdParcel(
      parcelId,
      adminId,
      note
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel put on hold successfully✅",
      data: parcel,
    });
  }
);

// GET DASHBOARD OVERVIEW (Admin Role)
const getDashboardOverview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelAdminServices.getDashboardOverview();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Dashboard overview retrieved successfully✅",
      data: result,
    });
  }
);

// GET FINAL STATUS COUNTS (Admin Role) - Get counts for ultimate statuses only
const getFinalStatusCounts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelAdminServices.getFinalStatusCounts();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Final status counts retrieved successfully✅",
      data: result,
    });
  }
);

// GET PARCEL TRENDS (Admin Role) - Get new parcel creation trends over time
const getParcelTrends = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { days = "7" } = req.query as { days?: string };
    const daysNumber = Math.min(30, Math.max(1, Number(days) || 7)); // Default 7 days, max 30 days

    const result = await ParcelAdminServices.getParcelTrends(daysNumber);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Parcel trends for last ${daysNumber} days retrieved successfully✅`,
      data: result,
    });
  }
);

// GET COMPREHENSIVE PARCEL TRENDS (Admin Role) - Get both 7 and 30 day trends with comparison
const getComprehensiveParcelTrends = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelAdminServices.getComprehensiveParcelTrends();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comprehensive parcel trends retrieved successfully✅",
      data: result,
    });
  }
);

export const ParcelAdminControllers = {
  getAllParcels,
  getParcelById,
  blockParcel,
  unblockParcel,
  pickUpParcel,
  startTransit,
  deliverParcel,
  returnParcel,
  holdParcel,
  getDashboardOverview,
  getFinalStatusCounts,
  getParcelTrends,
  getComprehensiveParcelTrends,
};
