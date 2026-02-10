import { NextResponse } from "next/server";
import { API_BASE, backendHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

export async function GET() {
  const url = noCacheUrl(`${API_BASE}/wp-json/cocart/v2/cart`);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: backendHeaders(),
    });

    const text = await response.text();
    const resHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      resHeaders[key] = value;
    });

    return NextResponse.json({
      request_url: url,
      response_status: response.status,
      response_headers: resHeaders,
      body_snippet: text.slice(0, 1000),
      body_length: text.length,
      is_json: (() => { try { JSON.parse(text); return true; } catch { return false; } })(),
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      request_url: url,
    }, { status: 500 });
  }
}
