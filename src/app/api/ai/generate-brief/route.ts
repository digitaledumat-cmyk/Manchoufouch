import { NextResponse } from "next/server";

import { generateBriefWithAi, resolveAiProvider } from "@/lib/ai/openai";
import { simulateSeoBrief } from "@/lib/ai/simulate-seo";
import { getDomainById } from "@/lib/data/domains";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      domainId?: string;
      url?: string;
    };

    const domainId = body.domainId?.trim();
    if (!domainId) {
      return NextResponse.json(
        { error: "Le domaine est requis." },
        { status: 400 },
      );
    }

    const domain = getDomainById(domainId);
    if (!domain) {
      return NextResponse.json({ error: "Domaine inconnu." }, { status: 400 });
    }

    const provider = resolveAiProvider();

    if (provider === "simulation") {
      const brief = await simulateSeoBrief(domainId);
      return NextResponse.json({ brief, provider });
    }

    const brief = await generateBriefWithAi({
      domainId: domain.id,
      domainLabel: domain.label,
      url: body.url,
    });

    return NextResponse.json({
      brief: {
        domain: domain.id,
        keywords: brief.keywords,
        headings: brief.headings,
        metaDescription: brief.metaDescription,
        generatedAt: brief.generatedAt,
      },
      provider,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de générer le brief.",
      },
      { status: 500 },
    );
  }
}
