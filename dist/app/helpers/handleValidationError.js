"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = void 0;
// Handler function for Mongoose general ValidationError.
const handleValidationError = (err) => {
    const errorSources = [];
    const errors = Object.values(err.errors);
    errors.forEach((errorObj) => {
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
exports.handleValidationError = handleValidationError;
