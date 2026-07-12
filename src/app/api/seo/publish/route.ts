import { NextResponse } from "next/server";

import {
  removePublishedArticle,
  upsertPublishedArticle,
} from "@/lib/seo/published-store";
import { requestSearchEngineIndexing } from "@/lib/seo/request-indexing";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: "publish" | "unpublish";
      article?: {
        id: string;
        title: string;
        domain: string;
        metaDescription: string;
        keywords: string[];
        h1: string;
        content: string;
        author?: string;
        userName?: string;
        targetUrl?: string;
      };
      id?: string;
    };

    if (body.action === "unpublish" && body.id) {
      await removePublishedArticle(body.id);
      return NextResponse.json({ ok: true, unpublished: true });
    }

    const input = body.article;
    if (!input?.id || !input.title || !input.content) {
      return NextResponse.json(
        { error: "Article incomplet pour publication / indexation." },
        { status: 400 },
      );
    }

    const published = await upsertPublishedArticle({
      id: input.id,
      title: input.title,
      domain: input.domain,
      metaDescription: input.metaDescription || "",
      keywords: input.keywords || [],
      h1: input.h1 || input.title,
      content: input.content,
      author: input.author || input.userName || "Manchoufouch",
      targetUrl: input.targetUrl,
    });

    const indexing = await requestSearchEngineIndexing([
      `/annonces/${published.slug}`,
      "/sitemap.xml",
    ]);

    return NextResponse.json({
      ok: true,
      article: published,
      publicPath: `/annonces/${published.slug}`,
      indexing,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Publication / indexation impossible.",
      },
      { status: 500 },
    );
  }
}
