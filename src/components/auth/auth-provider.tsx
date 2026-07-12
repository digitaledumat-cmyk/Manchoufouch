"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addCreditsToUser,
  consumeCredit,
  ensureAdminSeed,
  loginUser,
  readSession,
  registerUser,
  writeSession,
  type AuthSession,
} from "@/lib/auth/storage";
import { getCreditPackById } from "@/lib/data/pricing";

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  isAdmin: boolean;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  buyPack: (packId: string) => Promise<void>;
  useCredit: () => Promise<AuthSession>;
  refreshSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureAdminSeed();
    setSession(readSession());
    setReady(true);
  }, []);

  const refreshSession = useCallback(() => {
    setSession(readSession());
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const next = registerUser(input);
      setSession(next);
    },
    [],
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const next = loginUser(input);
      setSession(next);
    },
    [],
  );

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
  }, []);

  const buyPack = useCallback(async (packId: string) => {
    const pack = getCreditPackById(packId);
    const current = readSession();
    if (!pack) throw new Error("Pack introuvable.");
    if (!current) throw new Error("Créez un compte avant d'acheter des crédits.");

    const next = addCreditsToUser(current.user.id, pack.articles);
    if (!next) throw new Error("Impossible d'ajouter les crédits.");

    const withHistory: AuthSession = {
      ...next,
      purchasedPacks: [
        ...next.purchasedPacks,
        {
          packId: pack.id,
          articles: pack.articles,
          at: new Date().toISOString(),
        },
      ],
    };
    writeSession(withHistory);
    setSession(withHistory);
  }, []);

  const useCredit = useCallback(async () => {
    const current = readSession();
    if (!current) throw new Error("Vous devez être connecté.");
    const next = consumeCredit(current.user.id);
    setSession(next);
    return next;
  }, []);

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
