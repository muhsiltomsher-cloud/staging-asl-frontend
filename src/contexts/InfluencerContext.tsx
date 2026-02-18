"use client";

import React, { Suspense, createContext, useContext, useReducer, useEffect, useCallback, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";

const STORAGE_KEY = "asl_influencer_ref";
const EXPIRY_DAYS = 30;
const MAX_CODE_LENGTH = 50;
const CODE_PATTERN = /^[a-z0-9_-]+$/;

interface InfluencerData {
  code: string;
  landingPage: string;
  visitDate: string;
  expiry: number;
}

interface InfluencerState {
  referralCode: string | null;
  landingPage: string | null;
  visitDate: string | null;
}

type InfluencerAction =
  | { type: "SET_REFERRAL"; code: string; landingPage: string; visitDate: string }
  | { type: "CLEAR" };

interface InfluencerContextType {
  referralCode: string | null;
  landingPage: string | null;
  visitDate: string | null;
  clearReferral: () => void;
}

const InfluencerContext = createContext<InfluencerContextType | undefined>(undefined);

function getStoredReferral(): InfluencerData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const data: InfluencerData = JSON.parse(stored);
    if (Date.now() > data.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function storeReferral(code: string, landingPage: string): InfluencerData {
  const data: InfluencerData = {
    code,
    landingPage,
    visitDate: new Date().toISOString(),
    expiry: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }
  return data;
}

function influencerReducer(state: InfluencerState, action: InfluencerAction): InfluencerState {
  switch (action.type) {
    case "SET_REFERRAL":
      return { referralCode: action.code, landingPage: action.landingPage, visitDate: action.visitDate };
    case "CLEAR":
      return { referralCode: null, landingPage: null, visitDate: null };
    default:
      return state;
  }
}

function getInitialState(): InfluencerState {
  const stored = getStoredReferral();
  if (stored) {
    return { referralCode: stored.code, landingPage: stored.landingPage, visitDate: stored.visitDate };
  }
  return { referralCode: null, landingPage: null, visitDate: null };
}

interface InfluencerProviderProps {
  children: React.ReactNode;
}

function InfluencerRefCapture({ dispatch }: { dispatch: React.ActionDispatch<[action: InfluencerAction]> }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hasTrackedVisitRef = useRef<string | null>(null);

  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (!refParam) return;

    const code = refParam.trim().toLowerCase().slice(0, MAX_CODE_LENGTH);
    if (!code || !CODE_PATTERN.test(code)) return;

    const stored = storeReferral(code, pathname);
    dispatch({ type: "SET_REFERRAL", code, landingPage: pathname, visitDate: stored.visitDate });

    if (hasTrackedVisitRef.current !== code) {
      hasTrackedVisitRef.current = code;
      fetch("/api/influencer/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, landing_page: pathname }),
      }).catch(() => {});
    }
  }, [searchParams, pathname, dispatch]);

  return null;
}

export function InfluencerProvider({ children }: InfluencerProviderProps) {
  const [state, dispatch] = useReducer(influencerReducer, null, getInitialState);

  const clearReferral = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    dispatch({ type: "CLEAR" });
  }, []);

  return (
    <InfluencerContext.Provider
      value={{
        referralCode: state.referralCode,
        landingPage: state.landingPage,
        visitDate: state.visitDate,
        clearReferral,
      }}
    >
      <Suspense fallback={null}>
        <InfluencerRefCapture dispatch={dispatch} />
      </Suspense>
      {children}
    </InfluencerContext.Provider>
  );
}

export function useInfluencer(): InfluencerContextType {
  const context = useContext(InfluencerContext);
  if (!context) {
    throw new Error("useInfluencer must be used within an InfluencerProvider");
  }
  return context;
}
