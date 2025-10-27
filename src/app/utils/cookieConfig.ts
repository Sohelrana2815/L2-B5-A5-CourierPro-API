import { Response } from "express";
import { envVars } from "../config/env";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "none" | "lax" | "strict";
  maxAge?: number;
  domain?: string;
}

// Get cookie options based on environment
export const getCookieOptions = (maxAge?: number): CookieOptions => {
  const isProduction = envVars.NODE_ENV === "production";
  const isSecure = isProduction; // HTTPS in production

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isProduction ? "none" : "lax",
    maxAge,
    domain: isProduction ? undefined : undefined, // Let browser handle domain in production
  };
};

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  const cookieOptions = getCookieOptions();

  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

export const clearAuthCookie = (res: Response) => {
  const cookieOptions = getCookieOptions();

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};
