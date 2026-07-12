import type { Metadata } from "next";
import type { Article } from "@/lib/data/articles";
import { getDomainLabel } from "@/lib/data/domains";
import { SITE_CONFIG } from "@/lib/seo/site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.url}${normalized === "/" ? "" : normalized}`;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  image = "/og-default.png",
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle =
    title === SITE_CONFIG.name
      ? `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`
      : title.includes(SITE_CONFIG.name)
        ? title
        : `${title} | ${SITE_CONFIG.name}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type,
      publishedTime,
      modifiedTime,
      authors,
      images: [
        {
          url: absoluteUrl(image),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      creator: SITE_CONFIG.twitter,
      images: [absoluteUrl(image)],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildArticleMetadata(article: Article): Metadata {
  return buildMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/annonces/${article.slug}`,
    keywords: [...article.keywords, getDomainLabel(article.domain)],
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    authors: [article.author],
    noIndex: article.status !== "published",
  });
}
