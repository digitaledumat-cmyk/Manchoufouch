import { NextResponse } from "next/server";

import {
  loginUserServer,
  publicSessionFromUser,
} from "@/lib/auth/server-store";
import { encodeSession, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const user = await loginUserServer({
      email: body.email || "",
      password: body.password || "",
    });

    const session = publicSessionFromUser(user);
    const token = encodeSession(session);
    const response = NextResponse.json({ ok: true, session });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Connexion impossible.",
      },
      { status: 401 },
    );
  }
}
