import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = siteConfig.apiUrl;

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

    const response = await fetch(`${API_BASE}/wp-json/cocart/jwt/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "refresh_failed",
            message: data.message || "Token refresh failed.",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      token: data.jwt_token || data.token,
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
