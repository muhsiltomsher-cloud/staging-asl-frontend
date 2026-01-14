import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const CF7_FORM_ID = "5988fcb";
const API_BASE = `${siteConfig.apiUrl}/wp-json/contact-form-7/v1/contact-forms`;

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

    const formData = new FormData();
    formData.append("your-first-name", body.firstName);
    formData.append("your-last-name", body.lastName);
    formData.append("your-email", body.email);
    formData.append("your-phone", body.phone || "");
    formData.append("your-subject", body.subject || "General Inquiry");
    formData.append("your-message", body.message);

    const url = `${API_BASE}/${CF7_FORM_ID}/feedback`;

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.status === "mail_sent") {
      return NextResponse.json({
        success: true,
        message: data.message || "Your message has been sent successfully.",
      });
    }

    if (data.status === "validation_failed") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "validation_failed",
            message: data.message || "Please check your form inputs.",
            invalidFields: data.invalid_fields || [],
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: data.status || "submission_error",
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
