import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import type { AuthSession, UserRole } from "@/lib/auth/types";

export const SESSION_COOKIE = "manchoufouch_session";

type CookiePayload = AuthSession & {
  exp: number;
};

function secret() {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "manchoufouch-dev-auth-secret"
  );
}

function sign(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function encodeSession(session: AuthSession, days = 30) {
  const payload: CookiePayload = {
    ...session,
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined | null): AuthSession | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as CookiePayload;
    if (!payload?.user?.id || !payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return {
      user: {
        id: payload.user.id,
        name: payload.user.name,
        email: payload.user.email,
        createdAt: payload.user.createdAt,
        role: payload.user.role as UserRole,
        phone: payload.user.phone || "",
        companyWebsite: payload.user.companyWebsite || "",
      },
      credits: payload.credits ?? 0,
      purchasedPacks: payload.purchasedPacks ?? [],
    };
  } catch {
    return null;
  }
}

export async function readRequestSession(): Promise<AuthSession | null> {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}

export async function requireAdminSession(): Promise<AuthSession> {
  const session = await readRequestSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Accès admin requis.");
  }
  return session;
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
