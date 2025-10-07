/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { TErrorSource } from "../interfaces/error.types";
import { handleZodError } from "../helpers/handleZodError";
import { handleCastError } from "../helpers/handleCastError";
import { handleValidationError } from "../helpers/handleValidationError";
import { handleDuplicateError } from "../helpers/handleDuplicateError";

// Global Express Error Handler Middleware.
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    console.log(err);
  }

  // Initialize default error response variables
  let errorSources: TErrorSource[] = [];
  let statusCode = 500;
  let message = "Something went wrong!";

  // 1. Handle MongoDB Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;

    // 2. Handle Zod Validation Error
  } else if (err.name === "ZodError") {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSource[];

    // 3. Handle Mongoose Cast Error (e.g., invalid ID)
  } else if (err.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;

    // 4. Handle Mongoose General Validation Error
  } else if (err.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    errorSources = simplifiedError.errorSources as TErrorSource[];
    message = simplifiedError.message; // Use the message from the handler

    // 5. Handle Custom AppError
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    // 6. Handle Generic JavaScript Error
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  // Final response object sent to the client
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err : null,
    // Include stack trace only in development environment
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
