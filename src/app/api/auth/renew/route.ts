import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

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
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({ refresh_token }),
    });

    const data = await safeJson(response);

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
