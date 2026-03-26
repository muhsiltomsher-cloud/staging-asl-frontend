import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE, backendPostHeaders, noCacheUrl, safeJsonResponse } from "@/lib/utils/backendFetch";
import { isTokenBlocked } from "@/lib/security/token-blocklist";
const AUTH_TOKEN_KEY = "asl_auth_token";
const AUTH_USER_KEY = "asl_auth_user";
const AUTH_REFRESH_TOKEN_KEY = "asl_refresh_token";

export interface AuthenticatedUser {
  user_id: number;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
  token: string;
}

export interface AuthResult {
  authenticated: boolean;
  user: AuthenticatedUser | null;
  error?: {
    code: string;
    message: string;
  };
}

// Allowed JWT signing algorithms — reject "none" and any other unexpected algorithm
const ALLOWED_JWT_ALGORITHMS = ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "ES256", "ES384", "ES512"];

function isValidJwtFormat(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  // Reject tokens with empty signature (alg:none attack)
  if (!parts[2] || parts[2].trim() === "") return false;
  
  try {
    // Validate header — reject alg:none and unknown algorithms
    const header = JSON.parse(atob(parts[0]));
    const alg = String(header.alg || "").toUpperCase();
    if (!alg || alg === "NONE" || !ALLOWED_JWT_ALGORITHMS.includes(alg)) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function tryRefreshToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(noCacheUrl(`${API_BASE}/wp-json/cocart/jwt/refresh-token`), {
      method: "POST",
      headers: backendPostHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await safeJsonResponse(response);
      return (data.jwt_token as string) || (data.token as string) || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyAuth(_request: NextRequest): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;
    const userDataStr = cookieStore.get(AUTH_USER_KEY)?.value;
    const refreshToken = cookieStore.get(AUTH_REFRESH_TOKEN_KEY)?.value;

    if (!token || !userDataStr) {
      return {
        authenticated: false,
        user: null,
        error: {
          code: "unauthorized",
          message: "Authentication required",
        },
      };
    }

    let userData;
    try {
      userData = JSON.parse(userDataStr);
    } catch {
      try {
        userData = JSON.parse(decodeURIComponent(userDataStr));
      } catch {
        return {
          authenticated: false,
          user: null,
          error: {
            code: "invalid_user_data",
            message: "Invalid user data in cookie",
          },
        };
      }
    }

    if (!userData.user_id) {
      return {
        authenticated: false,
        user: null,
        error: {
          code: "invalid_user_data",
          message: "User ID not found in cookie",
        },
      };
    }

    // Check if token has been blocklisted (invalidated via logout)
    if (isTokenBlocked(token)) {
      return {
        authenticated: false,
        user: null,
        error: {
          code: "token_invalidated",
          message: "Token has been invalidated",
        },
      };
    }

    if (!isValidJwtFormat(token)) {
      if (refreshToken) {
        const newToken = await tryRefreshToken(refreshToken);
        if (newToken && isValidJwtFormat(newToken)) {
          return {
            authenticated: true,
            user: {
              user_id: userData.user_id,
              user_email: userData.user_email,
              user_nicename: userData.user_nicename,
              user_display_name: userData.user_display_name,
              token: newToken,
            },
          };
        }
      }
      if (userData.user_id && userData.user_email) {
        return {
          authenticated: true,
          user: {
            user_id: userData.user_id,
            user_email: userData.user_email,
            user_nicename: userData.user_nicename,
            user_display_name: userData.user_display_name,
            token: token,
          },
        };
      }
      return {
        authenticated: false,
        user: null,
        error: {
          code: "invalid_token",
          message: "Invalid or expired authentication token",
        },
      };
    }

    return {
      authenticated: true,
      user: {
        user_id: userData.user_id,
        user_email: userData.user_email,
        user_nicename: userData.user_nicename,
        user_display_name: userData.user_display_name,
        token: token,
      },
    };
  } catch (error) {
    return {
      authenticated: false,
      user: null,
      error: {
        code: "auth_error",
        message: error instanceof Error ? error.message : "Authentication error",
      },
    };
  }
}

export function unauthorizedResponse(error?: { code: string; message: string }): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: error || {
        code: "unauthorized",
        message: "Authentication required",
      },
    },
    { status: 401 }
  );
}

export function forbiddenResponse(message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "forbidden",
        message: message || "You do not have permission to access this resource",
      },
    },
    { status: 403 }
  );
}
