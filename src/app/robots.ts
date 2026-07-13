import type { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const origin = SITE_CONFIG.url.replace(/\/$/, "");
  const host = new URL(origin).host;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/articles/", "/pricing"],
        disallow: ["/dashboard/", "/admin", "/api/", "/auth/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/articles/", "/pricing"],
        disallow: ["/dashboard/", "/admin", "/api/", "/auth/"],
      },
      {
        userAgent: "bingbot",
        allow: ["/", "/articles/", "/pricing"],
        disallow: ["/dashboard/", "/admin", "/api/", "/auth/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host,
  };
}
