import { SITE_CONFIG } from "@/lib/seo/site";

export function getIndexNowKey() {
  return (
    process.env.INDEXNOW_KEY?.trim() ||
    "manchoufouch-indexnow-7f3a9c2e1b84"
  );
}

export type IndexingResult = {
  sitemapUrl: string;
  googlePing: { ok: boolean; detail: string };
  bingPing: { ok: boolean; detail: string };
  indexNow: { ok: boolean; detail: string };
};

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

/** Demande l'indexation : ping sitemap Google/Bing + IndexNow. */
export async function requestSearchEngineIndexing(pathsOrUrls: string[]) {
  const origin = SITE_CONFIG.url.replace(/\/$/, "");
  const sitemapUrl = `${origin}/sitemap.xml`;
  const key = getIndexNowKey();

  const urls = pathsOrUrls.map((item) =>
    item.startsWith("http")
      ? item
      : `${origin}${item.startsWith("/") ? item : `/${item}`}`,
  );

  const [googlePing, bingPing] = await Promise.all([
    softFetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    ),
    softFetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    ),
  ]);

  let indexNow: { ok: boolean; detail: string };
  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
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
    indexNow = {
      ok: response.ok || response.status === 200 || response.status === 202,
      detail: `HTTP ${response.status}`,
    };
  } catch (error) {
    indexNow = {
      ok: false,
      detail: error instanceof Error ? error.message : "Échec IndexNow",
    };
  }

  const result: IndexingResult = {
    sitemapUrl,
    googlePing,
    bingPing,
    indexNow,
  };

  return result;
}
