import { NextResponse } from "next/server";

import {
  publicSessionFromUser,
  resolveUserFromSession,
} from "@/lib/auth/server-store";
import {
  encodeSession,
  readRequestSession,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/session";

export async function GET() {
  const session = await readRequestSession();
  if (!session) {
    return NextResponse.json({ session: null });
  }

  const user = await resolveUserFromSession({
    id: session.user.id,
    email: session.user.email,
  });

  if (!user || user.blocked) {
    const response = NextResponse.json({ session: null });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: "",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  const next = publicSessionFromUser(user, session.purchasedPacks);
  const response = NextResponse.json({ session: next });
  response.cookies.set(sessionCookieOptions(encodeSession(next)));
  return response;
}
