/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import User from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, "User already exist!");
  }

  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND) || 10);

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
  const createdObj = user.toObject();
  const { password: _pwd, ...userWithoutPassword } = createdObj;

  return userWithoutPassword;
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

  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password as string,
      Number(envVars.BCRYPT_SALT_ROUND) || 10
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getAllUsers = async () => {
  const users = await User.find({ isDeleted: { $ne: true } });
  const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
  return {
    data: users,
    meta: { total: totalUsers },
  };
};

// ADMIN: Block user
const blockUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { accountStatus: "BLOCKED" },
    { new: true }
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};

// ADMIN: Unblock user
const unblockUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { accountStatus: "ACTIVE" },
    { new: true }
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};

// ADMIN: Soft delete user
const softDeleteUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};

// ADMIN: Restore soft deleted user
const restoreUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isDeleted: false },
    { new: true }
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};

// ADMIN: Bulk soft delete users
const bulkSoftDeleteUsers = async (userIds: string[]) => {
  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { isDeleted: true }
  );

  if (result.matchedCount === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No users found to delete!");
  }

  return {
    message: `${result.modifiedCount} users soft deleted successfully`,
    deletedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
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

  if (targetUser.accountStatus === "BLOCKED") {
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
};
