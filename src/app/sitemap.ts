import type { MetadataRoute } from "next";

import { getPublishedArticles } from "@/lib/data/articles";
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
      url: `${origin}/annonces`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${origin}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${origin}/auth/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${origin}/auth/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const demoArticles = getPublishedArticles().map((article) => ({
    url: `${origin}/annonces/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const clientArticles = (await readPublishedArticles()).map((article) => ({
    url: `${origin}/annonces/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...demoArticles, ...clientArticles];
}
