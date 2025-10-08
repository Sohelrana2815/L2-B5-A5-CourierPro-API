"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
// Handler function for MongoDB duplicate key errors (code 11000).
const handleDuplicateError = (err) => {
    const duplicateKey = Object.keys(err.keyValue);
    return {
        statusCode: 409, // Conflict
        message: `User${err.keyValue[duplicateKey[0]]} already exists`,
    };
};
exports.handleDuplicateError = handleDuplicateError;
