import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = `${siteConfig.apiUrl}/wp-json/asl/v1`;

interface NewsletterFormData {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterFormData = await request.json();

    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_email",
            message: "Email address is required.",
          },
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "invalid_email",
            message: "Please enter a valid email address.",
          },
        },
        { status: 400 }
      );
    }

    const url = `${API_BASE}/newsletter`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Thank you for subscribing to our newsletter!",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: data.code || "subscription_error",
          message: data.message || "Failed to subscribe. Please try again.",
        },
      },
      { status: response.ok ? 400 : response.status }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "network_error",
          message: error instanceof Error ? error.message : "Network error occurred. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
