import type { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/seo/site";

/**
 * Private HTML pages (/auth, /dashboard, /admin) already send meta robots
 * noindex. Blocking them in robots.txt prevents Google from reading that
 * noindex and triggers Search Console: "Indexed despite blocked by robots.txt".
 * Only keep Disallow on API routes (no HTML meta available).
 */
export default function robots(): MetadataRoute.Robots {
  const origin = SITE_CONFIG.url.replace(/\/$/, "");
  const host = new URL(origin).host;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host,
  };
}
