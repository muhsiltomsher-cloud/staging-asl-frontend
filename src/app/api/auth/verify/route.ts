import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendPostHeaders, noCacheUrl } from "@/lib/utils/backendFetch";
import { isTokenBlocked } from "@/lib/security/token-blocklist";

// Allowed JWT signing algorithms — reject "none" and any other unexpected algorithm
const ALLOWED_JWT_ALGORITHMS = ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "ES256", "ES384", "ES512"];

function isTokenAlgorithmSafe(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[2] || parts[2].trim() === "") return false;
    const header = JSON.parse(atob(parts[0]));
    const alg = String(header.alg || "").toUpperCase();
    return !!alg && alg !== "NONE" && ALLOWED_JWT_ALGORITHMS.includes(alg);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, valid: false },
        { status: 401 }
      );
    }

    // Reject tokens using alg:none or disallowed algorithms before forwarding to backend
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!isTokenAlgorithmSafe(token)) {
      return NextResponse.json(
        { success: false, valid: false, error: "Invalid token algorithm" },
        { status: 401 }
      );
    }

    // Reject tokens that have been blocklisted (invalidated via logout)
    if (isTokenBlocked(token)) {
      return NextResponse.json(
        { success: false, valid: false, error: "Token has been invalidated" },
        { status: 401 }
      );
    }

    const response = await fetch(noCacheUrl(`${API_BASE}/wp-json/cocart/jwt/validate-token`), {
      method: "POST",
      headers: backendPostHeaders({ "Authorization": authHeader }),
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
