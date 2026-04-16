"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import { fetchCurrentUser, type AuthUser, type LoginCredentials, type LoginResponse } from "@/lib/api/auth";

const AUTH_USER_KEY = "asl_auth_user";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAccountDrawerOpen: boolean;
  setIsAccountDrawerOpen: (open: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  googleLogin: (credential: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // First try the non-HttpOnly user metadata cookie for instant UI
        const userDataStr = getCookie(AUTH_USER_KEY);
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr as string) as AuthUser;
            setUser(userData);
          } catch {
            // Cookie was corrupted; /api/auth/me will be the source of truth
          }
        }

        // Verify auth state server-side (tokens are HttpOnly cookies)
        const { authenticated, user: serverUser } = await fetchCurrentUser();
        if (authenticated && serverUser) {
          setUser(serverUser);
        } else if (!authenticated) {
          setUser(null);
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
      // F-08: Login via the server-side API route.
      // Tokens are set as HttpOnly cookies by the server — never returned in JSON.
      const apiResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const response: LoginResponse = await apiResponse.json();

      if (response.success && response.user) {
        // User metadata (no tokens) comes from the JSON body
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential }),
      });

      const response: LoginResponse = await apiResponse.json();

      if (response.success && response.user) {
        setUser(response.user);
      }

      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // F-08: Call server-side logout to blocklist tokens and clear HttpOnly cookies.
    // Retry once on failure because if the server call doesn't succeed the
    // HttpOnly cookies (which JS cannot touch) will persist.
    const doLogout = () =>
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

    try {
      const res = await doLogout();
      if (!res.ok) throw new Error("logout failed");
    } catch {
      // Retry once after a short delay
      try {
        await new Promise((r) => setTimeout(r, 500));
        await doLogout();
      } catch {
        // If retry also fails, continue with client-side cleanup
      }
    }
    // Clear the non-HttpOnly user metadata cookie client-side
    deleteCookie(AUTH_USER_KEY);
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
