import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";

export const guestOnly = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated (has req.user set by checkAuth middleware)
  if (req.user) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This route is only for guest users. Please log out to access this feature, or use your authenticated routes."
    );
  }

  next();
};
