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

function getPsiKey() {
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
): Promise<PageSpeedScores | null> {
  const key = getPsiKey();
  const endpoint = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
  );
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.set("category", "PERFORMANCE");
  endpoint.searchParams.append("category", "ACCESSIBILITY");
  endpoint.searchParams.append("category", "BEST_PRACTICES");
  endpoint.searchParams.append("category", "SEO");
  if (key) endpoint.searchParams.set("key", key);

  const response = await fetch(endpoint.toString(), {
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `PageSpeed API (${response.status}) : ${detail.slice(0, 180)}`,
    );
  }

  const data = (await response.json()) as {
    lighthouseResult?: {
      categories?: Record<string, { score?: number | null }>;
      audits?: Record<
        string,
        { displayValue?: string; numericValue?: number }
      >;
    };
  };

  const categories = data.lighthouseResult?.categories;
  const audits = data.lighthouseResult?.audits ?? {};
  if (!categories) return null;

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
    return null;
  }

  return {
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
  };
}
