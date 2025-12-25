import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = siteConfig.apiUrl;

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ForgotPasswordResponse>> {
  try {
    const body: ForgotPasswordRequest = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_email",
            message: "Email address is required",
          },
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "invalid_email",
            message: "Please enter a valid email address",
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE}/wp-json/bdpwr/v1/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link shortly.",
      });
    }

    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 404 || errorData.code === "rest_no_route") {
      const wpResponse = await fetch(`${API_BASE}/wp-json/wp/v2/users/lostpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_login: email.trim() }),
      });

      if (wpResponse.ok) {
        return NextResponse.json({
          success: true,
          message: "If an account exists with this email, you will receive a password reset link shortly.",
        });
      }

      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link shortly.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link shortly.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link shortly.",
    });
  }
}
