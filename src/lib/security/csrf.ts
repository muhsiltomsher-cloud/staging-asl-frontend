import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const CSRF_TOKEN_KEY = "asl_csrf_token";
const CSRF_HEADER_KEY = "x-csrf-token";
const TOKEN_LENGTH = 32;

export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString("hex");
}

export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_TOKEN_KEY)?.value;
  
  if (!token) {
    token = generateCsrfToken();
  }
  
  return token;
}

export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_KEY)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_KEY);
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

export function csrfErrorResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "csrf_validation_failed",
        message: "Invalid or missing CSRF token",
      },
    },
    { status: 403 }
  );
}

export function setCsrfCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(CSRF_TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return response;
}
