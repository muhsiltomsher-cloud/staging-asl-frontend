"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { validateToken, refreshToken as apiRefreshToken, type AuthUser, type LoginCredentials, type LoginResponse } from "@/lib/api/auth";

const AUTH_TOKEN_KEY = "asl_auth_token";
const AUTH_USER_KEY = "asl_auth_user";
const AUTH_REFRESH_TOKEN_KEY = "asl_refresh_token";
const AUTH_WP_TOKEN_KEY = "asl_wp_auth_token";

const isProduction = typeof window !== "undefined" && window.location.protocol === "https:";

const secureCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: isProduction,
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAccountDrawerOpen: boolean;
  setIsAccountDrawerOpen: (open: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  googleLogin: (credential: string) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getCookie(AUTH_TOKEN_KEY);
        const userDataStr = getCookie(AUTH_USER_KEY);
        const refreshTokenValue = getCookie(AUTH_REFRESH_TOKEN_KEY);

        if (token && userDataStr) {
          const userData = JSON.parse(userDataStr as string) as AuthUser;
          setUser(userData);
          setIsLoading(false);

          try {
            const isValid = await validateToken(token as string);
            if (!isValid && refreshTokenValue) {
              try {
                const refreshResponse = await apiRefreshToken(refreshTokenValue as string);
                if (refreshResponse.success && refreshResponse.token) {
                  setCookie(AUTH_TOKEN_KEY, refreshResponse.token, {
                    ...secureCookieOptions,
                    maxAge: 60 * 60 * 24 * 7,
                  });
                  userData.token = refreshResponse.token;
                  setCookie(AUTH_USER_KEY, JSON.stringify(userData), {
                    ...secureCookieOptions,
                    maxAge: 60 * 60 * 24 * 7,
                  });
                  setUser({ ...userData });
                }
              } catch {
                // Refresh failed - keep user logged in from cookies
              }
            }
          } catch {
            // Validation failed - keep user logged in from cookies
          }
          return;
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      // Use the rate-limited API route for login
      const apiResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const response: LoginResponse = await apiResponse.json();

      if (response.success && response.user) {
        setCookie(AUTH_TOKEN_KEY, response.user.token, {
          ...secureCookieOptions,
          maxAge: 60 * 60 * 24 * 7,
        });
        setCookie(AUTH_USER_KEY, JSON.stringify(response.user), {
          ...secureCookieOptions,
          maxAge: 60 * 60 * 24 * 7,
        });
        // Store refresh token if available
        if (response.user.refresh_token) {
          setCookie(AUTH_REFRESH_TOKEN_KEY, response.user.refresh_token, {
            ...secureCookieOptions,
            maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
          });
        }
        // Store WordPress JWT token for YITH wishlist and other WP endpoints
        if (response.user.wp_token) {
          setCookie(AUTH_WP_TOKEN_KEY, response.user.wp_token, {
            ...secureCookieOptions,
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
        }
        setUser(response.user);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const googleLogin = useCallback(async (credential: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const apiResponse = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      const response: LoginResponse = await apiResponse.json();

      if (response.success && response.user) {
        setCookie(AUTH_TOKEN_KEY, response.user.token, {
          ...secureCookieOptions,
          maxAge: 60 * 60 * 24 * 7,
        });
        setCookie(AUTH_USER_KEY, JSON.stringify(response.user), {
          ...secureCookieOptions,
          maxAge: 60 * 60 * 24 * 7,
        });
        if (response.user.refresh_token) {
          setCookie(AUTH_REFRESH_TOKEN_KEY, response.user.refresh_token, {
            ...secureCookieOptions,
            maxAge: 60 * 60 * 24 * 30,
          });
        }
        if (response.user.wp_token) {
          setCookie(AUTH_WP_TOKEN_KEY, response.user.wp_token, {
            ...secureCookieOptions,
            maxAge: 60 * 60 * 24 * 7,
          });
        }
        setUser(response.user);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    deleteCookie(AUTH_TOKEN_KEY);
    deleteCookie(AUTH_USER_KEY);
    deleteCookie(AUTH_REFRESH_TOKEN_KEY);
    deleteCookie(AUTH_WP_TOKEN_KEY);
    setUser(null);
  }, []);

    return (
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          isLoading,
          isAccountDrawerOpen,
          setIsAccountDrawerOpen,
          login,
          googleLogin,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
