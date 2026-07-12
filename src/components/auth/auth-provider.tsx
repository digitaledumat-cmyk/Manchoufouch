"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthSession } from "@/lib/auth/types";

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  isAdmin: boolean;
  register: (input: {
    name: string;
    email: string;
    password: string;
    captchaToken?: string;
  }) => Promise<void>;
  login: (input: {
    email: string;
    password: string;
    captchaToken?: string;
  }) => Promise<void>;
  logout: () => void;
  buyPack: (packId: string) => Promise<void>;
  useCredit: () => Promise<AuthSession>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Requête impossible.",
    );
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  const refreshSession = useCallback(async () => {
    const response = await fetch("/api/auth/me", { credentials: "include" });
    const data = await parseJson<{ session: AuthSession | null }>(response);
    setSession(data.session);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refreshSession();
      } catch {
        setSession(null);
      } finally {
        setReady(true);
      }
    })();
  }, [refreshSession]);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      captchaToken?: string;
    }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await parseJson<{ session: AuthSession }>(response);
      setSession(data.session);
    },
    [],
  );

  const login = useCallback(
    async (input: {
      email: string;
      password: string;
      captchaToken?: string;
    }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await parseJson<{ session: AuthSession }>(response);
      setSession(data.session);
    },
    [],
  );

  const logout = useCallback(() => {
    void fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => setSession(null));
  }, []);

  const buyPack = useCallback(async (packId: string) => {
    const response = await fetch("/api/auth/buy-pack", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId }),
    });
    const data = await parseJson<{ session: AuthSession }>(response);
    setSession(data.session);
  }, []);

  const useCredit = useCallback(async () => {
    // Credits are consumed server-side when publishing an article.
    // Kept for compatibility with older call sites.
    await refreshSession();
    const response = await fetch("/api/auth/me", { credentials: "include" });
    const data = await parseJson<{ session: AuthSession | null }>(response);
    if (!data.session) throw new Error("Vous devez être connecté.");
    setSession(data.session);
    return data.session;
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      session,
      ready,
      isAdmin: session?.user.role === "admin",
      register,
      login,
      logout,
      buyPack,
      useCredit,
      refreshSession,
    }),
    [
      session,
      ready,
      register,
      login,
      logout,
      buyPack,
      useCredit,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
