"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const handleDuplicateError_1 = require("../helpers/handleDuplicateError");
const handleZodError_1 = require("../helpers/handleZodError");
const handleCastError_1 = require("../helpers/handleCastError");
const handleValidationError_1 = require("../helpers/handleValidationError");
// Global Express Error Handler Middleware.
const globalErrorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    if (env_1.envVars.NODE_ENV === "development") {
        console.log(err);
    }
    // Initialize default error response variables
    let errorSources = [];
    let statusCode = 500;
    let message = "Something went wrong!";
    // 1. Handle MongoDB Duplicate Key Error (code 11000)
    if (err.code === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.handleDuplicateError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        // 2. Handle Zod Validation Error
    }
    else if (err.name === "ZodError") {
        const simplifiedError = (0, handleZodError_1.handleZodError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
        // 3. Handle Mongoose Cast Error (e.g., invalid ID)
    }
    else if (err.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.handleCastError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        // 4. Handle Mongoose General Validation Error
    }
    else if (err.name === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.handleValidationError)(err);
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources;
        message = simplifiedError.message; // Use the message from the handler
        // 5. Handle Custom AppError
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
        // 6. Handle Generic JavaScript Error
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }
    // Final response object sent to the client
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: env_1.envVars.NODE_ENV === "development" ? err : null,
        // Include stack trace only in development environment
        stack: env_1.envVars.NODE_ENV === "development" ? err.stack : null,
    });
};
exports.globalErrorHandler = globalErrorHandler;
