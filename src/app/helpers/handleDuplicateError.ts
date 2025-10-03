import { TGenericErrorResponse } from "../interfaces/error.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Handler function for MongoDB duplicate key errors (code 11000).

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const duplicateKey = Object.keys(err.keyValue);
  return {
    statusCode: 409, // Conflict
    message: `${duplicateKey[0]} ${
      err.keyValue[duplicateKey[0]]
    } already exists`,
  };
};
