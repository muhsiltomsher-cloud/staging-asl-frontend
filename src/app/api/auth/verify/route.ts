import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = siteConfig.apiUrl;
const USER_AGENT = "Mozilla/5.0 (compatible; ASL-Frontend/1.0)";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, valid: false },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE}/wp-json/cocart/jwt/validate-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
        "Authorization": authHeader,
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      return NextResponse.json({ success: true, valid: true });
    }

    return NextResponse.json(
      { success: false, valid: false },
      { status: response.status }
    );
  } catch {
    return NextResponse.json(
      { success: false, valid: false },
      { status: 500 }
    );
  }
}
