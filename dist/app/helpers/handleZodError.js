"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = void 0;
// Handler function for Zod validation errors.
const handleZodError = (err) => {
    // Initialize errorSources with the new TErrorSource type
    const errorSources = [];
    const statusCode = 400; // Bad Request
    let message = "Zod Validation Error Occurred!";
    try {
        // Attempt to parse the Zod error message which is assumed to be a JSON string of ZodIssue[].
        const zodErrors = JSON.parse(err.message);
        zodErrors.forEach((errorObj) => {
            errorSources.push({
                // Join the path array to get a clean field name (e.g., 'user.name')
                path: errorObj.path.join("."),
                message: errorObj.message,
            });
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (parseError) {
        // Fallback if parsing fails or Zod error structure is unexpected.
        message = "Zod Error: Unable to parse error details";
        errorSources.push({
            path: "unknown",
            message: err.message,
        });
    }
    return {
        statusCode: statusCode, // 400
        message: message,
        errorSources,
    };
};
exports.handleZodError = handleZodError;
