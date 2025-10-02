import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

export const globalErrorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // console.log(err);
  let statusCode = 500;
  let message = "Something went wrong!";
  // Duplicate key error
  if (err.code === 11000) {
    // console.log("Duplicate key error", err.keyValue);
    const duplicateKey = Object.keys(err.keyValue);
    // console.log(err.keyValue[duplicateKey[0]]);
    statusCode = 409;
    message = `User with ${duplicateKey[0]} ${
      err.keyValue[duplicateKey[0]]
    } already exists`;
  }
  // CastError or objectId error
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    err,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
