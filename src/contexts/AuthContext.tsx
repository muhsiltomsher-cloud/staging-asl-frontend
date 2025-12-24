"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { login as apiLogin, validateToken, type AuthUser, type LoginCredentials, type LoginResponse } from "@/lib/api/auth";

const AUTH_TOKEN_KEY = "asl_auth_token";
const AUTH_USER_KEY = "asl_auth_user";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAccountDrawerOpen: boolean;
  setIsAccountDrawerOpen: (open: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
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

        if (token && userDataStr) {
          const isValid = await validateToken(token as string);
          if (isValid) {
            const userData = JSON.parse(userDataStr as string) as AuthUser;
            setUser(userData);
          } else {
            deleteCookie(AUTH_TOKEN_KEY);
            deleteCookie(AUTH_USER_KEY);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        deleteCookie(AUTH_TOKEN_KEY);
        deleteCookie(AUTH_USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);

      if (response.success && response.user) {
        setCookie(AUTH_TOKEN_KEY, response.user.token, {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          sameSite: "lax",
        });
        setCookie(AUTH_USER_KEY, JSON.stringify(response.user), {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          sameSite: "lax",
        });
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
