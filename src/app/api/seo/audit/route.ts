import { NextResponse } from "next/server";

import { runPageSeoAudit } from "@/lib/seo/run-page-audit";
import { simulateSeoAudit } from "@/lib/seo/simulate-audit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const url = body.url?.trim();

    if (!url) {
      return NextResponse.json(
        { error: "Saisissez une URL à analyser." },
        { status: 400 },
      );
    }

    try {
      const result = await runPageSeoAudit(url);
      return NextResponse.json({
        result,
        provider: result.mode === "pagespeed" ? "pagespeed" : "live",
      });
    } catch (liveError) {
      // Fallback simulation si le site bloque le fetch
      const result = {
        ...simulateSeoAudit(url),
        checks: [],
        mode: "simulation" as const,
        note:
          liveError instanceof Error
            ? liveError.message
            : "Analyse live indisponible, mode estimation.",
      };
      return NextResponse.json({
        result,
        provider: "simulation",
        warning: result.note,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de lancer l'audit SEO.",
      },
      { status: 500 },
    );
  }
}
