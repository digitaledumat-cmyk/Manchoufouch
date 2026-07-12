import { NextResponse } from "next/server";

import {
  publicSessionFromUser,
  registerUserServer,
} from "@/lib/auth/server-store";
import { encodeSession, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const user = await registerUserServer({
      name: body.name || "",
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
          error instanceof Error ? error.message : "Inscription impossible.",
      },
      { status: 400 },
    );
  }
}
