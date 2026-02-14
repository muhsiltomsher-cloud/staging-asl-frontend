import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/utils/loadEnv";
import { API_BASE as BASE_URL } from "@/lib/utils/backendFetch";

const API_BASE = `${BASE_URL}/wp-json/wc/v3`;

function getWooCommerceCredentials() {
  const consumerKey = getEnvVar("WC_CONSUMER_KEY") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_KEY") || "";
  const consumerSecret = getEnvVar("WC_CONSUMER_SECRET") || getEnvVar("NEXT_PUBLIC_WC_CONSUMER_SECRET") || "";
  return { consumerKey, consumerSecret };
}

function getBasicAuthParams(): string {
  const { consumerKey, consumerSecret } = getWooCommerceCredentials();
  return `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { success: false, error: { code: "missing_email", message: "Email is required" } },
      { status: 400 }
    );
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, error: { code: "invalid_email", message: "Invalid email format" } },
      { status: 400 }
    );
  }

  try {
    // Search for customers with this email
    const response = await fetch(
      `${API_BASE}/customers?email=${encodeURIComponent(email)}&${getBasicAuthParams()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: data.code || "check_email_error",
            message: data.message || "Failed to check email.",
          },
        },
        { status: response.status }
      );
    }

    // Check if any customers were found with this email
    const isRegistered = Array.isArray(data) && data.length > 0;

    return NextResponse.json({ 
      success: true, 
      data: { 
        isRegistered,
        // Don't expose customer details for security
      } 
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
