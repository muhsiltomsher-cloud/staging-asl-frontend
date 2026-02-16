"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
  locale?: string;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  text = "signin_with",
  locale = "en",
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof window !== "undefined" && !!window.google?.accounts?.id
  );
  const [clientId, setClientId] = useState<string | null>(
    () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null
  );

  const handleCredentialResponse = useCallback(
    (response: { credential: string; select_by: string }) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError?.("No credential received from Google");
      }
    },
    [onSuccess, onError]
  );

  useEffect(() => {
    if (scriptLoaded) return;

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existingScript) {
      const onLoad = () => setScriptLoaded(true);
      existingScript.addEventListener("load", onLoad);
      return () => existingScript.removeEventListener("load", onLoad);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onError?.("Failed to load Google Sign-In");
    document.head.appendChild(script);
  }, [scriptLoaded, onError]);

  useEffect(() => {
    if (clientId) return;
    let cancelled = false;
    fetch("/api/auth/google-client-id")
      .then((res) => res.json())
      .then((data: { clientId?: string }) => {
        if (!cancelled && data.clientId) setClientId(data.clientId);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [clientId]);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.google?.accounts?.id) return;
    if (!clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    const containerWidth = containerRef.current.offsetWidth;
    const buttonWidth = Math.max(Math.min(containerWidth - 20, 400), 200);

    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: buttonWidth,
      text,
      shape: "pill",
      locale,
    });
  }, [scriptLoaded, clientId, handleCredentialResponse, text, locale]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center w-full"
    />
  );
}
