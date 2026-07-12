import { NextResponse } from "next/server";

import {
  consumeCreditServer,
  createArticleServer,
  listArticlesByUserServer,
  publicSessionFromUser,
  resolveUserFromSession,
} from "@/lib/auth/server-store";
import {
  encodeSession,
  readRequestSession,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await readRequestSession();
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté." },
        { status: 401 },
      );
    }

    const articles = await listArticlesByUserServer(session.user.id);
    return NextResponse.json({
      articles,
      published: articles.filter(
        (article) => article.status === "approved" && article.publicPath,
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Chargement impossible.",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await readRequestSession();
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      title?: string;
      domain?: string;
      targetUrl?: string;
      backlinks?: string;
      metaDescription?: string;
      keywords?: string[];
      h1?: string;
      content?: string;
    };

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Titre et contenu obligatoires." },
        { status: 400 },
      );
    }

    const user = await resolveUserFromSession({
      id: session.user.id,
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Session expirée ou compte introuvable. Déconnectez-vous puis reconnectez-vous.",
        },
        { status: 403 },
      );
    }

    if (user.blocked) {
      return NextResponse.json(
        { error: "Ce compte est bloqué. Contactez l'administrateur." },
        { status: 403 },
      );
    }

    if (user.credits < 1) {
      return NextResponse.json(
        { error: "Crédits insuffisants. Demandez des crédits à l'admin." },
        { status: 400 },
      );
    }

    const updatedUser = await consumeCreditServer(user.id);
    const article = await createArticleServer({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      title: body.title.trim(),
      domain: body.domain || "referencement",
      targetUrl: body.targetUrl || "",
      backlinks: body.backlinks || "",
      metaDescription: body.metaDescription || "",
      keywords: body.keywords || ["SEO Maroc", "référencement Google"],
      h1: body.h1 || body.title.trim(),
      content: body.content.trim(),
    });

    const next = publicSessionFromUser(updatedUser, session.purchasedPacks);
    const response = NextResponse.json({
      ok: true,
      article,
      session: next,
      message: `Article « ${article.title} » soumis pour validation admin.`,
    });
    response.cookies.set(sessionCookieOptions(encodeSession(next)));
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Publication impossible.",
      },
      { status: 400 },
    );
  }
}
