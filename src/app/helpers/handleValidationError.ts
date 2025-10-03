/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose from "mongoose";
import { TErrorSource, TGenericErrorResponse } from "../interfaces/error.types";

// Handler function for Mongoose general ValidationError.
export const handleValidationError = (
  err: mongoose.Error.ValidationError
): TGenericErrorResponse => {
  const errorSources: TErrorSource[] = [];

  const errors = Object.values(err.errors);

  errors.forEach((errorObj: any) => {
    errorSources.push({
      path: errorObj.path,
      message: errorObj.message,
    });
  });

  return {
    statusCode: 400, // Bad Request
    message: "Validation Error Occurred!",
    errorSources,
  };
};
