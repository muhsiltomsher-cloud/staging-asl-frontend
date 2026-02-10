import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = siteConfig.apiUrl;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "missing_credentials", message: "Username and password are required" },
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE}/wp-json/cocart/v2/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

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
        },
        body: JSON.stringify({ username, password }),
      });
      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        wpToken = wpData.token;
      }
    } catch {
      // WordPress JWT is optional
    }

    return NextResponse.json({
      success: true,
      user: {
        token: data.extras?.jwt_token || data.jwt_token || data.token,
        wp_token: wpToken,
        refresh_token: data.extras?.jwt_refresh || data.jwt_refresh_token || data.refresh_token,
        user_id: parseInt(data.user_id) || data.id || 0,
        user_email: data.email || data.user_email || "",
        user_nicename: data.user_nicename || data.nicename || data.username || "",
        user_display_name: data.display_name || data.user_display_name || data.username || "",
      },
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
