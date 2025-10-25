"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const user_interface_1 = require("../modules/user/user.interface");
const checkAuth = (authRoles, customErrorMessage) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Normalize authRoles to array
        const roles = Array.isArray(authRoles) ? authRoles : [authRoles];
        // Check both cookie and Authorization header
        const accessToken = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) || ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.authorization);
        if (!accessToken) {
            // Use custom message if provided, otherwise use generic message
            const errorMessage = customErrorMessage || "You are not authorized!";
            throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, errorMessage);
        }
        const verifiedToken = (0, jwt_1.verifyToken)(accessToken, env_1.envVars.JWT_ACCESS_SECRET);
        if (!verifiedToken) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `You are not authorized! ${verifiedToken}`);
        }
        const isUserExist = yield user_model_1.default.findOne({
            email: verifiedToken.email,
        }).select("+isDeleted");
        if (!isUserExist) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist!");
        }
        if (isUserExist.accountStatus === user_interface_1.IsActive.BLOCKED ||
            isUserExist.accountStatus === user_interface_1.IsActive.INACTIVE) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExist.accountStatus}!`);
        }
        if (isUserExist.isDeleted) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted!");
        }
        if (!roles.includes(verifiedToken.role)) {
            // Use custom message if provided, otherwise use generic message
            const errorMessage = customErrorMessage ||
                `Access denied! This route is only accessible to: ${roles.length === 1 ? roles[0] : roles.join(", ")}`;
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, errorMessage);
        }
        req.user = verifiedToken;
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.checkAuth = checkAuth;
