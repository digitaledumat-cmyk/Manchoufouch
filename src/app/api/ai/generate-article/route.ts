import { NextResponse } from "next/server";

import {
  generateArticleWithAi,
  resolveAiProvider,
} from "@/lib/ai/openai";
import {
  ARTICLE_MODELS,
  simulateArticleFromUrl,
  type ArticleModelId,
} from "@/lib/ai/simulate-article";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      url?: string;
      model?: string;
      domainLabel?: string;
    };

    const url = body.url?.trim();
    const model = body.model as ArticleModelId | undefined;

    if (!url) {
      return NextResponse.json(
        { error: "Le lien du site web est requis." },
        { status: 400 },
      );
    }

    if (!model || !ARTICLE_MODELS.some((item) => item.id === model)) {
      return NextResponse.json(
        { error: "Modèle d'article invalide." },
        { status: 400 },
      );
    }

    const provider = resolveAiProvider();

    const article =
      provider === "simulation"
        ? await simulateArticleFromUrl({
            url,
            model,
            domainLabel: body.domainLabel,
          })
        : await generateArticleWithAi({
            url,
            model,
            domainLabel: body.domainLabel,
          });

    return NextResponse.json({ article, provider });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de générer l'article.",
      },
      { status: 500 },
    );
  }
}
