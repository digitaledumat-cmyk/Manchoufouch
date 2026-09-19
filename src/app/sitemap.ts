import type { MetadataRoute } from "next";

import { readPublishedArticles } from "@/lib/seo/published-store";
import { SITE_CONFIG } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = SITE_CONFIG.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: origin,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${origin}/articles`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${origin}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Ne jamais faire échouer le sitemap (500) si le store Blob est indisponible.
  let clientArticles: MetadataRoute.Sitemap = [];
  try {
    const published = await readPublishedArticles();
    clientArticles = published
      .filter((article) => article.status === "published")
      .map((article) => ({
        url: `${origin}/articles/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: "daily" as const,
        priority: 0.85,
      }));
  } catch (error) {
    console.error("[sitemap] Impossible de lire les articles publiés:", error);
  }

  return [...staticRoutes, ...clientArticles];
}
