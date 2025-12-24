import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";

const API_BASE = siteConfig.apiUrl;
const WISHLIST_BASE = `${API_BASE}/wp-json/yith/wishlist/v1`;
const AUTH_TOKEN_COOKIE = "asl_auth_token";

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value || null;
}

function getAuthHeaders(request: NextRequest, authToken: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  } else if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const authToken = await getAuthToken();
    
    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "unauthorized",
            message: "You must be logged in to view your wishlist.",
          },
        },
        { status: 401 }
      );
    }

    const response = await fetch(`${WISHLIST_BASE}/lists`, {
      method: "GET",
      headers: getAuthHeaders(request, authToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "wishlist_error",
            message: data.message || "Failed to get wishlist.",
          },
        },
        { status: response.status }
      );
    }

    // Find default wishlist or use first one
    let wishlist = null;
    let items: unknown[] = [];
    
    if (Array.isArray(data)) {
      wishlist = data.find((w: { is_default?: boolean }) => w.is_default) || data[0];
      items = wishlist?.items || [];
    } else {
      wishlist = data;
      items = data?.items || [];
    }

    return NextResponse.json({ success: true, wishlist, items });
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

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    const authToken = await getAuthToken();
    
    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "unauthorized",
            message: "You must be logged in to manage your wishlist.",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    let url: string;
    let method: string = "POST";

    switch (action) {
      case "add":
        url = `${WISHLIST_BASE}/items`;
        break;
      case "remove":
        url = `${WISHLIST_BASE}/items`;
        method = "DELETE";
        break;
      case "sync":
        url = `${WISHLIST_BASE}/wishlist/sync`;
        break;
      default:
        return NextResponse.json(
          { success: false, error: { code: "invalid_action", message: "Invalid action" } },
          { status: 400 }
        );
    }

    const fetchOptions: RequestInit = {
      method,
      headers: getAuthHeaders(request, authToken),
    };

    if (Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "wishlist_error",
            message: data.message || "Wishlist operation failed.",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist: data.wishlist || data,
      items: data.items || data.wishlist?.items || [],
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
