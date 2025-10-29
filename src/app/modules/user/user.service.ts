/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import User from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { Types } from "mongoose";

// pagination options type

interface PaginationOptions {
  page?: number;
  limit?: number;
  isBlocked?: boolean | string;
  isDeleted?: boolean | string;
  role?: string;
  sort?: "new" | "old" | string;
}

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, "User already exist!");
  }

  // Check if phone number is already registered (if phone is provided)
  if (payload.phone) {
    const existingUserWithPhone = await User.findOne({ phone: payload.phone });
    if (existingUserWithPhone) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Phone number is already registered!"
      );
    }
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND) || 10
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    password: hashedPassword,
    email,
    auths: [authProvider],
    ...rest,
  });
  const userObj = user.toObject();

  return { name: userObj.name };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist!");
  }

  if (payload.role) {
    // Only admins can update roles
    if (decodedToken.role !== Role.ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Only administrators can update user roles!"
      );
    }

    // Additional validation for ADMIN role assignment
    if (payload.role === Role.ADMIN) {
      // Check if the target user exists and is not already an admin
      if (isUserExist.role === Role.ADMIN) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "User is already an administrator!"
        );
      }

      // Optional: Add additional security checks here
      // For example, require certain conditions to promote to admin
      // or log the promotion for audit purposes
    }

    // Prevent users from demoting other admins (maintain admin privileges)
    if (isUserExist.role === Role.ADMIN && payload.role !== Role.ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Cannot demote an existing administrator. Admin privileges can only be managed by system administrators."
      );
    }
  }

  if (payload.accountStatus || payload.isDeleted || payload.isVerified) {
    if (
      decodedToken.role === Role.SENDER ||
      decodedToken.role === Role.RECEIVER
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You are not allowed to update status!"
      );
    }
  }

  if (payload.phone) {
    // Check if phone number is already registered by another user
    const existingUserWithPhone = await User.findOne({
      phone: payload.phone,
      _id: { $ne: new Types.ObjectId(userId) }, // Exclude current user
    });

    if (existingUserWithPhone) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Phone number is already registered to another user!"
      );
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

// GET ALL USERS

const getAllUsers = async ({
  page = 1,
  limit = 10,
  isBlocked,
  isDeleted,
  role,
  sort,
}: PaginationOptions = {}) => {
  const pageNumber = Math.max(1, Math.floor(Number(page) || 1));
  const parsedLimit = Math.max(
    1,
    Math.min(100, Math.floor(Number(limit) || 10))
  );
  const skip = (pageNumber - 1) * parsedLimit;

  // build filter object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (typeof isBlocked !== "undefined") {
    filter.isBlocked =
      typeof isBlocked === "string" ? isBlocked === "true" : Boolean(isBlocked);
  }
  if (typeof isDeleted !== "undefined") {
    filter.isDeleted =
      typeof isDeleted === "string" ? isDeleted === "true" : Boolean(isDeleted);
  }
  if (role) {
    const normalized = String(role).toUpperCase();
    if (["SENDER", "RECEIVER", "ADMIN"].includes(normalized))
      filter.role = normalized;
  }

  // sort handling: default = newest first (desc)
  const sortNormalized = String(sort || "new").toLowerCase();
  const createdAtSort = sortNormalized === "old" ? 1 : -1;

  const [users, totalUsers] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: createdAtSort })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / parsedLimit));

  return {
    data: users,
    meta: {
      total: totalUsers,
      page: pageNumber,
      limit: parsedLimit,
      totalPages,
    },
  };
};

// GET ME

const getMyProfile = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }
  const { password, ...rest } = user.toObject();
  return rest;
};

// ADMIN: Block user
const blockUser = async (userId: string, adminId: string) => {
  const admin = await User.findById(adminId);

  if (!admin || admin.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Only admins can block users!");
  }

  const user = await User.findById(userId).select("+isDeleted");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot block a deleted user!");
  }

  if (user.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already blocked!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isBlocked: true },
    { new: true }
  );

  return updatedUser;
};

// ADMIN: Unblock user
const unblockUser = async (userId: string, adminId: string) => {
  const admin = await User.findById(adminId);

  if (!admin || admin.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Only admins can unblock users!");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not blocked!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isBlocked: false },
    { new: true }
  );

  return updatedUser;
};

// ADMIN: Soft delete user
const softDeleteUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already deleted!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
  );

  return updatedUser;
};

// ADMIN: Restore soft deleted user
const restoreUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not deleted!");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: false },
    { new: true }
  );

  return updatedUser;
};

// ADMIN: Bulk soft delete users
const bulkSoftDeleteUsers = async (userIds: string[]) => {
  // First, check which users are already deleted
  const alreadyDeletedUsers = await User.find({
    _id: { $in: userIds },
    isDeleted: true,
  }).select("_id name");

  // Filter out already deleted users from the update operation
  const usersToDelete = userIds.filter(
    (id) => !alreadyDeletedUsers.some((user) => user._id.toString() === id)
  );

  const result = await User.updateMany(
    {
      _id: { $in: usersToDelete },
      isDeleted: { $ne: true }, // Additional safety check
    },
    { isDeleted: true }
  );

  if (result.matchedCount === 0 && alreadyDeletedUsers.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No users found to delete!");
  }

  return {
    message: `${result.modifiedCount} users soft deleted successfully`,
    deletedCount: result.modifiedCount,
    alreadyDeletedCount: alreadyDeletedUsers.length,
    alreadyDeletedUsers: alreadyDeletedUsers.map((user) => ({
      id: user._id,
      name: user.name,
    })),
    matchedCount: result.matchedCount + alreadyDeletedUsers.length,
  };
};

// ADMIN: Promote user to admin
const promoteUserToAdmin = async (userId: string, adminId: string) => {
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "Target user not found!");
  }

  if (targetUser.role === Role.ADMIN) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User is already an administrator!"
    );
  }

  if (targetUser.isDeleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot promote a deleted user to administrator!"
    );
  }

  if (targetUser.isBlocked) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot promote a blocked user to administrator!"
    );
  }

  // Update user role to ADMIN
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role: Role.ADMIN },
    { new: true, runValidators: true }
  );

  return {
    message: `User ${targetUser.name} has been successfully promoted to administrator`,
    updatedUser,
  };
};

export const UserServices = {
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
