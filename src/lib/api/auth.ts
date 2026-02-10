export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  newsletter?: boolean;
}

export interface AuthUser {
  token: string;
  wp_token?: string;
  refresh_token?: string;
  user_id: number;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface AuthError {
  code: string;
  message: string;
  retry_after?: number;
  data?: {
    status: number;
  };
}

export interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  error?: AuthError;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  user_id?: number;
  error?: AuthError;
}

export interface RefreshTokenResponse {
  success: boolean;
  token?: string;
  error?: AuthError;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: AuthError;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: AuthError;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: {
          code: data.error?.code || "login_failed",
          message: data.error?.message || "Login failed. Please check your credentials.",
          data: { status: response.status },
        },
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function register(data: RegisterData): Promise<RegisterResponse> {
  try {
    const response = await fetch("/api/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.first_name || data.username,
        last_name: data.last_name || "",
        billing: {
          phone: data.phone || "",
        },
        meta_data: data.newsletter ? [{ key: "newsletter_subscribed", value: "yes" }] : [],
      }),
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: {
          code: result.error?.code || "registration_failed",
          message: result.error?.message || "Registration failed. Please try again.",
        },
      };
    }

    return {
      success: true,
      message: "Registration successful! Please login with your credentials.",
      user_id: result.data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/validate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.valid === true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function refreshToken(refreshTokenValue: string): Promise<RefreshTokenResponse> {
  try {
    const response = await fetch("/api/auth/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: {
          code: data.error?.code || "refresh_failed",
          message: data.error?.message || "Token refresh failed.",
        },
      };
    }

    return {
      success: true,
      token: data.token,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "asl_auth_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: {
          code: result.error?.code || "forgot_password_failed",
          message: result.error?.message || "Failed to send password reset email.",
        },
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}

export async function resetPassword(
  key: string,
  login: string,
  password: string
): Promise<ResetPasswordResponse> {
  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, login, password }),
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: {
          code: result.error?.code || "reset_password_failed",
          message: result.error?.message || "Failed to reset password.",
        },
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "network_error",
        message: error instanceof Error ? error.message : "Network error occurred",
      },
    };
  }
}
