"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookie = exports.setAuthCookie = exports.getCookieOptions = void 0;
const env_1 = require("../config/env");
// Get cookie options based on environment
const getCookieOptions = (maxAge) => {
    const isProduction = env_1.envVars.NODE_ENV === "production";
    const isSecure = isProduction; // HTTPS in production
    return {
        httpOnly: true,
        secure: isSecure,
        sameSite: isProduction ? "none" : "lax",
        maxAge,
        domain: isProduction ? undefined : undefined, // Let browser handle domain in production
    };
};
exports.getCookieOptions = getCookieOptions;
const setAuthCookie = (res, tokenInfo) => {
    const cookieOptions = (0, exports.getCookieOptions)();
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 24 * 60 * 60 * 1000 }));
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }));
    }
};
exports.setAuthCookie = setAuthCookie;
const clearAuthCookie = (res) => {
    const cookieOptions = (0, exports.getCookieOptions)();
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
};
exports.clearAuthCookie = clearAuthCookie;
