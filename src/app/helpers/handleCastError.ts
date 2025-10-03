import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/error.types";

// Handler function for Mongoose CastErrors (e.g., invalid ObjectID).
export const handleCastError = (
  err: mongoose.Error.CastError
): TGenericErrorResponse => {
  return {
    statusCode: 400, // Bad Request
    message: `Invalid ${err.path}: ${err.value}`,
  };
};
