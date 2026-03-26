import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, incrementRateLimit, rateLimitResponse, LOGIN_RATE_LIMIT } from "@/lib/security";
import { API_BASE, backendPostHeaders, noCacheUrl, safeJsonResponse } from "@/lib/utils/backendFetch";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    token: string;
    wp_token?: string;
    refresh_token?: string;
    user_id: number;
    user_email: string;
    user_nicename: string;
    user_display_name: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  // Check rate limit (only checks, does not increment)
  const rateLimitResult = checkRateLimit(request, LOGIN_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult.resetTime) as NextResponse<LoginResponse>;
  }

  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !username.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_username",
            message: "Email is required",
          },
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_password",
            message: "Password is required",
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(noCacheUrl(`${API_BASE}/wp-json/cocart/v2/login`), {
      method: "POST",
      headers: backendPostHeaders(),
      body: JSON.stringify({ username: username.trim(), password }),
    });

    const data = await safeJsonResponse(response);

    if (!response.ok) {
      // Only increment rate limit counter on failed login attempts
      incrementRateLimit(request, LOGIN_RATE_LIMIT);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: String(data.code || "login_failed"),
            message: String(data.message || "Login failed. Please check your credentials."),
          },
        },
        { status: response.status }
      );
    }

    let wpToken: string | undefined;
    try {
      const wpResponse = await fetch(noCacheUrl(`${API_BASE}/wp-json/jwt-auth/v1/token`), {
        method: "POST",
        headers: backendPostHeaders(),
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (wpResponse.ok) {
        const wpData = await safeJsonResponse(wpResponse);
        wpToken = wpData.token as string;
      }
    } catch {
    }

    const token = String((data.extras as Record<string, unknown>)?.jwt_token || data.jwt_token || data.token || "");
    const refreshToken = String((data.extras as Record<string, unknown>)?.jwt_refresh || data.jwt_refresh_token || data.refresh_token || "");
    const userId = parseInt(String(data.user_id || "0")) || (data.id as number) || 0;
    const userEmail = String(data.email || data.user_email || "");
    const userNicename = String(data.user_nicename || data.nicename || data.username || "");
    const userDisplayName = String(data.display_name || data.user_display_name || data.username || "");

    const isSecure = process.env.NODE_ENV === "production";
    const cookieOptions = {
      path: "/",
      sameSite: "lax" as const,
      secure: isSecure,
    };

    // Return user info in JSON body (needed for client-side state),
    // but set sensitive tokens as HttpOnly cookies so they are not accessible to JS/XSS
    const res = NextResponse.json({
      success: true,
      user: {
        token,
        wp_token: wpToken,
        refresh_token: refreshToken,
        user_id: userId,
        user_email: userEmail,
        user_nicename: userNicename,
        user_display_name: userDisplayName,
      },
    });

    // Set HttpOnly cookies for sensitive tokens (not readable by client-side JS)
    res.cookies.set("asl_auth_token", token, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    if (refreshToken) {
      res.cookies.set("asl_refresh_token", refreshToken, {
        ...cookieOptions,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    if (wpToken) {
      res.cookies.set("asl_wp_auth_token", wpToken, {
        ...cookieOptions,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
    // User data cookie (non-HttpOnly so client JS can read user info)
    // Intentionally exclude sensitive tokens — they are only in the HttpOnly cookies above
    res.cookies.set("asl_auth_user", JSON.stringify({
      user_id: userId,
      user_email: userEmail,
      user_nicename: userNicename,
      user_display_name: userDisplayName,
    }), {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "server_error",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
