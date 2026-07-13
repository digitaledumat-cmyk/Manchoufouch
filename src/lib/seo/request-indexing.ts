import { SITE_CONFIG } from "@/lib/seo/site";

export function getIndexNowKey() {
  return (
    process.env.INDEXNOW_KEY?.trim() ||
    "manchoufouch-indexnow-7f3a9c2e1b84"
  );
}

export type IndexingResult = {
  sitemapUrl: string;
  urls: string[];
  googlePing: { ok: boolean; detail: string };
  bingPing: { ok: boolean; detail: string };
  indexNow: { ok: boolean; detail: string };
  bingIndexNow: { ok: boolean; detail: string };
};

function siteOrigin() {
  return SITE_CONFIG.url.replace(/\/$/, "");
}

function toAbsoluteUrls(pathsOrUrls: string[]) {
  const origin = siteOrigin();
  return [
    ...new Set(
      pathsOrUrls.map((item) =>
        item.startsWith("http")
          ? item
          : `${origin}${item.startsWith("/") ? item : `/${item}`}`,
      ),
    ),
  ];
}

async function softFetch(url: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(10000),
    });
    return {
      ok: response.ok || response.status === 200,
      detail: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Échec réseau",
    };
  }
}

async function postIndexNow(
  endpoint: string,
  urls: string[],
): Promise<{ ok: boolean; detail: string }> {
  const origin = siteOrigin();
  const key = getIndexNowKey();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        host: new URL(origin).host,
        key,
        keyLocation: `${origin}/${key}.txt`,
        urlList: urls,
      }),
    });
    return {
      ok:
        response.ok ||
        response.status === 200 ||
        response.status === 202,
      detail: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Échec IndexNow",
    };
  }
}

/** Demande l'indexation : ping sitemap Google/Bing + IndexNow (auto). */
export async function requestSearchEngineIndexing(pathsOrUrls: string[]) {
  const origin = siteOrigin();
  const sitemapUrl = `${origin}/sitemap.xml`;
  const urls = toAbsoluteUrls(pathsOrUrls);

  const [googlePing, bingPing, indexNow, bingIndexNow] = await Promise.all([
    softFetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    ),
    softFetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    ),
    postIndexNow("https://api.indexnow.org/indexnow", urls),
    postIndexNow("https://www.bing.com/indexnow", urls),
  ]);

  return {
    sitemapUrl,
    urls,
    googlePing,
    bingPing,
    indexNow,
    bingIndexNow,
  } satisfies IndexingResult;
}

/** Relance l'indexation de toutes les URLs du sitemap (site entier). */
export async function requestFullSitemapIndexing(): Promise<IndexingResult> {
  const origin = siteOrigin();
  const sitemapUrl = `${origin}/sitemap.xml`;

  let urls: string[] = [origin, `${origin}/articles`, `${origin}/pricing`];

  try {
    const response = await fetch(sitemapUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) {
      const xml = await response.text();
      const found = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
      if (found.length > 0) urls = found;
    }
  } catch {
    // fallback to core pages above
  }

  return requestSearchEngineIndexing(urls);
}

export function isIndexingSuccessful(result: IndexingResult) {
  return (
    result.indexNow.ok ||
    result.bingIndexNow.ok ||
    result.googlePing.ok ||
    result.bingPing.ok
  );
}
