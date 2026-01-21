import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { siteConfig } from "@/config/site";

const API_BASE = siteConfig.apiUrl;
const AUTH_TOKEN_KEY = "asl_auth_token";
const AUTH_USER_KEY = "asl_auth_user";

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

export async function verifyAuth(_request: NextRequest): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;
    const userDataStr = cookieStore.get(AUTH_USER_KEY)?.value;

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

    // Validate token with backend
    const response = await fetch(`${API_BASE}/wp-json/cocart/jwt/validate-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        authenticated: false,
        user: null,
        error: {
          code: "invalid_token",
          message: "Invalid or expired authentication token",
        },
      };
    }

    // Parse user data from cookie
    const userData = JSON.parse(userDataStr);
    
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
