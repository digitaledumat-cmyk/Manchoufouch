import { NextResponse } from "next/server";

import { updateArticleServer } from "@/lib/auth/server-store";
import {
  publicPathForSlug,
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
      try {
        await updateArticleServer(body.id, {
          publicSlug: "",
          publicPath: "",
        });
      } catch {
        // article client may already be deleted
      }
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

    const publicPath = publicPathForSlug(published.slug);

    try {
      await updateArticleServer(input.id, {
        status: "approved",
        publicSlug: published.slug,
        publicPath,
      });
    } catch {
      // keep published page even if client record update fails
    }

    const indexing = await requestSearchEngineIndexing([
      publicPath,
      "/annonces",
      "/sitemap.xml",
    ]);

    return NextResponse.json({
      ok: true,
      article: published,
      publicPath,
      publicUrl: publicPath,
      message: `Page créée : ${publicPath}`,
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
