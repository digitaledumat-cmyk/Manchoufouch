export type PageSpeedScores = {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  metrics: {
    lcp: string;
    inp: string;
    cls: string;
    fcp: string;
    tti: string;
    speedIndex: string;
  };
  strategy: "mobile" | "desktop";
};

export type PageSpeedFetchResult =
  | { ok: true; scores: PageSpeedScores }
  | { ok: false; error: string };

export function getPageSpeedApiKey() {
  return (
    process.env.PAGESPEED_API_KEY?.trim() ||
    process.env.GOOGLE_PSI_API_KEY?.trim() ||
    ""
  );
}

function score100(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return null;
  return Math.round(value * 100);
}

function auditDisplay(
  audits: Record<string, { displayValue?: string; numericValue?: number }>,
  id: string,
  fallback = "—",
) {
  const audit = audits[id];
  if (!audit) return fallback;
  if (audit.displayValue) {
    return audit.displayValue.replace(/\s+/g, " ").trim();
  }
  if (typeof audit.numericValue === "number") {
    return String(Math.round(audit.numericValue));
  }
  return fallback;
}

/** Scores officiels Google PageSpeed / Lighthouse (mobile). */
export async function fetchPageSpeedScores(
  url: string,
): Promise<PageSpeedFetchResult> {
  const key = getPageSpeedApiKey();
  if (!key) {
    return {
      ok: false,
      error:
        "PAGESPEED_API_KEY manquante. Ajoutez-la dans .env.local et dans Vercel → Environment Variables, puis redéployez.",
    };
  }

  const endpoint = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
  );
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.set("locale", "fr");
  for (const category of [
    "PERFORMANCE",
    "ACCESSIBILITY",
    "BEST_PRACTICES",
    "SEO",
  ] as const) {
    endpoint.searchParams.append("category", category);
  }
  endpoint.searchParams.set("key", key);

  let response: Response;
  try {
    response = await fetch(endpoint.toString(), {
      signal: AbortSignal.timeout(90000),
      cache: "no-store",
    });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `PageSpeed injoignable : ${error.message}`
          : "PageSpeed injoignable.",
    };
  }

  const raw = await response.text();
  let data: {
    error?: { message?: string; status?: string };
    lighthouseResult?: {
      categories?: Record<string, { score?: number | null }>;
      audits?: Record<
        string,
        { displayValue?: string; numericValue?: number }
      >;
    };
  };

  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    return {
      ok: false,
      error: `Réponse PageSpeed invalide (HTTP ${response.status}).`,
    };
  }

  if (!response.ok || data.error) {
    const message =
      data.error?.message ||
      `Erreur PageSpeed HTTP ${response.status}`;
    if (response.status === 403) {
      return {
        ok: false,
        error:
          "Clé refusée (403). Activez « PageSpeed Insights API » sur Google Cloud pour cette clé.",
      };
    }
    if (response.status === 429) {
      return {
        ok: false,
        error: "Quota PageSpeed dépassé. Réessayez dans quelques minutes.",
      };
    }
    return { ok: false, error: message.slice(0, 280) };
  }

  const categories = data.lighthouseResult?.categories;
  const audits = data.lighthouseResult?.audits ?? {};
  if (!categories) {
    return { ok: false, error: "PageSpeed n'a pas renvoyé de catégories Lighthouse." };
  }

  const performance = score100(categories.performance?.score);
  const accessibility = score100(categories.accessibility?.score);
  const bestPractices = score100(categories["best-practices"]?.score);
  const seo = score100(categories.seo?.score);

  if (
    performance == null ||
    accessibility == null ||
    bestPractices == null ||
    seo == null
  ) {
    return {
      ok: false,
      error: "Scores PageSpeed incomplets (catégories manquantes).",
    };
  }

  return {
    ok: true,
    scores: {
      performance,
      accessibility,
      bestPractices,
      seo,
      strategy: "mobile",
      metrics: {
        lcp: auditDisplay(audits, "largest-contentful-paint"),
        inp: auditDisplay(
          audits,
          "interaction-to-next-paint",
          auditDisplay(audits, "experimental-interaction-to-next-paint"),
        ),
        cls: auditDisplay(audits, "cumulative-layout-shift"),
        fcp: auditDisplay(audits, "first-contentful-paint"),
        tti: auditDisplay(audits, "interactive"),
        speedIndex: auditDisplay(audits, "speed-index"),
      },
    },
  };
}
