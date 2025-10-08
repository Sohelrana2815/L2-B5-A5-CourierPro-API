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

  const hashedPassword = await bcryptjs.hash(password as string, 10);

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

  return user;
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
    if (decodedToken.role === Role.SENDER || decodedToken.role === Role.RECEIVER) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are not allowed to update role!");
    }
  }

  if (payload.accountStatus || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.SENDER || decodedToken.role === Role.RECEIVER) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are not allowed to update status!");
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(payload.password as string, envVars.BCRYPT_SALT_ROUND);
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true
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

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
  blockUser,
  unblockUser,
  softDeleteUser,
  restoreUser,
};
