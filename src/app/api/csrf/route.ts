import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie } from "@/lib/security";

export async function GET(): Promise<NextResponse> {
  const token = generateCsrfToken();
  
  const response = NextResponse.json({
    success: true,
    token: token,
  });
  
  return setCsrfCookie(response, token);
}
