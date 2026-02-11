import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE, backendPostHeaders, noCacheUrl, safeJsonResponse } from "@/lib/utils/backendFetch";
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

function isValidJwtFormat(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  
  try {
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
