import { NextRequest, NextResponse } from "next/server";
import { isTokenBlocked } from "@/lib/security/token-blocklist";

/**
 * GET /api/auth/me
 *
 * Returns the current user's metadata from the HttpOnly auth cookies.
 * Replaces client-side document.cookie reads so tokens never need to
 * be exposed to JavaScript (F-08 remediation).
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("asl_auth_token")?.value;
  const userDataStr = request.cookies.get("asl_auth_user")?.value;

  if (!token || !userDataStr) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  // Reject blocklisted tokens
  if (isTokenBlocked(token)) {
    const res = NextResponse.json({ authenticated: false, user: null });
    res.cookies.set("asl_auth_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("asl_auth_user", "", { path: "/", maxAge: 0 });
    res.cookies.set("asl_refresh_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("asl_wp_auth_token", "", { path: "/", maxAge: 0 });
    return res;
  }

  try {
    let userData;
    try {
      userData = JSON.parse(userDataStr);
    } catch {
      userData = JSON.parse(decodeURIComponent(userDataStr));
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        user_id: userData.user_id,
        user_email: userData.user_email,
        user_nicename: userData.user_nicename,
        user_display_name: userData.user_display_name,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
