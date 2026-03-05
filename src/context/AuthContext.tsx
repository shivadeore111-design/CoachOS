/**
 * src/context/AuthContext.tsx
 * Supabase auth context with graceful fallback to demo mode.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

// ─── Demo user (used when Supabase is not configured) ────────────────────────

const DEMO_USER: User = {
  id: "coach-1",
  email: "alex@coachos.io",
  app_metadata: {},
  user_metadata: { name: "Alex Morgan" },
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00Z",
} as User;

const DEMO_SESSION: Session = {
  access_token: "demo-token",
  refresh_token: "demo-refresh",
  expires_in: 99999,
  expires_at: 9999999999,
  token_type: "bearer",
  user: DEMO_USER,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isDemo: !isSupabaseConfigured,
  });

  // Bootstrap: check existing session or enter demo mode
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode — auto-authenticate
      setState({ user: DEMO_USER, session: DEMO_SESSION, loading: false, isDemo: true });
      return;
    }

    // Real Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        isDemo: false,
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        isDemo: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Sign In ───────────────────────────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo mode: accept any credentials
      setState({ user: DEMO_USER, session: DEMO_SESSION, loading: false, isDemo: true });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  // ─── Sign Up ───────────────────────────────────────────────────────────────

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      setState({ user: DEMO_USER, session: DEMO_SESSION, loading: false, isDemo: true });
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message ?? null };
  }, []);

  // ─── Sign Out ─────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setState({ user: null, session: null, loading: false, isDemo: false });
      return;
    }
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
