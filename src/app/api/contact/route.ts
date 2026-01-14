import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = `${siteConfig.apiUrl}/wp-json/asl/v1`;

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    if (!body.firstName || !body.lastName || !body.email || !body.message) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_fields",
            message: "First name, last name, email, and message are required.",
          },
        },
        { status: 400 }
      );
    }

    const url = `${API_BASE}/contact`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone || "",
        subject: body.subject || "General Inquiry",
        message: body.message,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Your message has been sent successfully.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: data.code || "submission_error",
          message: data.message || "Failed to send message. Please try again.",
        },
      },
      { status: response.ok ? 400 : response.status }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);
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
