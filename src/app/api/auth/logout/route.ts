import { NextRequest, NextResponse } from "next/server";
import { blockToken } from "@/lib/security/token-blocklist";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    let token = authHeader?.replace(/^Bearer\s+/i, "");

    // Fallback: read token from cookie (browser sends it automatically)
    if (!token) {
      token = request.cookies.get("asl_auth_token")?.value;
    }

    // Read refresh token from request body if provided
    let refreshToken: string | undefined;
    try {
      const body = await request.json();
      refreshToken = body.refresh_token;
    } catch {
      // Body may be empty — that's fine
    }

    // Fallback: read refresh token from cookie
    if (!refreshToken) {
      refreshToken = request.cookies.get("asl_refresh_token")?.value;
    }

    // Block the access token server-side so it cannot be replayed
    if (token) {
      blockToken(token);
    }

    // Block the refresh token as well to prevent new access tokens being generated
    if (refreshToken) {
      blockToken(refreshToken);
    }

    // Clear auth cookies server-side
    const response = NextResponse.json({ success: true });

    const cookieOptions = {
      path: "/",
      maxAge: 0,
    };

    response.cookies.set("asl_auth_token", "", cookieOptions);
    response.cookies.set("asl_auth_user", "", cookieOptions);
    response.cookies.set("asl_refresh_token", "", cookieOptions);
    response.cookies.set("asl_wp_auth_token", "", cookieOptions);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "logout_error",
          message: error instanceof Error ? error.message : "Logout failed",
        },
      },
      { status: 500 }
    );
  }
}
