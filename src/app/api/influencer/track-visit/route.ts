import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendPostHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, landing_page } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "missing_code", message: "Referral code is required" } },
        { status: 400 }
      );
    }

    const url = `${API_BASE}/wp-json/asl-influencer/v1/track-visit`;

    const response = await fetch(noCacheUrl(url), {
      method: "POST",
      headers: backendPostHeaders(),
      body: JSON.stringify({
        code: code.trim().toLowerCase(),
        landing_page: landing_page || "",
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: { code: "tracking_error", message: "Failed to track visit" } },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "network_error",
          message: error instanceof Error ? error.message : "Network error occurred",
        },
      },
      { status: 500 }
    );
  }
}
