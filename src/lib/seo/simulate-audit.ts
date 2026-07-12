export type SeoScoreCategory = {
  id: string;
  label: string;
  score: number;
};

export type SeoLabMetric = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  hint: string;
  status: "good" | "average" | "poor";
};

export type SeoOpportunity = {
  title: string;
  impact: "Élevé" | "Moyen" | "Faible";
  description: string;
};

export type SeoAuditResult = {
  url: string;
  analyzedAt: string;
  overall: number;
  categories: SeoScoreCategory[];
  metrics: SeoLabMetric[];
  opportunities: SeoOpportunity[];
};

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function scoreFromHash(hash: number, min: number, max: number, salt: number) {
  return min + ((hash + salt * 17) % (max - min + 1));
}

export function simulateSeoAudit(rawUrl: string): SeoAuditResult {
  const url = rawUrl.trim() || "https://exemple.com";
  const hash = hashString(url.toLowerCase());

  const performance = scoreFromHash(hash, 62, 98, 1);
  const accessibility = scoreFromHash(hash, 70, 99, 2);
  const bestPractices = scoreFromHash(hash, 68, 97, 3);
  const seo = scoreFromHash(hash, 74, 100, 4);
  const overall = Math.round(
    (performance + accessibility + bestPractices + seo) / 4,
  );

  const lcp = (1.1 + (hash % 25) / 10).toFixed(1);
  const inp = 80 + (hash % 140);
  const cls = ((hash % 18) / 100).toFixed(2);
  const fcp = (0.8 + (hash % 20) / 10).toFixed(1);
  const tti = (2.4 + (hash % 30) / 10).toFixed(1);
  const speedIndex = (1.6 + (hash % 28) / 10).toFixed(1);

  const metricStatus = (
    value: number,
    good: number,
    poor: number,
  ): SeoLabMetric["status"] => {
    if (value <= good) return "good";
    if (value <= poor) return "average";
    return "poor";
  };

  return {
    url,
    analyzedAt: new Date().toISOString(),
    overall,
    categories: [
      { id: "performance", label: "Performance", score: performance },
      { id: "accessibility", label: "Accessibilité", score: accessibility },
      { id: "best-practices", label: "Bonnes pratiques", score: bestPractices },
      { id: "seo", label: "SEO", score: seo },
    ],
    metrics: [
      {
        id: "lcp",
        label: "LCP",
        value: lcp,
        unit: "s",
        hint: "Largest Contentful Paint",
        status: metricStatus(Number(lcp), 2.5, 4),
      },
      {
        id: "inp",
        label: "INP",
        value: String(inp),
        unit: "ms",
        hint: "Interaction to Next Paint",
        status: metricStatus(inp, 200, 500),
      },
      {
        id: "cls",
        label: "CLS",
        value: cls,
        hint: "Cumulative Layout Shift",
        status: metricStatus(Number(cls), 0.1, 0.25),
      },
      {
        id: "fcp",
        label: "FCP",
        value: fcp,
        unit: "s",
        hint: "First Contentful Paint",
        status: metricStatus(Number(fcp), 1.8, 3),
      },
      {
        id: "tti",
        label: "TTI",
        value: tti,
        unit: "s",
        hint: "Time to Interactive",
        status: metricStatus(Number(tti), 3.8, 7.3),
      },
      {
        id: "si",
        label: "Speed Index",
        value: speedIndex,
        unit: "s",
        hint: "Speed Index",
        status: metricStatus(Number(speedIndex), 3.4, 5.8),
      },
    ],
    opportunities: [
      {
        title: "Optimiser les images et le lazy-loading",
        impact: "Élevé",
        description:
          "Compresser les visuels hero et différer le chargement hors écran pour améliorer LCP et Speed Index.",
      },
      {
        title: "Renforcer les balises title / meta description",
        impact: "Élevé",
        description:
          "Chaque page clé doit avoir un title unique et une méta-description orientée intention de recherche.",
      },
      {
        title: "Structurer le contenu avec H1/H2/H3",
        impact: "Moyen",
        description:
          "Une hiérarchie Hn claire améliore le crawl, la compréhension IA et le score SEO éditorial.",
      },
      {
        title: "Réduire le JavaScript non critique",
        impact: "Moyen",
        description:
          "Différer les scripts tiers pour accélérer l'interactivité (INP / TTI).",
      },
    ],
  };
}

export function scoreTone(score: number): "good" | "average" | "poor" {
  if (score >= 90) return "good";
  if (score >= 50) return "average";
  return "poor";
}
