/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { JwtPayload } from "jsonwebtoken";

// GET ME

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const myProfile = await UserServices.getMyProfile(user.userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile retrieved successfully",
      data: myProfile,
    });
  }
);

// ADMIN: Block user
const blockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const adminUser = req.user as JwtPayload;
    const user = await UserServices.blockUser(userId, adminUser.userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User blocked successfully",
      data: user,
    });
  }
);

// ADMIN: Unblock user
const unblockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const adminUser = req.user as JwtPayload;
    const user = await UserServices.unblockUser(userId, adminUser.userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User unblocked successfully",
      data: user,
    });
  }
);

// ADMIN: Restore soft deleted user
const restoreUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await UserServices.restoreUser(userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User restored successfully",
      data: user,
    });
  }
);

// ADMIN: Soft delete user
const softDeleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await UserServices.softDeleteUser(userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User soft deleted successfully",
      data: user,
    });
  }
);
// Create user
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully",
      data: user,
    });
  }
);

// GET ALL USERS
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 1;

    const result = await UserServices.getAllUsers({ page, limit });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Users Retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

// UPDATE USER
const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;
    const user = await UserServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Updated Successfully",
      data: user,
    });
  }
);

// ADMIN: Bulk soft delete users
const bulkSoftDeleteUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "userIds array is required and must not be empty!"
      );
    }

    const result = await UserServices.bulkSoftDeleteUsers(userIds);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: result.message,
      data: result,
    });
  }
);

// ADMIN: Promote user to admin
const promoteUserToAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const adminUser = req.user as JwtPayload;

    const result = await UserServices.promoteUserToAdmin(
      userId,
      adminUser.userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: result.message,
      data: result.updatedUser,
    });
  }
);

export const UserControllers = {
  createUser,
  getAllUsers,
  updateUser,
  blockUser,
  unblockUser,
  softDeleteUser,
  restoreUser,
  bulkSoftDeleteUsers,
  promoteUserToAdmin,
  getMyProfile,
};
