import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import User from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";
export const checkAuth =
  (authRoles: string | string[], customErrorMessage?: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Normalize authRoles to array
      const roles = Array.isArray(authRoles) ? authRoles : [authRoles];

      // Check both cookie and Authorization header
      const accessToken =
        req.cookies?.accessToken || req.headers?.authorization;

      if (!accessToken) {
        // Use custom message if provided, otherwise use generic message
        const errorMessage = customErrorMessage || "You are not authorized!";
        throw new AppError(httpStatus.UNAUTHORIZED, errorMessage);
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      if (!verifiedToken) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `You are not authorized! ${verifiedToken}`
        );
      }

      const isUserExist = await User.findOne({
        email: verifiedToken.email,
      }).select("+isDeleted");

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist!");
      }

      if (
        isUserExist.accountStatus === IsActive.BLOCKED ||
        isUserExist.accountStatus === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.accountStatus}!`
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted!");
      }

      if (!roles.includes(verifiedToken.role)) {
        // Use custom message if provided, otherwise use generic message
        const errorMessage =
          customErrorMessage ||
          `Access denied! This route is only accessible to: ${
            roles.length === 1 ? roles[0] : roles.join(", ")
          }`;

        throw new AppError(httpStatus.FORBIDDEN, errorMessage);
      }

      req.user = verifiedToken;

      next();
    } catch (err) {
      next(err);
    }
  };
