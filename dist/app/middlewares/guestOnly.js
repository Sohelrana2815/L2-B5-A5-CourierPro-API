"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestOnly = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const guestOnly = (req, res, next) => {
    // Check if user is authenticated (has req.user set by checkAuth middleware)
    if (req.user) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This route is only for guest users. Please log out to access this feature, or use your authenticated routes.");
    }
    next();
};
exports.guestOnly = guestOnly;
