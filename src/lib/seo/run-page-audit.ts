import type {
  SeoAuditResult,
  SeoLabMetric,
  SeoOpportunity,
  SeoScoreCategory,
} from "@/lib/seo/simulate-audit";

export type SeoCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type RealSeoAuditResult = SeoAuditResult & {
  checks: SeoCheck[];
  mode: "live" | "pagespeed";
  scoreSource?: "pagespeed" | "onpage";
};

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Saisissez une URL à analyser.");
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html: string, names: string[]) {
  for (const name of names) {
    const re = new RegExp(
      `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["'][^>]*>`,
      "i",
    );
    const match = html.match(re);
    const value = match?.[1] || match?.[2];
    if (value) return decodeEntities(value);
  }
  return "";
}

function countMatches(html: string, re: RegExp) {
  return (html.match(re) || []).length;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function metricStatus(
  value: number,
  good: number,
  poor: number,
): SeoLabMetric["status"] {
  if (value <= good) return "good";
  if (value <= poor) return "average";
  return "poor";
}

/** Audit SEO on-page réel à partir du HTML du site. */
export async function runPageSeoAudit(rawUrl: string): Promise<RealSeoAuditResult> {
  const url = normalizeUrl(rawUrl);
  const started = Date.now();

  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ManchoufouchAudit/1.0; +https://manchoufouch.ma)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Impossible d'analyser le site (HTTP ${response.status}). Vérifiez l'URL.`,
    );
  }

  const finalUrl = response.url || url;
  const html = (await response.text()).slice(0, 500_000);
  const bytes = html.length;
  const loadMs = Date.now() - started;

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decodeEntities(titleMatch?.[1] ?? "");
  const metaDescription = metaContent(html, [
    "description",
    "og:description",
    "twitter:description",
  ]);
  const viewport = metaContent(html, ["viewport"]);
  const robots = metaContent(html, ["robots"]).toLowerCase();
  const canonical =
    html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>|<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i,
    )?.[1] ||
    html.match(
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i,
    )?.[1] ||
    "";
  const ogTitle = metaContent(html, ["og:title"]);
  const lang =
    html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] ||
    html.match(/lang=["']([^"']+)["']/i)?.[1] ||
    "";

  const h1Count = countMatches(html, /<h1\b[^>]*>/gi);
  const h2Count = countMatches(html, /<h2\b[^>]*>/gi);
  const h3Count = countMatches(html, /<h3\b[^>]*>/gi);
  const imgCount = countMatches(html, /<img\b[^>]*>/gi);
  const imgWithAlt = countMatches(
    html,
    /<img\b[^>]*\balt\s*=\s*["'][^"']+["'][^>]*>/gi,
  );
  const imgMissingAlt = Math.max(0, imgCount - imgWithAlt);
  const linkCount = countMatches(html, /<a\b[^>]*href=/gi);
  const https = finalUrl.startsWith("https://");
  const textLength = decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  ).length;

  const checks: SeoCheck[] = [
    {
      id: "https",
      label: "HTTPS sécurisé",
      passed: https,
      detail: https ? "Le site utilise HTTPS." : "Passez en HTTPS (certificat SSL).",
    },
    {
      id: "title",
      label: "Balise title",
      passed: title.length >= 15 && title.length <= 65,
      detail: title
        ? `Title (${title.length} car.) : « ${title.slice(0, 70)} »`
        : "Title manquant.",
    },
    {
      id: "meta",
      label: "Meta description",
      passed: metaDescription.length >= 70 && metaDescription.length <= 165,
      detail: metaDescription
        ? `Meta (${metaDescription.length} car.).`
        : "Meta description absente.",
    },
    {
      id: "h1",
      label: "H1 unique",
      passed: h1Count === 1,
      detail:
        h1Count === 0
          ? "Aucun H1 détecté."
          : h1Count === 1
            ? "1 H1 détecté (idéal)."
            : `${h1Count} H1 détectés — idéalement 1 seul.`,
    },
    {
      id: "headings",
      label: "Structure H2/H3",
      passed: h2Count >= 1,
      detail: `${h2Count} H2 · ${h3Count} H3`,
    },
    {
      id: "viewport",
      label: "Viewport mobile",
      passed: Boolean(viewport),
      detail: viewport ? "Meta viewport présente." : "Meta viewport manquante.",
    },
    {
      id: "lang",
      label: "Attribut lang",
      passed: Boolean(lang),
      detail: lang ? `lang="${lang}"` : "Attribut lang manquant sur <html>.",
    },
    {
      id: "canonical",
      label: "URL canonique",
      passed: Boolean(canonical),
      detail: canonical ? `Canonical : ${canonical}` : "Lien canonical absent.",
    },
    {
      id: "og",
      label: "Open Graph",
      passed: Boolean(ogTitle),
      detail: ogTitle ? "og:title présent." : "Balises Open Graph incomplètes.",
    },
    {
      id: "robots",
      label: "Indexation autorisée",
      passed: !robots.includes("noindex"),
      detail: robots
        ? `robots: ${robots}`
        : "Pas de meta robots bloquante.",
    },
    {
      id: "alts",
      label: "Attributs alt images",
      passed: imgCount === 0 || imgMissingAlt / Math.max(imgCount, 1) < 0.35,
      detail:
        imgCount === 0
          ? "Aucune image détectée."
          : `${imgWithAlt}/${imgCount} images avec alt (${imgMissingAlt} manquantes).`,
    },
    {
      id: "content",
      label: "Volume de contenu",
      passed: textLength >= 400,
      detail: `≈ ${textLength} caractères de texte indexable.`,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const seoScore = clamp((passedCount / checks.length) * 100, 35, 100);

  // Estimations perf dérivées de la taille HTML + temps de réponse serveur
  const htmlKb = bytes / 1024;
  const performance = clamp(
    100 - htmlKb * 0.35 - Math.max(0, loadMs - 800) / 40,
    40,
    98,
  );
  const accessibility = clamp(
    70 +
      (viewport ? 8 : 0) +
      (lang ? 6 : 0) +
      (imgMissingAlt === 0 ? 10 : Math.max(0, 10 - imgMissingAlt)) -
      (h1Count === 0 ? 8 : 0),
    45,
    99,
  );
  const bestPractices = clamp(
    65 +
      (https ? 15 : 0) +
      (canonical ? 8 : 0) +
      (!robots.includes("noindex") ? 7 : -20) +
      (ogTitle ? 5 : 0),
    40,
    99,
  );
  const overall = Math.round(
    (performance + accessibility + bestPractices + seoScore) / 4,
  );

  const lcp = Number((1.0 + htmlKb / 80 + loadMs / 2500).toFixed(1));
  const fcp = Number((0.7 + htmlKb / 120 + loadMs / 3500).toFixed(1));
  const tti = Number((2.0 + htmlKb / 60 + loadMs / 1800).toFixed(1));
  const speedIndex = Number((1.4 + htmlKb / 70 + loadMs / 2200).toFixed(1));
  const inp = clamp(90 + htmlKb * 1.2 + loadMs / 20, 80, 420);
  const cls = Number((0.02 + (imgMissingAlt > 3 ? 0.08 : 0.01)).toFixed(2));

  const categories: SeoScoreCategory[] = [
    { id: "performance", label: "Performance", score: performance },
    { id: "accessibility", label: "Accessibilité", score: accessibility },
    { id: "best-practices", label: "Bonnes pratiques", score: bestPractices },
    { id: "seo", label: "SEO", score: seoScore },
  ];

  const metrics: SeoLabMetric[] = [
    {
      id: "lcp",
      label: "LCP*",
      value: String(lcp),
      unit: "s",
      hint: "Estimé (HTML + latence)",
      status: metricStatus(lcp, 2.5, 4),
    },
    {
      id: "inp",
      label: "INP*",
      value: String(inp),
      unit: "ms",
      hint: "Estimé",
      status: metricStatus(inp, 200, 500),
    },
    {
      id: "cls",
      label: "CLS*",
      value: String(cls),
      hint: "Estimé (alts images)",
      status: metricStatus(cls, 0.1, 0.25),
    },
    {
      id: "fcp",
      label: "FCP*",
      value: String(fcp),
      unit: "s",
      hint: "Estimé",
      status: metricStatus(fcp, 1.8, 3),
    },
    {
      id: "tti",
      label: "TTI*",
      value: String(tti),
      unit: "s",
      hint: "Estimé",
      status: metricStatus(tti, 3.8, 7.3),
    },
    {
      id: "si",
      label: "Speed Index*",
      value: String(speedIndex),
      unit: "s",
      hint: "Estimé",
      status: metricStatus(speedIndex, 3.4, 5.8),
    },
  ];

  const opportunities: SeoOpportunity[] = [];
  for (const check of checks.filter((c) => !c.passed)) {
    opportunities.push({
      title: check.label,
      impact:
        check.id === "https" ||
        check.id === "title" ||
        check.id === "meta" ||
        check.id === "h1" ||
        check.id === "robots"
          ? "Élevé"
          : check.id === "viewport" || check.id === "alts" || check.id === "content"
            ? "Moyen"
            : "Faible",
      description: check.detail,
    });
  }

  if (htmlKb > 180) {
    opportunities.push({
      title: "Réduire le poids HTML",
      impact: "Élevé",
      description: `Page d’environ ${Math.round(htmlKb)} Ko — compressez HTML/CSS/JS et les images.`,
    });
  }

  if (linkCount < 3) {
    opportunities.push({
      title: "Améliorer le maillage interne",
      impact: "Moyen",
      description: `Seulement ${linkCount} lien(s) détecté(s). Ajoutez des liens internes utiles.`,
    });
  }

  if (opportunities.length === 0) {
    opportunities.push({
      title: "Maintenir le suivi SEO",
      impact: "Faible",
      description:
        "Bonnes bases on-page. Continuez avec contenus, backlinks et Core Web Vitals réels (PageSpeed).",
    });
  }

  let mode: RealSeoAuditResult["mode"] = "live";
  let scoreSource: RealSeoAuditResult["scoreSource"] = "onpage";

  try {
    const { fetchPageSpeedScores } = await import("@/lib/seo/pagespeed");
    const psi = await fetchPageSpeedScores(finalUrl);
    if (psi) {
      mode = "pagespeed";
      scoreSource = "pagespeed";
      categories[0].score = psi.performance;
      categories[1].score = psi.accessibility;
      categories[2].score = psi.bestPractices;
      categories[3].score = psi.seo;

      const parseMetricNumber = (raw: string) => {
        const match = raw.replace(",", ".").match(/([\d.]+)\s*(ms|s)?/i);
        if (!match) return 0;
        const value = Number(match[1]);
        if ((match[2] || "").toLowerCase() === "ms") return value / 1000;
        return value;
      };

      const lcpRaw = psi.metrics.lcp;
      const lcpNum = parseMetricNumber(lcpRaw);
      metrics[0] = {
        id: "lcp",
        label: "LCP",
        value: lcpRaw,
        hint: "Google PageSpeed (mobile)",
        status: metricStatus(
          lcpRaw.toLowerCase().includes("ms") ? lcpNum : lcpNum,
          2.5,
          4,
        ),
      };
      // For LCP in ms, convert: if value was in ms, parseMetricNumber already /1000
      metrics[0].status = metricStatus(lcpNum, 2.5, 4);

      const inpNum = (() => {
        const match = psi.metrics.inp.replace(",", ".").match(/([\d.]+)/);
        return match ? Number(match[1]) : 0;
      })();
      metrics[1] = {
        id: "inp",
        label: "INP",
        value: psi.metrics.inp,
        hint: "Google PageSpeed (mobile)",
        status: metricStatus(inpNum, 200, 500),
      };
      metrics[2] = {
        id: "cls",
        label: "CLS",
        value: psi.metrics.cls,
        hint: "Google PageSpeed (mobile)",
        status: metricStatus(parseMetricNumber(psi.metrics.cls), 0.1, 0.25),
      };
      metrics[3] = {
        id: "fcp",
        label: "FCP",
        value: psi.metrics.fcp,
        hint: "Google PageSpeed (mobile)",
        status: metricStatus(parseMetricNumber(psi.metrics.fcp), 1.8, 3),
      };
      metrics[4] = {
        id: "tti",
        label: "TTI",
        value: psi.metrics.tti,
        hint: "Google PageSpeed (mobile)",
        status: metricStatus(parseMetricNumber(psi.metrics.tti), 3.8, 7.3),
      };
      metrics[5] = {
        id: "si",
        label: "Speed Index",
        value: psi.metrics.speedIndex,
        hint: "Google PageSpeed (mobile)",
        status: metricStatus(parseMetricNumber(psi.metrics.speedIndex), 3.4, 5.8),
      };
    }
  } catch {
    // Garde les scores on-page estimés si PageSpeed échoue
  }

  const overallFinal = Math.round(
    categories.reduce((sum, item) => sum + item.score, 0) / categories.length,
  );

  return {
    url: finalUrl,
    analyzedAt: new Date().toISOString(),
    overall: overallFinal,
    categories,
    metrics,
    opportunities: opportunities.slice(0, 8),
    checks,
    mode,
    scoreSource,
  };
}
