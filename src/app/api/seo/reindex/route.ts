import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/session";
import {
  isIndexingSuccessful,
  requestFullSitemapIndexing,
  requestSearchEngineIndexing,
} from "@/lib/seo/request-indexing";

/** Relance l'indexation automatique (sitemap complet ou URLs ciblées). */
export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = (await request.json().catch(() => ({}))) as {
      urls?: string[];
    };

    const indexing =
      body.urls && body.urls.length > 0
        ? await requestSearchEngineIndexing(body.urls)
        : await requestFullSitemapIndexing();

    return NextResponse.json({
      ok: true,
      indexed: isIndexingSuccessful(indexing),
      message: isIndexingSuccessful(indexing)
        ? `Indexation automatique lancée (${indexing.urls.length} URL).`
        : "Indexation demandée, mais les moteurs n'ont pas confirmé.",
      indexing,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Indexation impossible.",
      },
      { status: error instanceof Error && error.message.includes("admin") ? 401 : 500 },
    );
  }
}
