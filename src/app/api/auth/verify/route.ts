import { NextRequest, NextResponse } from "next/server";
import { API_BASE, backendHeaders, noCacheUrl } from "@/lib/utils/backendFetch";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, valid: false },
        { status: 401 }
      );
    }

    const response = await fetch(noCacheUrl(`${API_BASE}/wp-json/cocart/jwt/validate-token`), {
      method: "POST",
      headers: backendHeaders({ "Authorization": authHeader }),
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
