import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { checkRateLimit, rateLimitResponse, LOGIN_RATE_LIMIT } from "@/lib/security";

const API_BASE = siteConfig.apiUrl;
const USER_AGENT = "Mozilla/5.0 (compatible; ASL-Frontend/1.0)";

async function safeJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { code: "invalid_response", message: "Backend returned non-JSON response" };
  }
}

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
  // Check rate limit
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
            message: "Username or email is required",
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

    const response = await fetch(`${API_BASE}/wp-json/cocart/v2/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    const data = await safeJson(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "login_failed",
            message: data.message || "Login failed. Please check your credentials.",
          },
        },
        { status: response.status }
      );
    }

    let wpToken: string | undefined;
    try {
      const wpResponse = await fetch(`${API_BASE}/wp-json/jwt-auth/v1/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (wpResponse.ok) {
        const wpData = await safeJson(wpResponse);
        wpToken = wpData.token as string;
      }
    } catch {
    }

    return NextResponse.json({
      success: true,
      user: {
        token: ((data.extras as Record<string, unknown>)?.jwt_token as string) || (data.jwt_token as string) || (data.token as string),
        wp_token: wpToken,
        refresh_token: ((data.extras as Record<string, unknown>)?.jwt_refresh as string) || (data.jwt_refresh_token as string) || (data.refresh_token as string),
        user_id: parseInt(data.user_id as string) || (data.id as number) || 0,
        user_email: (data.email as string) || (data.user_email as string) || "",
        user_nicename: (data.user_nicename as string) || (data.nicename as string) || (data.username as string) || "",
        user_display_name: (data.display_name as string) || (data.user_display_name as string) || (data.username as string) || "",
      },
    });
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
