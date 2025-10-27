import { Response } from "express";
import { setAuthCookie, clearAuthCookie } from "./cookieConfig";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

// Re-export for backward compatibility
export { setAuthCookie, clearAuthCookie };
