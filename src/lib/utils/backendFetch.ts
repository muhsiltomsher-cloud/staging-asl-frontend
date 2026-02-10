import { siteConfig } from "@/config/site";

const API_BASE = siteConfig.apiUrl;
const USER_AGENT = "Mozilla/5.0 (compatible; ASL-Frontend/1.0)";

const NO_CACHE_HEADERS: HeadersInit = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "User-Agent": USER_AGENT,
};

export function backendHeaders(extra?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...NO_CACHE_HEADERS,
    ...extra,
  };
}

export function backendAuthHeaders(token: string, extra?: HeadersInit): HeadersInit {
  return backendHeaders({
    "Authorization": `Bearer ${token}`,
    ...extra,
  });
}

export function noCacheUrl(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_t=${Date.now()}`;
}

export async function safeJsonResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const isHtml = text.trim().startsWith("<!") || text.trim().startsWith("<html");
    return {
      code: "invalid_response",
      message: isHtml
        ? "Backend returned an HTML page instead of JSON. This is likely caused by a server-side cache (e.g. LiteSpeed Cache) intercepting API requests. Please exclude /wp-json/* paths from caching."
        : "Backend returned non-JSON response",
      _raw_length: text.length,
    };
  }
}

export { API_BASE, USER_AGENT };
