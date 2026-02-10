import { NextResponse } from "next/server";
import { API_BASE, backendHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

async function testEndpoint(url: string, method: string, body?: string) {
  const opts: RequestInit = {
    method,
    headers: backendHeaders(),
  };
  if (body) opts.body = body;

  const response = await fetch(url, opts);
  const text = await response.text();
  const resHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    resHeaders[key] = value;
  });

  return {
    request_url: url,
    request_method: method,
    response_status: response.status,
    response_headers: resHeaders,
    body_snippet: text.slice(0, 1000),
    body_length: text.length,
    is_json: (() => { try { JSON.parse(text); return true; } catch { return false; } })(),
  };
}

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    results.get_cart = await testEndpoint(
      noCacheUrl(`${API_BASE}/wp-json/cocart/v2/cart`),
      "GET"
    );
  } catch (error) {
    results.get_cart = { error: error instanceof Error ? error.message : "Unknown error" };
  }

  try {
    results.post_add_item = await testEndpoint(
      noCacheUrl(`${API_BASE}/wp-json/cocart/v2/cart/add-item`),
      "POST",
      JSON.stringify({ id: "99999", quantity: "1" })
    );
  } catch (error) {
    results.post_add_item = { error: error instanceof Error ? error.message : "Unknown error" };
  }

  return NextResponse.json(results);
}
