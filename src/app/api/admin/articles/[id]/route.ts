import { NextResponse } from "next/server";

import {
  deleteArticleServer,
  getAdminStatsServer,
  listArticlesServer,
  updateArticleServer,
} from "@/lib/auth/server-store";
import { requireAdminSession } from "@/lib/auth/session";
import type { ClientArticle } from "@/lib/auth/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const body = (await request.json()) as Partial<
      Pick<
        ClientArticle,
        | "title"
        | "domain"
        | "targetUrl"
        | "backlinks"
        | "metaDescription"
        | "keywords"
        | "h1"
        | "content"
        | "status"
        | "adminNote"
      >
    >;

    const article = await updateArticleServer(id, body);
    const [articles, stats] = await Promise.all([
      listArticlesServer(),
      getAdminStatsServer(),
    ]);
    return NextResponse.json({ ok: true, article, articles, stats });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Mise à jour impossible.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    await deleteArticleServer(id);
    const [articles, stats] = await Promise.all([
      listArticlesServer(),
      getAdminStatsServer(),
    ]);
    return NextResponse.json({ ok: true, articles, stats });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Suppression impossible.",
      },
      { status: 400 },
    );
  }
}
