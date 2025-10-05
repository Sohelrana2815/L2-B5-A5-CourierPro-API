"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCastError = void 0;
// Handler function for Mongoose CastErrors (e.g., invalid ObjectID).
const handleCastError = (err) => {
    return {
        statusCode: 400, // Bad Request
        message: `Invalid ${err.path}: ${err.value}`,
    };
};
exports.handleCastError = handleCastError;
