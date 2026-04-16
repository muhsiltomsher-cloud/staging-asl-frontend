import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { isTokenBlocked } from "@/lib/security/token-blocklist";

const locales = siteConfig.locales;
const defaultLocale = siteConfig.defaultLocale;

const BLOCKED_PATHS = [
  "/wp-admin",
  "/wp-login.php",
  "/wp-login",
  "/xmlrpc.php",
  "/wp-cron.php",
  "/wp-trackback.php",
  "/wp-config.php",
  "/.env",
  "/.git",
  "/wp-includes/wlwmanifest.xml",
  "/wp-content/debug.log",
];

const BLOCKED_PATTERNS = [
  /\/wp-content\/plugins\/.*/,
  /\/wp-content\/themes\/.*/,
  /\/wp-includes\/.*/,
  /\.sql$/,
  /\.bak$/,
  /\.old$/,
  /\.orig$/,
  /\.save$/,
];

const BOT_USER_AGENTS = [
  "nikto",
  "sqlmap",
  "nmap",
  "masscan",
  "zgrab",
  "gobuster",
  "dirbuster",
];

function isBlockedRequest(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";

  for (const bot of BOT_USER_AGENTS) {
    if (userAgent.includes(bot)) return true;
  }

  const lowerPath = pathname.toLowerCase();

  for (const blocked of BLOCKED_PATHS) {
    if (lowerPath === blocked || lowerPath.startsWith(blocked + "/")) return true;
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(lowerPath)) return true;
  }

  return false;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
}

// ---------- F-04 / F-05: JWT security helpers ----------

const ALLOWED_ALGORITHMS = new Set([
  "HS256", "HS384", "HS512",
  "RS256", "RS384", "RS512",
  "ES256", "ES384", "ES512",
]);

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1];
  }
  return request.cookies.get("asl_auth_token")?.value || null;
}

/**
 * F-04: Reject tokens signed with "none" or any algorithm not in the
 * allow-list.  Also rejects malformed tokens (wrong segment count,
 * empty signature, un-parseable header).
 */
function isAlgorithmAllowed(token: string): boolean {
  try {
    const parts = token.split(".");
    // A valid JWS has exactly 3 segments and a non-empty signature
    if (parts.length !== 3 || !parts[2] || parts[2].trim() === "") return false;
    const header = JSON.parse(atob(parts[0]));
    const alg = String(header.alg || "").toUpperCase();
    return ALLOWED_ALGORITHMS.has(alg);
  } catch {
    return false;
  }
}

const PUBLIC_API_ROUTES = new Set([
  "/api/auth/login",
  "/api/auth/google",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/csrf",
  "/api/health",
  "/api/products",
  "/api/categories",
  "/api/coupons",
  "/api/shipping",
  "/api/settings",
  "/api/reviews",
  "/api/tracking",
]);

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.has(pathname);
}

/**
 * Validate any JWT present on an /api/* request.
 * Returns a 401 response if the token is invalid; otherwise null.
 */
function validateApiToken(request: NextRequest): NextResponse | null {
  const token = extractToken(request);
  if (!token) return null; // no token — let the endpoint decide if auth is required

  const pathname = request.nextUrl.pathname;

  // F-04: Reject tokens signed with "none" or any disallowed algorithm
  if (!isAlgorithmAllowed(token)) {
    if (isPublicApiRoute(pathname)) {
      // Strip the bad token but let the request through
      const res = NextResponse.next();
      res.cookies.delete("asl_auth_token");
      return addSecurityHeaders(res);
    }
    const res = addSecurityHeaders(
      NextResponse.json(
        { success: false, error: { code: "invalid_token_algorithm", message: "Token uses a disallowed signing algorithm" } },
        { status: 401 }
      )
    );
    res.cookies.delete("asl_auth_token");
    return res;
  }

  // F-05: Reject tokens that were invalidated via logout
  if (isTokenBlocked(token)) {
    if (isPublicApiRoute(pathname)) {
      const res = NextResponse.next();
      res.cookies.delete("asl_auth_token");
      return addSecurityHeaders(res);
    }
    const res = addSecurityHeaders(
      NextResponse.json(
        { success: false, error: { code: "token_invalidated", message: "Token has been invalidated" } },
        { status: 401 }
      )
    );
    res.cookies.delete("asl_auth_token");
    return res;
  }

  return null; // token looks fine
}

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2))
      .find((lang) => locales.includes(lang as typeof locales[number]));
    if (preferredLocale) return preferredLocale;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBlockedRequest(request)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return addSecurityHeaders(NextResponse.next());

  // Skip locale redirect for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // files with extensions
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  // F-04 / F-05: Validate JWT on API routes before they reach handlers
  if (pathname.startsWith("/api")) {
    const tokenError = validateApiToken(request);
    if (tokenError) return tokenError;
    return addSecurityHeaders(NextResponse.next());
  }

  // Redirect to locale-prefixed path
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|images|plugins).*)",
  ],
};
