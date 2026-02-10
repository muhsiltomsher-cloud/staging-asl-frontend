import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = siteConfig.apiUrl;
const USER_AGENT = "Mozilla/5.0 (compatible; ASL-Frontend/1.0)";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const currency = searchParams.get("currency");
    const locale = searchParams.get("locale");

    let url = `${API_BASE}/wp-json/asl-free-gifts/v1/rules`;
    const params: string[] = [];
    if (currency) {
      params.push(`currency=${encodeURIComponent(currency)}`);
    }
    if (locale) {
      params.push(`lang=${encodeURIComponent(locale)}`);
    }
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      next: {
        revalidate: 60,
        tags: ["free-gifts"],
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "api_error",
            message: "Failed to fetch free gift rules",
          },
        },
        { status: response.status }
      );
    }

    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "invalid_response",
            message: "Backend returned non-JSON response",
          },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      rules: (data.rules as unknown[]) || [],
    });
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
