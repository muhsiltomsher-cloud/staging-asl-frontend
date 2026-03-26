import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendPostHeaders, noCacheUrl, safeJsonResponse } from "@/lib/utils/backendFetch";
import { isTokenBlocked } from "@/lib/security/token-blocklist";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "missing_token", message: "Refresh token is required" },
        },
        { status: 400 }
      );
    }

    // Reject refresh tokens that were blocklisted during logout
    if (isTokenBlocked(refresh_token)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "token_invalidated", message: "Refresh token has been invalidated" },
        },
        { status: 401 }
      );
    }

    const response = await fetch(noCacheUrl(`${API_BASE}/wp-json/cocart/jwt/refresh-token`), {
      method: "POST",
      headers: backendPostHeaders(),
      body: JSON.stringify({ refresh_token }),
    });

    const data = await safeJsonResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: (data.code as string) || "refresh_failed",
            message: (data.message as string) || "Token refresh failed.",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      token: (data.jwt_token as string) || (data.token as string),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "network_error", message: "Network error occurred" },
      },
      { status: 500 }
    );
  }
}
