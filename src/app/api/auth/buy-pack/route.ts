import { NextResponse } from "next/server";

import {
  addCreditsServer,
  findUserById,
  publicSessionFromUser,
} from "@/lib/auth/server-store";
import {
  encodeSession,
  readRequestSession,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { getCreditPackById } from "@/lib/data/pricing";

export async function POST(request: Request) {
  try {
    const session = await readRequestSession();
    if (!session) {
      return NextResponse.json(
        { error: "Créez un compte avant d'acheter des crédits." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { packId?: string };
    const pack = getCreditPackById(body.packId || "");
    if (!pack) {
      return NextResponse.json({ error: "Pack introuvable." }, { status: 400 });
    }

    const updatedUser = await addCreditsServer(session.user.id, pack.articles);
    const next = publicSessionFromUser(updatedUser, [
      ...session.purchasedPacks,
      {
        packId: pack.id,
        articles: pack.articles,
        at: new Date().toISOString(),
      },
    ]);

    // Refresh credits from DB in case of race.
    const fresh = await findUserById(session.user.id);
    if (fresh) next.credits = fresh.credits;

    const response = NextResponse.json({ ok: true, session: next });
    response.cookies.set(sessionCookieOptions(encodeSession(next)));
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Achat impossible.",
      },
      { status: 400 },
    );
  }
}
