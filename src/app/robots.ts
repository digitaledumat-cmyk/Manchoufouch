import type { MetadataRoute } from "next";

import { SITE_CONFIG } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const origin = SITE_CONFIG.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard/", "/admin", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
