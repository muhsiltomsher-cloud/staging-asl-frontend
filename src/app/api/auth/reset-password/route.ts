import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_BASE = siteConfig.apiUrl;

export interface ResetPasswordRequest {
  key: string;
  login: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// Use WordPress's built-in password reset validation and update
async function resetPasswordViaWordPressAPI(
  key: string,
  login: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // First, validate the reset key by accessing the reset page
    // This also sets up the necessary cookies/session
    const validateUrl = `${API_BASE}/wp-login.php?action=rp&key=${encodeURIComponent(key)}&login=${encodeURIComponent(login)}`;
    
    const validateResponse = await fetch(validateUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "manual",
    });

    // Get all cookies from the response
    const setCookieHeaders = validateResponse.headers.getSetCookie?.() || [];
    const cookieHeader = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
    
    // Check if the key is valid - WordPress redirects to the reset form if valid
    // or shows an error page if invalid
    if (validateResponse.status === 302) {
      const location = validateResponse.headers.get("location") || "";
      // If redirected to login page with error, the key is invalid
      if (location.includes("error=invalidkey") || location.includes("error=expiredkey")) {
        return { success: false, message: "This password reset link has expired or is invalid" };
      }
    }

    // If we get a 200, check if it's the reset form or an error
    if (validateResponse.status === 200) {
      const html = await validateResponse.text();
      if (html.includes("Invalid key") || html.includes("expired") || html.includes("invalidkey")) {
        return { success: false, message: "This password reset link has expired or is invalid" };
      }
    }

    // Now submit the password reset form
    const formData = new URLSearchParams();
    formData.append("pass1", password);
    formData.append("pass2", password);
    formData.append("rp_key", key);
    formData.append("wp-submit", "Save Password");

    const submitResponse = await fetch(`${API_BASE}/wp-login.php?action=resetpass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Cookie": cookieHeader,
        "Referer": validateUrl,
        "Origin": API_BASE,
      },
      body: formData.toString(),
      redirect: "manual",
    });

    // Check for successful password reset
    if (submitResponse.status === 302) {
      const location = submitResponse.headers.get("location") || "";
      // WordPress redirects to login page with password=changed on success
      if (location.includes("password=changed")) {
        return { success: true, message: "Password has been reset successfully" };
      }
      // If redirected elsewhere without success indicator, it likely failed
      if (location.includes("error=") || location.includes("invalidkey") || location.includes("expiredkey")) {
        return { success: false, message: "This password reset link has expired or is invalid" };
      }
    }

    // Check response body for success/error messages
    if (submitResponse.status === 200) {
      const html = await submitResponse.text();
      if (html.includes("Your password has been reset") || html.includes("password has been changed")) {
        return { success: true, message: "Password has been reset successfully" };
      }
      if (html.includes("Invalid key") || html.includes("expired") || html.includes("error")) {
        return { success: false, message: "This password reset link has expired or is invalid" };
      }
    }

    return { success: false, message: "Unable to reset password. Please try again or request a new reset link." };
  } catch (error) {
    console.error("WordPress reset password error:", error);
    return { success: false, message: "An error occurred while resetting password" };
  }
}

// Alternative method using WooCommerce's reset password form
async function resetPasswordViaWooCommerce(
  key: string,
  login: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Access the WooCommerce reset password page with the key
    const resetPageUrl = `${API_BASE}/my-account/lost-password/?key=${encodeURIComponent(key)}&login=${encodeURIComponent(login)}`;
    
    const pageResponse = await fetch(resetPageUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!pageResponse.ok) {
      return { success: false, message: "Unable to access reset page" };
    }

    const pageHtml = await pageResponse.text();
    
    // Check if the page shows an error (invalid/expired key)
    if (pageHtml.includes("Invalid key") || pageHtml.includes("expired") || 
        pageHtml.includes("This key is invalid") || pageHtml.includes("password reset link")) {
      return { success: false, message: "This password reset link has expired or is invalid" };
    }

    // Get cookies for the session
    const setCookieHeaders = pageResponse.headers.getSetCookie?.() || [];
    const cookieHeader = setCookieHeaders.map(c => c.split(';')[0]).join('; ');

    // Extract nonce from the page if present
    const nonceMatch = pageHtml.match(/name="woocommerce-reset-password-nonce"\s+value="([^"]+)"/);
    const nonce = nonceMatch ? nonceMatch[1] : "";

    // Build form data
    const formData = new URLSearchParams();
    formData.append("pass1", password);
    formData.append("pass2", password);
    formData.append("reset_key", key);
    formData.append("reset_login", login);
    formData.append("wc_reset_password", "true");
    if (nonce) {
      formData.append("woocommerce-reset-password-nonce", nonce);
    }
    formData.append("save", "Save");

    const submitResponse = await fetch(resetPageUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Cookie": cookieHeader,
        "Referer": resetPageUrl,
        "Origin": API_BASE,
      },
      body: formData.toString(),
      redirect: "manual",
    });

    // Check for redirect to success page
    if (submitResponse.status === 302) {
      const location = submitResponse.headers.get("location") || "";
      // Only consider it success if redirected to my-account with password-reset indicator
      if (location.includes("password-reset=true") || location.includes("reset=true")) {
        return { success: true, message: "Password has been reset successfully" };
      }
      // Generic redirect to my-account without success indicator is NOT reliable
      // Don't return success here - fall through to check the response
    }

    // Check response body
    if (submitResponse.status === 200 || submitResponse.status === 302) {
      let html = "";
      try {
        html = await submitResponse.text();
      } catch {
        // If we can't read the body, continue
      }
      
      if (html.includes("Your password has been reset") || 
          html.includes("password has been changed") ||
          html.includes("Password changed successfully")) {
        return { success: true, message: "Password has been reset successfully" };
      }
      
      if (html.includes("Invalid key") || html.includes("expired")) {
        return { success: false, message: "This password reset link has expired or is invalid" };
      }
    }

    return { success: false, message: "Unable to reset password via WooCommerce" };
  } catch (error) {
    console.error("WooCommerce reset password error:", error);
    return { success: false, message: "An error occurred while resetting password" };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ResetPasswordResponse>> {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { key, login, password } = body;

    if (!key || !key.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_key",
            message: "Reset key is required",
          },
        },
        { status: 400 }
      );
    }

    if (!login || !login.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "missing_login",
            message: "Username is required",
          },
        },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "invalid_password",
            message: "Password must be at least 6 characters",
          },
        },
        { status: 400 }
      );
    }

    const wooResult = await resetPasswordViaWooCommerce(key.trim(), login.trim(), password);
    if (wooResult.success) {
      return NextResponse.json({
        success: true,
        message: wooResult.message,
      });
    }

    const wpResult = await resetPasswordViaWordPressAPI(key.trim(), login.trim(), password);
    if (wpResult.success) {
      return NextResponse.json({
        success: true,
        message: wpResult.message,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "reset_failed",
          message: wooResult.message || wpResult.message || "Unable to reset password. The link may have expired.",
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "server_error",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
