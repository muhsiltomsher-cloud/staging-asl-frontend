import { NextResponse } from "next/server";
import { API_BASE, backendHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

async function testEndpoint(url: string, method: string, headers: HeadersInit, body?: string) {
  const opts: RequestInit = { method, headers };
  if (body) opts.body = body;

  const response = await fetch(url, opts);
  const text = await response.text();

  return {
    request_url: url,
    request_method: method,
    response_status: response.status,
    body_snippet: text.slice(0, 500),
    is_json: (() => { try { JSON.parse(text); return true; } catch { return false; } })(),
  };
}

export async function GET() {
  const results: Record<string, unknown> = {};
  const minimalHeaders = backendHeaders();

  try {
    results.get_cart_minimal = await testEndpoint(
      noCacheUrl(`${API_BASE}/wp-json/cocart/v2/cart`),
      "GET",
      minimalHeaders
    );
  } catch (error) {
    results.get_cart_minimal = { error: error instanceof Error ? error.message : "Unknown error" };
  }

  try {
    results.post_add_item = await testEndpoint(
      noCacheUrl(`${API_BASE}/wp-json/cocart/v2/cart/add-item`),
      "POST",
      minimalHeaders,
      JSON.stringify({ id: "99999", quantity: "1" })
    );
  } catch (error) {
    results.post_add_item = { error: error instanceof Error ? error.message : "Unknown error" };
  }

  return NextResponse.json(results);
}
